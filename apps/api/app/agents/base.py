from abc import ABC, abstractmethod

import anthropic
import structlog

from app.core.config import settings

logger = structlog.get_logger()

_client: anthropic.AsyncAnthropic | None = None


def get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        _client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


MODEL = "claude-sonnet-4-6"


class BaseAgent(ABC):
    """Common interface for all VoltAgent specialist agents."""

    name: str = "base"

    def __init__(self) -> None:
        self.client = get_client()
        self.log = logger.bind(agent=self.name)

    async def _run(self, system: str, user: str, max_tokens: int = 1024) -> str:
        response = await self.client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        text = response.content[0]
        assert text.type == "text"
        return text.text

    @abstractmethod
    async def run(self, context: dict) -> dict:
        """Execute the agent and return a structured result."""
