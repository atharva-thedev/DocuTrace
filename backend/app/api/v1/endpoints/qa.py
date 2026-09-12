from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document, DocumentChunk
from app.models.document_set import DocumentSet
from app.models.extraction import ExtractedField
from app.models.qa import QAThread, QAMessage
from app.schemas.qa import QAPromptRequest, QAMessageResponse, QAThreadResponse
from app.schemas.common import ApiResponse
from app.utils.ownership import assert_ownership
from app.services.rag_qa_service import EvidenceGroundedQAService

router = APIRouter()

@router.post("/query", response_model=ApiResponse[QAMessageResponse])
async def ask_document_question(
    payload: QAPromptRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a natural language question about a document or document set.
    Returns an answer strictly grounded in source evidence with document ID, page, and bounding box citations.
    """
    doc = None
    chunks = []
    fields = []

    # Verify Document or DocumentSet access
    if payload.document_id:
        doc = await assert_ownership(db, Document, payload.document_id, current_user.id, user_role=current_user.role)
        c_res = await db.execute(select(DocumentChunk).where(DocumentChunk.document_id == doc.id))
        chunks = c_res.scalars().all()
        f_res = await db.execute(select(ExtractedField).where(ExtractedField.document_id == doc.id))
        fields = f_res.scalars().all()

    # Create or retrieve thread
    thread = None
    if payload.thread_id:
        t_res = await db.execute(select(QAThread).where(QAThread.id == payload.thread_id, QAThread.user_id == current_user.id))
        thread = t_res.scalar_one_or_none()

    if not thread:
        thread = QAThread(
            user_id=current_user.id,
            document_id=payload.document_id,
            document_set_id=payload.document_set_id,
            title=payload.query[:60],
        )
        db.add(thread)
        await db.flush()

    # Save User message
    user_msg = QAMessage(
        thread_id=thread.id,
        sender_type="user",
        content=payload.query,
        citations=None,
    )
    db.add(user_msg)

    # Run Evidence-Grounded Q&A Service
    qa_result = EvidenceGroundedQAService.answer_query(
        query=payload.query,
        document=doc,
        chunks=chunks,
        fields=fields,
    )

    # Save Assistant message with citations
    assistant_msg = QAMessage(
        thread_id=thread.id,
        sender_type="assistant",
        content=qa_result["answer"],
        citations=qa_result["citations"],
    )
    db.add(assistant_msg)
    await db.commit()
    await db.refresh(assistant_msg)

    return ApiResponse(
        data=QAMessageResponse(
            id=assistant_msg.id,
            thread_id=assistant_msg.thread_id,
            sender_type=assistant_msg.sender_type,
            content=assistant_msg.content,
            citations=assistant_msg.citations,
            created_at=assistant_msg.created_at
        )
    )

@router.get("/threads", response_model=ApiResponse[List[QAThreadResponse]])
async def list_qa_threads(
    document_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List recent Q&A conversations."""
    query = select(QAThread).where(QAThread.user_id == current_user.id)
    if document_id:
        query = query.where(QAThread.document_id == document_id)

    res = await db.execute(query.options(selectinload(QAThread.messages)).order_by(QAThread.created_at.desc()))
    threads = res.scalars().all()

    return ApiResponse(data=[
        QAThreadResponse(
            id=t.id,
            user_id=t.user_id,
            document_id=t.document_id,
            document_set_id=t.document_set_id,
            title=t.title,
            created_at=t.created_at,
            messages=[QAMessageResponse.model_validate(m) for m in t.messages]
        )
        for t in threads
    ])
