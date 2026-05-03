"""
Celery application — background tasks and beat schedule.
"""

import asyncio

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery = Celery("voltagent", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

celery.conf.beat_schedule = {
    # Run full agent analysis for every user every 15 minutes
    "run-agent-analysis": {
        "task": "app.worker.run_agent_analysis_all_users",
        "schedule": crontab(minute="*/15"),
    },
}
celery.conf.timezone = "UTC"


@celery.task(name="app.worker.run_agent_analysis_all_users")
def run_agent_analysis_all_users() -> None:
    asyncio.run(_run_analysis())


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
