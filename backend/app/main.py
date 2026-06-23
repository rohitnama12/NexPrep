from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi.errors import RateLimitExceeded
import asyncio  # Asynchronous handling ke liye

from app.core.security import limiter, _rate_limit_exceeded_handler
from app.core.config import get_settings
from app.api.routers import system, tutor, arena, mcq, history, profile, tracker, analytics
from app.utils.massive_loader import run_massive_import
from app.utils.tracker_loader import run_tracker_import
from app.services.supabase_client import get_supabase_client

settings = get_settings()

# Lifespan Context Manager (Startup aur Shutdown safe handling)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize global singleton pool
    get_supabase_client()
    print("[Lifespan] Global Supabase Connection Pool Active.")
    
    # Run heavy background loaders safely without breaking main event loop
    try:
        # loop = asyncio.get_event_loop()
        # run_in_executor se background threads main pool connectivity ko choke nahi karenge
        # loop.run_in_executor(None, run_massive_import)
        # loop.run_in_executor(None, run_tracker_import)
        print("[Lifespan] Background seeders disabled to prevent pool starvation.")
    except Exception as e:
        print(f"[Lifespan] Failed to start seeders: {e}")
        
    yield
    print("[Lifespan] Application shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan  # Lifespan injection
)

# Setup Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Set up CORS (Explicitly allow Vercel production domain along with wildcard)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://nex-prep-dusky.vercel.app", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup routers
app.include_router(system.router, prefix=f"{settings.API_V1_STR}/system", tags=["system"])
app.include_router(tutor.router, prefix=f"{settings.API_V1_STR}/tutor", tags=["tutor"])
app.include_router(arena.router, prefix=f"{settings.API_V1_STR}/arena", tags=["arena"])
app.include_router(mcq.router, prefix=f"{settings.API_V1_STR}/mcq", tags=["mcq"])
app.include_router(history.router, prefix=f"{settings.API_V1_STR}/history", tags=["history"])
app.include_router(profile.router, prefix=f"{settings.API_V1_STR}/profile", tags=["profile"])
app.include_router(tracker.router, prefix=f"{settings.API_V1_STR}/tracker", tags=["tracker"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}