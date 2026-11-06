from connection import connect_azure_sql
from pathlib import Path
from pydantic import BaseModel, field_validator, Field
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_user(user: User) -> bool:
    conn = connect_azure_sql()

    try:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO dbo.Users (username, email, password_hash)
        VALUES (%(username)s, %(email)s, %(password_hash)s)
        """,
                       {
                           "username": user.username,
                           "email": user.email,
                           "password_hash": hash_password(user.password_hash)
                       })

        conn.commit()
        return True

    except Exception:
        conn.rollback()
        return False
    finally:
        conn.close()
