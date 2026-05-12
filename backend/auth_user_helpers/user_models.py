from pathlib import Path
from pydantic import BaseModel, field_validator, Field

BASE_DIR = Path(__file__).resolve().parent.parent

USERS_TABLE = "users"

METADATA_DB = BASE_DIR / "metadata.db"

class User(BaseModel):
    user_id: str
    username: str
    email: str
    password_hash: str
    created_at: str
    updated_at: str

# UserPublic is a model that represents the information that the frontend retrieves from the backend. 
class UserPublic(BaseModel):
    user_id: str
    username: str
    email: str
    created_at: str
    updated_at: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str = Field(min_length = 7, max_length = 72)

    @field_validator('password')
    @classmethod
    def password_must_contain_digit(cls, password: str) -> str:
        if not any(char.isdigit() for char in password):
            raise ValueError("Password must contain at least one digit and be between 7 and 72 characters long")
        return password

class UserLogin(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    message: str
    user: UserPublic