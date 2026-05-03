"""
PDF utility bill parser.
Uses pdfplumber to extract text and regex to pull out usage and rate data.
Supports PSE, Seattle City Light, and Tacoma Power bill formats.
"""

import re
from datetime import datetime, timezone

import pdfplumber
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.utility_data import DataSource, UsageRecord

logger = structlog.get_logger()

# Patterns common across WA utility bills
_KWH_PATTERN = re.compile(r"(?:usage|consumption|kWh used)[^\d]*(\d[\d,]*)\s*kWh", re.I)
_BILLING_PERIOD = re.compile(
    r"(?:billing period|service period)[^\d]*(\w+ \d+)[^\d]*(\w+ \d+, \d{4})", re.I
)
_AMOUNT_DUE = re.compile(r"(?:amount due|total due)[^\d]*\$\s*([\d,]+\.\d{2})", re.I)


class PDFBillParser:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.log = logger.bind(service="pdf_parser")

    async def parse_and_store(
        self, user: User, pdf_bytes: bytes, source: DataSource
    ) -> int:
        """Parse a PDF bill, create synthetic monthly UsageRecords, and return count."""
        extracted = self._extract(pdf_bytes)
        self.log.info("extracted", user_id=user.id, **extracted)

        if extracted["kwh"] is None:
            return 0

        records = self._build_records(user.id, extracted, source)
        self.session.add_all(records)
        await self.session.commit()
        return len(records)

    def _extract(self, pdf_bytes: bytes) -> dict:
        text = ""
        with pdfplumber.open(pdf_bytes) as pdf:  # type: ignore[arg-type]
            for page in pdf.pages:
                text += page.extract_text() or ""

        kwh = self._find_kwh(text)
        period_start, period_end = self._find_billing_period(text)
        amount_due = self._find_amount(text)

        return {
            "kwh": kwh,
            "period_start": period_start,
            "period_end": period_end,
            "amount_due": amount_due,
        }

    def _find_kwh(self, text: str) -> float | None:
        m = _KWH_PATTERN.search(text)
        if m:
            return float(m.group(1).replace(",", ""))
        # Fallback: look for a plain number followed by kWh
        m2 = re.search(r"(\d[\d,]*)\s*kWh", text, re.I)
        return float(m2.group(1).replace(",", "")) if m2 else None

    def _find_billing_period(self, text: str) -> tuple[datetime, datetime]:
        now = datetime.now(timezone.utc)
        m = _BILLING_PERIOD.search(text)
        if m:
            try:
                end = datetime.strptime(m.group(2), "%B %d, %Y").replace(tzinfo=timezone.utc)
                start = end.replace(day=1)
                return start, end
            except ValueError:
                pass
        # Default: current month
        return now.replace(day=1, hour=0, minute=0, second=0), now

    def _find_amount(self, text: str) -> float | None:
        m = _AMOUNT_DUE.search(text)
        return float(m.group(1).replace(",", "")) if m else None

    def _build_records(
        self, user_id: int, extracted: dict, source: DataSource
    ) -> list[UsageRecord]:
        """Distribute monthly kWh evenly into daily records for trend charting."""
        start: datetime = extracted["period_start"]
        end: datetime = extracted["period_end"]
        total_kwh: float = extracted["kwh"]

        from datetime import timedelta

        days = max(1, (end - start).days)
        daily_kwh = total_kwh / days

        records = []
        current = start
        while current < end:
            next_day = current + timedelta(days=1)
            records.append(
                UsageRecord(
                    user_id=user_id,
                    interval_start=current,
                    interval_end=next_day,
                    kwh=round(daily_kwh, 4),
                    source=source,
                )
            )
            current = next_day

        return records
