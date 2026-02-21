from fastapi import APIRouter

router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/dataset/{dataset_id}/insight")
def get_insight(dataset_id: str):
    '''
    Get insight is a service that allows for the frontend to get an immediate insight of the data.
    '''
    return {"message": "Insight retrieved successfully"}