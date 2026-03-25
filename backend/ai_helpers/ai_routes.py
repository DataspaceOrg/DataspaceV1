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
@router.get("/dataset/{dataset_id}/insight")
def get_insight(dataset_id: str, table_name: str):
    '''
    Get insight is a service that allows for the frontend to get an immediate insight of the data.
    '''

    insight_agent = InsightAgent(dataset_id)
    insight_response = insight_agent.run_full_agent(dataset_id, insight_agent.dataset.tables[0])

    return {"message": "Insight retrieved successfully", "insight_response": insight_response}