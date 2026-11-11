import os
from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient
from mssql_python import connect

# Run on import of connection.py fie.
credential = DefaultAzureCredential()


def connect_azure_sql():
    conn = connect(
        os.environ["SQL_CONNECTION_STRING"],
        token_provider=credential,
        autocommit=False
    )
    return conn


def connect_azure_blob_storage() -> BlobServiceClient:
    return BlobServiceClient(
        account_url=os.environ["AZURE_STORAGE_ACCOUNT_URL"],
        credential=credential
    )
