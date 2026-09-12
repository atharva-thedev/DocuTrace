from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.obligation import Obligation
from app.schemas.obligation import ObligationResponse, ObligationUpdate
from app.schemas.common import ApiResponse
from app.utils.ownership import assert_ownership

router = APIRouter()

@router.get("/documents/{document_id}/obligations", response_model=ApiResponse[List[ObligationResponse]])
async def get_document_obligations(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all extracted obligations, commitments, deadlines, and responsible parties for a document."""
    doc = await assert_ownership(db, Document, document_id, current_user.id, user_role=current_user.role)

    res = await db.execute(
        select(Obligation)
        .where(Obligation.document_id == doc.id)
        .order_by(Obligation.due_date.asc())
    )
    obligations = res.scalars().all()

    return ApiResponse(data=[ObligationResponse.model_validate(o) for o in obligations])

@router.patch("/obligations/{obligation_id}", response_model=ApiResponse[ObligationResponse])
async def update_obligation(
    obligation_id: str,
    payload: ObligationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update status, deadline, or assignee for an obligation."""
    res = await db.execute(select(Obligation).where(Obligation.id == obligation_id))
    obl = res.scalar_one_or_none()

    if not obl:
        raise HTTPException(status_code=404, detail="Obligation not found.")

    await assert_ownership(db, Document, obl.document_id, current_user.id, user_role=current_user.role)

    if payload.status:
        obl.status = payload.status
    if payload.responsible_party:
        obl.responsible_party = payload.responsible_party
    if payload.due_date:
        obl.due_date = payload.due_date

    await db.commit()
    await db.refresh(obl)

    return ApiResponse(
        data=ObligationResponse.model_validate(obl),
        message="Obligation updated successfully"
    )
