from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.core.deps import DBSession
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user import UserRepository

router = APIRouter()


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, session: DBSession) -> TokenResponse:
    repo = UserRepository(session)
    if await repo.get_by_email(body.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await repo.create(
        full_name=body.full_name,
        email=body.email,
        phone=body.phone,
        hashed_password=hash_password(body.password),
    )
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, session: DBSession) -> TokenResponse:
    repo = UserRepository(session)
    user = await repo.get_by_email(body.email)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(access_token=create_access_token(str(user.id)))
