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
    extension = Path(filename).suffix.lower()

if __name__ == "__main__":
    print(detect_upload_type("test.csv"))
    
# running python3 db_helpers/db_services.py 
