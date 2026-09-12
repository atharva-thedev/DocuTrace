import hashlib
import os
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile, HTTPException
from app.core.config import settings

# Recognized magic bytes
MAGIC_NUMBERS = {
    b"%PDF": "application/pdf",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"\xff\xd8\xff": "image/jpeg",
    b"PK\x03\x04": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

def validate_file_magic(content_header: bytes) -> str:
    """Validate file content using initial magic bytes."""
    for magic, mime in MAGIC_NUMBERS.items():
        if content_header.startswith(magic):
            return mime
    raise HTTPException(
        status_code=400,
        detail="Unsupported file format. Please upload a valid PDF, PNG, JPG, or DOCX document.",
    )

async def save_upload_file(file: UploadFile, owner_id: str) -> Tuple[str, str, int, str]:
    """
    Save uploaded file securely with SHA-256 hash and path containment check.
    Returns: (saved_relative_path, original_filename, file_size_bytes, sha256_hash)
    """
    header = await file.read(16)
    if not header:
        raise HTTPException(status_code=400, detail="Empty file submitted.")
    
    mime_type = validate_file_magic(header)
    await file.seek(0)

    # Read entire content to calculate hash and size
    content = await file.read()
    file_size = len(content)
    
    max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_size_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB.",
        )

    file_hash = hashlib.sha256(content).hexdigest()

    # Determine extension
    orig_ext = Path(file.filename).suffix.lower()
    if orig_ext not in settings.ALLOWED_EXTENSIONS:
        orig_ext = ".pdf" if mime_type == "application/pdf" else ".bin"

    # User subfolder for isolation
    user_upload_dir = Path(settings.UPLOAD_DIR) / owner_id
    user_upload_dir.mkdir(parents=True, exist_ok=True)

    dest_filename = f"{file_hash}{orig_ext}"
    dest_path = (user_upload_dir / dest_filename).resolve()

    # Path traversal check
    if not str(dest_path).startswith(str(Path(settings.UPLOAD_DIR).resolve())):
        raise HTTPException(status_code=400, detail="Invalid destination path.")

    # Write file to disk
    with open(dest_path, "wb") as f:
        f.write(content)

    relative_path = str(dest_path)
    return relative_path, file.filename, file_size, file_hash
