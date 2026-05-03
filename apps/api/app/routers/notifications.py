from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import select, update

from app.core.deps import CurrentUser, DBSession
from app.models.alert import Alert

router = APIRouter()


class AlertResponse(BaseModel):
    id: int
    alert_type: str
    channel: str
    title: str
    body: str
    delivered: bool
    read: bool
    created_at: str

    model_config = {"from_attributes": True}


@router.get("/", response_model=list[AlertResponse])
async def list_alerts(user: CurrentUser, session: DBSession, limit: int = 20) -> list[Alert]:
    result = await session.execute(
        select(Alert)
        .where(Alert.user_id == user.id)
        .order_by(Alert.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


@router.post("/{alert_id}/read")
async def mark_read(alert_id: int, user: CurrentUser, session: DBSession) -> dict:
    await session.execute(
        update(Alert)
        .where(Alert.id == alert_id, Alert.user_id == user.id)
        .values(read=True)
    )
    await session.commit()
    return {"ok": True}
