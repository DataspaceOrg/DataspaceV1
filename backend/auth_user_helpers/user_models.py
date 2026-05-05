from pathlib import Path
from Pydantic import BaseModel

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

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str