import os
from pathlib import Path

from dotenv import load_dotenv
from azure.identity import InteractiveBrowserCredential
from mssql_python import connect

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

credential = InteractiveBrowserCredential(
    tenant_id=os.environ["AZURE_TENANT_ID"]
)

conn = connect(
    os.environ["SQL_CONNECTION_STRING"],
    token_provider=credential,
)
cursor = conn.cursor()

cursor.execute("SELECT DB_NAME()")
print("Connected to:", cursor.fetchone()[0])

cursor.execute("SELECT TOP 1 id, message FROM dbo.connection_test ORDER BY id")
row = cursor.fetchone()
print("Before:", row)

cursor.execute(
    "UPDATE dbo.connection_test SET message = %(message)s WHERE id = %(id)s",
    {"message": "Updated from Python!", "id": row[0]},
)
conn.commit()

cursor.execute(
    "SELECT id, message FROM dbo.connection_test WHERE id = %(id)s", {"id": row[0]})
print("After:", cursor.fetchone())

cursor.close()
conn.close()


# python server/sql_simple_check.py
