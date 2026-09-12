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
from app.schemas.document_set import DocumentSetCreate, DocumentSetResponse, AddDocumentToSetRequest, DocumentSetItemResponse
from app.schemas.document import DocumentResponse
from app.schemas.common import ApiResponse
from app.utils.ownership import assert_ownership

router = APIRouter()

@router.post("/", response_model=ApiResponse[DocumentSetResponse], status_code=status.HTTP_201_CREATED)
async def create_document_set(
    set_in: DocumentSetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new logical grouping / set of related documents (e.g. Invoice + PO + Contract)."""
    doc_set = DocumentSet(
        owner_id=current_user.id,
        name=set_in.name,
        description=set_in.description,
    )
    db.add(doc_set)
    await db.flush()

    if set_in.document_ids:
        for doc_id in set_in.document_ids:
            doc = await assert_ownership(db, Document, doc_id, current_user.id, user_role=current_user.role)
            item = DocumentSetItem(
                document_set_id=doc_set.id,
                document_id=doc.id,
                role_in_set=doc.document_type
            )
            db.add(item)

    await db.commit()
    
    # Reload with relations
    res = await db.execute(
        select(DocumentSet)
        .where(DocumentSet.id == doc_set.id)
        .options(selectinload(DocumentSet.items).selectinload(DocumentSetItem.document))
    )
    full_set = res.scalar_one()

    return ApiResponse(
        data=DocumentSetResponse(
            id=full_set.id,
            owner_id=full_set.owner_id,
            name=full_set.name,
            description=full_set.description,
            created_at=full_set.created_at,
            updated_at=full_set.updated_at,
            items=[
                DocumentSetItemResponse(
                    id=i.id,
                    document_id=i.document_id,
                    role_in_set=i.role_in_set,
                    document=DocumentResponse.model_validate(i.document) if i.document else None
                )
                for i in full_set.items
            ]
        ),
        message="Document set created successfully"
    )

@router.get("/", response_model=ApiResponse[List[DocumentSetResponse]])
async def list_document_sets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all document sets belonging to the authenticated user."""
    res = await db.execute(
        select(DocumentSet)
        .where(DocumentSet.owner_id == current_user.id)
        .options(selectinload(DocumentSet.items).selectinload(DocumentSetItem.document))
        .order_by(DocumentSet.created_at.desc())
    )
    sets = res.scalars().all()

    resp = []
    for s in sets:
        resp.append(DocumentSetResponse(
            id=s.id,
            owner_id=s.owner_id,
            name=s.name,
            description=s.description,
            created_at=s.created_at,
            updated_at=s.updated_at,
            items=[
                DocumentSetItemResponse(
                    id=i.id,
                    document_id=i.document_id,
                    role_in_set=i.role_in_set,
                    document=DocumentResponse.model_validate(i.document) if i.document else None
                )
                for i in s.items
            ]
        ))

    return ApiResponse(data=resp)

@router.get("/{set_id}", response_model=ApiResponse[DocumentSetResponse])
async def get_document_set(
    set_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details and linked documents for a specific document set."""
    doc_set = await assert_ownership(db, DocumentSet, set_id, current_user.id, user_role=current_user.role)
    
    res = await db.execute(
        select(DocumentSet)
        .where(DocumentSet.id == set_id)
        .options(selectinload(DocumentSet.items).selectinload(DocumentSetItem.document))
    )
    s = res.scalar_one()

    return ApiResponse(
        data=DocumentSetResponse(
            id=s.id,
            owner_id=s.owner_id,
            name=s.name,
            description=s.description,
            created_at=s.created_at,
            updated_at=s.updated_at,
            items=[
                DocumentSetItemResponse(
                    id=i.id,
                    document_id=i.document_id,
                    role_in_set=i.role_in_set,
                    document=DocumentResponse.model_validate(i.document) if i.document else None
                )
                for i in s.items
            ]
        )
    )

@router.post("/{set_id}/documents", response_model=ApiResponse[None])
async def add_document_to_set(
    set_id: str,
    payload: AddDocumentToSetRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Link an existing document into a document set."""
    doc_set = await assert_ownership(db, DocumentSet, set_id, current_user.id, user_role=current_user.role)
    doc = await assert_ownership(db, Document, payload.document_id, current_user.id, user_role=current_user.role)

    # Check if already linked
    existing = await db.execute(
        select(DocumentSetItem).where(
            DocumentSetItem.document_set_id == doc_set.id,
            DocumentSetItem.document_id == doc.id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Document already linked to this set.")

    item = DocumentSetItem(
        document_set_id=doc_set.id,
        document_id=doc.id,
        role_in_set=payload.role_in_set or doc.document_type
    )
    db.add(item)
    await db.commit()

    return ApiResponse(data=None, message="Document linked to set successfully")
