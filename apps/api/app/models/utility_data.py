from datetime import datetime
from enum import StrEnum

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UtilityProvider(StrEnum):
    PSE = "pse"
    SEATTLE_CITY_LIGHT = "seattle_city_light"
    TACOMA_POWER = "tacoma_power"
    SNOHOMISH_PUD = "snohomish_pud"


class DataSource(StrEnum):
    GREEN_BUTTON = "green_button"
    PDF_UPLOAD = "pdf_upload"


class UtilityConnection(Base):
    __tablename__ = "utility_connections"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    provider: Mapped[UtilityProvider] = mapped_column(Enum(UtilityProvider))
    access_token: Mapped[str | None] = mapped_column(String(1024))
    refresh_token: Mapped[str | None] = mapped_column(String(1024))
    token_expires_at: Mapped[datetime | None] = mapped_column(DateTime)
    tier1_limit_kwh: Mapped[float] = mapped_column(Float, default=600.0)
    tier1_rate: Mapped[float] = mapped_column(Float, default=0.112)
    tier2_rate: Mapped[float] = mapped_column(Float, default=0.159)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="utility_connections")  # type: ignore[name-defined]


class UsageRecord(Base):
    """15-minute interval energy usage data from Green Button or parsed PDF."""

    __tablename__ = "usage_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    interval_start: Mapped[datetime] = mapped_column(DateTime, index=True)
    interval_end: Mapped[datetime] = mapped_column(DateTime)
    kwh: Mapped[float] = mapped_column(Float)
    source: Mapped[DataSource] = mapped_column(Enum(DataSource))

    user: Mapped["User"] = relationship(back_populates="usage_records")  # type: ignore[name-defined]


class TierPricingPlan(Base):
    """Static rate schedule for a utility provider and billing period."""

    __tablename__ = "tier_pricing_plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    provider: Mapped[UtilityProvider] = mapped_column(Enum(UtilityProvider), index=True)
    effective_date: Mapped[datetime] = mapped_column(DateTime)
    tier1_limit_kwh: Mapped[float] = mapped_column(Float)
    tier1_rate_cents: Mapped[float] = mapped_column(Float)
    tier2_rate_cents: Mapped[float] = mapped_column(Float)
    peak_rate_cents: Mapped[float | None] = mapped_column(Float)
    off_peak_rate_cents: Mapped[float | None] = mapped_column(Float)
    super_off_peak_rate_cents: Mapped[float | None] = mapped_column(Float)

    peak_start_hour: Mapped[int | None] = mapped_column(Integer)
    peak_end_hour: Mapped[int | None] = mapped_column(Integer)
    evening_peak_start_hour: Mapped[int | None] = mapped_column(Integer)
    evening_peak_end_hour: Mapped[int | None] = mapped_column(Integer)
