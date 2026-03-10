from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    channel: str
    severity: str
    message: str
    is_read: bool
    target_user_id: str | None = None
    risk_prediction_id: str | None = None
