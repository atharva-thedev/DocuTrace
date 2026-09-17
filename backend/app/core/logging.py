import sys
from loguru import logger
from app.core.config import settings
import re

# Sensitive patterns to scrub from logs
SENSITIVE_PATTERNS = [
    (r'(?i)password["\']?\s*[:=]\s*["\']?([^"\'\s]+)', r'password="[REDACTED]"'),
    (r'(?i)bearer\s+[a-zA-Z0-9\-_.]+', 'Bearer [REDACTED]'),
    (r'(?i)token["\']?\s*[:=]\s*["\']?([^"\'\s]+)', r'token="[REDACTED]"'),
    (r'(?i)secret["\']?\s*[:=]\s*["\']?([^"\'\s]+)', r'secret="[REDACTED]"'),
    (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', '[EMAIL_MASKED]'),
]

def mask_sensitive_data(message: str) -> str:
    """Mask passwords, tokens, API keys, and raw emails in log output."""
    for pattern, repl in SENSITIVE_PATTERNS:
        message = re.sub(pattern, repl, message)
    return message

def setup_logging():
    """Configure structured logging."""
    if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    logger.remove()
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=settings.LOG_LEVEL,
        colorize=True,
    )
    return logger
