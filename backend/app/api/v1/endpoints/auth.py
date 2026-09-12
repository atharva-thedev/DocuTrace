from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timezone
from loguru import logger

from app.core.database import get_db
from app.core.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    hash_token,
)
from app.models.user import User, RefreshTokenSession
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.schemas.common import ApiResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=ApiResponse[UserResponse], status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user account."""
    result = await db.execute(select(User).where(User.email == user_in.email.lower()))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "member",
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    logger.info(f"User registered: {user.email} (ID: {user.id})")
    return ApiResponse(data=UserResponse.model_validate(user), message="Registration successful")

@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login_user(
    user_in: UserLogin,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate user, set HttpOnly refresh token cookie, and return access token."""
    result = await db.execute(select(User).where(User.email == user_in.email.lower()))
    user = result.scalar_one_or_none()

    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact an administrator.",
        )

    # 1. Create Access Token (15 min)
    access_token = create_access_token(subject=user.id, role=user.role)

    # 2. Create Refresh Token (7 days) and save hash to DB
    raw_refresh, token_hash, expires_at = create_refresh_token(subject=user.id)
    
    session_record = RefreshTokenSession(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        is_revoked=False,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent", "")[:500]
    )
    db.add(session_record)
    await db.commit()

    # 3. Set HttpOnly Cookie
    response.set_cookie(
        key="refresh_token",
        value=raw_refresh,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax" if settings.ENVIRONMENT == "development" else "strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path="/api/v1/auth",
    )

    logger.info(f"User logged in: {user.email}")
    return ApiResponse(
        data=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
        ),
        message="Login successful"
    )

@router.post("/refresh", response_model=ApiResponse[TokenResponse])
async def refresh_access_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using HttpOnly refresh cookie.
    Implements single-flight refresh token rotation and automatic reuse-breach invalidation.
    """
    raw_refresh = request.cookies.get("refresh_token")
    if not raw_refresh:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing from request cookies.",
        )

    incoming_hash = hash_token(raw_refresh)
    result = await db.execute(
        select(RefreshTokenSession).where(RefreshTokenSession.token_hash == incoming_hash)
    )
    session_record = result.scalar_one_or_none()

    if not session_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token.",
        )

    # Breach Detection: if this token was already revoked / rotated and is being reused
    if session_record.is_revoked:
        logger.warning(f"⚠️ Refresh token reuse detected for user {session_record.user_id}! Revoking all sessions.")
        await db.execute(
            update(RefreshTokenSession)
            .where(RefreshTokenSession.user_id == session_record.user_id)
            .values(is_revoked=True)
        )
        await db.commit()
        response.delete_cookie(key="refresh_token", path="/api/v1/auth")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Security breach detected: Revoked token reuse. All active sessions invalidated.",
        )

    # Expiry Check (timezone-safe)
    exp = session_record.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)

    if exp < datetime.now(timezone.utc):
        session_record.is_revoked = True
        await db.commit()
        response.delete_cookie(key="refresh_token", path="/api/v1/auth")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired. Please log in again.",
        )

    # Fetch User
    user_res = await db.execute(select(User).where(User.id == session_record.user_id))
    user = user_res.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account inactive or deleted.",
        )

    # Revoke old refresh token (Rotate)
    session_record.is_revoked = True

    # Generate new refresh token
    new_raw_refresh, new_token_hash, new_expires_at = create_refresh_token(subject=user.id)
    new_session = RefreshTokenSession(
        user_id=user.id,
        token_hash=new_token_hash,
        expires_at=new_expires_at,
        is_revoked=False,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent", "")[:500]
    )
    db.add(new_session)

    # Generate new access token
    new_access_token = create_access_token(subject=user.id, role=user.role)
    await db.commit()

    # Set new HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=new_raw_refresh,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax" if settings.ENVIRONMENT == "development" else "strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path="/api/v1/auth",
    )

    return ApiResponse(
        data=TokenResponse(
            access_token=new_access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
        ),
        message="Token refreshed successfully"
    )

@router.post("/logout", response_model=ApiResponse[None])
async def logout_user(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Revoke refresh token and clear cookie."""
    raw_refresh = request.cookies.get("refresh_token")
    if raw_refresh:
        h = hash_token(raw_refresh)
        await db.execute(
            update(RefreshTokenSession)
            .where(RefreshTokenSession.token_hash == h)
            .values(is_revoked=True)
        )
        await db.commit()

    response.delete_cookie(key="refresh_token", path="/api/v1/auth")
    return ApiResponse(data=None, message="Logged out successfully")

@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Retrieve profile of the currently logged-in user."""
    return ApiResponse(data=UserResponse.model_validate(current_user))
