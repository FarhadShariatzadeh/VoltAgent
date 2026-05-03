from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(20))
    hashed_password: Mapped[str] = mapped_column(String(255))

    notify_email: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_sms: Mapped[bool] = mapped_column(Boolean, default=False)
    alert_tou: Mapped[bool] = mapped_column(Boolean, default=True)
    alert_tier: Mapped[bool] = mapped_column(Boolean, default=True)
    alert_forecast: Mapped[bool] = mapped_column(Boolean, default=True)
    alert_vampire: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    utility_connections: Mapped[list["UtilityConnection"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    usage_records: Mapped[list["UsageRecord"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    alerts: Mapped[list["Alert"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
