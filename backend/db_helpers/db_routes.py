from fastapi import FastAPI, APIRouter
from fastapi import UploadFile, File
import uuid
from .db_services import detect_upload_type, save_raw_file, save_parquet_file
from .db_constants import DATA_ROOT
from .db_constants import Dataset

router = APIRouter(prefix="/db", tags=["db"])

@router.get("/")
def read_root():
    # Return a JSON response to the frontend
    return {"message": "Welcome to the DB Helper API"}

@router.post("/upload_db")
def upload_db(file: UploadFile = File(...)) -> dict:
    '''
    Upload db is a service that allows for the frontend to send a request object containing the file to be uploaded to the database. 

    Args:
        JSON: dict - A dictionary containing the file to be uploaded to the database.

    Returns:
        dict - A response object (dictionary) containing the message "File uploaded successfully".
    '''

    # If no file is provided, raise an error.
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    # Detect the type of the file.
    upload_type = detect_upload_type(file.filename)

    # Give dataset a unique id, and then its directory, From this current directory, we will create the copy of the file.
    dataset_id = str(uuid.uuid4())


    dataset_dir = DATA_ROOT / dataset_id
    dataset_dir.mkdir(parents=True, exist_ok=True)

    if upload_type == "csv":
        raw_path, raw_size = save_raw_file(dataset_dir, file)
        parquet_path = save_parquet_file(dataset_dir, raw_path)

        new_dataset = Dataset(
            dataset_id=dataset_id,
            upload_type=upload_type,
            raw_byte_size=raw_size,
            tables={"parquet": str(parquet_path)},
            schema={}
        )

        print(new_dataset)

        print(f"Raw file saved to {raw_path} with size {raw_size}")
        print(f"Parquet file saved to {parquet_path}")

    print(upload_type)

    if upload_type == 'db':
        raw_path, raw_size = save_raw_file(dataset_dir, file)
        print(f"Raw file saved to {raw_path} with size {raw_size}")



    return { "message": "File uploaded successfully"}