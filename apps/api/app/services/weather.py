"""
Open-Meteo integration for weather forecasts.
Free, no API key required. Covers WA state coordinates.
"""

from datetime import date

import httpx
import structlog

from app.core.config import settings

logger = structlog.get_logger()

# Seattle, WA default coordinates
SEATTLE_LAT = 47.6062
SEATTLE_LON = -122.3321


class WeatherService:
    def __init__(self) -> None:
        self.log = logger.bind(service="weather")

    async def get_forecast(
        self,
        lat: float = SEATTLE_LAT,
        lon: float = SEATTLE_LON,
        days: int = 7,
    ) -> list[dict]:
        """Return daily weather forecast with high/low temps and precipitation."""
        url = f"{settings.OPEN_METEO_BASE_URL}/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
            "temperature_unit": "fahrenheit",
            "forecast_days": days,
            "timezone": "America/Los_Angeles",
        }

        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()

        daily = data.get("daily", {})
        dates = daily.get("time", [])
        highs = daily.get("temperature_2m_max", [])
        lows = daily.get("temperature_2m_min", [])
        precip = daily.get("precipitation_sum", [])

        forecasts = []
        for i, d in enumerate(dates):
            forecasts.append(
                {
                    "date": d,
                    "temp_high_f": highs[i] if i < len(highs) else None,
                    "temp_low_f": lows[i] if i < len(lows) else None,
                    "precipitation_mm": precip[i] if i < len(precip) else None,
                    "heat_wave": (highs[i] > 90) if i < len(highs) and highs[i] else False,
                    "cold_snap": (lows[i] < 28) if i < len(lows) and lows[i] else False,
                }
            )

        self.log.info("fetched", days=len(forecasts))
        return forecasts

    async def is_heat_dome_expected(self, days_ahead: int = 3) -> bool:
        """True if any of the next N days will have a heat-dome (>90°F high)."""
        forecasts = await self.get_forecast(days=days_ahead)
        return any(f["heat_wave"] for f in forecasts)
