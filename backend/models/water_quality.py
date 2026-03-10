import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base


class WaterQuality(Base):
    __tablename__ = "water_quality"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    collected_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    ph: Mapped[float] = mapped_column(Float, nullable=False)
    turbidity: Mapped[float] = mapped_column(Float, nullable=False)
    temperature: Mapped[float] = mapped_column(Float, nullable=False)
    dissolved_oxygen: Mapped[float] = mapped_column(Float, nullable=False)
    ecoli_presence: Mapped[bool] = mapped_column(Boolean, nullable=False)
    tds: Mapped[float] = mapped_column(Float, nullable=False)
    chlorine_level: Mapped[float] = mapped_column(Float, nullable=False)
