"""Populate local database with demo data for dashboard testing."""

from datetime import datetime, timedelta
import random

from sqlalchemy.orm import Session

from database.base import Base
from database.session import SessionLocal, engine
from models.alert import Alert, AlertChannel, AlertSeverity
from models.prediction import Prediction, RiskLevel
from models.symptom_report import SymptomReport
from models.user import User, UserRole
from models.water_quality import WaterQuality
from utils.auth import get_password_hash

SYMPTOMS = ["Diarrhea", "Vomiting", "Fever", "Cholera symptoms", "Typhoid symptoms"]


def seed_demo_data(db: Session, rows: int = 70, force: bool = False) -> bool:
    if not force and db.query(SymptomReport.id).first() is not None:
        return False

    user = db.query(User).filter(User.email == "citizen@healthmonitor.org").first()
    if not user:
        user = User(
            email="citizen@healthmonitor.org",
            full_name="Community Member",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.COMMUNITY,
        )
        db.add(user)
        db.flush()

    for _ in range(rows):
        lat = 12.9 + random.uniform(-0.25, 0.25)
        lon = 77.5 + random.uniform(-0.25, 0.25)
        dt = datetime.utcnow() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))

        db.add(
            SymptomReport(
                user_id=user.id,
                latitude=lat,
                longitude=lon,
                reported_at=dt,
                symptoms=random.sample(SYMPTOMS, random.randint(1, 3)),
                water_source_type=random.choice(["tap", "well", "river", "borewell"]),
                household_size=random.randint(2, 8),
                recent_travel=random.choice([True, False]),
                notes="Auto-generated seed sample",
            )
        )

        db.add(
            WaterQuality(
                latitude=lat,
                longitude=lon,
                collected_at=dt,
                ph=round(random.uniform(5.8, 8.9), 2),
                turbidity=round(random.uniform(1.0, 18.0), 2),
                temperature=round(random.uniform(18.0, 36.0), 2),
                dissolved_oxygen=round(random.uniform(4.0, 12.0), 2),
                ecoli_presence=random.random() < 0.35,
                tds=round(random.uniform(120.0, 620.0), 2),
                chlorine_level=round(random.uniform(0.1, 2.6), 2),
            )
        )

        level = random.choices(
            [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH],
            weights=[0.45, 0.35, 0.20],
            k=1,
        )[0]
        confidence = round(random.uniform(0.55, 0.97), 2)

        prediction = Prediction(
            latitude=lat,
            longitude=lon,
            predicted_at=dt,
            ph=round(random.uniform(5.8, 8.9), 2),
            turbidity=round(random.uniform(1.0, 18.0), 2),
            temperature=round(random.uniform(18.0, 36.0), 2),
            ecoli=random.choice([0, 1]),
            number_of_symptom_reports=random.randint(0, 50),
            population_density=round(random.uniform(1500.0, 12000.0), 2),
            rainfall=round(random.uniform(0.0, 220.0), 2),
            risk_level=level,
            confidence=confidence,
            triggered_alert=level == RiskLevel.HIGH,
        )
        db.add(prediction)
        db.flush()

        if level == RiskLevel.HIGH:
            db.add(
                Alert(
                    channel=AlertChannel.DASHBOARD,
                    severity=AlertSeverity.CRITICAL,
                    message=(
                        f"Seeded HIGH risk event near ({lat:.4f}, {lon:.4f}) "
                        f"with confidence {confidence:.2f}."
                    ),
                    risk_prediction_id=prediction.id,
                )
            )

    db.commit()
    return True


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        seeded = seed_demo_data(db)
        if seeded:
            print("Demo seed data inserted")
        else:
            print("Seed skipped because symptom reports already exist")
    finally:
        db.close()


if __name__ == "__main__":
    main()
