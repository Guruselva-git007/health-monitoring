from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Smart Community Health Monitoring API"
    secret_key: str = "change_this_to_a_secure_random_value"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 24 * 60

    database_url: str = "sqlite:///./health_monitoring.db"
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:19006",
        "http://127.0.0.1:19006",
    ]

    smtp_host: str = "localhost"
    smtp_port: int = 1025
    smtp_user: str = ""
    smtp_password: str = ""

    sms_api_url: str = ""
    sms_api_key: str = ""

    model_path: str = "ml_model/models/rf_risk_model.joblib"
    metrics_path: str = "ml_model/models/rf_metrics.json"

    default_admin_email: str = "admin@healthmonitor.org"
    default_admin_password: str = "ChangeMe123!"
    auto_train_model_on_startup: bool = False
    auto_seed_on_startup: bool = True
    demo_seed_records: int = 70

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
