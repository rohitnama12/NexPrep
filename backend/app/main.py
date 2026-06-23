from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from app.core.security import limiter, _rate_limit_exceeded_handler
from app.core.config import get_settings
from app.api.routers import system, tutor, arena, mcq, history, profile, tracker, analytics
from app.utils.massive_loader import run_massive_import
from app.utils.tracker_loader import run_tracker_import
import threading

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Setup Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
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

@app.on_event("startup")
async def startup_event():
    try:
        # Run massive arena seeder and stable embedded Tracker seeder
        threading.Thread(target=run_massive_import, daemon=True).start()
        threading.Thread(target=run_tracker_import, daemon=True).start()
    except Exception as e:
        print(f"Failed to start seeders: {e}")
