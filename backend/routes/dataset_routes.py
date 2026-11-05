import logging
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi import UploadFile, File, Header
from azure.core.exceptions import AzureError

from services.dataset_service import DatasetService

router = APIRouter(prefix="/dataset", tags=["dataset"])
logger = logging.getLogger(__name__)


@router.post("/upload")
def upload_dataset(file: UploadFile = File(...)):
    try:
        dataset = DatasetService.save_file_to_azure(file)
        return dataset
    except AzureError:
        logger.exception("Azure dataset upload failed")
        raise HTTPException(502, "Could not upload the file to storage.")
    finally:
        file.file.close()
