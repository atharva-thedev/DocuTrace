from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
from datetime import datetime, timezone
import math
import os

from app.core.database import get_db, AsyncSessionLocal
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.extraction import ExtractedField
from app.models.anomaly import AnomalyRecord
from app.models.obligation import Obligation
from app.models.risk_score import RiskScore
from app.schemas.document import DocumentResponse, DocumentDetailResponse
from app.schemas.common import ApiResponse, PaginatedResponse, PaginationMeta
from app.utils.file_helpers import save_upload_file
from app.utils.ownership import assert_ownership
from app.services.pipeline_orchestrator import DocumentPipelineOrchestrator

router = APIRouter()

async def run_pipeline_bg(document_id: str):
    """Background task runner with isolated DB session."""
    async with AsyncSessionLocal() as db:
        await DocumentPipelineOrchestrator.process_document_pipeline(document_id, db)

@router.post("/upload", response_model=ApiResponse[DocumentResponse], status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    document_type: str = Form(default="invoice"),  # invoice, po, contract, financial_report, compliance, other
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a document (PDF, PNG, JPG, DOCX).
    Saves file securely, registers metadata, and queues the 8-step intelligent processing pipeline.
    """
    saved_path, original_name, file_size, file_hash = await save_upload_file(file, current_user.id)

    doc = Document(
        owner_id=current_user.id,
        filename=os.path.basename(saved_path),
        original_filename=original_name,
        file_path=saved_path,
        file_size=file_size,
        mime_type=file.content_type or "application/pdf",
        file_hash=file_hash,
        document_type=document_type.lower(),
        status="queued",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Queue async background processing
    background_tasks.add_task(run_pipeline_bg, doc.id)

    return ApiResponse(
        data=DocumentResponse.model_validate(doc),
        message="Document uploaded successfully. Processing pipeline queued."
    )

@router.get("/", response_model=PaginatedResponse[DocumentResponse])
async def list_documents(
    document_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List documents belonging to the authenticated user with filtering and pagination."""
    query = select(Document).where(Document.owner_id == current_user.id, Document.is_deleted == False)

    if document_type:
        query = query.where(Document.document_type == document_type.lower())
    if status:
        query = query.where(Document.status == status.lower())
    if search:
        query = query.where(Document.original_filename.ilike(f"%{search}%"))

    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    # Pagination
    offset = (page - 1) * limit
    paged_query = query.order_by(desc(Document.created_at)).offset(offset).limit(limit)
    result = await db.execute(paged_query)
    docs = result.scalars().all()

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return PaginatedResponse(
        data=[DocumentResponse.model_validate(d) for d in docs],
        pagination=PaginationMeta(
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
    )

@router.get("/{document_id}", response_model=ApiResponse[DocumentDetailResponse])
async def get_document_details(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve detailed document metadata, including summary and counts of extracted items."""
    doc = await assert_ownership(db, Document, document_id, current_user.id, user_role=current_user.role)

    # Fetch extractions count
    f_res = await db.execute(select(func.count()).select_from(ExtractedField).where(ExtractedField.document_id == doc.id))
    f_count = f_res.scalar_one()

    # Fetch anomalies count
    a_res = await db.execute(select(func.count()).select_from(AnomalyRecord).where(AnomalyRecord.document_id == doc.id))
    a_count = a_res.scalar_one()

    # Fetch obligations count
    o_res = await db.execute(select(func.count()).select_from(Obligation).where(Obligation.document_id == doc.id))
    o_count = o_res.scalar_one()

    # Fetch risk score
    r_res = await db.execute(select(RiskScore).where(RiskScore.document_id == doc.id))
    risk = r_res.scalar_one_or_none()

    doc_detail = DocumentDetailResponse(
        id=doc.id,
        owner_id=doc.owner_id,
        filename=doc.filename,
        original_filename=doc.original_filename,
        file_size=doc.file_size,
        mime_type=doc.mime_type,
        file_hash=doc.file_hash,
        document_type=doc.document_type,
        status=doc.status,
        page_count=doc.page_count,
        summary=doc.summary,
        error_message=doc.error_message,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        doc_metadata=doc.doc_metadata,
        extracted_fields_count=f_count,
        anomalies_count=a_count,
        obligations_count=o_count,
        risk_score=risk.overall_score if risk else None,
        risk_level=risk.risk_level if risk else None
    )

    return ApiResponse(data=doc_detail)

@router.get("/{document_id}/file")
async def get_document_file(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Stream raw document file for the in-app document viewer."""
    doc = await assert_ownership(db, Document, document_id, current_user.id, user_role=current_user.role)

    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Underlying document file not found on disk.")

    return FileResponse(
        path=doc.file_path,
        media_type=doc.mime_type,
        filename=doc.original_filename,
    )

@router.delete("/{document_id}", response_model=ApiResponse[None])
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Soft delete a document and remove from active listings."""
    doc = await assert_ownership(db, Document, document_id, current_user.id, user_role=current_user.role)
    doc.is_deleted = True
    doc.deleted_at = datetime.now(timezone.utc)
    await db.commit()

    return ApiResponse(data=None, message="Document deleted successfully")
