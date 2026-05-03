"""
NotifierService — persists alerts to DB and delivers them via email (Resend) or SMS (Twilio).
"""

import structlog
import resend
from twilio.rest import Client as TwilioClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.alert import Alert, AlertChannel, AlertType
from app.models.user import User

logger = structlog.get_logger()


class NotifierService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.log = logger.bind(service="notifier")
        resend.api_key = settings.RESEND_API_KEY

    async def send(
        self,
        user: User,
        alert_type: AlertType,
        title: str,
        body: str,
    ) -> Alert | None:
        """Persist alert and deliver via user's preferred channel(s)."""
        channel = self._pick_channel(user, alert_type)
        if channel is None:
            return None

        alert = Alert(
            user_id=user.id,
            alert_type=alert_type,
            channel=channel,
            title=title,
            body=body,
        )
        self.session.add(alert)

        try:
            if channel == AlertChannel.EMAIL and user.notify_email and user.email:
                await self._send_email(user.email, title, body)
                alert.delivered = True
            elif channel == AlertChannel.SMS and user.notify_sms and user.phone:
                self._send_sms(user.phone, f"{title}: {body}")
                alert.delivered = True
        except Exception as exc:
            self.log.warning("delivery_failed", error=str(exc), user_id=user.id)

        await self.session.commit()
        return alert

    def _pick_channel(self, user: User, alert_type: AlertType) -> AlertChannel | None:
        alert_enabled = {
            AlertType.BILL_FORECAST: user.alert_forecast,
            AlertType.TOU_WARNING: user.alert_tou,
            AlertType.TIER_WARNING: user.alert_tier,
            AlertType.VAMPIRE_POWER: user.alert_vampire,
            AlertType.SPIKE_DETECTED: user.alert_forecast,
        }.get(alert_type, False)

        if not alert_enabled:
            return None
        # Prefer SMS for real-time alerts, email for summaries
        if user.notify_sms and user.phone and alert_type in (
            AlertType.TOU_WARNING, AlertType.SPIKE_DETECTED
        ):
            return AlertChannel.SMS
        if user.notify_email:
            return AlertChannel.EMAIL
        return None

    async def _send_email(self, to: str, subject: str, body: str) -> None:
        params: resend.Emails.SendParams = {
            "from": settings.RESEND_FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": f"<p>{body}</p><hr><p style='color:#888;font-size:12px'>VoltAgent — Your personal energy manager. <a href='#'>Manage preferences</a></p>",
        }
        resend.Emails.send(params)
        self.log.info("email_sent", to=to, subject=subject)

    def _send_sms(self, to: str, message: str) -> None:
        client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(to=to, from_=settings.TWILIO_FROM_NUMBER, body=message[:160])
        self.log.info("sms_sent", to=to)
