import sqlite3
import uuid
import os
from passlib.context import CryptContext
from datetime import datetime
from auth_user_helpers.user_models import METADATA_DB, USERS_TABLE, User, UserPublic

'''
user_services.py is a module that contains functions to interact with the users table in metadata.db 
It helps provide a way of creating, updating, tracking and storing user information which will then be correlated with datasets and agent sessions. 
'''

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def connect_users_db():
    '''
    connect_users_db: Creates the users table if it does not exist and providers a pointer to the connection.
    '''

    conn = sqlite3.connect(METADATA_DB)
    conn.execute(f"""
    CREATE TABLE IF NOT EXISTS {USERS_TABLE} (
        user_id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE, 
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)
    conn.commit()
    return conn


def hash_password(password: str) -> str:
    '''
    hash_password hashes the user inputted password using SHA-256 hashing. 
    '''
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    '''
    verify_password verifies the user inputted password with the password hash.
    '''
    return pwd_context.verify(password, password_hash)

def create_user(username: str, email: str | None, password: str) -> UserPublic:
    conn = connect_users_db()

    user_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    password_hash = hash_password(password)

    conn.execute(f"""
    INSERT INTO {USERS_TABLE} (
    user_id, username, email, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, username, email, password_hash, now, now))

    conn.commit()

    # Return the new user that was created
    return UserPublic(
        user_id=user_id,
        username=username,
        email=email,
        created_at=now,
        updated_at=now
    )

def get_user_by_id(user_id: str) -> User | None:

    conn = connect_users_db()
    cursor = conn.execute(f"""
    SELECT * FROM {USERS_TABLE} WHERE user_id = ?
    """, (user_id,))

    row = cursor.fetchone()

    if row is None:
        return None

    return User(user_id=row[0],
    username=row[1], 
    email=row[2], 
    password_hash=row[3], 
    created_at=row[4], 
    updated_at=row[5])

def authenticate_user(email: str, password: str) -> UserPublic | None:
    '''
    authenticate_user authenticates the user (ensures that their credentials are correct) with the user name and password
    during login. Checks if the given email associates with a user and if the password hash matches the password inputted.
    '''

    conn = connect_users_db()

    # Perform a verification by fetching their email login. 
    cursor = conn.execute(f"""
    SELECT * FROM {USERS_TABLE} WHERE email = ?
    """, (email,))

    row = cursor.fetchone()

    if row is None:
        return None

    stored_password_hash = row[3]

    # Put the user information into the user model.
    public_user = UserPublic(user_id=row[0],
    username=row[1], 
    email=row[2], 
    created_at=row[4], 
    updated_at=row[5])

    # Verify the password hash with the inputted password. 
    password_valid = verify_password(password, stored_password_hash)


    if not password_valid:
        # Return none for password invalid, indicates that the password is incorrect.
        return None

    # Correct credentials, return the user. 
    return public_user

def update_user():
    pass




