import json
from contextlib import closing
from uuid import UUID

from connection import connect_azure_sql
from .db_constants import Dataset

DATASET_FIELDS = "id, user_id, upload_type, raw_byte_size, path, [tables], [schema]"


def save_metadata(dataset: Dataset) -> None:
    query = """
    INSERT INTO dbo.Dataset (id, user_id, upload_type, raw_byte_size, path, name, [tables], [schema])
    VALUES (%(dataset_id)s, %(user_id)s, %(upload_type)s, %(raw_byte_size)s,
            %(path)s, %(name)s, %(tables)s, %(schema)s)
    """
    parameters = {
        **dataset.model_dump(),
        "name": dataset.path.rsplit("/", 1)[-1],
        "tables": json.dumps(dataset.tables),
        "schema": json.dumps(dataset.schema),
    }
    with closing(connect_azure_sql()) as conn:
        conn.cursor().execute(query, parameters)
        conn.commit()


def metadata_references_blob(dataset: Dataset) -> bool:
    query = "SELECT 1 FROM dbo.Dataset WHERE id = %(dataset_id)s AND path = %(path)s"
    with closing(connect_azure_sql()) as conn:
        cursor = conn.cursor()
        cursor.execute(query, {"dataset_id": dataset.dataset_id, "path": dataset.path})
        return cursor.fetchone() is not None


def _dataset_from_row(row) -> Dataset:
    return Dataset(
        dataset_id=str(UUID(str(row.id))),
        user_id=str(UUID(str(row.user_id))),
        upload_type=row.upload_type,
        raw_byte_size=row.raw_byte_size,
        path=row.path,
        tables=json.loads(row.tables or "[]"),
        schema=json.loads(row.schema or "{}"),
    )


def list_datasets(user_id: str) -> list[Dataset]:
    query = f"""
    SELECT {DATASET_FIELDS} FROM dbo.Dataset
    WHERE user_id = %(user_id)s AND path IS NOT NULL AND raw_byte_size IS NOT NULL
    """
    with closing(connect_azure_sql()) as conn:
        cursor = conn.cursor()
        cursor.execute(query, {"user_id": user_id})
        return [_dataset_from_row(row) for row in cursor.fetchall()]


def get_dataset_by_id(dataset_id: str, user_id: str) -> Dataset:
    try:
        parameters = {"dataset_id": str(UUID(dataset_id)), "user_id": str(UUID(user_id))}
    except ValueError:
        raise ValueError("Dataset not found.") from None

    query = f"""
    SELECT {DATASET_FIELDS} FROM dbo.Dataset
    WHERE id = %(dataset_id)s AND user_id = %(user_id)s
      AND path IS NOT NULL AND raw_byte_size IS NOT NULL
    """
    with closing(connect_azure_sql()) as conn:
        cursor = conn.cursor()
        cursor.execute(query, parameters)
        row = cursor.fetchone()
        if row is None:
            raise ValueError("Dataset not found.")
        return _dataset_from_row(row)
