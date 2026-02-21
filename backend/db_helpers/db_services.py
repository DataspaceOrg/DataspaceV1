import os
import sys
import sqlite3
import duckdb
import uuid
from pathlib import Path
import logging
import json
from .db_constants import Dataset
from sqlalchemy import (
    create_engine, Column, String, DateTime, Integer, Text
)
from db_helpers.db_constants import DATA_ROOT, METADATA_DB, METADATA_TABLE
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
        dataset_dir: Path - The directory to save the raw file to. (Must Exist) Will be the dataset directory under its uuid.
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
    Will be under the tables directory under its uuid.

    Args:
        dataset_dir: Path - The directory to save the parquet file to. (
        raw_csv_path: the path to the raw csv file.

    Returns:
        Path - The path to the saved parquet file. eg) format -> datasets/uuid/tables/file_name.parquet
    '''

    # Make a tables directory for storing a parquet file. 
    tables_dir = dataset_dir / "tables"
    tables_dir.mkdir(parents=True, exist_ok=True)

    parquet_path = tables_dir / f"{raw_csv_path.stem}.parquet" 
    # read the csv file from its path and write it to the parquet file in the tables directory where we want to store it. 
    duckdb.read_csv(str(raw_csv_path)).write_parquet(str(parquet_path))

    return parquet_path

def get_parquet_schema(parquet_path: Path) -> dict[str, str]:
    '''
    Returns column names and types for a single Parquet file. 
    DuckDB infers types when writing CSV to Parquet, so we can read them back from Parquet file into our metadata.

    Args: 
        parquet_path: Path - The path to the parquet file.
    
    Returns:
        dict[str, dict[str, str]] - The schema of the parquet file.
    '''

    schema: dict[str, dict[str, str]] = {}
    result = duckdb.execute("DESCRIBE (SELECT * FROM read_parquet(?))", [str(parquet_path)]).fetchall()

    # eg return) {"column_name": "TYPE"}
    # parquet_path.stem is the name of the parquet file without the extension. 
    schema[parquet_path.stem] = {column[0]: column[1] for column in result}
    return schema

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

    # For each table get the information about the table, getting the column names and their types. 
    for table in table_names:
        # Fetching all of the columns in the table and their types
        cursor = conn.execute(f"PRAGMA table_info({table})")
        schema[table] = {column[1]: column[2] or "TEXT" for column in cursor.fetchall()}

    return schema

########################################################
# Metadata Database Functions
########################################################

def connect_metadata_db():
    # Connect to the metadata database
    conn = sqlite3.connect(str(METADATA_DB))

    conn.execute(f"""CREATE TABLE IF NOT EXISTS {METADATA_TABLE}
    (dataset_id TEXT PRIMARY KEY, upload_type TEXT, raw_byte_size INTEGER, tables TEXT NOT NULL, schema TEXT NOT NULL)""")

    conn.commit()
    return conn

def save_metadata(dataset: Dataset):
    '''
    save_metadata is a function that saves the metadata of a dataset to the metadata database.
    Args:
        dataset: Dataset - The dataset to save the metadata of.
    '''

    data = dataset.model_dump()
    # get the connection to the metadata database.
    conn = connect_metadata_db()

    try: 
        conn.execute(f"INSERT INTO {METADATA_TABLE} (dataset_id, upload_type, raw_byte_size, tables, schema) VALUES (?, ?, ?, ?, ?)",
        (data["dataset_id"], data["upload_type"], data["raw_byte_size"], json.dumps(data["tables"]), json.dumps(data["schema"])))
        conn.commit()

    finally:
        conn.close()

def list_datasets():
    '''
    list_datasets is a function that lists all the datasets in the metadata database.
    Args:
        None
    Returns:
        list[Dataset] - A list of all the datasets in the metadata database.
    '''
    conn = connect_metadata_db()
    try:
        cursor = conn.execute(f"SELECT * FROM {METADATA_TABLE}").fetchall()
    finally:
        conn.close()

    # convert the cursor (query for all the metadata rows) into a list of Dataset objects and then return. 
    return [Dataset(
        dataset_id=row[0],
        upload_type=row[1],
        raw_byte_size=row[2],
        tables=json.loads(row[3]),
        schema=json.loads(row[4])
    ) for row in cursor]

def get_dataset_by_id(dataset_id: str) -> Dataset:
    '''
    get_dataset_by_id is a function that gets a dataset by its indivual id, from the metadata database.
    Args: 
        dataset_id: str - The id of the dataset to get.
    returns:
        Dataset - The dataset object with the given id.
    '''
    conn = connect_metadata_db()
    try:
        # Create a tuple of the dataset id, so that it can be used in the query. we need the , at the end to make it a tuple.
        db_tuple = (dataset_id,)
        cursor = conn.execute(f"SELECT * FROM {METADATA_TABLE} WHERE dataset_id = ?", db_tuple).fetchone()
    finally:
        conn.close()

    return Dataset(
        dataset_id=cursor[0],
        upload_type=cursor[1],
        raw_byte_size=cursor[2],
        tables=json.loads(cursor[3]),
        schema=json.loads(cursor[4])
    )

# Potential next functions to add
# - Save JSON Files
# - Conversion function of SQL to CSV (this can be done by converting each table into a parquet file.)
# - Conversion of CSV to SQL (this can be done by converting each parquet file into a table in the sqlite database.)


if __name__ == "__main__":
    # print(os.getcwd())
    # print(get_sqlite_table_names(Path("db_helpers/test_data/test_sql.db")))
    # print(get_sqlite_schema(Path("db_helpers/test_data/test_sql.db")))
    connect_metadata_db()

    print(list_datasets())


    
# running python3 -m db_helpers.db_services
