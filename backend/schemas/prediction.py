from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PredictionRequest(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    ph: float = Field(ge=0, le=14)
    turbidity: float = Field(ge=0, le=2000)
    temperature: float = Field(ge=-10, le=80)
    ecoli: int = Field(ge=0, le=1)
    number_of_symptom_reports: int = Field(ge=0, le=100000)
    population_density: float = Field(ge=0, le=100000)
    rainfall: float = Field(ge=0, le=10000)


class PredictionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    predicted_at: datetime
    latitude: float
    longitude: float
    risk_level: str
    confidence: float
    probabilities: dict[str, float]
    triggered_alert: bool
