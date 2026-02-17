from fastapi import FastAPI, APIRouter
from fastapi import UploadFile, File


router = APIRouter(prefix="/db", tags=["db"])

@router.get("/")
def read_root():
    # Return a JSON response to the frontend
    return {"message": "Welcome to the DB Helper API"}

@router.post("/upload_db")
def upload_db(file: UploadFile = File(...)):
    # Return a JSON response to the frontend
    print(UploadFile)
    return {"message": "File uploaded successfully"}