from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from app.core.security import get_current_user, security
from app.services.db_client import get_auth_supabase
from datetime import datetime, timedelta
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def calculate_streaks(dates):
    if not dates:
        return 0, 0
    dates = sorted(list(set(dates)))
    max_streak = 1
    current_streak = 1
    
    # Calculate max streak
    temp_streak = 1
    for i in range(1, len(dates)):
        diff = (datetime.strptime(dates[i], "%Y-%m-%d") - datetime.strptime(dates[i-1], "%Y-%m-%d")).days
        if diff == 1:
            temp_streak += 1
            max_streak = max(max_streak, temp_streak)
        else:
            temp_streak = 1

    # Calculate current streak
    today = datetime.now().strftime("%Y-%m-%d")
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    if dates[-1] not in [today, yesterday]:
        current_streak = 0
    else:
        current_streak = 1
        for i in range(len(dates)-2, -1, -1):
            diff = (datetime.strptime(dates[i+1], "%Y-%m-%d") - datetime.strptime(dates[i], "%Y-%m-%d")).days
            if diff == 1:
                current_streak += 1
            else:
                break
                
    return current_streak, max_streak

@router.get("/overview")
async def get_analytics_overview(
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        supabase = get_auth_supabase(credentials.credentials)
        
        # 1. Total Problems Solved
        solved_result = supabase.table("solved_challenges").select("id", count="exact").eq("user_id", user.id).eq("passed", True).execute()
        total_solved = solved_result.count if solved_result.count else 0
        
        # 2. Total Problems Attempted
        all_attempts_result = supabase.table("solved_challenges").select("id", count="exact").eq("user_id", user.id).execute()
        total_attempts = all_attempts_result.count if all_attempts_result.count else 0
        
        problem_accuracy = 0
        if total_attempts > 0:
            problem_accuracy = round((total_solved / total_attempts) * 100, 1)
            
        # 3. Total MCQs
        mcq_result = supabase.table("mcq_results").select("total_questions").eq("user_id", user.id).execute()
        mcq_participation = sum([row.get("total_questions", 0) for row in mcq_result.data]) if mcq_result.data else 0
        
        # 4. Streak Calculation
        challenges_dates = supabase.table("solved_challenges").select("created_at").eq("user_id", user.id).execute()
        mcq_dates = supabase.table("mcq_results").select("created_at").eq("user_id", user.id).execute()
        
        all_dates = []
        if challenges_dates.data:
            all_dates.extend([row["created_at"][:10] for row in challenges_dates.data])
        if mcq_dates.data:
            all_dates.extend([row["created_at"][:10] for row in mcq_dates.data])
            
        current_streak, max_streak = calculate_streaks(all_dates)
        
        return {
            "total_solved": total_solved,
            "problem_accuracy": problem_accuracy,
            "mcq_participation": mcq_participation,
            "current_streak": current_streak,
            "max_streak": max_streak
        }
    except Exception as e:
        logger.error(f"Analytics overview error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics overview")

@router.get("/dsa-distribution")
async def get_dsa_distribution(
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        supabase = get_auth_supabase(credentials.credentials)
        result = supabase.table("solved_challenges").select("topic").eq("user_id", user.id).eq("passed", True).execute()
        
        distribution = {}
        if result.data:
            for row in result.data:
                topic = row.get("topic", "Unknown")
                distribution[topic] = distribution.get(topic, 0) + 1
            
        chart_data = [{"name": k, "solved": v} for k, v in distribution.items()]
        chart_data.sort(key=lambda x: x["solved"], reverse=True)
        return chart_data
    except Exception as e:
        logger.error(f"DSA distribution error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch DSA distribution")

@router.get("/dsa-difficulty")
async def get_dsa_difficulty(
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        supabase = get_auth_supabase(credentials.credentials)
        result = supabase.table("solved_challenges").select("difficulty").eq("user_id", user.id).eq("passed", True).execute()
        
        counts = {"Easy": 0, "Medium": 0, "Hard": 0}
        if result.data:
            for row in result.data:
                diff = row.get("difficulty", "Easy")
                if diff in counts:
                    counts[diff] += 1
                    
        return counts
    except Exception as e:
        logger.error(f"DSA difficulty error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch DSA difficulty")

@router.get("/mcq-distribution")
async def get_mcq_distribution(
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        supabase = get_auth_supabase(credentials.credentials)
        result = supabase.table("mcq_results").select("difficulty, score, total_questions").eq("user_id", user.id).execute()
        
        distribution = {
            "Easy": {"correct": 0, "total": 0},
            "Medium": {"correct": 0, "total": 0},
            "Hard": {"correct": 0, "total": 0}
        }
        
        if result.data:
            for row in result.data:
                diff = row.get("difficulty", "Medium")
                if diff in distribution:
                    distribution[diff]["correct"] += row.get("score", 0)
                    distribution[diff]["total"] += row.get("total_questions", 0)
                    
        chart_data = [
            {"name": "Easy", "value": distribution["Easy"]["correct"]},
            {"name": "Medium", "value": distribution["Medium"]["correct"]},
            {"name": "Hard", "value": distribution["Hard"]["correct"]},
        ]
        return [c for c in chart_data if c["value"] > 0]
    except Exception as e:
        logger.error(f"MCQ distribution error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch MCQ distribution")

@router.get("/activity-heatmap")
async def get_activity_heatmap(
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        supabase = get_auth_supabase(credentials.credentials)
        
        challenges_dates = supabase.table("solved_challenges").select("created_at").eq("user_id", user.id).execute()
        mcq_dates = supabase.table("mcq_results").select("created_at").eq("user_id", user.id).execute()
        
        date_counts = {}
        if challenges_dates.data:
            for row in challenges_dates.data:
                date = row["created_at"][:10]
                date_counts[date] = date_counts.get(date, 0) + 1
        if mcq_dates.data:
            for row in mcq_dates.data:
                date = row["created_at"][:10]
                date_counts[date] = date_counts.get(date, 0) + 1
                
        # Calculate levels 1-4
        if not date_counts:
            return []
            
        max_count = max(date_counts.values())
        
        def get_level(count, max_c):
            if count == 0: return 0
            if max_c <= 4: return min(count, 4)
            ratio = count / max_c
            if ratio <= 0.25: return 1
            if ratio <= 0.5: return 2
            if ratio <= 0.75: return 3
            return 4

        heatmap_data = []
        for date, count in date_counts.items():
            heatmap_data.append({
                "date": date,
                "count": count,
                "level": get_level(count, max_count)
            })
            
        return sorted(heatmap_data, key=lambda x: x["date"])
    except Exception as e:
        logger.error(f"Activity heatmap error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch activity heatmap")

@router.get("/recent-submissions")
async def get_recent_submissions(
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        supabase = get_auth_supabase(credentials.credentials)
        
        # Fetch the raw rows from solved_challenges for the user, ordered by created_at descending
        result = supabase.table("solved_challenges").select("id, topic, difficulty, passed, category, created_at, code_snippet, problem_payload").eq("user_id", user.id).order("created_at", desc=True).limit(50).execute()
        
        if result.data:
            return result.data
        return []
    except Exception as e:
        logger.error(f"Recent submissions error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch recent submissions")

