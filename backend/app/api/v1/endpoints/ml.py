from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from app.services.ml_classifier_service import DocuTraceMLInferenceService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

class DocumentMLEvaluateRequest(BaseModel):
    document_id: str = Field(..., description="Unique document ID (e.g. DOC-4A2B9F8E1103)")
    title: str = Field(..., description="Document title")
    text_snippet: Optional[str] = Field("", description="Optional text content or extracted OCR snippet")
    issuer_name: Optional[str] = Field("", description="Issuing entity name")
    recipient_name: Optional[str] = Field("", description="Recipient full name")
    recipient_email: Optional[str] = Field("", description="Recipient email address")
    sha256_hash: Optional[str] = Field("", description="64-character document SHA256 digest")
    blockchain_tx_id: Optional[str] = Field("", description="Blockchain ledger transaction hash (0x...)")
    duration_hours: Optional[float] = Field(24.0, description="Turnaround duration in hours")

@router.post("/evaluate", response_model=Dict[str, Any], summary="Run Multi-Model ML Inference & Persist to MongoDB")
async def evaluate_document_and_log(
    request: DocumentMLEvaluateRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Executes the 3 ML models for:
    1. Multi-class Document Type Classification (10 classes with confidence & softmax probabilities)
    2. Status & Compliance Risk Scoring (5 lifecycle classes & risk score 0-100)
    3. Ledger Cryptographic Trace Anomaly Detection (IsolationForest)
    
    Persists the prediction payload to MongoDB Atlas collection `docutrace.ml_predictions`.
    """
    try:
        result = await DocuTraceMLInferenceService.evaluate_and_log_document(
            document_id=request.document_id,
            title=request.title,
            text_snippet=request.text_snippet or "",
            issuer_name=request.issuer_name or "",
            recipient_name=request.recipient_name or "",
            recipient_email=request.recipient_email or "",
            sha256_hash=request.sha256_hash or "",
            blockchain_tx_id=request.blockchain_tx_id or "",
            duration_hours=request.duration_hours or 24.0,
            user_id=str(current_user.id) if current_user else None,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute ML evaluation: {str(e)}"
        )

@router.get("/predictions", response_model=List[Dict[str, Any]], summary="Fetch Recent ML Predictions from MongoDB Atlas")
async def get_ml_predictions_history(
    limit: int = Query(50, ge=1, le=500, description="Max records to return"),
    document_id: Optional[str] = Query(None, description="Filter by Document ID"),
    current_user: User = Depends(get_current_user),
):
    """
    Fetches prediction telemetry history from MongoDB Atlas `docutrace.ml_predictions`.
    """
    filter_query = {}
    if document_id:
        filter_query["document_id"] = document_id
        
    records = await DocuTraceMLInferenceService.get_prediction_history(
        limit=limit,
        filter_query=filter_query
    )
    return records
