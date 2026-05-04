from fastapi import APIRouter, Query
from ai_helpers.insight_agent import InsightAgent
from ai_helpers.ai_constants import InsightRequest
from db_helpers.db_constants import AgentSession, AgentQuery
from db_helpers.db_agent_session import restore_table_session
from db_helpers.db_agent_queries import agent_query_history
router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/")
def read_root():
    '''
    Read root is a service that allows for the frontend to get the root of the AI API.
    '''
    return {"message": "Welcome to the AI API"}

# get_insight is a synchronous function as the insight is needed before being able to chain next steps.
@router.post("/dataset/{dataset_id}/insight")
def get_insight(dataset_id: str, body: InsightRequest) -> dict:
    '''
    Get insight is a service that allows for the frontend to get an immediate insight of the data.
    '''

    insight_agent = InsightAgent(dataset_id)
    insight_response = insight_agent.run_full_agent(
        table_name=body.table_name,
        dataset_context=body.dataset_context,
    )

    # insight_response is a dictionary with the format of the frontend InsightResponse type. {"message": "Insight agent run successfully", "session": AgentSession, "query": AgentQuery}
    return insight_response

@router.get("/dataset/{dataset_id}/session")
def retrieve_table_session(dataset_id: str, table_name: str) -> dict:
    '''
    retrieve_table_session: Retrieves the latest agent session for a table. It will return all of the agent queries that are for a session.
    '''

    # Returns an AgentSession object if it exists, otherwise None. 
    session = restore_table_session(dataset_id, table_name)

    # No sessions exist, so creating a new one is necessary.
    if session is None:
        return {"exists": False, "session": None, "queries": []}

    queries = agent_query_history(session.session_id)

    # Return a json object with the session and the queries. 
    # Return format {exists: bool, session: AgentSession, queries: list[AgentQuery]}
    return {"exists": True, "session": session, "queries": queries}

# Do I want to retrieve the latest session?
# Have a system that holds the information for 1 session. 