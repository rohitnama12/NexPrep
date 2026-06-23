from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials
from app.models.schemas import ChallengeHistoryCreate, MCQHistoryCreate
from app.services.db_client import save_coding_challenge, save_mcq_result, get_user_dashboard_stats, get_challenge_history, get_all_challenge_history
from app.core.security import get_current_user, security
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# We use get_current_user to validate the token globally, and we extract credentials to get the raw JWT.
@router.post("/challenge")
async def record_challenge(
    data: ChallengeHistoryCreate, 
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token = credentials.credentials
        result = await save_coding_challenge(token, data)
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Error recording challenge history: {e}")
        raise HTTPException(status_code=500, detail="Failed to save challenge history")

@router.post("/mcq")
async def record_mcq(
    data: MCQHistoryCreate, 
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token = credentials.credentials
        result = await save_mcq_result(token, data)
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Error recording MCQ history: {e}")
        raise HTTPException(status_code=500, detail="Failed to save MCQ history")

@router.get("/dashboard")
async def get_dashboard(
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token = credentials.credentials
        stats = await get_user_dashboard_stats(token)
        return {"status": "success", "data": stats}
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard stats")

@router.get("/challenge/all")
async def get_all_challenge_history_endpoint(
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Returns up to 200 most recent challenge submissions for the authenticated user."""
    try:
        token = credentials.credentials
        history = await get_all_challenge_history(token)
        return {"status": "success", "data": history}
    except Exception as e:
        logger.error(f"Error fetching all challenge history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch challenge history")

@router.get("/challenge/history/{topic}")
async def get_topic_challenge_history(
    topic: str,
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token = credentials.credentials
        history = await get_challenge_history(token, topic)
        return {"status": "success", "data": history}
    except Exception as e:
        logger.error(f"Error fetching challenge history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch challenge history")
