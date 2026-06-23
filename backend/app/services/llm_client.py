from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from app.core.config import get_settings
from app.services.openrouter_utils import get_dynamic_free_models

settings = get_settings()


async def get_llm(temperature: float = 0.7):
    """
    Returns an LLM instance configured with dynamic routing and fallbacks.
    
    Priority:
    1. Route A — Local Model (Ollama/LM Studio): If USE_LOCAL_MODEL is True.
    2. Route B — Cloud:
       a. Primary: Groq API (fast inference, user has a key).
       b. Optional: Grok/xAI (if user provides GROK_API_KEY).
       c. Fallbacks: Dynamically fetched FREE models from OpenRouter.
    """

    # ──────────────────────────────────────────────────
    # Route A: Local Model Execution (Ollama / LM Studio)
    # ──────────────────────────────────────────────────
    if settings.USE_LOCAL_MODEL:
        return ChatOpenAI(
            api_key="ollama",
            base_url=settings.LOCAL_BASE_URL,
            model=settings.LOCAL_MODEL_NAME,
            temperature=temperature,
        )

    # ──────────────────────────────────────────────────
    # Route B: Cloud Architecture
    # ──────────────────────────────────────────────────
    primary_llm = None
    fallback_llms = []

    # B.1  Groq — fast, free-tier inference (primary)
    if settings.GROQ_API_KEY:
        primary_llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model=settings.GROQ_MODEL,
            temperature=temperature,
        )

    # B.2  Grok / xAI — optional secondary
    if settings.GROK_API_KEY:
        grok_llm = ChatOpenAI(
            api_key=settings.GROK_API_KEY,
            base_url="https://api.x.ai/v1",
            model=settings.GROK_MODEL,
            temperature=temperature,
        )
        if primary_llm is None:
            primary_llm = grok_llm
        else:
            fallback_llms.append(grok_llm)

    # B.3  Dynamic OpenRouter free models as fallbacks
    if settings.OPENROUTER_API_KEY:
        dynamic_models = await get_dynamic_free_models()
        for model_id in dynamic_models[:4]:
            fallback_llms.append(
                ChatOpenAI(
                    api_key=settings.OPENROUTER_API_KEY,
                    base_url="https://openrouter.ai/api/v1",
                    model=model_id,
                    temperature=temperature,
                    default_headers={
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "AI Interview Platform",
                    },
                )
            )

    # B.4  Absolute fallback — if no primary was configured at all,
    #      use the first OpenRouter fallback as primary.
    if primary_llm is None:
        if fallback_llms:
            primary_llm = fallback_llms.pop(0)
        else:
            raise ValueError(
                "No LLM API key is configured. "
                "Set at least one of GROQ_API_KEY, GROK_API_KEY, or OPENROUTER_API_KEY in your .env file."
            )

    # Chain fallbacks if available
    if fallback_llms:
        return primary_llm.with_fallbacks(fallback_llms)

    return primary_llm
