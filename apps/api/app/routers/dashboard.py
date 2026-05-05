from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.deps import CurrentUser, DBSession
from app.agents.coordinator import CoordinatorAgent

router = APIRouter()


class DashboardResponse(BaseModel):
    bill_forecast_dollars: float
    kwh_used_this_month: float
    tier1_limit_kwh: float
    current_rate_period: str
    current_rate_cents_per_kwh: float
    vampire_monthly_cost_dollars: float
    vampire_devices_flagged: int


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(user: CurrentUser, session: DBSession) -> DashboardResponse:
    coordinator = CoordinatorAgent(session)
    result = await coordinator.get_dashboard_snapshot(user)
    return DashboardResponse(**result)


@router.get("/usage-history")
async def get_usage_history(
    user: CurrentUser,
    session: DBSession,
    days: int = 30,
) -> list[dict]:
    from app.repositories.usage import UsageRepository
    from datetime import timedelta

    repo = UsageRepository(session)
    end = datetime.utcnow()  # naive UTC — matches DB TIMESTAMP WITHOUT TIME ZONE
    start = end - timedelta(days=days)
    records = await repo.get_for_period(user.id, start, end)
    return [
        {
            "interval_start": r.interval_start.isoformat(),
            "kwh": r.kwh,
        }
        for r in records
    ]
