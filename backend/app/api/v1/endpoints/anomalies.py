from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.anomaly import AnomalyRecord
from app.schemas.anomaly import AnomalyResponse, AnomalyResolveRequest
from app.schemas.common import ApiResponse
from app.utils.ownership import assert_ownership

router = APIRouter()

@router.get("/documents/{document_id}/anomalies", response_model=ApiResponse[List[AnomalyResponse]])
async def get_document_anomalies(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all detected financial, math, duplicate, or missing information anomalies for a document."""
    doc = await assert_ownership(db, Document, document_id, current_user.id, user_role=current_user.role)

    res = await db.execute(
        select(AnomalyRecord)
        .where(AnomalyRecord.document_id == doc.id)
        .order_by(AnomalyRecord.severity.desc(), AnomalyRecord.created_at.desc())
    )
    anomalies = res.scalars().all()

    return ApiResponse(data=[AnomalyResponse.model_validate(a) for a in anomalies])

@router.post("/anomalies/{anomaly_id}/resolve", response_model=ApiResponse[AnomalyResponse])
async def resolve_anomaly(
    anomaly_id: str,
    payload: AnomalyResolveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark an anomaly as resolved with explanation notes."""
    res = await db.execute(select(AnomalyRecord).where(AnomalyRecord.id == anomaly_id))
    anom = res.scalar_one_or_none()

    if not anom:
        raise HTTPException(status_code=404, detail="Anomaly record not found.")

    await assert_ownership(db, Document, anom.document_id, current_user.id, user_role=current_user.role)

    anom.is_resolved = True
    anom.resolved_by = current_user.full_name
    anom.resolution_notes = payload.resolution_notes

    await db.commit()
    await db.refresh(anom)

    return ApiResponse(
        data=AnomalyResponse.model_validate(anom),
        message="Anomaly marked as resolved"
    )
