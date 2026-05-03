from fastapi import APIRouter
from pydantic import BaseModel

from app.core.deps import CurrentUser, DBSession
from app.repositories.user import UserRepository

router = APIRouter()


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str | None
    notify_email: bool
    notify_sms: bool
    alert_tou: bool
    alert_tier: bool
    alert_forecast: bool
    alert_vampire: bool

    model_config = {"from_attributes": True}


class UpdatePreferencesRequest(BaseModel):
    notify_email: bool | None = None
    notify_sms: bool | None = None
    alert_tou: bool | None = None
    alert_tier: bool | None = None
    alert_forecast: bool | None = None
    alert_vampire: bool | None = None


@router.get("/me", response_model=UserResponse)
async def get_me(user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(user)


@router.patch("/me/preferences", response_model=UserResponse)
async def update_preferences(
    body: UpdatePreferencesRequest, user: CurrentUser, session: DBSession
) -> UserResponse:
    updates = body.model_dump(exclude_none=True)
    repo = UserRepository(session)
    updated = await repo.update(user, **updates)
    return UserResponse.model_validate(updated)
