"""
CoordinatorAgent — orchestrates all specialist agents and persists alerts.
Called by the dashboard endpoint and by the Celery background beat.
"""

import asyncio
from datetime import datetime, timezone  # noqa: timezone used in run_full_analysis

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.forecasting_agent import ForecastingAgent
from app.agents.tier_agent import TierAgent
from app.agents.tou_agent import TOUAgent
from app.agents.vampire_agent import VampireAgent
from app.models.alert import Alert, AlertType
from app.models.user import User
from app.repositories.usage import UsageRepository
from app.services.notifier import NotifierService

logger = structlog.get_logger()

# Washington state default TOU schedule (PSE winter)
DEFAULT_TOU = {
    "peak_start": 7,
    "peak_end": 10,
    "evening_peak_start": 17,
    "evening_peak_end": 20,
    "peak_rate_cents": 15.9,
    "off_peak_rate_cents": 8.9,
    "super_off_peak_rate_cents": 6.5,
    "super_off_peak_start": 23,
    "super_off_peak_end": 7,
}


class CoordinatorAgent:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.log = logger.bind(agent="coordinator")

    async def get_dashboard_snapshot(self, user: User) -> dict:
        """
        Return real-time dashboard data without any OpenAI calls.
        All values are computed deterministically so the dashboard loads instantly
        even when the user has no usage data yet.
        AI agents only run in the background Celery beat (run_full_analysis).
        """
        # Use naive UTC — DB column is TIMESTAMP WITHOUT TIME ZONE
        now = datetime.utcnow()
        usage_repo = UsageRepository(self.session)

        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        records = await usage_repo.get_for_period(user.id, month_start, now)

        kwh_used = sum(r.kwh for r in records)
        days_elapsed = max((now - month_start).days + 1, 1)
        days_in_month = 30

        # Bill projection
        tier1 = min(kwh_used, 600.0)
        tier2 = max(0.0, kwh_used - 600.0)
        bill_so_far = tier1 * 0.112 + tier2 * 0.159
        projected = (bill_so_far / days_elapsed) * days_in_month

        # TOU period — determined by hour alone, no LLM needed
        hour = now.hour
        tou = DEFAULT_TOU
        if tou["peak_start"] <= hour < tou["peak_end"] or tou["evening_peak_start"] <= hour < tou["evening_peak_end"]:
            current_period = "peak"
            current_rate = tou["peak_rate_cents"]
        elif hour >= tou["super_off_peak_start"] or hour < tou["super_off_peak_end"]:
            current_period = "super-off-peak"
            current_rate = tou["super_off_peak_rate_cents"]
        else:
            current_period = "off-peak"
            current_rate = tou["off_peak_rate_cents"]

        # Vampire power — simple average of nightly baselines, no LLM needed
        baselines = self._compute_nightly_baselines(records)
        avg_watts = (sum(baselines) / len(baselines)) if baselines else 0.0
        vampire_monthly_kwh = avg_watts / 1000 * 24 * 30
        vampire_monthly_cost = vampire_monthly_kwh * tou["off_peak_rate_cents"] / 100
        vampire_devices = 1 if avg_watts > 50 else 0

        return {
            "bill_forecast_dollars": round(projected, 2),
            "kwh_used_this_month": round(kwh_used, 1),
            "tier1_limit_kwh": 600.0,
            "current_rate_period": current_period,
            "current_rate_cents_per_kwh": current_rate,
            "vampire_monthly_cost_dollars": round(vampire_monthly_cost, 2),
            "vampire_devices_flagged": vampire_devices,
        }

    async def run_full_analysis(self, user: User) -> list[Alert]:
        """
        Run all agents and persist any triggered alerts.
        Called by the Celery background beat (every 15 min per user).
        """
        self.log.info("run_full_analysis", user_id=user.id)
        now = datetime.utcnow()  # naive UTC — matches DB TIMESTAMP WITHOUT TIME ZONE
        usage_repo = UsageRepository(self.session)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        records = await usage_repo.get_for_period(user.id, month_start, now)
        kwh_used = sum(r.kwh for r in records)
        days_elapsed = (now - month_start).days + 1

        forecasting_ctx = {
            "kwh_used": kwh_used,
            "days_elapsed": days_elapsed,
            "days_in_month": 30,
            "tier1_limit": 600.0,
            "tier1_rate": 0.112,
            "tier2_rate": 0.159,
            "budget_dollars": None,
        }
        tier_ctx = {**forecasting_ctx}
        tou_ctx = {**DEFAULT_TOU, "current_hour": now.hour}
        vampire_ctx = {
            "nightly_baselines_watts": self._compute_nightly_baselines(records),
            "rate_cents_per_kwh": DEFAULT_TOU["off_peak_rate_cents"],
        }

        forecast_res, tier_res, tou_res, vampire_res = await asyncio.gather(
            ForecastingAgent().run(forecasting_ctx),
            TierAgent().run(tier_ctx),
            TOUAgent().run(tou_ctx),
            VampireAgent().run(vampire_ctx),
        )

        notifier = NotifierService(self.session)
        created: list[Alert] = []

        alert_map = [
            (forecast_res, AlertType.BILL_FORECAST),
            (tier_res, AlertType.TIER_WARNING),
            (tou_res, AlertType.TOU_WARNING),
            (vampire_res, AlertType.VAMPIRE_POWER),
        ]

        for result, alert_type in alert_map:
            if result.get("fire_alert") and result.get("alert_title"):
                alert = await notifier.send(
                    user=user,
                    alert_type=alert_type,
                    title=result["alert_title"],
                    body=result["alert_body"] or "",
                )
                if alert:
                    created.append(alert)

        return created

    def _compute_nightly_baselines(self, records: list) -> list[float]:
        """Estimate nightly baseline watts from quiet-hour (1-5 AM) records."""
        from collections import defaultdict

        nights: dict[str, list[float]] = defaultdict(list)
        for r in records:
            if 1 <= r.interval_start.hour <= 5:
                day_key = r.interval_start.date().isoformat()
                # Convert 15-min kWh to average watts: kWh * 4 * 1000
                nights[day_key].append(r.kwh * 4000)

        baselines = []
        for readings in nights.values():
            if readings:
                baselines.append(sum(readings) / len(readings))

        return baselines[-14:] if baselines else []
