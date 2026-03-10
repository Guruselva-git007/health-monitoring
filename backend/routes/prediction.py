from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.session import get_db
from ml_model.model_manager import risk_model_manager
from models.prediction import Prediction, RiskLevel
from models.user import User, UserRole
from schemas.prediction import PredictionRequest, PredictionResponse
from utils.auth import get_current_user
from utils.notifications import NotificationService
from utils.realtime import realtime_manager

router = APIRouter(tags=["Prediction"])


@router.post("/predict-risk", response_model=PredictionResponse)
async def predict_risk(
    payload: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PredictionResponse:
    if current_user.role not in {UserRole.ADMIN, UserRole.HEALTH_OFFICER}:
        # Community users can call for educational insights but data is still accepted.
        pass

    result = risk_model_manager.predict(payload.model_dump())

    prediction = Prediction(
        latitude=payload.latitude,
        longitude=payload.longitude,
        ph=payload.ph,
        turbidity=payload.turbidity,
        temperature=payload.temperature,
        ecoli=payload.ecoli,
        number_of_symptom_reports=payload.number_of_symptom_reports,
        population_density=payload.population_density,
        rainfall=payload.rainfall,
        risk_level=RiskLevel(result.risk_level),
        confidence=result.confidence,
        triggered_alert=False,
    )
    db.add(prediction)
    db.flush()

    if result.risk_level == RiskLevel.HIGH.value:
        notifier = NotificationService(db)
        notifier.trigger_high_risk_alerts(prediction)
        prediction.triggered_alert = True

    db.commit()
    db.refresh(prediction)

    await realtime_manager.broadcast(
        event="risk_prediction_created",
        payload={
            "id": prediction.id,
            "risk_level": prediction.risk_level.value,
            "confidence": prediction.confidence,
            "latitude": prediction.latitude,
            "longitude": prediction.longitude,
            "predicted_at": prediction.predicted_at.isoformat(),
            "triggered_alert": prediction.triggered_alert,
        },
    )

    return PredictionResponse(
        id=prediction.id,
        predicted_at=prediction.predicted_at,
        latitude=prediction.latitude,
        longitude=prediction.longitude,
        risk_level=prediction.risk_level.value,
        confidence=prediction.confidence,
        probabilities=result.probabilities,
        triggered_alert=prediction.triggered_alert,
    )


@router.get("/risk-map")
def risk_map(
    limit: int = Query(default=500, ge=1, le=2000),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    rows = db.query(Prediction).order_by(Prediction.predicted_at.desc()).limit(limit).all()
    return {
        "items": [
            {
                "id": row.id,
                "latitude": row.latitude,
                "longitude": row.longitude,
                "risk_level": row.risk_level.value,
                "confidence": row.confidence,
                "predicted_at": row.predicted_at,
            }
            for row in rows
        ],
        "model_metrics": risk_model_manager.load_metrics(),
    }
