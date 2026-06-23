import os
from dotenv import load_dotenv
load_dotenv("/Users/rohitnama/Desktop/Gen_AI_projects/learning/backend/.env")
from supabase import create_client, Client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
# Provide auth headers if needed, but we bypass auth by using the service key or anon key to query
supabase: Client = create_client(url, key)

try:
    user_id = "test-user-id" # Dummy ID, we just want to see if the syntax works
    
    solved_result = supabase.table("solved_challenges").select("id", count="exact").eq("user_id", user_id).eq("passed", True).execute()
    total_solved = solved_result.count if solved_result.count else 0
    
    all_attempts_result = supabase.table("solved_challenges").select("id", count="exact").eq("user_id", user_id).execute()
    total_attempts = all_attempts_result.count if all_attempts_result.count else 0
    
    problem_accuracy = 0
    if total_attempts > 0:
        problem_accuracy = round((total_solved / total_attempts) * 100)
    
    print({
        "total_solved": total_solved,
        "total_attempts": total_attempts,
        "problem_accuracy": problem_accuracy
    })
    
except Exception as e:
    print("Error:", e)
