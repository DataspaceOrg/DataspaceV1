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

## April 2, 2026
- Working on fixing the agent for .db files.
- Idea for the next agent aggregation testing, we can have markdown formatting returned to the user but JSON tables for the next model to take in.

## April 29, 2026
- Its been a while. Been busy with school finishing up. 
- Need to add a dataset name to the backend model. 
- Need to add a saving feature for each step to the backend.
- Fixed frontend issues for outputting in a dataset. 

- Idea: Creating a seperate table for agent workflow session, and workflow results. 
- Keep database as SQL as we have many workflow sessions and many steps with timesteps and entries. 
- agent_session table: session_id, dataset_id, table_name, current_step, status, created_at, updated_at
- agent_queries table: step_id, session_id, step_number, prompt_input, response_output, created_at 

## May 2,2026
- Creating the agent_session table and the agent_queries table. 
- Built functions to create, update, and get agent sessions.

## May 3, 2026
- TODO: Fix the temporary prompt input. Add an input that gives extra information to the agent.
- TODO: Create session handlers to restore information.
- TODO: Add the information login for a user.
- TODO: Start working on the aggregation agent. 

- Finished adding a temporary prompt input which gives additional information to the agent.
- Working on restoring information from the agent sessions. 

Steps: When opening the dataset page. A selected table is set. Our frontend will ask the backend 
if there is an existing agent session. If it does then it loads the existing session information and populates the UI with the information.

- TODO FIX: Have the data from retrieving an AgentSession and AgentQuery be reflected in the frontend.
- TODO FIX: Have the data from creating a new agent session and new agent query use the AgentSession and AgentQuery types for returning information back to the frontend while also storing to the database. 

## May 5, 2026
- Work on building an initial login page
- Integrate login page with a user identification system in the backend. 
- Performing db moficiations to dataset metadata. (Migrations)

## May 6, 2026
- Built backend user authentification system.
- Working on frontend user authentification system.

## May 11, 2026
- TODO: Work on adding migrations to the database for the dataset metadata and agent_sessions tables.
- Creating an initial Dataspace dashboard page.

- Finished initial login and signup using local storage for user information. (Change later on)

## May 12, 2026
- Work on adding the initial hero page for the website.
- Need improvements on the pipeline system. Add core information (Data Profiling)

Notes: Possibly changing the pipeline system
1. Upload and Parse the data (get the metadata, find sample rows and sessions)
2. Data Profiling: (Get basic statistics about the data)
3. Insight Agent: (Use the data profiling, sample rows, metadata to get an initial insight of the data)
4. Analysis Planning: Agent (use the output from the insight agent to plan the analysis that needs to be done. Classifies the task)
5. Aggregation agent: (Use the output from the insight agent and the analysis planner to build queries that need to be executed.)
6. Execution layer: (Execute the queries and scripts. Return the results to the user.)
7. Synthesis Agent: (Consumes insight, analysis plan, query results, chart specs, profile stats, user context). Produces (findings, explainations, caveats, recommended follow ups) Checks how well it aligned with business goals.
8. Follow up agent: Handles user questions after the first analysis has been completed. 

```
Data Profiling: (Get basic statistics about the data)
  -> What are some initial stats for the data?

Insight Agent
  -> "What is this dataset?"
Analysis Planning Agent
  -> "What should we analyze?"
Aggregation / Query Agent
  -> "How do we compute it?"
Visualization Builder Agent
  -> "How should we show it?"
Execution Layer
  -> "Run the queries / validate chart data"
Synthesis Agent
  -> "What did we learn?"
Follow-Up Analyst Agent
  -> "What should we do next based on the user’s question?"
  ```
## May 13, 2026
- Worked on building the data profiling module. 
- Once again refactoring data analysis model. 

## June 28, 2026
- Worked on integrating 