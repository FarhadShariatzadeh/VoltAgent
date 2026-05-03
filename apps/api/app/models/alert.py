from datetime import datetime
from enum import StrEnum

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AlertType(StrEnum):
    BILL_FORECAST = "bill_forecast"
    TOU_WARNING = "tou_warning"
    TIER_WARNING = "tier_warning"
    VAMPIRE_POWER = "vampire_power"
    SPIKE_DETECTED = "spike_detected"


class AlertChannel(StrEnum):
    EMAIL = "email"
    SMS = "sms"


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    alert_type: Mapped[AlertType] = mapped_column(Enum(AlertType))
    channel: Mapped[AlertChannel] = mapped_column(Enum(AlertChannel))
    title: Mapped[str] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(Text)
    delivered: Mapped[bool] = mapped_column(Boolean, default=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="alerts")  # type: ignore[name-defined]
