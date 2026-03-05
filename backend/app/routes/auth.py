"""Authentication routes: register, login, me."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.schemas import RegisterRequest, LoginRequest, AuthResponse, UserOut

logger = logging.getLogger("waterwatchai.auth_routes")
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user (always role='user')."""
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role})
    logger.info(f"User registered: {user.username}")
    return AuthResponse(
        token=token,
        user=UserOut(id=user.id, username=user.username, email=user.email, role=user.role),
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate and return a JWT token."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id, "role": user.role})
    logger.info(f"User logged in: {user.username}")
    return AuthResponse(
        token=token,
        user=UserOut(id=user.id, username=user.username, email=user.email, role=user.role),
    )


@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return UserOut(id=user.id, username=user.username, email=user.email, role=user.role)
