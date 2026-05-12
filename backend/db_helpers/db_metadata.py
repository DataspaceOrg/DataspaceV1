import sqlite3
from pathlib import Path
from .db_constants import METADATA_DB, METADATA_TABLE, Dataset
import json


########################################################
# Metadata Database Helper Functions
########################################################
'''
db_metadata.py is a module that contains the functions to interact with the metadata database.
'''

def connect_metadata_db():
    '''
    connect_metadata_db is a function that ensures that the metadata SQLite schema matches the current Dataset model

    - If Not it will create the table.
    - Possibly add a deletion migration deletion. 
    - Function requires fixes.
    '''

    metadata_path = Path(METADATA_DB)
    conn = sqlite3.connect(str(metadata_path))

    conn.execute(f""" CREATE TABLE IF NOT EXISTS {METADATA_TABLE} (dataset_id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL,
    upload_type TEXT, 
    raw_byte_size INTEGER, 
    dataset_path TEXT NOT NULL,
    tables TEXT NOT NULL, 
    schema TEXT NOT NULL)""")

    conn.commit()
    return conn


def save_metadata(dataset: Dataset):
    '''
    save_metadata is a function that saves the metadata of a dataset to the metadata database.
    Args:
        dataset: Dataset - The dataset to save the metadata of.
    '''

    data = dataset.model_dump()
    # get the connection to the metadata database.
    conn = connect_metadata_db()

    try: 
        conn.execute(f"INSERT INTO {METADATA_TABLE} (dataset_id, user_id, upload_type, raw_byte_size, dataset_path, tables, schema) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (data["dataset_id"], data["user_id"], data["upload_type"], data["raw_byte_size"], data["dataset_path"], json.dumps(data["tables"]), json.dumps(data["schema"])))
        conn.commit()

    finally:
        conn.close()

def list_datasets(user_id: str) -> list[Dataset]:
    '''
    list_datasets is a function that lists all the datasets in the metadata database for a given user. 
    Args:
        None
    Returns:
        list[Dataset] - A list of all the datasets in the metadata database for a given user.
    '''
    conn = connect_metadata_db()
    try:
        cursor = conn.execute(f"SELECT * FROM {METADATA_TABLE} WHERE user_id = ?", (user_id,)).fetchall()
    finally:
        conn.close()

    # convert the cursor (query for all the metadata rows) into a list of Dataset objects and then return. 
    return [Dataset(
        dataset_id=row[0],
        user_id=row[1],
        upload_type=row[2],
        raw_byte_size=row[3],
        dataset_path=row[4],
        tables=json.loads(row[5]),
        schema=json.loads(row[6])
    ) for row in cursor]

def get_dataset_by_id(dataset_id: str, user_id: str) -> Dataset:
    '''
    get_dataset_by_id is a function that gets a dataset by its indivual id, from the metadata database for a given user.
    Args: 
        dataset_id: str - The id of the dataset to get.
        user_id: str - The id of the user to get the dataset for.
    returns:
        Dataset - The dataset object with the given id.
    '''
    conn = connect_metadata_db()
    try:
        # Create a tuple of the dataset id, so that it can be used in the query. we need the , at the end to make it a tuple.
        db_tuple = (dataset_id, user_id)
        cursor = conn.execute(f"SELECT * FROM {METADATA_TABLE} WHERE dataset_id = ? AND user_id = ?", db_tuple).fetchone()

        # If the dataset is not found, raise an error.
        if cursor is None:
            raise ValueError(f"Dataset with id {dataset_id} not found.")

    except sqlite3.OperationalError as e:
        raise ValueError(f"Metadata table not initialized: or error retrieving dataset: {e}")

    finally:
        conn.close()

    return Dataset(
        dataset_id=cursor[0],
        user_id=cursor[1],
        upload_type=cursor[2],
        raw_byte_size=cursor[3],
        dataset_path=cursor[4],
        tables=json.loads(cursor[5]),
        schema=json.loads(cursor[6])
    )

# python -m db_helpers.db_metadata

if __name__ == "__main__":
    migrate_metadata_db()



