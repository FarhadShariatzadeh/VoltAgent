from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DailyPlatformSnapshot(Base):
    """
    Daily aggregate metrics for investor reporting.
    One row per calendar day, computed by a nightly Celery task.
    """

    __tablename__ = "daily_platform_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    snapshot_date: Mapped[datetime] = mapped_column(DateTime, unique=True, index=True)

    # User traction
    total_users: Mapped[int] = mapped_column(Integer, default=0)
    active_users_24h: Mapped[int] = mapped_column(Integer, default=0)
    active_users_30d: Mapped[int] = mapped_column(Integer, default=0)
    new_signups: Mapped[int] = mapped_column(Integer, default=0)

    # Collective impact
    total_kwh_saved: Mapped[float] = mapped_column(Float, default=0.0)
    total_dollars_saved: Mapped[float] = mapped_column(Float, default=0.0)

    # Load-shifting
    kwh_shifted_to_offpeak: Mapped[float] = mapped_column(Float, default=0.0)
    pct_shifted: Mapped[float] = mapped_column(Float, default=0.0)

    # Alerts
    alerts_sent: Mapped[int] = mapped_column(Integer, default=0)
    alerts_actioned: Mapped[int] = mapped_column(Integer, default=0)

    computed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
