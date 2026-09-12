from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    assignee_id: Optional[str] = None
    document_id: Optional[str] = None
    obligation_id: Optional[str] = None
    anomaly_id: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = Field(default="medium", pattern="^(low|medium|high|urgent)$")

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|urgent)$")
    status: Optional[str] = Field(None, pattern="^(pending|in_progress|completed|cancelled)$")

class TaskResponse(BaseModel):
    id: str
    owner_id: str
    assignee_id: Optional[str] = None
    document_id: Optional[str] = None
    obligation_id: Optional[str] = None
    anomaly_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
