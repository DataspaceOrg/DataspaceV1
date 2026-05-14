## Dataspace Data Analysis.

1. Data Profiling Agent
   → Basic stats, types, distributions. Finds inital correlations that may exist between tables.
count
null_count
null_percent
mean
median
std_dev
min
max
quartiles
skew
outlier_count
zero_count
negative_count

2. Data Quality Agent
   → Missing values, duplicates, outliers, suspicious columns

3. Semantic Understanding Agent
   → What entities, metrics, dates and relationships exist. 

4. Insight Discovery Agent
   → Purpose is to act as an Initial analytical describer given the previous steps. (Rapidly understands the dataset, identifies promising directions, detect suspicious patterns, seed future investigation)

   Should take in table & relationship profiling. Semantic understanding, sample rows, schema, quality findings, metadata and generate high value exploratory explainations. 

eg: 
“This appears to be transactional ecommerce data centered around orders and customers.

Revenue and order_date appear to be the primary analytical dimensions.

Initial profiling suggests:
- strong seasonal behavior,
- customer segmentation opportunities,
- possible missing-value bias in customer_type,
- high variance in revenue distribution.

Likely useful analyses include:
- cohort retention,
- regional segmentation,
- revenue trend analysis,
- repeat customer behavior.”

5. Dataset Memory Agent
   → Store reusable context about the dataset
   eg
   {
  "dataset_type": "ecommerce sales",
  "main_entity": "orders",
  "time_granularity": "daily",
  "primary_metric": "revenue",
  "important_dimensions": [
    "region",
    "customer_type",
    "product_category"
  ],
  "quality_issues": [
    "customer_type missing in 18% of rows"
  ],
  "discovered_patterns": [
    "Revenue spikes on weekends",
    "West region has highest churn"
  ],
  "recommended_analyses": [
    "cohort analysis",
    "retention analysis"
  ]
}


-- NEXT STEPS WILL BE EXPANDED LATER -- 
7. Hypothesis Agent
   → Generate possible explanations worth testing

8. Analysis Planning Agent
   → Choose analyses based on user goal + dataset context

9. Query / Aggregation Agent
   → Generate SQL/pandas/duckDB queries

10. Execution + Validation Layer
   → Run queries, verify outputs, catch bad logic

11. Visualization Agent
   → Pick chart types and chart-ready data

12. Synthesis Agent
   → Explain what was learned in human terms

13. Evidence + Confidence Agent
   → Attach confidence, caveats, and traceability

14. Follow-Up Analyst Agent
   → Suggest next questions or deeper analyses

15. Memory Update Agent
   → Save findings, schema meaning, and known issues

1. Ingestion
2. Table Profiling Service
3. Data Quality Service
4. Semantic Understanding Agent
5. Insight Agent
6. Dataset Memory Builder
7. Analysis Planning Agent
8. Query / Aggregation Agent
9. Execution Layer
10. Visualization Agent
11. Synthesis Agent
12. Follow-Up Agent