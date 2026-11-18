from uuid import UUID

from azure.core.exceptions import AzureError
from fastapi import APIRouter, Header, HTTPException, Query

from routes.dataset_routes import upload_dataset
from .db_constants import Dataset
from .db_metadata import get_dataset_by_id, list_datasets
from .db_services import get_csv_rows, get_sample_rows


router = APIRouter(prefix="/db", tags=["db"])


@router.get("/")
def read_root():
    # Return a JSON response to the frontend
    return {"message": "Welcome to the DB Helper API"}


@router.get("/datasets/{dataset_id}")
def get_dataset_route(dataset_id: str, x_user_id: UUID = Header(...)) -> Dataset:
    '''
    Get dataset is a service that allows for the frontend to get a dataset by its id.
    uses the get_dataset_by_id function to get the dataset by its id for a given user. (Provided in the header of the request.)
    '''
    try:
        return get_dataset_by_id(dataset_id, str(x_user_id))
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc


@router.get("/datasets")
def list_datasets_route(x_user_id: UUID = Header(...)) -> list[Dataset]:
    '''
    List datasets is a service that allows for the frontend to list all the datasets in the database.
    uses the list_datasets function to list all the datasets in the database for a given user. (Provided in the header of the request.)
    '''
    return list_datasets(str(x_user_id))


router.add_api_route("/upload_db", upload_dataset, methods=["POST"])


@router.get("/datasets/{dataset_id}/rows")
def get_dataset_rows(
    dataset_id: str,
    table_name: str,
    x_user_id: UUID = Header(...),
    num_rows: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
) -> dict:
    '''
    Get a CSV page or a sample of up to 100 rows from a SQLite table.
    '''
    # retrieve the dataset metadata for the current user
    try:
        dataset = get_dataset_by_id(dataset_id, str(x_user_id))
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    if dataset.upload_type not in ("csv", "db", "sqlite"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV and SQLite datasets are supported.",
        )

    # ensure that the requested table belongs to the dataset
    if table_name not in dataset.tables:
        raise HTTPException(status_code=404, detail="Table not found.")

    try:
        if dataset.upload_type == "csv":
            return get_csv_rows(dataset, num_rows, offset)

        if offset:
            raise HTTPException(status_code=400, detail="SQLite previews do not support offsets.")

        sample_size = min(num_rows, 100)
        rows = get_sample_rows(dataset, sample_size, table_name)
    except AzureError as exc:
        raise HTTPException(502, "Could not read the dataset from storage.") from exc

    return {
        "rows": [
            {column: value.hex() if isinstance(value, bytes) else value for column, value in row.items()}
            for row in rows
        ],
        "total_rows": len(rows),
        "num_rows": sample_size,
        "offset": 0,
    }
