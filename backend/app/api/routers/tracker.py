from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPAuthorizationCredentials
from typing import Optional
from app.models.schemas import ProgressToggleRequest
from app.core.security import get_current_user, security
from app.services.supabase_client import get_supabase_client
from app.services.db_client import get_auth_supabase
import logging
import time

router = APIRouter()
logger = logging.getLogger(__name__)

# --- IN-MEMORY CACHE FOR STATIC DSA SHEETS ---
_STATIC_DATA_CACHE = {
    "all_problems": None,
    "metadata": None,
    "last_fetched": 0
}
CACHE_TTL = 3600  # Cache for 1 hour

async def _get_all_problems():
    current_time = time.time()
    if _STATIC_DATA_CACHE["all_problems"] is not None and (current_time - _STATIC_DATA_CACHE["last_fetched"]) < CACHE_TTL:
        return _STATIC_DATA_CACHE["all_problems"]
        
    supabase = get_supabase_client()
    query = supabase.table("dsa_sheets").select("*").order("topic").order("difficulty").order("id")
    # Always filter out NULL topic and difficulty values
    query = query.filter("topic", "not.is", "null").filter("difficulty", "not.is", "null")

    all_data = []
    chunk_size = 1000
    start = 0
    while True:
        chunk_response = query.range(start, start + chunk_size - 1).execute()
        chunk_data = chunk_response.data
        all_data.extend(chunk_data)
        if len(chunk_data) < chunk_size:
            break
        start += chunk_size
        
    _STATIC_DATA_CACHE["all_problems"] = all_data
    _STATIC_DATA_CACHE["last_fetched"] = current_time
    
    # Also clear metadata cache so it gets rebuilt from the fresh data
    _STATIC_DATA_CACHE["metadata"] = None
    return all_data



@router.get("/problems")
async def get_tracker_problems(
    playlist: Optional[str] = Query(default="all", description="Filter by sheet slug"),
    topic: Optional[str] = Query(default=None, description="Filter by topic"),
    difficulty: Optional[str] = Query(default=None, description="Filter by difficulty"),
    user: dict = Depends(get_current_user),
):
    """
    Returns DSA sheet problems from `dsa_sheets` with optional filters.
    Public read — uses the service-role Supabase client (no RLS restriction needed for reads).
    """
    try:
        all_problems = await _get_all_problems()
        
        filtered_data = []
        for prob in all_problems:
            # 1. Topic filter
            if topic and topic not in ("all", "undefined", "null", ""):
                if prob.get("topic") != topic:
                    continue
                    
            # 2. Difficulty filter
            if difficulty and difficulty not in ("all", "undefined", "null", ""):
                if prob.get("difficulty") != difficulty:
                    continue
                    
            # 3. Playlist filter
            if playlist and playlist not in ("all", "undefined", "null", ""):
                playlists = prob.get("playlists", [])
                if isinstance(playlists, str):
                    import json
                    try:
                        playlists = json.loads(playlists)
                    except Exception:
                        playlists = []
                if playlist not in playlists:
                    continue
                    
            filtered_data.append(prob)

        return {"status": "success", "count": len(filtered_data), "data": filtered_data}

    except Exception as e:
        logger.error(f"[Tracker] Failed to fetch problems: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tracker problems")


@router.post("/progress")
async def toggle_progress(
    body: ProgressToggleRequest,
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Upserts a row in `user_dsa_progress` for the authenticated user.
    Uses the user's JWT so that RLS (auth.uid() = user_id) is enforced.
    """
    try:
        token = credentials.credentials
        supabase = get_auth_supabase(token)

        # Extract user_id via strict attribute lookup
        user_id = user.id if hasattr(user, "id") else getattr(user, "sub", None)
        if not user_id:
            raise HTTPException(status_code=401, detail="Cannot resolve user identity from token")

        payload = {
            "user_id": user_id,
            "question_id": body.question_id,
            "is_completed": body.is_completed,
        }

        # Upsert on (user_id, question_id) composite key
        response = (
            supabase.table("user_dsa_progress")
            .upsert(payload, on_conflict="user_id,question_id")
            .execute()
        )
        return {"status": "success", "data": response.data}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Tracker] Failed to toggle progress: {e}")
        raise HTTPException(status_code=500, detail="Failed to update progress")


@router.get("/progress")
async def get_user_progress(
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Returns all progress rows for the authenticated user so the frontend
    can mark questions as completed on initial load.
    """
    try:
        token = credentials.credentials
        supabase = get_auth_supabase(token)

        response = (
            supabase.table("user_dsa_progress")
            .select("question_id, is_completed")
            .execute()
        )
        # Return as a set-friendly dict: { question_id: is_completed }
        progress_map = {row["question_id"]: row["is_completed"] for row in response.data}
        return {"status": "success", "data": progress_map}

    except Exception as e:
        logger.error(f"[Tracker] Failed to fetch user progress: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch progress")


@router.get("/metadata")
async def get_tracker_metadata(user: dict = Depends(get_current_user)):
    """
    Returns unique topics, difficulties, and dynamic playlist counts from the `dsa_sheets` table.
    """
    try:
        if _STATIC_DATA_CACHE["metadata"] is not None:
            return _STATIC_DATA_CACHE["metadata"]
            
        all_data = await _get_all_problems()

        topics = sorted(list(set(row["topic"] for row in all_data if row.get("topic"))))
        difficulties = sorted(list(set(row["difficulty"] for row in all_data if row.get("difficulty"))))

        # Dynamically count questions per playlist
        playlists_list = ["blind_75", "striver_a2z", "top_150", "all_leetcode"]
        playlist_counts = {pl: 0 for pl in playlists_list}
        playlist_counts["all"] = 0

        for row in all_data:
            playlist_counts["all"] += 1
            row_playlists = row.get("playlists")
            if row_playlists:
                if isinstance(row_playlists, str):
                    import json
                    try:
                        row_playlists = json.loads(row_playlists)
                    except Exception:
                        pass
                if isinstance(row_playlists, list):
                    for pl in row_playlists:
                        if pl in playlist_counts:
                            playlist_counts[pl] += 1
                        else:
                            playlist_counts[pl] = 1

        metadata = {
            "status": "success",
            "topics": topics,
            "difficulties": difficulties,
            "playlist_counts": playlist_counts
        }
        _STATIC_DATA_CACHE["metadata"] = metadata
        return metadata
    except Exception as e:
        logger.error(f"[Tracker] Failed to fetch metadata: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tracker metadata")
