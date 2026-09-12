from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.document_set import DocumentSet, DocumentSetItem
from app.models.extraction import ExtractedField
from app.models.verification import VerificationResult
from app.schemas.verification import VerificationResponse
from app.schemas.common import ApiResponse
from app.utils.ownership import assert_ownership
from app.services.verification_service import CrossDocumentVerificationService

router = APIRouter()

@router.post("/document-sets/{set_id}/verify", response_model=ApiResponse[VerificationResponse])
async def trigger_cross_document_verification(
    set_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger cross-document 3-way reconciliation (Invoice ↔ PO ↔ Contract) across all documents in a set.
    """
    doc_set = await assert_ownership(db, DocumentSet, set_id, current_user.id, user_role=current_user.role)

    # Fetch all documents and extracted fields in this set
    res = await db.execute(
        select(DocumentSetItem)
        .where(DocumentSetItem.document_set_id == set_id)
        .options(selectinload(DocumentSetItem.document))
    )
    items = res.scalars().all()

    if not items:
        raise HTTPException(status_code=400, detail="Cannot verify an empty document set. Add documents first.")

    docs_with_fields = []
    for item in items:
        doc = item.document
        f_res = await db.execute(select(ExtractedField).where(ExtractedField.document_id == doc.id))
        fields = f_res.scalars().all()
        docs_with_fields.append({"document": doc, "fields": fields})

    # Run Verification Engine
    verification_data = CrossDocumentVerificationService.verify_document_set(docs_with_fields)

    # Save or update result
    existing_res = await db.execute(
        select(VerificationResult).where(VerificationResult.document_set_id == set_id)
    )
    verif_obj = existing_res.scalar_one_or_none()

    if verif_obj:
        verif_obj.status = verification_data["status"]
        verif_obj.overall_summary = verification_data["overall_summary"]
        verif_obj.mismatch_count = verification_data["mismatch_count"]
        verif_obj.details = verification_data["details"]
    else:
        verif_obj = VerificationResult(
            document_set_id=set_id,
            status=verification_data["status"],
            overall_summary=verification_data["overall_summary"],
            mismatch_count=verification_data["mismatch_count"],
            details=verification_data["details"]
        )
        db.add(verif_obj)

    await db.commit()
    await db.refresh(verif_obj)

    return ApiResponse(
        data=VerificationResponse.model_validate(verif_obj),
        message="Cross-document verification completed."
    )

@router.get("/document-sets/{set_id}/results", response_model=ApiResponse[VerificationResponse])
async def get_verification_results(
    set_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the latest verification result for a document set."""
    await assert_ownership(db, DocumentSet, set_id, current_user.id, user_role=current_user.role)

    res = await db.execute(
        select(VerificationResult).where(VerificationResult.document_set_id == set_id)
    )
    verif_obj = res.scalar_one_or_none()

    if not verif_obj:
        raise HTTPException(status_code=404, detail="No verification results found for this document set. Trigger verification first.")

    return ApiResponse(data=VerificationResponse.model_validate(verif_obj))
