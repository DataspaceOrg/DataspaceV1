from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db_helpers import db_storage

app = FastAPI()

app.include_router(db_storage.router)



# uvicorn main:app --reload