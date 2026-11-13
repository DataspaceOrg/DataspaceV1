from connection import connect_azure_sql
from pathlib import Path
from pydantic import BaseModel, field_validator, Field
from passlib.context import CryptContext
from models.user_models import UserCreate, PublicUser
from datetime import timezone

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_user(user: UserCreate) -> PublicUser:

    conn = connect_azure_sql()

    password_hash = hash_password(user.password)
    query = """
    INSERT INTO dbo.Users (username, email, password_hash)
    OUTPUT
        INSERTED.id,
        INSERTED.username,
        INSERTED.email,
        INSERTED.created_at,
        INSERTED.updated_at
    VALUES (%(username)s, %(email)s, %(password_hash)s)
    """
    parameters = {
        "username": user.username,
        "email": user.email,
        "password_hash": password_hash,
    }

    try:
        cursor = conn.cursor()
        cursor.execute(query, parameters)
        row = cursor.fetchone()
        if row is None:
            raise RuntimeError("Insert returned no user.")

        created_user = PublicUser(
            id=str(row.id),
            username=row.username,
            email=row.email,
            created_at=row.created_at.replace(
                tzinfo=timezone.utc
            ).isoformat(),
            updated_at=row.updated_at.replace(
                tzinfo=timezone.utc
            ).isoformat(),
        )
        # Send the query to the Azure DB.
        conn.commit()
        return created_user

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def authenticate_user(email: str, password: str) -> PublicUser | None:
    if len(password) > 72:
        return None

    conn = connect_azure_sql()

    query = """
    SELECT id, username, email, password_hash, created_at, updated_at
    FROM dbo.Users
    WHERE email = %(email)s
    """

    try:
        cursor = conn.cursor()
        cursor.execute(query, {"email": email})
        row = cursor.fetchone()

        if row is None or not verify_password(password, row.password_hash):
            return None

        return PublicUser(
            id=str(row.id),
            username=row.username,
            email=row.email,
            created_at=row.created_at.replace(tzinfo=timezone.utc).isoformat(),
            updated_at=row.updated_at.replace(tzinfo=timezone.utc).isoformat(),
        )
    finally:
        conn.close()


def get_user_by_id(user_id: str) -> PublicUser | None:
    conn = connect_azure_sql()

    query = """
    SELECT id, username, email, created_at, updated_at
    FROM dbo.Users
    WHERE id = %(id)s
    """

    try:
        cursor = conn.cursor()
        cursor.execute(query, {"id": user_id})
        row = cursor.fetchone()

        if row is None:
            return None

        return PublicUser(
            id=str(row.id),
            username=row.username,
            email=row.email,
            created_at=row.created_at.replace(tzinfo=timezone.utc).isoformat(),
            updated_at=row.updated_at.replace(tzinfo=timezone.utc).isoformat(),
        )
    finally:
        conn.close()