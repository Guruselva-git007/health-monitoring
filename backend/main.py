from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.base import Base
from database.config import settings
from database.session import SessionLocal, engine
from routes.alerts import router as alert_router
from routes.auth import router as auth_router
from routes.monitoring import router as monitoring_router
from routes.prediction import router as prediction_router
from routes.reports import router as reports_router
from routes.water import router as water_router
from utils.startup import ensure_admin_account, ensure_demo_seed_data, ensure_model_artifacts

app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    ensure_model_artifacts()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        ensure_admin_account(db)
        ensure_demo_seed_data(db)
    finally:
        db.close()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(reports_router)
app.include_router(water_router)
app.include_router(prediction_router)
app.include_router(alert_router)
app.include_router(monitoring_router)
