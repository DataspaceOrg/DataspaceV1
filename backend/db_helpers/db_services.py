import os
import sqlite3
import duckdb
import uuid
from pathlib import Path
import logging
from .db_constants import Dataset
from db_helpers.db_constants import DATA_ROOT, METADATA_DB, METADATA_TABLE
from fastapi import UploadFile

##
'''
db_services.py is a module that contains the functions to interact with the database services.
This is different from the db_metadata which contains the functions to interact with the metadata database.
'''

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


def get_sample_rows(dataset: Dataset, num_rows: int, table_name: str) -> list[dict[str, any]]:
    '''
    get_sample_rows is a db_helper function that gets the sample rows from a dataset and returns them as a list of dictionaries.
    If table name is none then we will return none.

    For CSV -> Parquet: we will read the parquet file and return the sample rows.
    For SQLite we will read the SQLite database and return the sample rows. 
    '''
    if table_name is None:
        raise ValueError("No table name provided.")

    #Initialize duckDB connection.
    conn = duckdb.connect()
    dataset_path = dataset.dataset_path

    try:
        if dataset.upload_type == "csv":
            # If csv then we load in the parquet file and return the sample rows. There is only one table in the dataset.
            dataframe = conn.execute("SELECT * FROM read_parquet(?) LIMIT ?", [dataset_path, num_rows]).fetchdf()

        # If its a db type then it is an sqlite database. 
        elif dataset.upload_type == "db":
            # if sqlite then we moust attach the sqlite file into DuckDB and expose it with the name sqlite_db.
            conn.execute(f"ATTACH DATABASE '{dataset_path}' AS sqlite_db (TYPE sqlite)")
            dataframe = conn.execute(f"SELECT * FROM sqlite_db.{table_name} LIMIT ?", [num_rows]).fetchdf()

    finally:
        conn.close()

    return dataframe.to_dict(orient="records")
    

# Potential next functions to add
# - Save JSON Files
# - Conversion function of SQL to CSV (this can be done by converting each table into a parquet file.)
# - Conversion of CSV to SQL (this can be done by converting each parquet file into a table in the sqlite database.)


if __name__ == "__main__":
    pass


    
# running python3 -m db_helpers.db_services
