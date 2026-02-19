from pydantic import BaseModel
from typing import Literal, Optional

# UploadType is a literal type that represents the type of file that is being uploaded. (must be one of the following)
UploadType = Literal["csv", "json", "jsonl", "sqlite", "sql_dump", "unknown"]

class Dataset(BaseModel):
    '''
    Dataset is a model that represents the metadata of a dataset that gets uploaded to the database. 
    '''
    dataset_id: str 
    upload_type: UploadType 
    raw_byte_size: int
    tables: dict[str, str]
    schema: dict 