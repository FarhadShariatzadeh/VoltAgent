"""
Electricity Maps integration for real-time carbon intensity.
https://www.electricitymap.org/

Free tier provides current carbon intensity (gCO2eq/kWh) for a grid zone.
Washington state is in the PACW (Pacific Northwest) zone.
"""

import httpx
import structlog

from app.core.config import settings

logger = structlog.get_logger()

WASHINGTON_ZONE = "US-NW-PACW"


class CarbonService:
    def __init__(self) -> None:
        self.log = logger.bind(service="carbon")

    async def get_current_intensity(self, zone: str = WASHINGTON_ZONE) -> dict:
        """Return current carbon intensity in gCO2eq/kWh for the given zone."""
        url = f"{settings.ELECTRICITY_MAPS_BASE_URL}/carbon-intensity/latest"

        async with httpx.AsyncClient() as client:
            resp = await client.get(
                url,
                params={"zone": zone},
                headers={"auth-token": settings.ELECTRICITY_MAPS_API_KEY},
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()

        intensity = data.get("carbonIntensity", 0)
        self.log.info("fetched", zone=zone, gco2_per_kwh=intensity)
        return {
            "zone": zone,
            "gco2_per_kwh": intensity,
            "is_clean": intensity < 150,
            "datetime": data.get("datetime"),
        }

    async def get_forecast(self, zone: str = WASHINGTON_ZONE) -> list[dict]:
        """Return carbon intensity forecast for the next 24 hours."""
        url = f"{settings.ELECTRICITY_MAPS_BASE_URL}/carbon-intensity/forecast"

        async with httpx.AsyncClient() as client:
            resp = await client.get(
                url,
                params={"zone": zone},
                headers={"auth-token": settings.ELECTRICITY_MAPS_API_KEY},
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()

        return [
            {
                "datetime": entry["datetime"],
                "gco2_per_kwh": entry.get("carbonIntensity", 0),
                "is_clean": entry.get("carbonIntensity", 999) < 150,
            }
            for entry in data.get("forecast", [])
        ]
