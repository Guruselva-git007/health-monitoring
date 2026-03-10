import csv
from datetime import datetime
from io import StringIO

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database.session import get_db
from models.symptom_report import SymptomReport
from models.user import User, UserRole
from schemas.report import SymptomReportCreate, SymptomReportOut
from utils.auth import get_current_user
from utils.realtime import realtime_manager

router = APIRouter(tags=["Reports"])


@router.post("/report-symptom", response_model=SymptomReportOut, status_code=status.HTTP_201_CREATED)
async def create_symptom_report(
    payload: SymptomReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SymptomReportOut:
    report = SymptomReport(
        user_id=current_user.id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        reported_at=payload.date or datetime.utcnow(),
        symptoms=payload.symptoms,
        water_source_type=payload.water_source_type,
        household_size=payload.household_size,
        recent_travel=payload.recent_travel,
        photo_url=payload.photo_url,
        notes=payload.notes,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    await realtime_manager.broadcast(
        event="symptom_report_created",
        payload={
            "id": report.id,
            "latitude": report.latitude,
            "longitude": report.longitude,
            "symptoms": report.symptoms,
            "reported_at": report.reported_at.isoformat(),
        },
    )

    return SymptomReportOut.model_validate(report)


@router.get("/reports", response_model=list[SymptomReportOut])
def get_reports(
    limit: int = Query(default=100, ge=1, le=1000),
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[SymptomReportOut]:
    query = db.query(SymptomReport)

    if current_user.role == UserRole.COMMUNITY:
        query = query.filter(SymptomReport.user_id == current_user.id)

    if start_date:
        query = query.filter(SymptomReport.reported_at >= start_date)
    if end_date:
        query = query.filter(SymptomReport.reported_at <= end_date)

    reports = query.order_by(SymptomReport.reported_at.desc()).limit(limit).all()
    return [SymptomReportOut.model_validate(row) for row in reports]


@router.get("/reports/export/csv")
def export_reports_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StreamingResponse:
    if current_user.role not in {UserRole.ADMIN, UserRole.HEALTH_OFFICER}:
        raise HTTPException(status_code=403, detail="Not authorized to export reports")

    reports = db.query(SymptomReport).order_by(SymptomReport.reported_at.desc()).all()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "id",
            "user_id",
            "reported_at",
            "latitude",
            "longitude",
            "symptoms",
            "water_source_type",
            "household_size",
            "recent_travel",
            "photo_url",
            "notes",
        ]
    )

    for row in reports:
        writer.writerow(
            [
                row.id,
                row.user_id,
                row.reported_at.isoformat(),
                row.latitude,
                row.longitude,
                "|".join(row.symptoms),
                row.water_source_type,
                row.household_size,
                row.recent_travel,
                row.photo_url or "",
                row.notes or "",
            ]
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=symptom_reports.csv"},
    )
