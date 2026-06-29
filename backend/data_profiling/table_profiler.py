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
        
        #dataset metadata object
        self.dataset_metadata = dataset

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

    def table_distribution_column_stats(self, conn: duckdb.DuckDBPyConnection, table_sql: str, params: list, column_name: str) -> dict:
        """
        Computes numeric distribution statistics for a specified column on Numeric columns (INTEGER, FLOAT, DOUBLE)
        MIN/MAX, AVG, STD, MEDIAN, QUARTILES, SKEW, OUTLIER_COUNT. 
        """

        numeric_types = ["INT", "DOUBLE", "FLOAT", "REAL", "DECIMAL", "NUMERIC"]

        # 1. Fetch the MIN/MAX/AVG STDDEV from the column. 
        column = quote_name(column_name)
        #1. numeric values. removes nulls. contains all non null values for that numeric column.
        #2. quartiles - temporary result containign q1 and 23 quartiles and the IQR
        #3. iqr - interquartile range. (spread of the 50% middle of the data) helps track outliers.
        row = conn.execute(f"""
        WITH numeric_values AS (
            SELECT {column} AS value 
            FROM {table_sql} 
            WHERE {column} IS NOT NULL
        ),
        quartiles as (
            SELECT 
            QUANTILE_CONT(value, 0.25) as q1, 
            QUANTILE_CONT(value, 0.75) as q3
            FROM numeric_values
        )
        SELECT
            COUNT(*) as non_null_count,
            MIN(value) as min_value,
            MAX(value) as max_value, 
            AVG(value) as mean_value,
            STDDEV_SAMP(value) as std_dev,
            MEDIAN(value) as median_value,
            q1,
            q3,
            q3 - q1 AS iqr,
            SKEWNESS(value) as skew,
            SUM(CASE WHEN value = 0 THEN 1 ELSE 0 END) AS zero_count)
            SUM(CASE WHEN value < 0 THEN 1 ELSE 0 END) AS negative_count
            SUM(
                CASE
                    WHEN value < (q1 - 1.5 * (q3 - q1)) OR value > (q3 + 1.5 * (q3 - q1))
                    ELSE 0
                END
            ) as outlier_count
        FROM numeric_values
        CROSS JOIN quartiles
        GROUP BY q1, q3
        """, params).fetchone()

        return {
            "column_name": column_name,
            "column_type": "numeric",
            "non_null_count": row[0],
            "min": row[1],
            "max": row[2],
            "mean": row[3],
            "std_dev": row[4],
            "median": row[5],
            "q1": row[6],
            "q3": row[7],
            "iqr": row[8],
            "skew": row[9],
            "zero_count": row[10],
            "negative_count": row[11],
            "outlier_count": row[12],
        }
    def table_top_categorical_values():
        pass

    def table_profile_create():
        pass

if __name__ == "__main__":
    # Test Dataset

    # DB
    # dataset_metadata = get_dataset_by_id("0cf7ac22-d4cb-4c9c-8600-3d8813784ac5", "5a025d5d-7fe4-4f5e-b9f5-2aa2a42871b1")

    # CSV
    dataset_metadata = get_dataset_by_id("bffc71df-31ee-401e-9277-776c941115b3", "5a025d5d-7fe4-4f5e-b9f5-2aa2a42871b1")

    table_profiler = TableProfiler(dataset_metadata)

    # Connect to the database and attach the SQLite database. If it is an SQLite DB.
    conn = table_profiler.connect_db_instance()
    breakpoint()
    table_profiler.attach_sqlite(conn, dataset_metadata.dataset_path)

    table_sql_connection, params = table_profiler.get_table_instance("cancellations")

    row_count = table_profiler.table_row_count(conn, table_sql_connection)

    table_base_column_stats = table_profiler.table_base_column_stats(conn, table_sql_connection, params, "cancel_id")
    table_distribution_column_stats = table_profiler.table_distribution_column_stats(conn, table_sql_connection, params, "cancel_id")
    breakpoint()

# python3 -m data_profiling.table_profiler




