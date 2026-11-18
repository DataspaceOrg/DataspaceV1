from typing import Literal

from pydantic import BaseModel

UploadType = Literal["csv", "json", "jsonl", "sqlite", "sql_dump", "sql", "db", "unknown"]


class Dataset(BaseModel):
    """Metadata for an uploaded dataset, with a blob key relative to its container."""

    dataset_id: str
    user_id: str
    upload_type: UploadType
    raw_byte_size: int
    path: str
    tables: list[str]
    schema: dict[str, dict[str, str]]
