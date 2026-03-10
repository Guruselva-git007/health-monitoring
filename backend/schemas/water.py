from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WaterQualityCreate(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    collected_at: datetime | None = None
    ph: float = Field(ge=0, le=14)
    turbidity: float = Field(ge=0, le=2000)
    temperature: float = Field(ge=-10, le=80)
    dissolved_oxygen: float = Field(ge=0, le=30)
    ecoli_presence: bool
    tds: float = Field(ge=0, le=5000)
    chlorine_level: float = Field(ge=0, le=20)


class WaterQualityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    collected_at: datetime
    latitude: float
    longitude: float
    ph: float
    turbidity: float
    temperature: float
    dissolved_oxygen: float
    ecoli_presence: bool
    tds: float
    chlorine_level: float
