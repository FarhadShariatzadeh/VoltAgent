import json
from datetime import datetime, timezone

from app.agents.base import BaseAgent

SYSTEM = """You are VoltAgent's Forecasting Agent.
You receive a user's electricity usage so far this month, their rate structure, and today's date.
Your job is to:
1. Extrapolate their likely end-of-month total kWh.
2. Calculate the projected bill in dollars, accounting for tiered pricing.
3. Determine if an overspending alert should fire.
4. If yes, compose a short, friendly alert message (≤2 sentences).

Respond ONLY with valid JSON matching this schema:
{
  "projected_kwh": float,
  "projected_bill_dollars": float,
  "fire_alert": bool,
  "alert_title": string | null,
  "alert_body": string | null
}"""


class ForecastingAgent(BaseAgent):
    name = "forecasting"

    async def run(self, context: dict) -> dict:
        """
        context keys:
          kwh_used: float       — kWh consumed so far this month
          days_elapsed: int     — days into the billing cycle
          days_in_month: int
          tier1_limit: float    — kWh threshold for tier 1
          tier1_rate: float     — $/kWh
          tier2_rate: float     — $/kWh
          budget_dollars: float | None
        """
        self.log.info("run", kwh_used=context.get("kwh_used"))

        user_msg = json.dumps(context)
        raw = await self._run(SYSTEM, user_msg)

        try:
            result: dict = json.loads(raw)
        except json.JSONDecodeError:
            self.log.warning("json_parse_failed", raw=raw[:200])
            result = {
                "projected_kwh": 0.0,
                "projected_bill_dollars": 0.0,
                "fire_alert": False,
                "alert_title": None,
                "alert_body": None,
            }

        result["generated_at"] = datetime.now(timezone.utc).isoformat()
        return result
