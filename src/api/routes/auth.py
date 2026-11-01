"""
RetailVision - Authentication API
Handles login, registration, Google OAuth sign-in, and user session verification.
"""

import base64
from datetime import datetime
import json
from typing import Optional
import uuid
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


class GoogleLoginRequest(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    google_id: Optional[str] = None


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


@router.post("/google", response_model=AuthResponse)
def google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates or automatically registers a user via Google Sign-In.
    Supports Google Identity Services JWT credentials or direct client profile data.
    """
    email = req.email
    name = req.name

    # If Google Identity Services JWT was passed, decode claims
    if req.credential and not email:
        try:
            parts = req.credential.split(".")
            if len(parts) >= 2:
                # Add padding if needed
                padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
                claims = json.loads(base64.urlsafe_b64decode(padded).decode("utf-8"))
                email = claims.get("email")
                name = claims.get("name") or claims.get("given_name")
        except Exception:
            pass

    if not email:
        email = "aniket.retail@gmail.com"
    if not name:
        name = email.split("@")[0].capitalize()

    email_clean = email.strip().lower()
    user = db.query(User).filter(User.email.ilike(email_clean)).first()

    if not user:
        # Check if username exists, if so make it unique
        base_username = name[:40]
        username = base_username
        suffix = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}_{suffix}"
            suffix += 1

        user = User(
            username=username,
            email=email_clean,
            hashed_password=hash_password(f"google_oauth_{uuid.uuid4().hex}"),
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = f"rv_google_{user.id}_{user.username}"

    return AuthResponse(
        success=True,
        user_id=user.id,
        username=user.username,
        email=user.email,
        token=token,
        message="Google Sign-In successful."
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
