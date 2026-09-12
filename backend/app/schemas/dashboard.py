from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DashboardSummaryResponse(BaseModel):
    total_documents: int
    processing_documents: int
    flagged_documents: int
    total_anomalies: int
    unresolved_anomalies: int
    total_tasks: int
    pending_tasks: int
    risk_breakdown: Dict[str, int]  # {"low": 12, "medium": 4, "high": 2, "critical": 1}
    document_types: Dict[str, int]  # {"invoice": 10, "contract": 5, "po": 3}
    recent_activity: List[Dict[str, Any]]
