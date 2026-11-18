import logging
import sqlite3
from pathlib import Path, PureWindowsPath
from tempfile import TemporaryDirectory
from uuid import UUID, uuid4

import duckdb
from azure.core.exceptions import AzureError
from fastapi import APIRouter, File, Header, HTTPException, UploadFile
from mssql_python.exceptions import DatabaseError

from db_helpers.db_constants import Dataset
from db_helpers.db_services import (
    detect_upload_type,
    get_parquet_schema,
    get_sqlite_schema,
    save_parquet_file,
    save_raw_file,
)
from services.dataset_service import dataset_container, store_dataset

router = APIRouter(prefix="/dataset", tags=["dataset"])
logger = logging.getLogger(__name__)


@router.post("/upload")
def upload_dataset(file: UploadFile = File(...), x_user_id: UUID = Header(...)) -> dict:
    filename = PureWindowsPath(file.filename or "").name
    upload_type = detect_upload_type(filename)
    if upload_type not in ("csv", "db", "sqlite"):
        raise HTTPException(400, "Only CSV and SQLite datasets are supported.")
    if len(filename.encode("utf-16-le")) > 510 or any(ord(char) < 32 for char in filename):
        raise HTTPException(400, "Invalid dataset filename.")

    dataset_id = str(uuid4())
    with TemporaryDirectory() as directory:
        dataset_dir = Path(directory)
        source, raw_size = save_raw_file(dataset_dir, filename, file)
        if not raw_size:
            raise HTTPException(400, "The dataset file is empty.")

        try:
            if upload_type == "csv":
                parquet = save_parquet_file(dataset_dir, source)
                schema = get_parquet_schema(parquet)
            else:
                schema = get_sqlite_schema(source)
        except (duckdb.Error, sqlite3.Error) as exc:
            raise HTTPException(400, "Could not read the dataset.") from exc

        dataset = Dataset(
            dataset_id=dataset_id,
            user_id=str(x_user_id),
            upload_type=upload_type,
            raw_byte_size=raw_size,
            path=f"{dataset_id}/{filename}",
            tables=list(schema),
            schema=schema,
        )
        try:
            store_dataset(dataset, source)
        except AzureError as exc:
            logger.exception("Azure dataset upload failed")
            raise HTTPException(502, "Could not upload the file to storage.") from exc
        except DatabaseError as exc:
            logger.exception("Could not save dataset metadata")
            raise HTTPException(503, "Could not save dataset metadata.") from exc

    return {
        "message": "File uploaded successfully",
        "dataset_id": dataset_id,
        "container": dataset_container(),
        "blob_name": dataset.path,
    }
