## March 5, 2026

Worked on building the backend for the project by initializing the first AI Agent to run. Need to build Insight tool to get quick overview of the data

## March 14, 2026

1. Working on building the AI Agent to run quick overview of the data.
2. Built immediate working test for getting sample rows from the dataset via the functions get_sample_rows and get_dataset_by_id.
3. Changed the table schema in constants to be a list of table names, changed data_directory to dataset_path in metadata table. 

## March 18, 2026

1. Working on building the AI agent overview.

## March 22, 2026 

1. Continuing to work on building AI Agent overiview for CSV files. Finishing up initial insight agent. Possibly changing up the system prompt
2. Working on adding functionality to the frontend and use API to call the insight agent.
3. Building tests for both the insight agent using CSV and SQLite files. 

## March 23, 2026 
1. Working on implementing the insight agent for SQLite files.

## March 27, 2026
- Working on testing dataspace to ensure that the data outputs are as expected. 
- Built test files for SQL Dataset model and SQL retrieving rows from db for Insight agent.
- Built Initial AJAX fetch requests in the frontend for both Dashboard and Individual Dataset pages.

## March 30, 2026
- Working on the dataset page to query the insight agent and display the results. 
- Need to also add a name to the dataset. 

## April 1, 2026
- Make some frontend fixes and work on css/html clarity.
- Added the calling of the insight_agent. Added a queryInsightAgent api function which calls the endpoint in the backend.
- Added a struct obejct representing the response from the insight agent. 
- Note: When this is returned, python returns it as a dictionary, but over the rest framework it is converted and sent as a JSON object.
