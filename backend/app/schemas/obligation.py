from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime

class ObligationResponse(BaseModel):
    id: str
    document_id: str
    category: str
    title: str
    description: str
    responsible_party: str
    due_date: Optional[datetime] = None
    clause_reference: Optional[str] = None
    page_number: int
    bbox: Optional[List[float]] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ObligationUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(pending|fulfilled|overdue|waived)$")
    responsible_party: Optional[str] = None
    due_date: Optional[datetime] = None
