from pathlib import Path
from fastapi import UploadFile
import os
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient
from uuid import uuid4


class DatasetService:

    def detect_upload_type(filename: str):
        extension = Path(filename).suffix.lower()

        if extension == ".csv":
            return "csv"
        elif extension == ".db":
            return "db"
        elif extension == ".sqlite":
            return "sqlite"
        else:
            return "unknown"

    @staticmethod
    def save_file_to_azure(file: UploadFile) -> dict:
        account_url = os.environ["AZURE_STORAGE_ACCOUNT_URL"]
        container_name = os.environ["CONTAINER_NAME"]

        # temporary dataset_id
        dataset_id = str(uuid4())
        extension = Path(file.filename or "").suffix.lower()
        blob_name = f"{dataset_id}/original{extension}"
        # Add conditional check here.
        file.file.seek(0)

        default_credential = DefaultAzureCredential()
        service_client = BlobServiceClient(
            account_url=account_url, credential=default_credential)

        blob = service_client.get_blob_client(
            container=container_name, blob=blob_name)

        blob.upload_blob(data=file.file, overwrite=False)

        return {"dataset_id": dataset_id, "container": container_name, "blob_name": blob_name, }
