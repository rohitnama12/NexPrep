import os
from dotenv import load_dotenv
load_dotenv("/Users/rohitnama/Desktop/Gen_AI_projects/learning/backend/.env")
from supabase import create_client, Client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

try:
    res = supabase.table("solved_challenges").select("id", count="exact").execute()
    print("res", type(res))
    print("res.count", res.count)
except Exception as e:
    print("Error:", e)
