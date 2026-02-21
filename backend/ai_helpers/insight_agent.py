import duckdb
import os
from db_helpers.db_services import get_dataset_by_id

class InsightAgent:
    def __init__(self, dataset_id: str):
        self.dataset_id = dataset_id


if __name__ == "__main__":
    print(get_dataset_by_id("123"))

# python3 -m ai_helpers.insight_agent