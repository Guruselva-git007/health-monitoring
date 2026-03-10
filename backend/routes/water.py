from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database.session import get_db
from models.user import User, UserRole
from models.water_quality import WaterQuality
from schemas.water import WaterQualityCreate, WaterQualityOut
from utils.auth import get_optional_user
from utils.realtime import realtime_manager

router = APIRouter(tags=["Water Data"])


@router.post("/waterdata", response_model=WaterQualityOut, status_code=status.HTTP_201_CREATED)
async def create_water_data(
    payload: WaterQualityCreate,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> WaterQualityOut:
    if current_user and current_user.role == UserRole.COMMUNITY:
        raise HTTPException(status_code=403, detail="Community users cannot upload sensor data")

    row = WaterQuality(
        latitude=payload.latitude,
        longitude=payload.longitude,
        collected_at=payload.collected_at or datetime.utcnow(),
        ph=payload.ph,
        turbidity=payload.turbidity,
        temperature=payload.temperature,
        dissolved_oxygen=payload.dissolved_oxygen,
        ecoli_presence=payload.ecoli_presence,
        tds=payload.tds,
        chlorine_level=payload.chlorine_level,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    await realtime_manager.broadcast(
        event="water_data_created",
        payload={
            "id": row.id,
            "latitude": row.latitude,
            "longitude": row.longitude,
            "collected_at": row.collected_at.isoformat(),
            "ph": row.ph,
            "turbidity": row.turbidity,
            "ecoli_presence": row.ecoli_presence,
        },
    )

    return WaterQualityOut.model_validate(row)


@router.get("/waterdata", response_model=list[WaterQualityOut])
def get_water_data(
    limit: int = Query(default=200, ge=1, le=1000),
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    db: Session = Depends(get_db),
) -> list[WaterQualityOut]:
    query = db.query(WaterQuality)
    if start_date:
        query = query.filter(WaterQuality.collected_at >= start_date)
    if end_date:
        query = query.filter(WaterQuality.collected_at <= end_date)

    rows = query.order_by(WaterQuality.collected_at.desc()).limit(limit).all()
    return [WaterQualityOut.model_validate(row) for row in rows]
