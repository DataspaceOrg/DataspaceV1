## 1.1 Implementing Upload File Feature

- We store CSV/JSON Files (tabular) while also writing a Parquet version for large data and analytics. 
- For SQL Data we may just need 
- Use DuckDB to query (and to convert formats)
- Run ML (k-means) using pandas / numpy / scikit-learn loaded from Parquet

## 1.2 Dataspace Efficent Retrieval, AI, Immediate Insights
- On upload for CSV & Tabular JSON, Save raw convert to Parquet having DuckDB convert directory.
- For SQL Files, we just run it in DuckDB which uses columnar storage for efficient retrieval.


To do list AI feature:
1. Agent 1: Connect OpenAI API, create an agent (Give it the metadata and a small portion of the dataset) Get immediate insights, ideas about the data, what it might be about. 

2. Agent 2: Use another agent which takes the aggregations and the queries, uses rows and context from earlier to answer the queries about the data. (Let user know about the results of the queries and findings)

3. Agent 3: Use a new agent that sees this context, suggests Data visualizations that can help describe the data.

4. Agent 4: Use another agent that takes the insights and the queries, and uses the rows and context from earlier to answer the queries about the data. (Let user know about the results of the queries and findings, help summarize the data.)

5. Agent 5: Another agent that also looks at the recommendations, gives suggestions on how to improve the data. 

ai/ endpoints

POST ai/datasets/{dataset_id}/insight -> Goes to first agent, retrives metadata and information, creates an immediate insight of the data.
POST ai/datasets/{dataset_id}/suggest_queries -> Goes to second agent, takes the summary and the queries. 
POST ai/datasets/{dataset_id}/visualize -> Goes to third agent, takes the context and the visualizations.
POST ai/datasets/{dataset_id}/summary -> Goes to fourth agent, takes the summary and all of its findings via the other agents.
POST ai/datasets/{dataset_id}/recommendations -> Goes to fifth agent, gives suggestions on how to improve the data, how you can continue to get more insights from the data.