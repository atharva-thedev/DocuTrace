from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.document import DocumentResponse

class DocumentSetCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    document_ids: Optional[List[str]] = None

class AddDocumentToSetRequest(BaseModel):
    document_id: str
    role_in_set: Optional[str] = "primary"  # invoice, po, contract, supporting

class DocumentSetItemResponse(BaseModel):
    id: str
    document_id: str
    role_in_set: str
    document: Optional[DocumentResponse] = None

    model_config = ConfigDict(from_attributes=True)

class DocumentSetResponse(BaseModel):
    id: str
    owner_id: str
    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[DocumentSetItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
