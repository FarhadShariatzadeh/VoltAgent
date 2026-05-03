from datetime import datetime
from enum import StrEnum

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ChallengeStatus(StrEnum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"


class Challenge(Base):
    """30-Day Energy Savings Sprint enrollment and progress."""

    __tablename__ = "challenges"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    started_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    ends_at: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[ChallengeStatus] = mapped_column(
        Enum(ChallengeStatus), default=ChallengeStatus.ACTIVE
    )

    # kWh baseline: average daily usage in the 30 days before the challenge
    baseline_daily_kwh: Mapped[float] = mapped_column(Float, default=0.0)
    # Target: reduce by 10% vs baseline
    target_daily_kwh: Mapped[float] = mapped_column(Float, default=0.0)

    # Running totals updated by the Celery beat
    kwh_saved_total: Mapped[float] = mapped_column(Float, default=0.0)
    dollars_saved_total: Mapped[float] = mapped_column(Float, default=0.0)
    days_on_target: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped["User"] = relationship(back_populates="challenges")  # type: ignore[name-defined]
    daily_results: Mapped[list["ChallengeDayResult"]] = relationship(
        back_populates="challenge", cascade="all, delete-orphan"
    )


class ChallengeDayResult(Base):
    """Per-day result within a 30-day challenge."""

    __tablename__ = "challenge_day_results"

    id: Mapped[int] = mapped_column(primary_key=True)
    challenge_id: Mapped[int] = mapped_column(ForeignKey("challenges.id"), index=True)
    day_number: Mapped[int] = mapped_column(Integer)  # 1-30
    date: Mapped[datetime] = mapped_column(DateTime)
    actual_kwh: Mapped[float] = mapped_column(Float)
    target_kwh: Mapped[float] = mapped_column(Float)
    met_target: Mapped[bool] = mapped_column(default=False)
    dollars_saved: Mapped[float] = mapped_column(Float, default=0.0)

    challenge: Mapped["Challenge"] = relationship(back_populates="daily_results")
