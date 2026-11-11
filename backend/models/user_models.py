from pydantic import BaseModel, field_validator, Field
from datetime import datetime
# Models


class User(BaseModel):
    id: str
    username: str
    email: str
    password_hash: str
    created_at: str
    updated_at: str

# Represents a user returned to the Frontend.


class PublicUser(BaseModel):
    id: str
    username: str
    email: str
    created_at: str
    updated_at: str


class LoginChallenge(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    message: str
    user: PublicUser
    access_time: datetime


class UserCreate(BaseModel):
    username: str
    email: str
    password: str = Field(min_length=7, max_length=72)

    @field_validator('password')
    @classmethod
    def password_must_contain_digit(cls, password: str) -> str:
        if not any(char.isdigit() for char in password):
            raise ValueError(
                "Password must contain at least one digit and be between 7 and 72 characters long")
        return password
