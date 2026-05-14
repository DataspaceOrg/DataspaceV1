import duckdb
from db_helpers.db_constants import Dataset
from db_helpers.db_metadata import get_dataset_by_id

## table_profiler

## row counts
## null counts
## distinct counts
## top categorical values
## numeric min/max/mean/std
## date min/max

# Table profiler is a class that is used to get basic statistics about the data inside of a table.

def quote_name(name: str) -> str:
    """
    Safely quote SQL identifiers like table or column names.
    This prevents column names like "order date" from breaking SQL,
    and avoids unsafe raw interpolation for identifiers.
    """
    return '"' + name.replace('"', '""') + '"'

class TableProfiler:
    def __init__(self, dataset: Dataset):
        self.dataset = dataset

    def connect_db_instance(self) -> duckdb.DuckDBPyConnection:
        '''
        connect_db_instance is a function that connects to the database and returns a connection.
        '''
        return duckdb.connect()

    def attach_sqlite(self, conn: duckdb.DuckDBPyConnection, dataset_path: str) -> None:
        '''
        Attach the SQLite database for DuckDB to properly query the db
        '''
        if self.dataset.upload_type in {"db", "sqlite"}:
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

        if self.dataset.upload_type == "csv":
            return "read_parquet(?)", [self.dataset.dataset_path]

        if self.dataset.upload_type in {"db", "sqlite"}:
            return f"sqlite_db.{quote_name(table_name)}", []

        raise ValueError(f"Unsupported upload type: {self.dataset.upload_type}")

    def table_row_count(self, conn: duckdb.DuckDBPyConnection, table_sql: str) -> tuple[str, list]:
        '''
        table_row_count is a function that returns the number of rows inside of a table.
        Args:
            conn: duckdb.DuckDBPyConnection - The connection to the database.
            table_sql: str - The SQL reference to the table.
        Returns:
            tuple[str, list] - The SQL reference to the table and the parameters (for Parquet files)
        '''

        col_count = conn.execute(f"SELECT COUNT(*) FROM {table_sql}").fetchone()[0]
        return col_count

    def table_base_column_stats(self, conn: duckdb.DuckDBPyConnection, table_sql: str, params: list, column_name: str) -> dict:
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
        row = conn.execute(f"""
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

    def table_distribution_column_stats():
        pass

    def table_top_categorical_values():
        pass

    def table_profile_create():
        pass







    


if __name__ == "__main__":
    # Test Dataset
    dataset_metadata = get_dataset_by_id("15e5a145-1e06-4041-bcca-98aeac2248fc", "b13d10fe-e952-4105-ac75-51858467207c")
    table_profiler = TableProfiler(dataset_metadata)

    # Connect to the database and attach the SQLite database. If it is an SQLite DB.
    conn = table_profiler.connect_db_instance()
    table_profiler.attach_sqlite(conn, dataset_metadata.dataset_path)

    table_sql_connection, params = table_profiler.get_table_instance("cancellations")

    row_count = table_profiler.table_row_count(conn, table_sql_connection)

    table_base_column_stats = table_profiler.table_base_column_stats(conn, table_sql_connection, params, "cancel_id")
    breakpoint()

# python3 -m data_profiling.table_profiler




