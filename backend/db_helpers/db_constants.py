from pydantic import BaseModel
from typing import Literal, Optional
from pathlib import Path

# UploadType is a literal type that represents the type of file that is being uploaded. (must be one of the following)
UploadType = Literal["csv", "json", "jsonl", "sqlite", "sql_dump", "sql", "db", "unknown"]

# Base directory of the project.
BASE_DIR = Path(__file__).resolve().parent.parent

# Dataset directory from the base directory.
DATA_ROOT = BASE_DIR / "datasets"

# For local metadata storage
METADATA_DB = BASE_DIR / "metadata.db"

# Metadata table name in the metadata database.
METADATA_TABLE = "datasets_metadata"

class Dataset(BaseModel):
    '''
    Dataset is a model that represents the metadata of a dataset that gets uploaded to the database.

    tables: logical table name -> path (e.g. parquet path for CSV, or .sqlite path for SQLite).
    schema: per-table column info. Shape depends on upload_type:
      - SQLite: {"table_name": {"column_name": "SQLITE_TYPE"}, ...}
      - CSV/single table: {"parquet": {"column_name": "TYPE"}, ...} (if you add inference)
    '''
    dataset_id: str
    user_id: str
    upload_type: UploadType
    raw_byte_size: int
    dataset_path: str # The dataset path.
    tables: list[str] # all the table names in the dataset.
    schema: dict[str, dict[str, str]] #schema is a dictionary of the table name and the column names and their types.


# python3 -m db_helpers.db_constants