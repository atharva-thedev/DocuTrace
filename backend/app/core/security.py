import hmac
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import jwt
import bcrypt
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings
import secrets

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its bcrypt hash."""
    try:
        password_bytes = plain_password.encode("utf-8")[:72]
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    password_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")

def create_access_token(
    subject: Union[str, Any],
    role: str = "member",
    expires_delta: Optional[timedelta] = None
) -> str:
    """Generate a signed JWT access token (15m default)."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": str(subject),
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": secrets.token_hex(16),
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_ACCESS_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None
) -> tuple[str, str, datetime]:
    """
    Generate a cryptographically secure refresh token.
    Returns: (raw_token, hashed_token, expiry_datetime)
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    raw_token = secrets.token_urlsafe(48)
    token_hash = hash_token(raw_token)
    return raw_token, token_hash, expire

def hash_token(token: str) -> str:
    """Create a SHA-256 hash of a token for secure database storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def timing_safe_compare(val1: str, val2: str) -> bool:
    """Compare two strings using constant-time comparison to prevent timing attacks."""
    return hmac.compare_digest(val1.encode("utf-8"), val2.encode("utf-8"))

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT access token."""
    return jwt.decode(
        token,
        settings.JWT_ACCESS_SECRET,
        algorithms=[settings.ALGORITHM],
        options={"require": ["exp", "sub", "type"]}
    )

# AES-256-GCM Encryption for sensitive document fields
def encrypt_sensitive_data(plaintext: str) -> str:
    """Encrypt plaintext string using AES-256-GCM."""
    if not plaintext:
        return ""
    try:
        key = bytes.fromhex(settings.ENCRYPTION_KEY[:64])
        aesgcm = AESGCM(key)
        nonce = secrets.token_bytes(12)
        ciphertext = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
        return (nonce + ciphertext).hex()
    except Exception:
        return plaintext

def decrypt_sensitive_data(hex_data: str) -> str:
    """Decrypt AES-256-GCM encrypted hex string."""
    if not hex_data:
        return ""
    try:
        raw = bytes.fromhex(hex_data)
        nonce = raw[:12]
        ciphertext = raw[12:]
        key = bytes.fromhex(settings.ENCRYPTION_KEY[:64])
        aesgcm = AESGCM(key)
        decrypted = aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted.decode("utf-8")
    except Exception:
        return hex_data
