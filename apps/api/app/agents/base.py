from abc import ABC, abstractmethod

import structlog
from openai import AsyncOpenAI

from app.core.config import settings

logger = structlog.get_logger()

_client: AsyncOpenAI | None = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


class BaseAgent(ABC):
    """Common interface for all VoltAgent specialist agents."""

    name: str = "base"

    def __init__(self) -> None:
        self.client = get_client()
        self.log = logger.bind(agent=self.name)

    async def _run(self, system: str, user: str, max_tokens: int = 1024) -> str:
        response = await self.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        )
        return response.choices[0].message.content or ""

    @abstractmethod
    async def run(self, context: dict) -> dict:
        """Execute the agent and return a structured result."""
