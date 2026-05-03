import json

from app.agents.base import BaseAgent

SYSTEM = """You are VoltAgent's Tier Pricing Agent.
You receive a user's kWh consumed this billing cycle and their utility's tier structure.
Your job is to:
1. Calculate the percentage used relative to the Tier 1 limit.
2. Estimate remaining days until the tier jumps based on consumption rate.
3. Decide if a warning alert should fire (suggested threshold: >75% used).
4. If yes, draft a brief, actionable alert message (≤2 sentences) with a specific dollar impact.

Respond ONLY with valid JSON:
{
  "percent_used": float,
  "kwh_remaining": float,
  "days_until_tier_jump": float | null,
  "fire_alert": bool,
  "alert_title": string | null,
  "alert_body": string | null
}"""


class TierAgent(BaseAgent):
    name = "tier"

    async def run(self, context: dict) -> dict:
        """
        context keys:
          kwh_used: float
          tier1_limit: float
          tier1_rate: float
          tier2_rate: float
          days_elapsed: int
          days_in_month: int
        """
        self.log.info("run", kwh_used=context.get("kwh_used"))

        raw = await self._run(SYSTEM, json.dumps(context))

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            kwh_used = float(context.get("kwh_used", 0))
            limit = float(context.get("tier1_limit", 600))
            return {
                "percent_used": round(kwh_used / limit * 100, 1),
                "kwh_remaining": max(0.0, limit - kwh_used),
                "days_until_tier_jump": None,
                "fire_alert": False,
                "alert_title": None,
                "alert_body": None,
            }
