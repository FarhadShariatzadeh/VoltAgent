from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import select

from app.core.deps import CurrentUser, DBSession
from app.models.challenge import Challenge, ChallengeDayResult, ChallengeStatus
from app.repositories.usage import UsageRepository

router = APIRouter()


class ChallengeResponse(BaseModel):
    id: int
    started_at: str
    ends_at: str
    status: str
    baseline_daily_kwh: float
    target_daily_kwh: float
    kwh_saved_total: float
    dollars_saved_total: float
    days_on_target: int
    days_elapsed: int
    days_remaining: int
    progress_pct: float

    model_config = {"from_attributes": True}


class DayResultResponse(BaseModel):
    day_number: int
    date: str
    actual_kwh: float
    target_kwh: float
    met_target: bool
    dollars_saved: float


@router.post("/enroll", response_model=ChallengeResponse, status_code=201)
async def enroll(user: CurrentUser, session: DBSession) -> ChallengeResponse:
    # One active challenge at a time
    existing = await session.execute(
        select(Challenge).where(
            Challenge.user_id == user.id,
            Challenge.status == ChallengeStatus.ACTIVE,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "You already have an active challenge")

    # Baseline: average daily kWh over the past 30 days
    usage_repo = UsageRepository(session)
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    records = await usage_repo.get_for_period(user.id, thirty_days_ago, now)
    total_kwh = sum(r.kwh for r in records)
    baseline_daily = total_kwh / 30 if records else 20.0  # fallback 20 kWh/day
    target_daily = round(baseline_daily * 0.90, 3)  # 10% reduction goal

    challenge = Challenge(
        user_id=user.id,
        started_at=now,
        ends_at=now + timedelta(days=30),
        baseline_daily_kwh=round(baseline_daily, 3),
        target_daily_kwh=target_daily,
    )
    session.add(challenge)
    await session.commit()
    await session.refresh(challenge)
    return _to_response(challenge, now)


@router.get("/current", response_model=ChallengeResponse)
async def get_current(user: CurrentUser, session: DBSession) -> ChallengeResponse:
    result = await session.execute(
        select(Challenge).where(
            Challenge.user_id == user.id,
            Challenge.status == ChallengeStatus.ACTIVE,
        )
    )
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(404, "No active challenge")
    return _to_response(challenge, datetime.now(timezone.utc))


@router.get("/current/days", response_model=list[DayResultResponse])
async def get_day_results(user: CurrentUser, session: DBSession) -> list[DayResultResponse]:
    result = await session.execute(
        select(Challenge).where(
            Challenge.user_id == user.id,
            Challenge.status == ChallengeStatus.ACTIVE,
        )
    )
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(404, "No active challenge")

    days_result = await session.execute(
        select(ChallengeDayResult)
        .where(ChallengeDayResult.challenge_id == challenge.id)
        .order_by(ChallengeDayResult.day_number)
    )
    days = days_result.scalars().all()
    return [
        DayResultResponse(
            day_number=d.day_number,
            date=d.date.isoformat(),
            actual_kwh=d.actual_kwh,
            target_kwh=d.target_kwh,
            met_target=d.met_target,
            dollars_saved=d.dollars_saved,
        )
        for d in days
    ]


@router.get("/history", response_model=list[ChallengeResponse])
async def get_history(user: CurrentUser, session: DBSession) -> list[ChallengeResponse]:
    now = datetime.now(timezone.utc)
    result = await session.execute(
        select(Challenge)
        .where(Challenge.user_id == user.id)
        .order_by(Challenge.started_at.desc())
        .limit(10)
    )
    return [_to_response(c, now) for c in result.scalars().all()]


def _to_response(challenge: Challenge, now: datetime) -> ChallengeResponse:
    started = challenge.started_at
    if started.tzinfo is None:
        started = started.replace(tzinfo=timezone.utc)
    ends = challenge.ends_at
    if ends.tzinfo is None:
        ends = ends.replace(tzinfo=timezone.utc)

    days_elapsed = max(0, (now - started).days)
    days_remaining = max(0, (ends - now).days)
    progress_pct = round(min(100.0, days_elapsed / 30 * 100), 1)

    return ChallengeResponse(
        id=challenge.id,
        started_at=started.isoformat(),
        ends_at=ends.isoformat(),
        status=challenge.status,
        baseline_daily_kwh=challenge.baseline_daily_kwh,
        target_daily_kwh=challenge.target_daily_kwh,
        kwh_saved_total=challenge.kwh_saved_total,
        dollars_saved_total=challenge.dollars_saved_total,
        days_on_target=challenge.days_on_target,
        days_elapsed=days_elapsed,
        days_remaining=days_remaining,
        progress_pct=progress_pct,
    )
