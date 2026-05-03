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

_WEEKLY_SUMMARY_HTML = """
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
  <div style="background:#2563eb;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:20px">⚡ Your Weekly VoltAgent Summary</h1>
  </div>
  <div style="background:#f8fafc;padding:32px;border-radius:0 0 8px 8px">
    <p style="font-size:16px;margin:0 0 24px">Hi {name},</p>

    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;margin-bottom:16px">
      <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em">Estimated Bill This Month</p>
      <p style="margin:0;font-size:32px;font-weight:700;color:#2563eb">${projected_bill}</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
        <p style="margin:0 0 4px;color:#64748b;font-size:12px">kWh This Month</p>
        <p style="margin:0;font-size:22px;font-weight:600">{kwh_used}</p>
      </div>
      <div style="background:#ecfdf5;border:1px solid #d1fae5;border-radius:8px;padding:16px">
        <p style="margin:0 0 4px;color:#065f46;font-size:12px">Saved vs Last Month</p>
        <p style="margin:0;font-size:22px;font-weight:600;color:#059669">${dollars_saved}</p>
      </div>
    </div>

    {challenge_block}

    <p style="color:#64748b;font-size:13px;margin:24px 0 0">
      {agent_tip}
    </p>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#94a3b8;font-size:12px;margin:0">
      VoltAgent &mdash; Your personal energy manager.
      <a href="{app_url}/settings" style="color:#2563eb">Manage preferences</a>
    </p>
  </div>
</div>
"""

_CHALLENGE_BLOCK = """
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 4px;color:#92400e;font-size:12px;text-transform:uppercase">30-Day Sprint — Day {days_elapsed}/30</p>
      <div style="background:#e2e8f0;border-radius:4px;height:8px;overflow:hidden;margin:8px 0">
        <div style="background:#f59e0b;height:100%;width:{progress_pct}%"></div>
      </div>
      <p style="margin:4px 0 0;font-size:13px;color:#78350f">
        {days_on_target} of {days_elapsed} days on target &mdash; <strong>${challenge_dollars_saved} saved</strong>
      </p>
    </div>
"""


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

    async def send_weekly_summary(
        self,
        user: User,
        projected_bill: float,
        kwh_used: float,
        dollars_saved: float,
        agent_tip: str,
        challenge: dict | None = None,
    ) -> None:
        """Send the weekly "I saved you $X" summary email."""
        if not user.notify_email or not user.email:
            return

        challenge_block = ""
        if challenge:
            challenge_block = _CHALLENGE_BLOCK.format(
                days_elapsed=challenge["days_elapsed"],
                progress_pct=challenge["progress_pct"],
                days_on_target=challenge["days_on_target"],
                challenge_dollars_saved=f"{challenge['dollars_saved_total']:.2f}",
            )

        html = _WEEKLY_SUMMARY_HTML.format(
            name=user.full_name.split()[0],
            projected_bill=f"{projected_bill:.2f}",
            kwh_used=f"{kwh_used:.1f}",
            dollars_saved=f"{dollars_saved:.2f}",
            challenge_block=challenge_block,
            agent_tip=agent_tip,
            app_url=settings.FRONTEND_URL,
        )

        try:
            params: resend.Emails.SendParams = {
                "from": settings.RESEND_FROM_EMAIL,
                "to": [user.email],
                "subject": f"Your weekly energy summary — ${projected_bill:.2f} projected bill",
                "html": html,
            }
            resend.Emails.send(params)
            self.log.info("weekly_summary_sent", user_id=user.id)
        except Exception as exc:
            self.log.warning("weekly_summary_failed", error=str(exc), user_id=user.id)

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
            "html": (
                f"<div style='font-family:sans-serif;max-width:560px;margin:0 auto'>"
                f"<p>{body}</p>"
                f"<hr><p style='color:#888;font-size:12px'>VoltAgent &mdash; "
                f"<a href='{settings.FRONTEND_URL}/settings'>Manage preferences</a></p></div>"
            ),
        }
        resend.Emails.send(params)
        self.log.info("email_sent", to=to, subject=subject)

    def _send_sms(self, to: str, message: str) -> None:
        client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(to=to, from_=settings.TWILIO_FROM_NUMBER, body=message[:160])
        self.log.info("sms_sent", to=to)
