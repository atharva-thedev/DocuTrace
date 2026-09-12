from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.extraction import ExtractedField
from app.schemas.extraction import ExtractedFieldResponse, FieldCorrectionRequest, ExtractionSummaryResponse
from app.schemas.common import ApiResponse
from app.utils.ownership import assert_ownership

router = APIRouter()

@router.get("/documents/{document_id}/fields", response_model=ApiResponse[List[ExtractedFieldResponse]])
async def get_document_fields(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all structured extracted fields (dates, amounts, entities, clauses, bboxes) for a document."""
    doc = await assert_ownership(db, Document, document_id, current_user.id, user_role=current_user.role)

    res = await db.execute(
        select(ExtractedField)
        .where(ExtractedField.document_id == doc.id)
        .order_by(ExtractedField.page_number, ExtractedField.field_category)
    )
    fields = res.scalars().all()

    return ApiResponse(data=[ExtractedFieldResponse.model_validate(f) for f in fields])

@router.get("/documents/{document_id}/summary", response_model=ApiResponse[ExtractionSummaryResponse])
async def get_extraction_summary(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve categorized summary of extracted fields."""
    doc = await assert_ownership(db, Document, document_id, current_user.id, user_role=current_user.role)

    res = await db.execute(
        select(ExtractedField).where(ExtractedField.document_id == doc.id)
    )
    fields = res.scalars().all()

    by_cat = {}
    for f in fields:
        cat = f.field_category
        if cat not in by_cat:
            by_cat[cat] = []
        by_cat[cat].append(ExtractedFieldResponse.model_validate(f))

    return ApiResponse(
        data=ExtractionSummaryResponse(
            document_id=doc.id,
            fields_count=len(fields),
            fields_by_category=by_cat
        )
    )

@router.patch("/fields/{field_id}", response_model=ApiResponse[ExtractedFieldResponse])
async def update_extracted_field(
    field_id: str,
    payload: FieldCorrectionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Manually correct or override an extracted field value."""
    res = await db.execute(select(ExtractedField).where(ExtractedField.id == field_id))
    field_obj = res.scalar_one_or_none()

    if not field_obj:
        raise HTTPException(status_code=404, detail="Extracted field not found.")

    # Ensure document ownership
    await assert_ownership(db, Document, field_obj.document_id, current_user.id, user_role=current_user.role)

    field_obj.field_value = payload.field_value
    field_obj.normalized_value = payload.normalized_value or payload.field_value
    field_obj.is_corrected = True
    field_obj.corrected_by_user_id = current_user.id

    await db.commit()
    await db.refresh(field_obj)

    return ApiResponse(
        data=ExtractedFieldResponse.model_validate(field_obj),
        message="Field updated successfully"
    )
