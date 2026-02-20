import os
import sys
import sqlite3
import duckdb
import uuid
from pathlib import Path
import logging
from sqlalchemy import (
    create_engine, Column, String, DateTime, Integer, Text
)
from db_helpers.db_constants import DATA_ROOT
from fastapi import UploadFile



# from constants import Dataset

def detect_upload_type(filename: str):
    '''
    detect_upload_type is a function that detects the type of the file that is being uploaded.

    Args: filename: str - The name of the file that is being uploaded.

    Returns: 
        str - The type of the file that is being uploaded.
    '''
    extension = Path(filename).suffix.lower()

    if extension == ".csv":
        return "csv"
    elif extension == ".json":
        return "json"
    elif extension == ".jsonl":
        return "jsonl"
    elif extension == ".db":
        return "db"
    elif extension == ".sqlite":
        return "sqlite"
    elif extension == ".sql_dump":
        return "sql_dump"
    else:
        return "unknown"

def save_raw_file(dataset_dir: Path, file: UploadFile) -> Path:
    '''
    save_raw_file is a function that saves the raw file to the dataset directory.

    Args:
        dataset_dir: Path - The directory to save the raw file to. (Must Exist)
        file: UploadFile - The file to save.

    Returns:
        Path - The path to the saved raw file.
        int - The size of the saved raw file.
    '''

    if not dataset_dir.exists():
        raise FileNotFoundError(f"Dataset directory {dataset_dir} does not exist.")

    raw_saving_path = dataset_dir / f"{file.filename}"
    size = 0

    with open(raw_saving_path, "wb") as f:
        while True:
            # Read 1MB at a time.
            chunk = file.file.read(1024 * 1024)

            # If no chunk break the loop.
            if not chunk:
                break

            f.write(chunk)
            size += len(chunk)

    # returns raw_saving_path(Path), size(int)
    return raw_saving_path, size

def save_parquet_file(dataset_dir: Path, raw_csv_path: Path) -> Path:
    '''
    save_parquet_file is a function that saves the parquet file to the dataset directory.

    Args:
        dataset_dir: Path - The directory to save the parquet file to. (
        raw_csv_path: the path to the raw csv file.

    Returns:
        Path - The path to the saved parquet file.
    '''

    # Make a tables directory for storing a parquet file. 
    tables_dir = dataset_dir / "tables"
    tables_dir.mkdir(parents=True, exist_ok=True)

    parquet_path = tables_dir / f"{raw_csv_path.stem}.parquet" # We will name the parquet file the same as the csv file.
    duckdb.read_csv(str(raw_csv_path)).write_parquet(str(parquet_path))

    return parquet_path

def get_sqlite_table_names(sqlite_path: Path) -> list[str]:
    '''
    get_sqlite_table_names is a function that gets the table names from the sqlite database. Connection is done via sqlite3. 

    Args:
        sqlite_path: Path - The path to the sqlite database.

    Returns:
        list[str] - The table names in the sqlite database.
    '''

    # Connect to the sqlite database.
    sqlite_conn = sqlite3.connect(str(sqlite_path))

    # Get the table names from the sqlite database.
    cursor = sqlite_conn.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")

    table_names = cursor.fetchall()

    return [table[0] for table in table_names]


def get_sqlite_schema(sqlite_path: Path) -> dict:
    '''
    get_sqlite_schema is a function that gets the schema of the sqlite database.

    Args:
        sqlite_path: Path - The path to the sqlite database.

    Returns:
        the schema of a SQLite database, for each table it will be a dictionary of the column names and their types. 
    '''
    table_names = get_sqlite_table_names(sqlite_path)

    # dict[table_name: dict[column_name: column_type]]
    schema: dict[str, dict[str, str]] = {}

    conn = sqlite3.connect(str(sqlite_path))
    for table in table_names:
        # Fetching all of the columns in the table and their types
        cursor = conn.execute(f"PRAGMA table_info({table})")
        schema[table] = {column[1]: column[2] }
    




# Potential next functions to add
# - Save JSON Files
# - Conversion function of SQL to CSV (this can be done by converting each table into a parquet file.)
# - Conversion of CSV to SQL (this can be done by converting each parquet file into a table in the sqlite database.)


if __name__ == "__main__":
    print(os.getcwd())
    print(get_sqlite_table_names(Path("db_helpers/test_data/test_sql.db")))
    get_sqlite_schema(Path("db_helpers/test_data/test_sql.db"))
    
# running python3 -m db_helpers.db_services
