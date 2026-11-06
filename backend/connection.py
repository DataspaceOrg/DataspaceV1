import os
from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential
from mssql_python import connect

credential = DefaultAzureCredential()


def connect_azure_sql():
    conn = connect(
        os.environ["SQL_CONNECTION_STRING"],
        token_provider=credential,
        autocommit=False
    )
    return conn
