from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class MismatchItem(BaseModel):
    field: str
    severity: str  # low, medium, high, critical
    message: str
    doc1_id: str
    doc1_name: str
    doc1_value: Any
    doc2_id: str
    doc2_name: str
    doc2_value: Any
    explanation: str

class VerificationResponse(BaseModel):
    id: str
    document_set_id: str
    status: str
    overall_summary: Optional[str] = None
    mismatch_count: int
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
