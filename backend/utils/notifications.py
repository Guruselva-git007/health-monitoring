from __future__ import annotations

import smtplib
from email.message import EmailMessage

from sqlalchemy.orm import Session

from database.config import settings
from models.alert import Alert, AlertChannel, AlertSeverity
from models.prediction import Prediction
from models.user import User, UserRole


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def _persist_alert(
        self,
        *,
        message: str,
        severity: AlertSeverity,
        channel: AlertChannel,
        target_user_id: str | None,
        prediction_id: str | None,
    ) -> Alert:
        alert = Alert(
            message=message,
            severity=severity,
            channel=channel,
            target_user_id=target_user_id,
            risk_prediction_id=prediction_id,
        )
        self.db.add(alert)
        return alert

    def send_email(self, to_email: str, subject: str, body: str) -> bool:
        if not settings.smtp_host:
            return False

        try:
            msg = EmailMessage()
            msg["Subject"] = subject
            msg["From"] = settings.smtp_user or "alerts@healthmonitor.local"
            msg["To"] = to_email
            msg.set_content(body)

            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
                if settings.smtp_user and settings.smtp_password:
                    server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)
            return True
        except Exception:
            return False

    def send_push(self, user_id: str, message: str) -> bool:
        # Production systems should integrate FCM/APNS or a notification broker.
        return bool(user_id and message)

    def send_sms(self, user_id: str, message: str) -> bool:
        # Placeholder for SMS providers (Twilio, SNS, etc.).
        return bool(user_id and message)

    def trigger_high_risk_alerts(self, prediction: Prediction) -> list[Alert]:
        officers = (
            self.db.query(User)
            .filter(User.role.in_([UserRole.ADMIN, UserRole.HEALTH_OFFICER]), User.is_active.is_(True))
            .all()
        )
        community_users = (
            self.db.query(User)
            .filter(User.role == UserRole.COMMUNITY, User.is_active.is_(True))
            .all()
        )

        base_message = (
            f"HIGH outbreak risk detected near ({prediction.latitude:.4f}, {prediction.longitude:.4f}). "
            f"Confidence: {prediction.confidence:.2f}. Immediate field investigation is recommended."
        )

        created_alerts: list[Alert] = []

        for officer in officers:
            self.send_email(officer.email, "High Outbreak Risk Alert", base_message)
            self.send_push(officer.id, base_message)
            self.send_sms(officer.id, base_message)

            created_alerts.append(
                self._persist_alert(
                    message=base_message,
                    severity=AlertSeverity.CRITICAL,
                    channel=AlertChannel.EMAIL,
                    target_user_id=officer.id,
                    prediction_id=prediction.id,
                )
            )
            created_alerts.append(
                self._persist_alert(
                    message=base_message,
                    severity=AlertSeverity.CRITICAL,
                    channel=AlertChannel.PUSH,
                    target_user_id=officer.id,
                    prediction_id=prediction.id,
                )
            )
            created_alerts.append(
                self._persist_alert(
                    message=base_message,
                    severity=AlertSeverity.CRITICAL,
                    channel=AlertChannel.SMS,
                    target_user_id=officer.id,
                    prediction_id=prediction.id,
                )
            )

        for user in community_users:
            self.send_push(user.id, base_message)
            self.send_sms(user.id, base_message)
            created_alerts.append(
                self._persist_alert(
                    message=base_message,
                    severity=AlertSeverity.WARNING,
                    channel=AlertChannel.PUSH,
                    target_user_id=user.id,
                    prediction_id=prediction.id,
                )
            )

        created_alerts.append(
            self._persist_alert(
                message=base_message,
                severity=AlertSeverity.CRITICAL,
                channel=AlertChannel.DASHBOARD,
                target_user_id=None,
                prediction_id=prediction.id,
            )
        )

        return created_alerts
