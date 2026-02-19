import os
import duckdb
import uuid
from pathlib import Path
import logging
from sqlalchemy import (
    create_engine, Column, String, DateTime, Integer, Text
)

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
    elif extension == ".sqlite":
        return "sqlite"
    elif extension == ".sql_dump":
        return "sql_dump"
    else:
        return "unknown"

def save_raw_file()


if __name__ == "__main__":
    print(detect_upload_type("test.csv"))
    
# running python3 db_helpers/db_services.py 
