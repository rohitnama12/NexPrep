import httpx
import time
from typing import List

_cached_free_models = []
_cache_expiry = 0

OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models"

async def get_dynamic_free_models() -> List[str]:
    global _cached_free_models, _cache_expiry
    
    current_time = time.time()
    if _cached_free_models and current_time < _cache_expiry:
        return _cached_free_models

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(OPENROUTER_MODELS_URL, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            free_models = []
            for model in data.get("data", []):
                pricing = model.get("pricing", {})
                prompt_price = pricing.get("prompt", "1")
                completion_price = pricing.get("completion", "1")
                
                # Check if pricing is exactly "0" or 0 for both prompt and completion
                # Sometimes APIs return floats, so we handle both strings and floats
                def is_free(val) -> bool:
                    if isinstance(val, str):
                        return val == "0" or val == "0.0"
                    elif isinstance(val, (int, float)):
                        return val == 0
                    return False
                
                if is_free(prompt_price) and is_free(completion_price):
                    free_models.append(model["id"])
                    
            # Sorting logic: deprioritize 'qwen' and 'llama'
            def sort_key(model_id: str):
                mid = model_id.lower()
                # Returns 1 if deprioritized, 0 otherwise. Thus deprioritized go to the end.
                if "qwen" in mid or "llama" in mid:
                    return 1
                return 0
                
            free_models.sort(key=sort_key)
            
            if free_models:
                # Cache for 1 hour (3600 seconds)
                _cached_free_models = free_models
                _cache_expiry = current_time + 3600
            
            return _cached_free_models if _cached_free_models else [
                "mistralai/mistral-7b-instruct:free",
                "google/gemma-7b-it:free"
            ]
    except Exception as e:
        print(f"Failed to fetch dynamic models from OpenRouter: {e}")
        # Return previously cached if available, else static defaults
        if _cached_free_models:
            return _cached_free_models
        return [
            "mistralai/mistral-7b-instruct:free",
            "google/gemma-7b-it:free",
            "meta-llama/llama-3-8b-instruct:free"
        ]
