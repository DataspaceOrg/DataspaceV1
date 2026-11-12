from fastapi import APIRouter, HTTPException
import logging
from datetime import datetime, timezone
from mssql_python.exceptions import OperationalError
from services.user_service import authenticate_user, create_user
from models.user_models import LoginChallenge, LoginResponse, UserCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(body: LoginChallenge) -> LoginResponse:
    try:
        user = authenticate_user(body)
    except OperationalError as exc:
        logger.exception("Azure SQL operation failed during login")
        raise HTTPException(
            status_code=503,
            detail="Login is unavailable because the database could not be reached.",
        ) from exc

    if user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return LoginResponse(
        message="Login successful",
        user=user,
        access_time=datetime.now(timezone.utc),
    )


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
