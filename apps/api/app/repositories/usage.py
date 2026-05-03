from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.utility_data import UsageRecord


class UsageRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_for_period(
        self, user_id: int, start: datetime, end: datetime
    ) -> list[UsageRecord]:
        result = await self.session.execute(
            select(UsageRecord)
            .where(
                UsageRecord.user_id == user_id,
                UsageRecord.interval_start >= start,
                UsageRecord.interval_start < end,
            )
            .order_by(UsageRecord.interval_start)
        )
        return list(result.scalars().all())

    async def bulk_insert(self, records: list[UsageRecord]) -> None:
        self.session.add_all(records)
        await self.session.commit()
