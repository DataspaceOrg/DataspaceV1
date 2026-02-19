## 1.1 Implementing Upload File Feature

- We store CSV/JSON Files (tabular) while also writing a Parquet version for large data and analytics. 
- For SQL Data we may just need 
- Use DuckDB to query (and to convert formats)
- Run ML (k-means) using pandas / numpy / scikit-learn loaded from Parquet

## 1.2 Dataspace Efficent Retrieval, AI, Immediate Insights
- On upload for CSV & Tabular JSON, Save raw convert to Parquet having DuckDB convert directory.
- FOr SQL Files, we just run it in DuckDB which uses columnar storage for efficient retrieval.
