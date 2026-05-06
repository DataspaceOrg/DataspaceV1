import sqlite3
import uuid
import os
import hashlib
from datetime import datetime

'''
user_services.py is a module that contains functions to interact with the users table in metadata.db 
It helps provide a way of creating, updating, tracking and storing user information which will then be correlated with datasets and agent sessions. 
'''

def connect_users_db():
    '''
    connect_users_db: Creates the users table if it does not exist and providers a pointer to the connection.
    '''

    conn = sqlite3.connect(METADATA_DB)
    conn.execute(f"""
    CREATE TABLE IF NOT EXISTS {USERS_TABLE} 
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
    pass

def create_user(username: str, email: str | None, password: str) -> User:
    conn = connect_users_db()

    user_id = str(uuid.uuid4())
    now = datetime.now().isoformat()


