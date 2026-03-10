from schemas.alert import AlertOut
from schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserOut
from schemas.prediction import PredictionRequest, PredictionResponse
from schemas.report import SymptomReportCreate, SymptomReportOut
from schemas.water import WaterQualityCreate, WaterQualityOut

__all__ = [
    "RegisterRequest",
    "LoginRequest",
    "TokenResponse",
    "UserOut",
    "SymptomReportCreate",
    "SymptomReportOut",
    "WaterQualityCreate",
    "WaterQualityOut",
    "PredictionRequest",
    "PredictionResponse",
    "AlertOut",
]
