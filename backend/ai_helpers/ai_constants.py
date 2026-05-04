from pydantic import BaseModel



class InsightRequest(BaseModel):
    table_name: str
    dataset_context: str | None = None
