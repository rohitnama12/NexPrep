from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.supabase_client import get_supabase_client

import jwt
import time

limiter = Limiter(key_func=get_remote_address)
security = HTTPBearer()

class UserObj:
    def __init__(self, payload: dict):
        self.id = payload.get("sub")
        self.sub = payload.get("sub")
        self.email = payload.get("email")
        self.role = payload.get("role")
        self.user_metadata = payload.get("user_metadata", {})

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    FastAPI dependency to protect routes using Supabase JWTs.
    Validates the Bearer token payload and expiration.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        exp = payload.get("exp")
        if exp and exp < time.time():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user subject",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return UserObj(payload)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
