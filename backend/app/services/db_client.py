from supabase import create_client, Client, ClientOptions
from app.core.config import get_settings
from app.models.schemas import ChallengeHistoryCreate, MCQHistoryCreate
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

def get_auth_supabase(jwt_token: str) -> Client:
    options = ClientOptions(headers={"Authorization": f"Bearer {jwt_token}"})
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY, options=options)

async def save_coding_challenge(jwt_token: str, data: ChallengeHistoryCreate):
    try:
        supabase = get_auth_supabase(jwt_token)
        response = supabase.table("solved_challenges").insert(data.model_dump()).execute()
        return response.data
    except Exception as e:
        logger.error(f"Error saving coding challenge: {e}")
        raise e

async def save_mcq_result(jwt_token: str, data: MCQHistoryCreate):
    try:
        supabase = get_auth_supabase(jwt_token)
        response = supabase.table("mcq_results").insert(data.model_dump()).execute()
        return response.data
    except Exception as e:
        logger.error(f"Error saving MCQ result: {e}")
        raise e

async def get_user_dashboard_stats(jwt_token: str):
    try:
        supabase = get_auth_supabase(jwt_token)
        
        # Get coding challenges count
        challenges_res = supabase.table("solved_challenges").select("id", count="exact").execute()
        challenges_count = challenges_res.count if challenges_res.count is not None else len(challenges_res.data)
        
        # Get successful challenges count
        passed_res = supabase.table("solved_challenges").select("id", count="exact").eq("passed", True).execute()
        passed_count = passed_res.count if passed_res.count is not None else len(passed_res.data)
        
        # Get MCQ results
        mcq_res = supabase.table("mcq_results").select("score, total_questions").execute()
        
        total_mcqs = len(mcq_res.data)
        total_mcq_score = sum(item["score"] for item in mcq_res.data)
        total_mcq_possible = sum(item["total_questions"] for item in mcq_res.data)
        
        avg_mcq_score_percentage = 0
        if total_mcq_possible > 0:
            avg_mcq_score_percentage = (total_mcq_score / total_mcq_possible) * 100
            
        return {
            "total_challenges": challenges_count,
            "passed_challenges": passed_count,
            "total_mcqs_taken": total_mcqs,
            "avg_mcq_score_percentage": round(avg_mcq_score_percentage, 1)
        }
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        raise e

async def get_challenge_history(jwt_token: str, topic: str):
    try:
        supabase = get_auth_supabase(jwt_token)
        response = (
            supabase.table("solved_challenges")
            .select("id, topic, category, difficulty, passed, code_snippet, created_at")
            .eq("topic", topic)
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        return response.data
    except Exception as e:
        logger.error(f"Error fetching challenge history: {e}")
        raise e


async def get_all_challenge_history(jwt_token: str):
    """Fetch all challenge history for the user (most recent 200), regardless of topic."""
    try:
        supabase = get_auth_supabase(jwt_token)
        response = (
            supabase.table("solved_challenges")
            .select("id, topic, category, difficulty, passed, code_snippet, created_at")
            .order("created_at", desc=True)
            .limit(200)
            .execute()
        )
        return response.data
    except Exception as e:
        logger.error(f"Error fetching all challenge history: {e}")
        raise e


async def get_solved_problem_titles(jwt_token: str):
    """Fetch all distinct topics the user has solved, used for anti-duplication."""
    try:
        supabase = get_auth_supabase(jwt_token)
        response = (
            supabase.table("solved_challenges")
            .select("topic, category, difficulty")
            .order("created_at", desc=True)
            .limit(500)
            .execute()
        )
        return response.data
    except Exception as e:
        logger.error(f"Error fetching solved titles: {e}")
        return []

