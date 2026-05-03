from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.core.deps import CurrentUser, DBSession
from app.models.utility_data import DataSource, UtilityProvider
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

    from app.models.utility_data import UtilityConnection

    result = await session.execute(
        select(UtilityConnection).where(UtilityConnection.user_id == user.id)
    )
    connections = result.scalars().all()
    return {
        "connections": [
            {"provider": c.provider, "connected": c.access_token is not None}
            for c in connections
        ]
    }
