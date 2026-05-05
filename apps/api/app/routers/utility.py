import math
import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.core.deps import CurrentUser, DBSession
from app.models.utility_data import DataSource, UtilityConnection, UtilityProvider, UsageRecord
from app.services.green_button import GreenButtonService
from app.services.pdf_parser import PDFBillParser

router = APIRouter()


class ConnectRequest(BaseModel):
    provider: UtilityProvider
    authorization_code: str


class ConnectionResponse(BaseModel):
    provider: UtilityProvider
    connected: bool


@router.post("/connect", response_model=ConnectionResponse)
async def connect_utility(
    body: ConnectRequest, user: CurrentUser, session: DBSession
) -> ConnectionResponse:
    service = GreenButtonService(session)
    await service.connect(user, body.provider, body.authorization_code)
    return ConnectionResponse(provider=body.provider, connected=True)


@router.post("/upload-bill")
async def upload_bill(
    user: CurrentUser,
    session: DBSession,
    file: UploadFile = File(...),
) -> dict:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    content = await file.read()
    parser = PDFBillParser(session)
    records_count = await parser.parse_and_store(user, content, DataSource.PDF_UPLOAD)
    return {"records_imported": records_count}


@router.get("/status")
async def connection_status(user: CurrentUser, session: DBSession) -> dict:
    from sqlalchemy import select

    result = await session.execute(
        select(UtilityConnection).where(UtilityConnection.user_id == user.id)
    )
    connections = result.scalars().all()
    return {
        "connections": [
            {"provider": c.provider, "connected": True}
            for c in connections
        ]
    }


@router.post("/seed-demo-data")
async def seed_demo_data(user: CurrentUser, session: DBSession) -> dict:
    """
    Generate 30 days of realistic synthetic 15-minute usage data so the
    dashboard and agents have something to analyse without a real Green
    Button connection.  Safe to call multiple times — existing records for
    the covered window are deleted first.
    """
    from sqlalchemy import delete

    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    start = now - timedelta(days=30)

    # Wipe any existing demo records for this period
    await session.execute(
        delete(UsageRecord).where(
            UsageRecord.user_id == user.id,
            UsageRecord.interval_start >= start,
        )
    )

    records: list[UsageRecord] = []
    rng = random.Random(user.id)  # deterministic per user

    t = start
    while t < now:
        hour = t.hour
        # Base load profile: low overnight, medium day, high evening
        if 0 <= hour < 6:
            base_kwh = 0.08
        elif 6 <= hour < 9:
            base_kwh = 0.35   # morning peak
        elif 9 <= hour < 17:
            base_kwh = 0.22
        elif 17 <= hour < 21:
            base_kwh = 0.45   # evening peak
        else:
            base_kwh = 0.18

        # Add gentle sinusoidal daily variation + noise
        day_offset = (t - start).days
        seasonal = 1.0 + 0.15 * math.sin(2 * math.pi * day_offset / 14)
        noise = rng.uniform(0.85, 1.15)
        kwh = round(base_kwh * seasonal * noise, 4)

        records.append(UsageRecord(
            user_id=user.id,
            interval_start=t,
            interval_end=t + timedelta(minutes=15),
            kwh=kwh,
            source=DataSource.GREEN_BUTTON,
        ))
        t += timedelta(minutes=15)

    session.add_all(records)

    # Also ensure a utility connection row exists so /status shows connected
    from sqlalchemy import select as sa_select
    existing = await session.execute(
        sa_select(UtilityConnection).where(UtilityConnection.user_id == user.id)
    )
    if not existing.scalars().first():
        session.add(UtilityConnection(
            user_id=user.id,
            provider=UtilityProvider.PSE,
            access_token="demo",
        ))

    await session.commit()
    return {"records_imported": len(records), "days": 30}
