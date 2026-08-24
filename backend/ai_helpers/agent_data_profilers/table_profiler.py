import duckdb
from ai_helpers.agent_data_profilers.profiler_models import ColumnProfile
from db_helpers.db_constants import Dataset
from db_helpers.db_metadata import get_dataset_by_id

## table_profiler

## row counts
## null counts
## distinct counts
## top categorical values
## numeric min/max/mean/std

# Table profiler is a class that is used to get basic statistics about the data inside of a table.

def quote_name(name: str) -> str:
    """
    Safely quote SQL identifiers like table or column names.
    This prevents column names like "order date" from breaking SQL,
    and avoids unsafe raw interpolation for identifiers.
    """
    return '"' + name.replace('"', '""') + '"'

class TableProfiler:
    def __init__(self, dataset: Dataset, dataset_path):
        
        #dataset metadata object
        self.dataset_metadata = dataset
        self.conn = self.connect_db_instance()
        self.attach_sqlite(self.conn, dataset_path)

    def connect_db_instance(self) -> duckdb.DuckDBPyConnection:
        '''
        connect_db_instance is a function that connects to the database and returns a connection.
        '''
        return duckdb.connect()

    def attach_sqlite(self, conn: duckdb.DuckDBPyConnection, dataset_path: str) -> None:
        '''
        Attach the SQLite database for DuckDB to properly query the db
        '''
        if self.dataset_metadata.upload_type in {"db", "sqlite"}:
            conn.execute(f"ATTACH DATABASE '{dataset_path}' AS sqlite_db (TYPE sqlite)")


    def get_table_instance(self, table_name: str) -> tuple:
        """
        return the SQL reference that DUCKDB should query to build information on the given table.
        CSV Files will be read as parquet files.
        SQLite files will be attached as sqlite.db

        Args:
            dataset: Dataset - The dataset metadata.
            table_name: str - The name of the table being profiled. 
        Returns:      
        """

        if self.dataset_metadata.upload_type == "csv":
            return "read_parquet(?)", [self.dataset_metadata.dataset_path]

        if self.dataset_metadata.upload_type in {"db", "sqlite"}:
            return f"sqlite_db.{quote_name(table_name)}", []

        raise ValueError(f"Unsupported upload type: {self.dataset_metadata.upload_type}")

    def table_base_column_stats(self,table_sql: str, params: list, column_name: str) -> dict:
        '''
        Runs a query to compute general statistics on a specific column (Useful for all column types (BOOL, INTEGER, FLOAT))
        This function is used to get
        null_count: Amount of null values in a column.
        null_percentage: Percentage of null values in a column.

        COUNT(*) counts all rows
        COUNT(column) counts only non-null values
        The difference gives null_count.
        COUNT(DISTINCT column) shows how many unique values exist.
        '''

        column = quote_name(column_name)
        row = self.conn.execute(f"""
        SELECT COUNT(*) AS row_count, 
        COUNT({column}) AS non_null_count, 
        COUNT(*) - COUNT({column}) AS null_count,
        COUNT(DISTINCT {column}) AS distinct_count
        FROM {table_sql}
        """, params).fetchone()

        return {
            "row_count": row[0],
            "non_null_count": row[1],
            "null_count": row[2],
            "distinct_count": row[3]
        }

    def table_top_categorical_values():
        pass

    def generate_table_profiler_sql(self, table: str, column: str):
        '''
        generates the profile of a table for an SQL file inserted into the system. 
        Returns: A table_profile object containing information about the specific table. 
        '''
        table_sql_connection, params = self.get_table_instance("cancellations")
        column_stats = self.table_base_column_stats(table_sql_connection, params, "cancel_id")
        
        return ColumnProfile(
            row_count=column_stats["row_count"],
            non_null_count=column_stats["non_null_count"],
            null_count=column_stats["null_count"],
            distinct_count=column_stats["distinct_count"],
        )

    def generate_table_profiler_csv(self, table: str):
        pass


if __name__ == "__main__":
    # Test Dataset

    # DB
    dataset_metadata = get_dataset_by_id("0cf7ac22-d4cb-4c9c-8600-3d8813784ac5", "5a025d5d-7fe4-4f5e-b9f5-2aa2a42871b1")
    # CSV
    # dataset_metadata = get_dataset_by_id("bffc71df-31ee-401e-9277-776c941115b3", "5a025d5d-7fe4-4f5e-b9f5-2aa2a42871b1")

    table_profiler = TableProfiler(dataset_metadata, dataset_metadata.dataset_path)
    a = table_profiler.generate_table_profiler_sql('table', 'column')
    breakpoint()

# python3 -m ai_helpers.agent_data_profilers.table_profiler