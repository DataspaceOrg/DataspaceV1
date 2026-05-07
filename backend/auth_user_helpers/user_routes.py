from fastapi import APIRouter, HTTPException
from auth_user_helpers.user_services import create_user, authenticate_user
from auth_user_helpers.user_models import UserCreate, UserLogin

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register_user(body: UserCreate) -> dict[str, User]:
    '''
    register_user registers a new user into the database.
    '''
    try:
        new_user = create_user(
            username=body.username,
            email=body.email,
            password=body.password,
        )

        return {"message": "User registered successfully", "user": new_user}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not create user: {e}")

@router.post("/login")
def login(body: UserLogin) -> dict[str, User]:
    '''
    login authenticates a user and returns a JWT token.
    '''
    user = authenticate_user(email=body.email, password=body.password)

    if user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"message": "Login successful", "user": user}

@router.get("/users/{user_id}")
def get_user(user_id: str) -> dict[str, User]:
    user = get_user_by_id(user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User retrieved successfully", "user": user}


    