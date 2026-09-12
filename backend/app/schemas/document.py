from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentResponse(BaseModel):
    id: str
    owner_id: str
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    file_hash: str
    document_type: str
    status: str
    page_count: int
    summary: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentDetailResponse(DocumentResponse):
    doc_metadata: Optional[Dict[str, Any]] = None
    extracted_fields_count: int = 0
    anomalies_count: int = 0
    obligations_count: int = 0
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None

class DocumentFilter(BaseModel):
    document_type: Optional[str] = None
    status: Optional[str] = None
    search: Optional[str] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
