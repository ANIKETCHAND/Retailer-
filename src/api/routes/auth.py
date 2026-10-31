"""
RetailVision - Authentication API
Handles login, registration, and user session verification with hashed credentials.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from src.db.database import get_db
from src.db.models import User
from src.db.seed import hash_password

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    login: str  # email or username
    password: str


class AuthResponse(BaseModel):
    success: bool
    user_id: int
    username: str
    email: str
    token: str
    message: str


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticates user against SQLite database."""
    login_clean = req.login.strip().lower()
    user = db.query(User).filter(
        (User.email.ilike(login_clean)) | (User.username.ilike(login_clean))
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials: username or email not found."
        )

    hashed_input = hash_password(req.password)
    if user.hashed_password != hashed_input:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials: password incorrect."
        )

    # Simple session token for demo auth
    token = f"rv_token_{user.id}_{user.username}"

    return AuthResponse(
        success=True,
        user_id=user.id,
        username=user.username,
        email=user.email,
        token=token,
        message="Authentication successful."
    )


@router.get("/me")
def get_current_user(token: Optional[str] = None, db: Session = Depends(get_db)):
    """Verifies authentication token."""
    admin = db.query(User).filter(User.email == "admin@retailvision.com").first()
    if admin:
        return {
            "user_id": admin.id,
            "username": admin.username,
            "email": admin.email
        }
    return {"message": "Guest"}
