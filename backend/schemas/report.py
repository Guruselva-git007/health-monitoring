from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SymptomReportCreate(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    date: datetime | None = None
    symptoms: list[str] = Field(min_length=1)
    water_source_type: str = Field(min_length=2, max_length=100)
    household_size: int = Field(ge=1, le=50)
    recent_travel: bool = False
    photo_url: str | None = None
    notes: str | None = None


class SymptomReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    latitude: float
    longitude: float
    reported_at: datetime
    symptoms: list[str]
    water_source_type: str
    household_size: int
    recent_travel: bool
    photo_url: str | None = None
    notes: str | None = None
