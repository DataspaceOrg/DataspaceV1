import duckdb
import os
from db_helpers.db_services import get_sample_rows
from db_helpers.db_metadata import get_dataset_by_id
from openai import OpenAI
import logging
import dotenv

# Currently use 
dotenv.load_dotenv()

class InsightAgent:
    def __init__(self, dataset_id: str):
        self.dataset_id = dataset_id
        self.dataset = None
        self.sample_rows = None
        self.system_prompt = None
        self.formatted_sample_rows = None

        # Retrieve the dataset object to use for the agent. 
        self.retrieve_dataset()

    def run_simple_query(self, query: str):
        client = OpenAI()

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "you are saying hello to someone, make a greeting"},
                {"role": "user", "content": query}
            ]
        )
        return response.choices[0].message.content

    def retrieve_dataset(self):
        '''
        Retrieve the metadata of the dataset from the database.
        '''
        # dataset object is returned from this call. 
        dataset = get_dataset_by_id(self.dataset_id)
        self.dataset = dataset
        return dataset

    def retrieve_sample_rows(self, table_name: str):
        '''
        Retrieve the sample rows of the dataset from the database.
        '''

        if table_name is None:
            raise ValueError("No table name provided.")

        if table_name not in self.dataset.tables:
            raise ValueError(f"Table {table_name} not found in the dataset.")

        sample_rows = get_sample_rows(self.dataset, 10, table_name)
        self.sample_rows = sample_rows

        return sample_rows

    def value_for_prompt(self, value) -> str:
        '''
        value_for_prompt is a function that turns each cell into a plain string thats simple to understand and parse.
        eg) dates often use isoformat like 2026-03-22T00:00:00Z, but we want to turn it into a more readable format like March 22, 2026.
        Args:
            value: any - The value to be formatted.
        Returns:
            str - The formatted value.  
        '''
        if hasattr(value, "isoformat"):
            try:
                return value.isoformat()
            except Exception:
                return str(value)
        return str(value)

    def format_sample_rows(self, sample_rows: list[dict]) -> str:
        '''
        format rows is a function that formats the sample rows into a string making it easier for Agents to understand and parse information. Works for both the CSV and SQL Files
        sample_row will be a list of dictionaries. Each dictionary will have the column names as keys and the values as the value for a row of that column.
        Note: Sample rows is currently in the format of [{column_name: value, column_name: value, ...}, {column_name: value, column_name: value, ...}, ...].
        text_block_str should be in the following format:
        Row 1:
          - column1: value1
          - column2: value2
          - column3: value3
        Row 2:
          - column1: value1
          - column2: value2
          - column3: value3
        '''
        if not sample_rows:
            raise ValueError("No sample rows provided.")

        # text_blocks will contain the sample rows in a LLM friendly format.
        text_blocks: list[str] = []

        # Iterate through each row of the sample rows and then add the row to the text_block
        for i, row in enumerate(sample_rows, start=1):
            block = [f"Row {i}:"]
            for column, value in row.items():
                block.append(f"  - {column}: {self.value_for_prompt(value)}")
            text_blocks.append("\n".join(block))
        
        return "\n\n".join(text_blocks)

    def build_system_prompt(self) -> None:
        '''
        build_system_prompt is a function that builds the system prompt for the agent to retrieve the insight of the data
        Args:
            None
        Returns:
            str - The system prompt for the agent.
        '''
        system_prompt = f"""
        System: “You are a data analyst. Given the dataset metadata, schema, and sample rows below, 
        write a short overview: what the dataset is about, what the main columns mean, 
        and 2–3 brief insights from the sample.

        ## Dataset metadata:
        - dataset_id: {self.dataset.dataset_id}
        - upload_type: {self.dataset.upload_type}
        - raw_byte_size: {self.dataset.raw_byte_size}
        - tables: {", ".join(self.dataset.tables)}

        ## Schema:
        {self.dataset.schema}

        ## Sample rows:
        {self.formatted_sample_rows}
        """

        self.system_prompt = system_prompt

    def run_agent(self) -> str:

        client = OpenAI()
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": "Write a short overview of what the dataset is about, what the main columns mean, and 2–3 brief insights from the sample."}
            ]
        )
        return response.choices[0].message.content

    def run_full_agent(self, dataset_id: str, table_name: str) -> str:



        if self.dataset.upload_type == "csv":
            sample_rows = self.retrieve_sample_rows(table_name)
            self.formatted_sample_rows = self.format_sample_rows(sample_rows)
            self.build_system_prompt()
            return self.run_agent()

        # Format sample rows works for both types, currently differentiating in case of errors. 
        elif self.dataset.upload_type == "db":
            sample_rows = self.retrieve_sample_rows(table_name)
            self.formatted_sample_rows = self.format_sample_rows(sample_rows)
            self.build_system_prompt()
            return self.run_agent()

if __name__ == "__main__":

    # response1 = InsightAgent("d2808899-d2ab-405c-82e0-3e34c5517913").run_full_agent("d2808899-d2ab-405c-82e0-3e34c5517913", "ins_feat")
    # print(response1)
    response2 = InsightAgent("56af60ba-ba76-4321-bf83-66454d972ff9").run_full_agent("56af60ba-ba76-4321-bf83-66454d972ff9", "customers")
    print(response2)

    


# python3 -m ai_helpers.insight_agent

# Use Amazon Bedrock for data privacy
