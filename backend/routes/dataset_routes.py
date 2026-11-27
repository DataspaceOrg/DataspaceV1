import logging
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi import UploadFile, File, Header, Body
from azure.core.exceptions import AzureError
from fastapi.responses import StreamingResponse

from services.dataset_service import DatasetService

router = APIRouter(prefix="/db", tags=["dataset"])
logger = logging.getLogger(__name__)


@router.post("/upload")
def upload_dataset(file: UploadFile = File(...), x_user_id: str = Header(..., alias="x-user-id")):
    try:
        dataset = DatasetService.save_file_to_azure(file, x_user_id)
        return dataset
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except AzureError:
        logger.exception("Azure dataset upload failed")
        raise HTTPException(502, "Could not upload the file to storage.")
    finally:
        file.file.close()

@router.get("/dataset/{dataset_id}")
def get_dataset_metadata(dataset_id: str, x_user_id: str = Header(..., alias="x-user-id")):
    try:
        dataset = DatasetService.get_dataset_metadata(dataset_id, x_user_id)
        if not dataset:
            raise HTTPException(404, "Dataset not found.")
        return dataset
    except AzureError:
        logger.exception("Azure dataset retrieval failed")
        raise HTTPException(502, "Could not retrieve the dataset from storage.")

@router.get("/dataset/{dataset_id}/download")
def download_dataset(dataset_id: str, x_user_id: str = Header(..., alias="x-user-id")):
    try:
        dataset = DatasetService.get_dataset_metadata(dataset_id, x_user_id)
        if not dataset:
            raise HTTPException(404, "Dataset not found.")
        chunks, filename, content_type = DatasetService.get_dataset_download(
            dataset_id, x_user_id
        )
        return StreamingResponse(
            chunks,
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except AzureError:
        logger.exception("Azure dataset download failed")
        raise HTTPException(502, "Could not download the dataset from storage.")

@router.patch("/dataset/{dataset_id}")
def update_dataset_metadata(dataset_id: str, x_user_id:str = Header(..., alias="x-user-id"), metadata: dict = Body(...)):
    try:
        updated_dataset = DatasetService.update_dataset_metadata(
            dataset_id, x_user_id, metadata
        )
        if not updated_dataset:
            raise HTTPException(404, "Dataset not found.")
        return updated_dataset
    except AzureError:
        logger.exception("Azure dataset update failed")
        raise HTTPException(502, "Could not update the dataset in storage.")

@router.get("/datasets")
def list_datasets(x_user_id: str = Header(..., alias="x-user-id")):
    try:
        datasets = DatasetService.list_datasets(x_user_id)
        return datasets
    except AzureError:
        logger.exception("Azure dataset listing failed")
        raise HTTPException(502, "Could not list the datasets from storage.")

@router.delete("/dataset/{dataset_id}")
def delete_dataset(dataset_id: str, x_user_id: str = Header(..., alias="x-user-id")):
    try:
        success = DatasetService.delete_dataset(dataset_id, x_user_id)
        if not success:
            raise HTTPException(404, "Dataset not found or could not be deleted.")
        return {"message": "Dataset deleted successfully."}
    except AzureError:
        logger.exception("Azure dataset deletion failed")
        raise HTTPException(502, "Could not delete the dataset from storage.")