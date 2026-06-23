from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Interview Platform"
    API_V1_STR: str = "/api/v1"
    
    # OpenRouter (used for dynamic free model fallbacks)
    OPENROUTER_API_KEY: str = ""
    
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # Groq (Primary cloud LLM — fast inference)
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    # Grok / xAI (Optional secondary — if user has a key)
    GROK_API_KEY: Optional[str] = None
    GROK_MODEL: str = "grok-beta"
    
    # Local Model (Future — Ollama / LM Studio with Apple MPS)
    USE_LOCAL_MODEL: bool = False
    LOCAL_BASE_URL: str = "http://localhost:11434/v1"
    LOCAL_MODEL_NAME: str = "llama3"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
