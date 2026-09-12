from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class AnomalyResponse(BaseModel):
    id: str
    document_id: str
    anomaly_type: str
    severity: str
    title: str
    description: str
    score: float
    details: Optional[Dict[str, Any]] = None
    is_resolved: bool
    resolved_by: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AnomalyResolveRequest(BaseModel):
    resolution_notes: str
