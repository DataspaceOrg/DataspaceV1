from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from dependencies import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user_id,
)
from models.user_models import (
    LoginChallenge,
    LoginResponse,
    PublicUser,
    RegistrationResponse,
    UserCreate,
)
from services.user_service import (
    authenticate_user,
    create_user,
    get_user_by_id,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register_user(body: UserCreate) -> RegistrationResponse:
    try:
        new_user = create_user(body)
        if not new_user:
            raise HTTPException(
                status_code=500, detail="Could not create the account."
            )

        return RegistrationResponse(
            message="Account created successfully",
            user=new_user,
            access_time=datetime.now(timezone.utc),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400, detail=f"Could not create user: {exc}"
        ) from exc


@router.post("/login")
def login_user(body: LoginChallenge) -> LoginResponse:
    user = authenticate_user(body.email, body.password)

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return LoginResponse(
        message="Login successful",
        user=user,
        access_time=datetime.now(timezone.utc),
        access_token=create_access_token(user.id),
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=PublicUser)
def get_my_profile(
    current_user_id: str = Depends(get_current_user_id),
) -> PublicUser:
    user = get_user_by_id(current_user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user
