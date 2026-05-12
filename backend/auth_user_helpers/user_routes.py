from fastapi import APIRouter, HTTPException
from auth_user_helpers.user_services import create_user, authenticate_user
from auth_user_helpers.user_models import UserCreate, UserLogin
from auth_user_helpers.user_models import User, UserPublic, AuthResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register_user(body: UserCreate) -> AuthResponse:
    '''
    register_user registers a new user into the database, returns an AuthResponse object (see frontend objects) and the public information of the user.

    Note: In later implementation, might redirect to the login page after successful registration.
    This is for the case if we need to verify email. 
    '''

    try:
    # Create user returns a UserPublic object.
        new_user = create_user(
            username=body.username,
            email=body.email,
            password=body.password,
        )
        return AuthResponse(message="User registered successfully", user=new_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not create user: {e}")

@router.post("/login")
def login(body: UserLogin) -> AuthResponse:
    '''
    login function authenticates a user and returns an AuthResponse object (see frontend objects) and the public information of the user.
    '''
    public_user = authenticate_user(email=body.email, password=body.password)

    if public_user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return AuthResponse(message="Login successful", user=public_user)

@router.get("/users/{user_id}")
def get_user(user_id: str) -> dict:
    user = get_user_by_id(user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User retrieved successfully", "user": user}


    