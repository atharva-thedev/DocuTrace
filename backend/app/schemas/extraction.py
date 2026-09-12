from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any

class ExtractedFieldResponse(BaseModel):
    id: str
    document_id: str
    field_category: str
    field_key: str
    field_value: str
    normalized_value: Optional[str] = None
    confidence_score: float
    page_number: int
    bbox: Optional[List[float]] = None
    is_corrected: bool
    corrected_by_user_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class FieldCorrectionRequest(BaseModel):
    field_value: str
    normalized_value: Optional[str] = None

class ExtractionSummaryResponse(BaseModel):
    document_id: str
    fields_count: int
    fields_by_category: Dict[str, List[ExtractedFieldResponse]]
