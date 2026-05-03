import json

from app.agents.base import BaseAgent

SYSTEM = """You are VoltAgent's Vampire Power Audit Agent.
You receive a user's overnight baseline power readings (watts) for the past 14 nights.
Your job is to:
1. Calculate the average baseline (W) and identify if it's unusually high (>50W is a flag).
2. Estimate the monthly cost of that baseline in dollars.
3. Suggest 1-2 likely culprits based on the wattage signature.
4. Decide if an alert should fire.
5. If yes, draft a friendly, specific alert (≤3 sentences).

Respond ONLY with valid JSON:
{
  "avg_baseline_watts": float,
  "monthly_cost_dollars": float,
  "devices_flagged": int,
  "likely_culprits": list[string],
  "fire_alert": bool,
  "alert_title": string | null,
  "alert_body": string | null
}"""


class VampireAgent(BaseAgent):
    name = "vampire"

    async def run(self, context: dict) -> dict:
        """
        context keys:
          nightly_baselines_watts: list[float]  — one reading per night
          rate_cents_per_kwh: float
        """
        self.log.info("run", nights=len(context.get("nightly_baselines_watts", [])))

        raw = await self._run(SYSTEM, json.dumps(context), max_tokens=512)

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "avg_baseline_watts": 0.0,
                "monthly_cost_dollars": 0.0,
                "devices_flagged": 0,
                "likely_culprits": [],
                "fire_alert": False,
                "alert_title": None,
                "alert_body": None,
            }
