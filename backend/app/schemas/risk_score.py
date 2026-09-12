from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

class RiskFactor(BaseModel):
    name: str
    weight: float
    score: float
    description: str

class RiskScoreResponse(BaseModel):
    id: str
    document_id: str
    overall_score: int
    risk_level: str
    factors: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
