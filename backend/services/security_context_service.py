import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from connection import connect_azure_sql


def create_security_context(
    user_id: str,
    expires_in: timedelta,
) -> tuple[str, datetime]:
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    expires_at = datetime.now(timezone.utc) + expires_in

    conn = connect_azure_sql()
    query = """
    INSERT INTO dbo.SecurityContext (user_id, token_hash, expires_at)
    VALUES (%(user_id)s, %(token_hash)s, %(expires_at)s)
    """
    parameters = {
        "user_id": user_id,
        "token_hash": token_hash,
        "expires_at": expires_at.replace(tzinfo=None),
    }

    try:
        cursor = conn.cursor()
        cursor.execute(query, parameters)
        conn.commit()
        return token, expires_at
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def get_security_context(token: str) -> str | None:
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    conn = connect_azure_sql()
    query = """
    SELECT user_id
    FROM dbo.SecurityContext
    WHERE token_hash = %(token_hash)s
      AND expires_at > SYSUTCDATETIME()
      AND revoked_at IS NULL
    """

    try:
        cursor = conn.cursor()
        cursor.execute(query, {"token_hash": token_hash})
        row = cursor.fetchone()
        return str(row.user_id) if row is not None else None
    finally:
        conn.close()


def revoke_security_context(token: str) -> bool:
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    conn = connect_azure_sql()
    query = """
    UPDATE dbo.SecurityContext
    SET revoked_at = SYSUTCDATETIME()
    OUTPUT INSERTED.id
    WHERE token_hash = %(token_hash)s
      AND revoked_at IS NULL
    """

    try:
        cursor = conn.cursor()
        cursor.execute(query, {"token_hash": token_hash})
        row = cursor.fetchone()
        conn.commit()
        return row is not None
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
