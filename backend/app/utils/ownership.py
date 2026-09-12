from typing import Type, TypeVar
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

T = TypeVar("T")

async def assert_ownership(
    db: AsyncSession,
    model_class: Type[T],
    resource_id: str,
    user_id: str,
    allow_admin: bool = True,
    user_role: str = "member"
) -> T:
    """
    Ensure the requested resource exists and belongs to the specified user.
    Always raises 404 (NOT_FOUND) instead of 403 (FORBIDDEN) to prevent enumeration of private IDs.
    """
    query = select(model_class).where(model_class.id == resource_id)
    
    # If soft-delete is supported on the model
    if hasattr(model_class, "is_deleted"):
        query = query.where(model_class.is_deleted == False)

    result = await db.execute(query)
    resource = result.scalar_one_or_none()

    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )

    # Check owner_id or user_id attribute
    owner_field = None
    if hasattr(resource, "owner_id"):
        owner_field = resource.owner_id
    elif hasattr(resource, "user_id"):
        owner_field = resource.user_id

    if owner_field and owner_field != user_id:
        if allow_admin and user_role == "admin":
            return resource
        # IDOR prevention: return 404
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )

    return resource
