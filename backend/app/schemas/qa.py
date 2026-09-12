from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class CitationItem(BaseModel):
    document_id: str
    document_name: Optional[str] = None
    page_number: int
    bbox: Optional[List[float]] = None  # [x0, y0, x1, y1]
    quote: str
    confidence: float = 1.0

class QAPromptRequest(BaseModel):
    query: str = Field(..., min_length=2)
    document_id: Optional[str] = None
    document_set_id: Optional[str] = None
    thread_id: Optional[str] = None

class QAMessageResponse(BaseModel):
    id: str
    thread_id: str
    sender_type: str
    content: str
    citations: Optional[List[Dict[str, Any]]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class QAThreadResponse(BaseModel):
    id: str
    user_id: str
    document_id: Optional[str] = None
    document_set_id: Optional[str] = None
    title: str
    created_at: datetime
    messages: List[QAMessageResponse] = []

    model_config = ConfigDict(from_attributes=True)
