from supabase import create_client, Client
from app.core.config import get_settings

settings = get_settings()

# Global Singleton Instance 
_supabase_instance: Client = None

def get_supabase_client() -> Client:
    global _supabase_instance
    
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise ValueError("Supabase credentials are not configured")
    
    # Agar client pehle se bana hua hai, toh wahi wapas karo (Connection reuse)
    if _supabase_instance is None:
        _supabase_instance = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        
    return _supabase_instance

def reset_supabase_client():
    global _supabase_instance
    _supabase_instance = None