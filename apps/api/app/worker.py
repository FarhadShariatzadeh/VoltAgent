"""
Celery application — background tasks and beat schedule.
"""

import asyncio
from datetime import datetime, timedelta, timezone

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery = Celery("voltagent", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

celery.conf.beat_schedule = {
    "run-agent-analysis": {
        "task": "app.worker.run_agent_analysis_all_users",
        "schedule": crontab(minute="*/15"),
    },
    "update-challenge-day-results": {
        "task": "app.worker.update_challenge_day_results",
        "schedule": crontab(hour=1, minute=0),  # 1 AM UTC nightly
    },
    "compute-platform-snapshot": {
        "task": "app.worker.compute_platform_snapshot",
        "schedule": crontab(hour=2, minute=0),  # 2 AM UTC nightly
    },
    "send-weekly-summaries": {
        "task": "app.worker.send_weekly_summaries",
        "schedule": crontab(hour=9, minute=0, day_of_week=1),  # Monday 9 AM UTC
    },
}
celery.conf.timezone = "UTC"


@celery.task(name="app.worker.run_agent_analysis_all_users")
def run_agent_analysis_all_users() -> None:
    asyncio.run(_run_analysis())


@celery.task(name="app.worker.update_challenge_day_results")
def update_challenge_day_results() -> None:
    asyncio.run(_update_challenges())


@celery.task(name="app.worker.compute_platform_snapshot")
def compute_platform_snapshot() -> None:
    asyncio.run(_compute_snapshot())


@celery.task(name="app.worker.send_weekly_summaries")
def send_weekly_summaries() -> None:
    asyncio.run(_send_weekly_summaries())


async def _run_analysis() -> None:
    from sqlalchemy import select

    from app.agents.coordinator import CoordinatorAgent
    from app.db.base import AsyncSessionLocal
    from app.models.user import User

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()

    for user in users:
        async with AsyncSessionLocal() as session:
            coordinator = CoordinatorAgent(session)
            await coordinator.run_full_analysis(user)


async def _update_challenges() -> None:
    from sqlalchemy import select

    from app.db.base import AsyncSessionLocal
    from app.models.challenge import Challenge, ChallengeDayResult, ChallengeStatus
    from app.repositories.usage import UsageRepository

    now = datetime.now(timezone.utc)
    today = now.date()

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Challenge).where(Challenge.status == ChallengeStatus.ACTIVE)
        )
        challenges = result.scalars().all()

        for challenge in challenges:
            started = challenge.started_at
            if started.tzinfo is None:
                started = started.replace(tzinfo=timezone.utc)

            day_number = (now - started).days  # 0-indexed current day
            if day_number < 0:
                continue

            # Mark expired challenges
            ends = challenge.ends_at
            if ends.tzinfo is None:
                ends = ends.replace(tzinfo=timezone.utc)
            if now >= ends:
                challenge.status = (
                    ChallengeStatus.COMPLETED
                    if challenge.days_on_target >= 21
                    else ChallengeStatus.FAILED
                )
                continue

            # Compute yesterday's result (day_number - 1)
            result_day = day_number - 1
            if result_day < 0:
                continue

            # Check if already recorded
            existing = await session.execute(
                select(ChallengeDayResult).where(
                    ChallengeDayResult.challenge_id == challenge.id,
                    ChallengeDayResult.day_number == result_day,
                )
            )
            if existing.scalar_one_or_none():
                continue

            # Fetch yesterday's usage
            yesterday_start = started + timedelta(days=result_day)
            yesterday_end = yesterday_start + timedelta(days=1)
            usage_repo = UsageRepository(session)
            records = await usage_repo.get_for_period(
                challenge.user_id, yesterday_start, yesterday_end
            )
            actual_kwh = sum(r.kwh for r in records)
            met = actual_kwh <= challenge.target_daily_kwh
            kwh_saved = max(0.0, challenge.baseline_daily_kwh - actual_kwh)
            dollars_saved = round(kwh_saved * 0.13, 4)

            day_result = ChallengeDayResult(
                challenge_id=challenge.id,
                day_number=result_day,
                date=yesterday_start.date(),
                actual_kwh=round(actual_kwh, 3),
                target_kwh=challenge.target_daily_kwh,
                met_target=met,
                dollars_saved=dollars_saved,
            )
            session.add(day_result)

            if met:
                challenge.days_on_target += 1
            challenge.kwh_saved_total = round(
                challenge.kwh_saved_total + kwh_saved, 3
            )
            challenge.dollars_saved_total = round(
                challenge.dollars_saved_total + dollars_saved, 4
            )

        await session.commit()


async def _compute_snapshot() -> None:
    from sqlalchemy import func, select

    from app.db.base import AsyncSessionLocal
    from app.models.alert import Alert
    from app.models.analytics import DailyPlatformSnapshot
    from app.models.challenge import Challenge, ChallengeStatus
    from app.models.user import User
    from app.models.utility_data import UsageRecord

    now = datetime.now(timezone.utc)
    today = now.date()
    thirty_days_ago = now - timedelta(days=30)

    async with AsyncSessionLocal() as session:
        # Check if snapshot already exists for today
        existing = await session.scalar(
            select(DailyPlatformSnapshot).where(
                DailyPlatformSnapshot.snapshot_date >= now.replace(hour=0, minute=0, second=0, microsecond=0)
            )
        )
        if existing:
            return

        total_users = await session.scalar(select(func.count(User.id))) or 0
        active_30d = (
            await session.scalar(
                select(func.count(User.id)).where(User.created_at >= thirty_days_ago)
            )
            or 0
        )
        new_signups = active_30d

        total_kwh = await session.scalar(select(func.sum(UsageRecord.kwh))) or 0.0
        est_kwh_saved = total_kwh * 0.10
        est_dollars_saved = est_kwh_saved * 0.13

        alerts_sent = (
            await session.scalar(
                select(func.count(Alert.id)).where(Alert.delivered == True)  # noqa: E712
            )
            or 0
        )

        snapshot = DailyPlatformSnapshot(
            snapshot_date=now,
            total_users=total_users,
            active_users_24h=0,
            active_users_30d=active_30d,
            new_signups=new_signups,
            total_kwh_saved=round(est_kwh_saved, 2),
            total_dollars_saved=round(est_dollars_saved, 2),
            kwh_shifted_to_offpeak=round(est_kwh_saved * 0.6, 2),
            pct_shifted=round(est_kwh_saved / total_kwh * 100, 2) if total_kwh else 0.0,
            alerts_sent=alerts_sent,
            alerts_actioned=0,
            computed_at=now,
        )
        session.add(snapshot)
        await session.commit()


async def _send_weekly_summaries() -> None:
    from sqlalchemy import func, select

    from app.db.base import AsyncSessionLocal
    from app.models.challenge import Challenge, ChallengeStatus
    from app.models.user import User
    from app.models.utility_data import UsageRecord
    from app.services.notifier import NotifierService

    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.notify_email == True)  # noqa: E712
        )
        users = result.scalars().all()

    for user in users:
        async with AsyncSessionLocal() as session:
            # This month's kWh
            month_kwh = (
                await session.scalar(
                    select(func.sum(UsageRecord.kwh)).where(
                        UsageRecord.user_id == user.id,
                        UsageRecord.interval_start >= month_start,
                    )
                )
                or 0.0
            )

            # Last month's kWh for savings delta
            last_month_kwh = (
                await session.scalar(
                    select(func.sum(UsageRecord.kwh)).where(
                        UsageRecord.user_id == user.id,
                        UsageRecord.interval_start >= last_month_start,
                        UsageRecord.interval_start < month_start,
                    )
                )
                or 0.0
            )

            # Bill projection (tiered WA rates)
            days_elapsed = (now - month_start).days + 1
            daily_rate = month_kwh / days_elapsed if days_elapsed > 0 else 0
            projected_kwh = daily_rate * 30
            tier1 = min(projected_kwh, 600)
            tier2 = max(0, projected_kwh - 600)
            projected_bill = round(tier1 * 0.112 + tier2 * 0.159, 2)

            # Savings vs last month
            kwh_delta = max(0.0, last_month_kwh - month_kwh)
            dollars_saved = round(kwh_delta * 0.13, 2)

            # Active challenge info
            challenge_data = None
            active = await session.scalar(
                select(Challenge).where(
                    Challenge.user_id == user.id,
                    Challenge.status == ChallengeStatus.ACTIVE,
                )
            )
            if active:
                started = active.started_at
                if started.tzinfo is None:
                    started = started.replace(tzinfo=timezone.utc)
                days_elapsed_ch = max(0, (now - started).days)
                challenge_data = {
                    "days_elapsed": days_elapsed_ch,
                    "progress_pct": round(min(100.0, days_elapsed_ch / 30 * 100), 1),
                    "days_on_target": active.days_on_target,
                    "dollars_saved_total": active.dollars_saved_total,
                }

            notifier = NotifierService(session)
            await notifier.send_weekly_summary(
                user=user,
                projected_bill=projected_bill,
                kwh_used=round(month_kwh, 1),
                dollars_saved=dollars_saved,
                agent_tip="Shift your laundry and dishwasher to after 9 PM to avoid peak rates and trim your bill further.",
                challenge=challenge_data,
            )
