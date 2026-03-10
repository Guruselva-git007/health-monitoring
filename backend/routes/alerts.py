import csv
from io import StringIO

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database.session import get_db
from models.alert import Alert
from models.user import User, UserRole
from schemas.alert import AlertOut
from utils.auth import get_current_user

router = APIRouter(tags=["Alerts"])


@router.get("/alerts", response_model=list[AlertOut])
def get_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AlertOut]:
    query = db.query(Alert)
    if current_user.role == UserRole.COMMUNITY:
        query = query.filter((Alert.target_user_id == current_user.id) | (Alert.target_user_id.is_(None)))

    alerts = query.order_by(Alert.created_at.desc()).limit(300).all()
    return [AlertOut.model_validate(row) for row in alerts]


@router.post("/alerts/{alert_id}/read", response_model=AlertOut)
def mark_alert_as_read(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AlertOut:
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if current_user.role == UserRole.COMMUNITY and alert.target_user_id not in {None, current_user.id}:
        raise HTTPException(status_code=403, detail="Not allowed")

    alert.is_read = True
    db.commit()
    db.refresh(alert)
    return AlertOut.model_validate(alert)


@router.get("/alerts/export/csv")
def export_alerts_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StreamingResponse:
    if current_user.role not in {UserRole.ADMIN, UserRole.HEALTH_OFFICER}:
        raise HTTPException(status_code=403, detail="Not authorized to export alerts")

    alerts = db.query(Alert).order_by(Alert.created_at.desc()).all()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "created_at", "channel", "severity", "message", "target_user_id", "is_read"])

    for row in alerts:
        writer.writerow(
            [
                row.id,
                row.created_at.isoformat(),
                row.channel.value,
                row.severity.value,
                row.message,
                row.target_user_id or "",
                row.is_read,
            ]
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=alerts.csv"},
    )
