from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.risk_score import RiskScore
from app.schemas.risk_score import RiskScoreResponse
from app.schemas.common import ApiResponse
from app.utils.ownership import assert_ownership

router = APIRouter()

@router.get("/documents/{document_id}/risk", response_model=ApiResponse[RiskScoreResponse])
async def get_document_risk_score(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the explainable risk score (0-100) and factor attribution breakdown for a document."""
    doc = await assert_ownership(db, Document, document_id, current_user.id, user_role=current_user.role)

    res = await db.execute(
        select(RiskScore).where(RiskScore.document_id == doc.id)
    )
    risk = res.scalar_one_or_none()

    if not risk:
        raise HTTPException(status_code=404, detail="Risk score not calculated yet for this document.")

    return ApiResponse(data=RiskScoreResponse.model_validate(risk))
