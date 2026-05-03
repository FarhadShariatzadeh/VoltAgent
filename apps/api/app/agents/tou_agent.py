import json

from app.agents.base import BaseAgent

SYSTEM = """You are VoltAgent's Time-of-Use (TOU) Agent.
You receive the current time, the user's utility rate schedule, and recent usage.
Your job is to:
1. Identify the current rate period (peak / off-peak / super-off-peak).
2. Determine the next period transition time.
3. Decide if an actionable notification should be sent.
4. If yes, craft a short, friendly recommendation (≤2 sentences).

Respond ONLY with valid JSON:
{
  "current_period": "peak" | "off-peak" | "super-off-peak",
  "current_rate_cents": float,
  "next_transition_hour": int,
  "fire_alert": bool,
  "alert_title": string | null,
  "alert_body": string | null
}"""


class TOUAgent(BaseAgent):
    name = "tou"

    async def run(self, context: dict) -> dict:
        """
        context keys:
          current_hour: int          — 0-23 local hour
          peak_start: int            — morning peak start hour
          peak_end: int              — morning peak end hour
          evening_peak_start: int
          evening_peak_end: int
          peak_rate_cents: float
          off_peak_rate_cents: float
          super_off_peak_rate_cents: float | None
          super_off_peak_start: int | None
          super_off_peak_end: int | None
        """
        self.log.info("run", hour=context.get("current_hour"))

        raw = await self._run(SYSTEM, json.dumps(context))

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "current_period": "off-peak",
                "current_rate_cents": context.get("off_peak_rate_cents", 8.9),
                "next_transition_hour": 17,
                "fire_alert": False,
                "alert_title": None,
                "alert_body": None,
            }
