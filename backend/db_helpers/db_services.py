from contextlib import closing
import sqlite3
import duckdb
from pathlib import Path
from .db_constants import Dataset
from services.dataset_service import local_dataset_file
from fastapi import UploadFile
from typing import Any

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
    elif extension == ".db":
        return "db"
    elif extension == ".sqlite":
        return "sqlite"
    else:
        return "unknown"


def save_raw_file(dataset_dir: Path, filename: str, file: UploadFile) -> tuple[Path, int]:
    '''
    save_raw_file is a function that saves the raw file to the dataset directory.
    It is connected to the uploading feature of the frontend in Upload.tsx.

    Args:
        dataset_dir: Path - The directory to save the raw file to. (Must Exist) Will be the dataset directory under its uuid.
        filename: str - The validated basename.
        file: UploadFile - The file to save.

    Returns:
        Path - The path to the saved raw file.
        int - The size of the saved raw file.
    '''

    if not dataset_dir.exists():
        raise FileNotFoundError(
            f"Dataset directory {dataset_dir} does not exist.")

    raw_saving_path = dataset_dir / filename
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
    Will be under the tables directory under its uuid. It is connected to the uploading feature of the frontend in Upload.tsx.

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


def get_parquet_schema(parquet_path: Path) -> dict[str, dict[str, str]]:
    '''
    Returns column names and types for a single Parquet file. 
    DuckDB infers types when writing CSV to Parquet, so we can read them back from Parquet file into our metadata.
    It is used in the process of retrieving the schema for the dataset metadata. 

    Args: 
        parquet_path: Path - The path to the parquet file.

    Returns:
        dict[str, dict[str, str]] - The schema of the parquet file.
    '''

    schema: dict[str, dict[str, str]] = {}
    with closing(duckdb.connect()) as conn:
        result = conn.execute(
            "DESCRIBE (SELECT * FROM read_parquet(?))", [str(parquet_path)]
        ).fetchall()

    # eg return) {"column_name": "TYPE"}
    # parquet_path.stem is the name of the parquet file without the extension.
    schema[parquet_path.stem] = {column[0]: column[1] for column in result}
    return schema


def get_sqlite_table_names(sqlite_path: Path) -> list[str]:
    '''
    get_sqlite_table_names is a function that gets the table names from the sqlite database. Connection is done via sqlite3. 
    Its role is for retrieving the table names for the dataset metadata from the sqlite database.

    Args:
        sqlite_path: Path - The path to the sqlite database.

    Returns:
        list[str] - The table names in the sqlite database.
    '''

    with closing(sqlite3.connect(sqlite_path.as_uri() + "?mode=ro", uri=True)) as conn:
        rows = conn.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        ).fetchall()
    return [row[0] for row in rows]


def get_sqlite_schema(sqlite_path: Path) -> dict[str, dict[str, str]]:
    schema = {}
    with closing(sqlite3.connect(sqlite_path.as_uri() + "?mode=ro", uri=True)) as conn:
        for table in get_sqlite_table_names(sqlite_path):
            columns = conn.execute("SELECT * FROM pragma_table_info(?)", (table,))
            schema[table] = {column[1]: column[2] or "TEXT" for column in columns}
    return schema


def get_sample_rows(dataset: Dataset, num_rows: int, table_name: str) -> list[dict[str, Any]]:
    if table_name not in dataset.tables:
        raise ValueError("Table not found.")

    if dataset.upload_type == "csv":
        return get_csv_rows(dataset, num_rows, 0)["rows"]

    with local_dataset_file(dataset) as path:
        with closing(sqlite3.connect(path.as_uri() + "?mode=ro", uri=True)) as conn:
            conn.row_factory = sqlite3.Row
            table = '"' + table_name.replace('"', '""') + '"'
            return [dict(row) for row in conn.execute(f"SELECT * FROM {table} LIMIT ?", (num_rows,))]


def get_csv_rows(dataset: Dataset, num_rows: int, offset: int) -> dict[str, Any]:
    if dataset.upload_type != "csv":
        raise ValueError("Only .csv files are supported")
    if num_rows < 1:
        raise ValueError("number of rows must be positive")
    if offset < 0:
        raise ValueError("offset must not be negative")

    with local_dataset_file(dataset) as path, closing(duckdb.connect()) as conn:
        total_rows = conn.execute(
            "SELECT COUNT(*) FROM read_csv_auto(?)", [str(path)]
        ).fetchone()[0]
        cursor = conn.execute(
            "SELECT * FROM read_csv_auto(?) LIMIT ? OFFSET ?", [str(path), num_rows, offset]
        )
        columns = [column[0] for column in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return {
        "rows": rows,
        "total_rows": total_rows,
        "num_rows": num_rows,
        "offset": offset,
    }
