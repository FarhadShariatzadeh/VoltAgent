"""
Green Button Connect / Share My Data integration.
https://www.greenbuttonalliance.org/

In production this would exchange an OAuth authorization_code for tokens via
the utility's ESPI (Energy Service Provider Interface) endpoint, then poll
/Subscription/{id}/UsagePoint to fetch 15-minute interval data.
"""

from datetime import datetime, timezone

import httpx
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.utility_data import DataSource, UsageRecord, UtilityConnection, UtilityProvider

logger = structlog.get_logger()


class GreenButtonService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.log = logger.bind(service="green_button")

    async def connect(
        self, user: User, provider: UtilityProvider, authorization_code: str
    ) -> UtilityConnection:
        """Exchange authorization code for access/refresh tokens and persist the connection."""
        token_url = self._token_url(provider)

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                token_url,
                data={
                    "grant_type": "authorization_code",
                    "code": authorization_code,
                },
                timeout=10,
            )
            resp.raise_for_status()
            token_data = resp.json()

        conn = UtilityConnection(
            user_id=user.id,
            provider=provider,
            access_token=token_data.get("access_token"),
            refresh_token=token_data.get("refresh_token"),
            token_expires_at=datetime.now(timezone.utc),
        )
        self.session.add(conn)
        await self.session.commit()
        await self.session.refresh(conn)
        self.log.info("connected", user_id=user.id, provider=provider)
        return conn

    async def fetch_usage(self, conn: UtilityConnection, days: int = 30) -> list[UsageRecord]:
        """Fetch interval usage data and return unsaved UsageRecord objects."""
        espi_url = self._espi_url(conn.provider)

        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{espi_url}/UsagePoint",
                headers={"Authorization": f"Bearer {conn.access_token}"},
                timeout=30,
            )
            resp.raise_for_status()
            # In a real integration, parse the ESPI Atom/XML response.
            # We return an empty list here; parsing logic lives in a dedicated XML parser.
            raw_intervals: list[dict] = resp.json().get("intervals", [])

        records = [
            UsageRecord(
                user_id=conn.user_id,
                interval_start=datetime.fromisoformat(iv["start"]),
                interval_end=datetime.fromisoformat(iv["end"]),
                kwh=float(iv["wh"]) / 1000,
                source=DataSource.GREEN_BUTTON,
            )
            for iv in raw_intervals
        ]
        self.log.info("fetched", user_id=conn.user_id, records=len(records))
        return records

    def _token_url(self, provider: UtilityProvider) -> str:
        urls = {
            UtilityProvider.PSE: "https://pse.com/oauth/token",
            UtilityProvider.SEATTLE_CITY_LIGHT: "https://api.seattle.gov/oauth/token",
            UtilityProvider.TACOMA_POWER: "https://api.mytpu.org/oauth/token",
            UtilityProvider.SNOHOMISH_PUD: "https://api.snopud.com/oauth/token",
        }
        return urls[provider]

    def _espi_url(self, provider: UtilityProvider) -> str:
        urls = {
            UtilityProvider.PSE: "https://api.pse.com/espi/1_1/resource",
            UtilityProvider.SEATTLE_CITY_LIGHT: "https://api.seattle.gov/espi/1_1/resource",
            UtilityProvider.TACOMA_POWER: "https://api.mytpu.org/espi/1_1/resource",
            UtilityProvider.SNOHOMISH_PUD: "https://api.snopud.com/espi/1_1/resource",
        }
        return urls[provider]
