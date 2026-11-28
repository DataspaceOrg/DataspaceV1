from pathlib import Path
from connection import connect_azure_sql, connect_azure_blob_storage
from fastapi import UploadFile
from azure.storage.blob import ContentSettings
import os
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient
from uuid import uuid4
import json


class DatasetService:   
    @staticmethod
    def detect_upload_type(filename: str):
        extension = Path(filename).suffix.lower()

        if extension == ".csv":
            return "csv"
        elif extension == ".xlsx":
            return "xlsx"

        raise ValueError(f"Unsupported file extension: {extension}")
        
    @staticmethod
    def save_file_to_azure(file: UploadFile, user_id: str) -> dict:
        if not file.filename:
            raise ValueError("A filename is required.")
        
        account_url = os.environ["AZURE_STORAGE_ACCOUNT_URL"]
        container_name = os.environ["CONTAINER_NAME"]

        # temporary dataset_id
        dataset_id = str(uuid4())
        upload_type = DatasetService.detect_upload_type(file.filename)
        # Add conditional check.
        blob_name = f"{dataset_id}/{file.filename}"

        connection_blob = connect_azure_blob_storage()
        
        connection_sql = connect_azure_sql()
        try: 
            file.file.seek(0)
            file.file.seek(0, os.SEEK_END)
            raw_byte_size = file.file.tell()
            file.file.seek(0)
            cursor = connection_sql.cursor()
            cursor.execute(
                """
                INSERT INTO dbo.Dataset (
                    id, user_id, upload_type, path, name, raw_byte_size
                )
                VALUES (
                    %(id)s, %(user_id)s, %(upload_type)s, %(path)s, %(name)s,
                    %(raw_byte_size)s
                )
                """,
                {
                    "id": dataset_id,
                    "user_id": user_id,
                    "upload_type": upload_type,
                    "path": blob_name,
                    "name": file.filename,
                    "raw_byte_size": raw_byte_size,
                    "description": 'description',
                },
            )
            connection_sql.commit()
        except Exception:
            connection_sql.rollback()
            raise
        finally: 
            connection_sql.close()

        blob_client = connection_blob.get_blob_client(
            container=container_name,
            blob=blob_name,
        )
        blob_client.upload_blob(data=file.file, overwrite=False)
        return {"dataset_id": dataset_id, "container": container_name, "blob_name": blob_name, "upload_type": upload_type}

    @staticmethod
    def get_dataset_metadata(dataset_id: str, user_id: str) -> dict:
        connection_sql = connect_azure_sql()
        try:
            cursor = connection_sql.cursor()
            cursor.execute(
                """
                SELECT id, user_id, upload_type, path, name, description,
                    raw_byte_size, [columns], [tables], [schema]
                FROM dbo.Dataset
                WHERE id = %(dataset_id)s AND user_id = %(user_id)s
                """,
                {"dataset_id": dataset_id, "user_id": user_id},
            )
            row = cursor.fetchone()

            if row is None:
                return None

            return {
                "dataset_id": str(row.id),
                "user_id": str(row.user_id),
                "upload_type": row.upload_type,
                "dataset_path": row.path,
                "name": row.name,
                "description": row.description,
                "raw_byte_size": row.raw_byte_size,
                "columns": json.loads(row.columns) if row.columns else [],
                "tables": json.loads(row.tables) if row.tables else [],
                "schema": json.loads(row.schema) if row.schema else {},
            }
        finally:
            connection_sql.close()

    @staticmethod
    def get_dataset_download(dataset_id: str, user_id: str):
        connection_sql  = connect_azure_sql()
        try:
            cursor = connection_sql.cursor()
            cursor.execute(
                """
                SELECT path, name
                FROM dbo.Dataset
                WHERE id = %(dataset_id)s AND user_id = %(user_id)s
                """,
                {"dataset_id": dataset_id, "user_id": user_id},
            )
            row = cursor.fetchone()

            if row is None:
                return None, None, None

            connection_blob = connect_azure_blob_storage()

            blob = connection_blob.get_blob_client(container = os.environ["CONTAINER_NAME"], blob = row.path)
            chunks = blob.download_blob().chunks()

            content_type = blob.get_blob_properties().content_settings.content_type

            return chunks, row.name, content_type
        finally:
            connection_sql.close()

    @staticmethod
    def update_dataset_metadata(dataset_id: str, user_id: str, metadata: dict) -> dict:
        connection_sql = connect_azure_sql()
        try:
            cursor = connection_sql.cursor()
            cursor.execute(
                """
                UPDATE dbo.Dataset
                SET description = COALESCE(%(description)s, description),
                    [columns] = COALESCE(%(columns)s, [columns]),
                    [tables] = COALESCE(%(tables)s, [tables]),
                    [schema] = COALESCE(%(schema)s, [schema])
                WHERE id = %(dataset_id)s AND user_id = %(user_id)s
                """,
                {
                    "dataset_id": dataset_id,
                    "user_id": user_id,
                    "description": metadata.get("description"),
                    "columns": json.dumps(metadata["columns"]) if "columns" in metadata else None,
                    "tables": json.dumps(metadata["tables"]) if "tables" in metadata else None,
                    "schema": json.dumps(metadata["schema"]) if "schema" in metadata else None,
                },
            )
            connection_sql.commit()
            return DatasetService.get_dataset_metadata(dataset_id, user_id)
        except Exception:
            connection_sql.rollback()
            raise
        finally:
            connection_sql.close()


    @staticmethod
    def list_datasets(user_id: str) -> list:
        connection_sql = connect_azure_sql()
        try:
            cursor = connection_sql.cursor()
            cursor.execute(
                """
                SELECT id, user_id, upload_type, path, name, description,
                    raw_byte_size, [columns], [tables], [schema]
                FROM dbo.Dataset
                WHERE user_id = %(user_id)s
                """,
                {"user_id": user_id},
            )
            rows = cursor.fetchall()

            datasets = []
            for row in rows:
                datasets.append({
                    "dataset_id": str(row.id),
                    "user_id": str(row.user_id),
                    "upload_type": row.upload_type,
                    "dataset_path": row.path,
                    "name": row.name,
                    "description": row.description,
                    "raw_byte_size": row.raw_byte_size,
                    "columns": json.loads(row.columns) if row.columns else [],
                    "tables": json.loads(row.tables) if row.tables else [],
                    "schema": json.loads(row.schema) if row.schema else {},
                })

            return datasets
        finally:
            connection_sql.close()

    @staticmethod
    def delete_dataset(dataset_id: str, user_id: str) -> bool:
        connection_sql = connect_azure_sql()
        try:
            cursor = connection_sql.cursor()
            cursor.execute(
                """
                SELECT path
                FROM dbo.Dataset
                WHERE id = %(dataset_id)s AND user_id = %(user_id)s
                """,
                {"dataset_id": dataset_id, "user_id": user_id},
            )
            row = cursor.fetchone()

            if row is None:
                return False

            blob_path = row.path

            connection_blob = connect_azure_blob_storage()
            blob_client = connection_blob.get_blob_client(
                container=os.environ["CONTAINER_NAME"],
                blob=blob_path,
            )
            blob_client.delete_blob()
            cursor.execute(
                """
                DELETE FROM dbo.Dataset
                WHERE id = %(dataset_id)s AND user_id = %(user_id)s
                """,
                {"dataset_id": dataset_id, "user_id": user_id},
            )
            connection_sql.commit()

            return True
        except Exception:
            connection_sql.rollback()
            raise
        finally:
            connection_sql.close()