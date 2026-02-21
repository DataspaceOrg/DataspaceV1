from fastapi import FastAPI, APIRouter
from fastapi import UploadFile, File
import uuid
from .db_services import (
    detect_upload_type,
    save_raw_file,
    save_parquet_file,
    get_parquet_schema,
    get_sqlite_schema,
    get_sqlite_table_names,
    list_datasets,
    get_dataset_by_id,
)
from .db_constants import DATA_ROOT
from .db_constants import Dataset

router = APIRouter(prefix="/db", tags=["db"])

@router.get("/")
def read_root():
    # Return a JSON response to the frontend
    return {"message": "Welcome to the DB Helper API"}

@router.get("/dataset/{dataset_id}")
def get_dataset_route(dataset_id: str) -> Dataset:
    '''
    Get dataset is a service that allows for the frontend to get a dataset by its id.
    '''
    return get_dataset_by_id(dataset_id)

@router.get("/datasets")
def list_datasets_route() -> list[Dataset]:
    '''
    List datasets is a service that allows for the frontend to list all the datasets in the database.
    '''
    return list_datasets()

@router.post("/upload_db")
def upload_db(file: UploadFile = File(...)) -> dict:
    '''
    Upload db is a service that allows for the frontend to send a request object containing the file to be uploaded to the database. 
    '''

    # If no file is provided, raise an error.
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    # Detect the type of the file.
    upload_type = detect_upload_type(file.filename)

    # Give dataset a unique id, and then its directory, From this current directory, we will create the copy of the file.
    dataset_id = str(uuid.uuid4())
    dataset_dir = DATA_ROOT / dataset_id
    dataset_dir.mkdir(parents=True, exist_ok=True)

    if upload_type == "csv":
        # Save raw CSV and Parquet. One logical "table" (the parquet); key = file stem for consistency.
        raw_path, raw_size = save_raw_file(dataset_dir, file)
        parquet_path = save_parquet_file(dataset_dir, raw_path)
        table_key = parquet_path.stem 
        schema = get_parquet_schema(parquet_path)

        new_dataset = Dataset(
            dataset_id=dataset_id,
            upload_type=upload_type,
            raw_byte_size=raw_size,
            tables={table_key: str(parquet_path)}, # the table key will be the parquet path. 
            schema=schema,
        )

    if upload_type == "db" or upload_type == "sqlite":
        # If its a SQL db, save the raw db file, and then retrieve the tables and schema for metadata.
        raw_path, raw_size = save_raw_file(dataset_dir, file)
        table_names = get_sqlite_table_names(raw_path)
        tables = {name: str(raw_path) for name in table_names}
        schema = get_sqlite_schema(raw_path)

        new_dataset = Dataset(
            dataset_id=dataset_id,
            upload_type=upload_type,
            raw_byte_size=raw_size,
            tables=tables,
            schema=schema,
        )

    # Save the metadata of the dataset to the database.
    try:
        save_metadata(new_dataset)
        return { "message": "File uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving metadata: {e}")

    