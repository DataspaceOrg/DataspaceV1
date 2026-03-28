from pathlib import Path
import uuid
import pytest
# Important as the db_metadata uses .db_constants at import time. 
# we are effectively changing db_helpers.db_metadata.METADATA_DB = db_path (temporary path)
from db_helpers import db_metadata as meta
from db_helpers.db_constants import Dataset
from db_helpers.db_services import (
    detect_upload_type,
    get_sample_rows,
    get_sqlite_table_names,
    get_sqlite_schema,
)

@pytest.fixture
def temp_metadata_db(tmp_path, monkeypatch):

    db_path = tmp_path / "metadata.db"
    # we are effectively changing db_helpers.db_metadata.METADATA_DB = db_path (temporary path)

    monkeypatch.setattr(meta, "METADATA_DB", db_path)
    # Create the mock metadata database if it doesn't exist and connect to it. 
    conn = meta.connect_metadata_db()
    conn.close()

    # Everything before yield is setup. The value after yield is what the tests recieve. 
    yield db_path

    # Clean up the temporary database after the test is done. 
    if db_path.exists():
        db_path.unlink()

def test_save_metadata(temp_metadata_db):
    '''
    test_save_metadata is a function for testing that the metadata can be correctly saved into the temporary metadata database
    using the save_metadata function.

    temp_metadata_db: will be the db_path value. The path to the temporary metadata database.
    '''

    sample_database = Path(__file__).parent / "test_data" / "rideshare.db"

    upload_type = detect_upload_type(sample_database.name)

    # Note: we are not saving the raw file, we are just getting the table names and schema.
    # This is focused on metadata testing. 
    dataset_id = str(uuid.uuid4())
    table_names = get_sqlite_table_names(sample_database)
    schema = get_sqlite_schema(sample_database)

    if upload_type == "db":
        new_dataset = Dataset(
            dataset_id=dataset_id,
            upload_type=upload_type,
            raw_byte_size=sample_database.stat().st_size,
            dataset_path=str(sample_database),
            tables=table_names,
            schema=schema,
        )

    meta.save_metadata(new_dataset)
    loaded_dataset = meta.get_dataset_by_id(dataset_id)

    # Asserting for SQL Lite saved dataset.
    assert loaded_dataset.dataset_id == dataset_id
    assert loaded_dataset.upload_type == upload_type
    assert loaded_dataset.raw_byte_size == sample_database.stat().st_size
    assert loaded_dataset.dataset_path == str(sample_database)

    # Lock in the exact rideshare.db schema. 
    assert loaded_dataset.tables == ['cancellations', 'drivers', 'locations', 'payments', 'reviews', 'riders', 'trips', 'users']
    assert loaded_dataset.schema == schema

def test_get_sample_rows_sql():
    sample_database = Path(__file__).parent / "test_data" / "rideshare.db"
    table_names = get_sqlite_table_names(sample_database)
    schema = get_sqlite_schema(sample_database)
    dataset_id = str(uuid.uuid4())

    new_dataset = Dataset(
        dataset_id=dataset_id,
        upload_type="db",
        raw_byte_size=sample_database.stat().st_size,
        dataset_path=str(sample_database),
        tables=table_names,
        schema=schema,
    )

    rows = get_sample_rows(new_dataset, 2, table_names[0])

    # Assert that the number of rows is 2.
    assert len(rows) == 2
    # Asset that we retrieved a dictionary of the rows.
    assert isinstance(rows[0], dict)
    # Assert that the returned rows are a list of dictionaries.
    assert isinstance(rows, list)
    # Assert that the first returned item is the first row of the table.

    print("\n\nRows:")
    print(rows)

    

if __name__ == "__main__":
    test_get_sample_rows_sql()

# python3 -m tests.test_db


# Running pytest
# --import-mode=importlib is used to treat db_helpers as a top level module from the backend directory.
# env/bin/python -m pytest is to use the correct python
# env/bin/python -m pytest --import-mode=importlib tests/test_db.py -s -q
