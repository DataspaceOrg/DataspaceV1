from fastapi import APIRouter
from ai_helpers.insight_agent import InsightAgent

router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/")
def read_root():
    '''
    Read root is a service that allows for the frontend to get the root of the AI API.
    '''
    return {"message": "Welcome to the AI API"}

# get_insight is a synchronous function as the insight is needed before being able to chain next steps.
@router.post("/dataset/{dataset_id}/insight")
def get_insight(dataset_id: str, table_name: str) -> dict[str, str]:
    '''
    Get insight is a service that allows for the frontend to get an immediate insight of the data.
    Note: table_name is a query parameter that is used to see what table the user wants to get an insight of.
    '''

    insight_agent = InsightAgent(dataset_id)
    insight_response = insight_agent.run_full_agent(dataset_id, table_name)

    # Note: When this is returned, python returns it as a dictionary, but over the rest framework it is converted and sent as a JSON object.
    return {"message": "Insight retrieved successfully", "insight_response": insight_response}