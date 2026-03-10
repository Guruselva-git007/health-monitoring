from pathlib import Path

from sqlalchemy.orm import Session

from database.config import settings
from models.user import User, UserRole
from utils.auth import get_password_hash
from utils.seed_demo_data import seed_demo_data


def ensure_model_artifacts() -> bool:
    model_path = Path(settings.model_path)
    metrics_path = Path(settings.metrics_path)

    if model_path.exists() and metrics_path.exists():
        return False

    if not settings.auto_train_model_on_startup:
        return False

    try:
        from ml_model.train_random_forest import main as train_random_forest

        model_path.parent.mkdir(parents=True, exist_ok=True)
        metrics_path.parent.mkdir(parents=True, exist_ok=True)
        train_random_forest()
        return True
    except Exception:
        # Keep service startup resilient when optional ML training deps are missing.
        return False


def ensure_admin_account(db: Session) -> bool:
    admin = db.query(User).filter(User.email == settings.default_admin_email.lower()).first()
    if admin is not None:
        return False

    db.add(
        User(
            email=settings.default_admin_email.lower(),
            full_name="System Admin",
            password_hash=get_password_hash(settings.default_admin_password),
            role=UserRole.ADMIN,
            preferred_language="en",
        )
    )
    db.commit()
    return True


def ensure_demo_seed_data(db: Session) -> bool:
    if not settings.auto_seed_on_startup:
        return False

    return seed_demo_data(db, rows=settings.demo_seed_records)
