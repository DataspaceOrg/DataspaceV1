from fastapi import FastAPI, APIRouter
from fastapi import UploadFile, File


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
    # Return a JSON response to the frontend
    print(JSON)

    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "content_type": file.content_type }