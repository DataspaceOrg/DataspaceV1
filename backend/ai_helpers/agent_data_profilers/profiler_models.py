from pydantic import BaseModel

class ColumnProfile(BaseModel):
    row_count: int
    non_null_count: int
    null_count: int
    distinct_count: int