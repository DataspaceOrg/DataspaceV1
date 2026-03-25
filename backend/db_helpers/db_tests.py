# rm -rf backend/datasets/*
from db_helpers.db_services import get_sample_rows
from db_helpers.db_metadata import list_datasets, get_dataset_by_id

def initalize_test_setup():
    pass

def remove_test_setup():
    pass

# Test getting sample rows from the dataset via csv file. 
def test_get_sample_rows_csv():
    # Example dataset id
    dataset_id = "d2808899-d2ab-405c-82e0-3e34c5517913"
    # Retrieve the dataset from the database.
    dataset = get_dataset_by_id(dataset_id)
    # Get 10 individual sampled rows from the dataset. 
    sample_rows = get_sample_rows(dataset, 2, "creditcard")
    print(sample_rows)

def test_get_sample_rows_sqlite():
    dataset_id = "56af60ba-ba76-4321-bf83-66454d972ff9"
    dataset = get_dataset_by_id(dataset_id)
    print(dataset)

    sample_rows = get_sample_rows(dataset, 2, dataset.tables[0])
    print(sample_rows)

# Test uploading a dataset to the DB and the metadata being saved correctly. 
def test_upload_dataset():
    pass

# Test get all table names from the dataset
def test_get_all_table_names():
    pass

if __name__ == "__main__":
    # test_get_sample_rows_csv()
    test_get_sample_rows_sqlite()

# python3 -m db_helpers.db_tests
