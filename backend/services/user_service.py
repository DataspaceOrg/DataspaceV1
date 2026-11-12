from connection import connect_azure_sql
from passlib.context import CryptContext
from models.user_models import LoginChallenge, UserCreate, PublicUser
from datetime import timezone

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def public_user_from_row(row) -> PublicUser:
    return PublicUser(
        id=str(row.id),
        username=row.username,
        email=row.email,
        created_at=row.created_at.replace(tzinfo=timezone.utc).isoformat(),
        updated_at=row.updated_at.replace(tzinfo=timezone.utc).isoformat(),
    )


def authenticate_user(body: LoginChallenge) -> PublicUser | None:
    query = """
    SELECT id, username, email, password_hash, created_at, updated_at
    FROM dbo.Users
    WHERE email = %(email)s
    """
    conn = connect_azure_sql()
    try:
        cursor = conn.cursor()
        cursor.execute(query, {"email": body.email})
        row = cursor.fetchone()
    finally:
        conn.close()

    if row is None or not verify_password(body.password, row.password_hash):
        return None

    return public_user_from_row(row)


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

        created_user = public_user_from_row(row)
        # Send the query to the Azure DB.
        conn.commit()
        return created_user

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
