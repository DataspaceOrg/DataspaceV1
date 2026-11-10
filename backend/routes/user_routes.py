from fastapi import APIRouter, HTTPException
import logging
from datetime import datetime, timezone
from services.user_service import create_user
from models.user_models import UserCreate, PublicUser, LoginResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register_user(body: UserCreate) -> LoginResponse:

    try:
        new_user = create_user(body)
        if not new_user:
            raise HTTPException(
                status_code=500, detail="Could not create the account.")

        return LoginResponse(
            message="Account created successfully",
            user=new_user,
            access_time=datetime.now(timezone.utc),
        )

    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Could not create user: {e}")
