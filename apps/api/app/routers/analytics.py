"""
Analytics router — investor-facing metrics.
All endpoints require authentication; summary stats are aggregated across the platform.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import func, select

from app.core.deps import CurrentUser, DBSession
from app.models.alert import Alert
from app.models.analytics import DailyPlatformSnapshot
from app.models.challenge import Challenge, ChallengeStatus
from app.models.user import User
from app.models.utility_data import UsageRecord

router = APIRouter()


class PlatformMetrics(BaseModel):
    total_users: int
    active_users_30d: int
    new_signups_last_30d: int
    total_kwh_saved: float
    total_dollars_saved: float
    kwh_shifted_to_offpeak: float
    pct_load_shifted: float
    alerts_sent_total: int
    active_challenges: int
    avg_monthly_savings_per_user: float


class GrowthSnapshot(BaseModel):
    date: str
    total_users: int
    active_users_30d: int
    total_dollars_saved: float


class UserSavingsSummary(BaseModel):
    kwh_used_this_month: float
    projected_bill_dollars: float
    dollars_saved_vs_last_month: float
    challenges_completed: int
    total_kwh_saved_all_time: float
    total_dollars_saved_all_time: float


@router.get("/platform", response_model=PlatformMetrics)
async def get_platform_metrics(_user: CurrentUser, session: DBSession) -> PlatformMetrics:
    """Aggregate platform-wide investor metrics."""
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)

    total_users = await session.scalar(select(func.count(User.id))) or 0
    active_users_30d = (
        await session.scalar(
            select(func.count(User.id)).where(User.created_at >= thirty_days_ago)
        )
        or 0
    )
    new_signups = (
        await session.scalar(
            select(func.count(User.id)).where(User.created_at >= thirty_days_ago)
        )
        or 0
    )

    total_kwh = await session.scalar(select(func.sum(UsageRecord.kwh))) or 0.0
    # Estimate savings: 10% of total platform consumption at avg $0.13/kWh
    est_kwh_saved = total_kwh * 0.10
    est_dollars_saved = est_kwh_saved * 0.13

    alerts_sent = await session.scalar(select(func.count(Alert.id)).where(Alert.delivered == True)) or 0  # noqa: E712

    active_challenges = (
        await session.scalar(
            select(func.count(Challenge.id)).where(Challenge.status == ChallengeStatus.ACTIVE)
        )
        or 0
    )

    avg_savings = round(est_dollars_saved / total_users, 2) if total_users else 0.0

    return PlatformMetrics(
        total_users=total_users,
        active_users_30d=active_users_30d,
        new_signups_last_30d=new_signups,
        total_kwh_saved=round(est_kwh_saved, 1),
        total_dollars_saved=round(est_dollars_saved, 2),
        kwh_shifted_to_offpeak=round(est_kwh_saved * 0.6, 1),
        pct_load_shifted=round(est_kwh_saved / total_kwh * 100, 1) if total_kwh else 0.0,
        alerts_sent_total=alerts_sent,
        active_challenges=active_challenges,
        avg_monthly_savings_per_user=avg_savings,
    )


@router.get("/growth", response_model=list[GrowthSnapshot])
async def get_growth(
    _user: CurrentUser, session: DBSession, days: int = 30
) -> list[GrowthSnapshot]:
    """Return daily platform snapshots for growth charts."""
    result = await session.execute(
        select(DailyPlatformSnapshot)
        .order_by(DailyPlatformSnapshot.snapshot_date.desc())
        .limit(days)
    )
    snapshots = result.scalars().all()
    return [
        GrowthSnapshot(
            date=s.snapshot_date.date().isoformat(),
            total_users=s.total_users,
            active_users_30d=s.active_users_30d,
            total_dollars_saved=s.total_dollars_saved,
        )
        for s in reversed(snapshots)
    ]


@router.get("/my-savings", response_model=UserSavingsSummary)
async def get_my_savings(user: CurrentUser, session: DBSession) -> UserSavingsSummary:
    """Per-user lifetime savings summary."""
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # This month's usage
    month_kwh = (
        await session.scalar(
            select(func.sum(UsageRecord.kwh)).where(
                UsageRecord.user_id == user.id,
                UsageRecord.interval_start >= month_start,
            )
        )
        or 0.0
    )

    # Completed challenges
    completed = (
        await session.scalar(
            select(func.count(Challenge.id)).where(
                Challenge.user_id == user.id,
                Challenge.status == ChallengeStatus.COMPLETED,
            )
        )
        or 0
    )

    # Lifetime totals from completed challenges
    lifetime_kwh = (
        await session.scalar(
            select(func.sum(Challenge.kwh_saved_total)).where(
                Challenge.user_id == user.id
            )
        )
        or 0.0
    )
    lifetime_dollars = (
        await session.scalar(
            select(func.sum(Challenge.dollars_saved_total)).where(
                Challenge.user_id == user.id
            )
        )
        or 0.0
    )

    # Simple bill projection
    days_elapsed = (now - month_start).days + 1
    daily_rate = month_kwh / days_elapsed if days_elapsed > 0 else 0
    projected_kwh = daily_rate * 30
    tier1 = min(projected_kwh, 600)
    tier2 = max(0, projected_kwh - 600)
    projected_bill = round(tier1 * 0.112 + tier2 * 0.159, 2)

    return UserSavingsSummary(
        kwh_used_this_month=round(month_kwh, 1),
        projected_bill_dollars=projected_bill,
        dollars_saved_vs_last_month=round(lifetime_dollars / max(1, completed + 1), 2),
        challenges_completed=completed,
        total_kwh_saved_all_time=round(lifetime_kwh, 1),
        total_dollars_saved_all_time=round(lifetime_dollars, 2),
    )
