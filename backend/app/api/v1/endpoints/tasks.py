from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.task import ActionTask
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.schemas.common import ApiResponse

router = APIRouter()

@router.get("/", response_model=ApiResponse[List[TaskResponse]])
async def list_tasks(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all actionable tasks assigned to or owned by the current user."""
    query = select(ActionTask).where(
        (ActionTask.owner_id == current_user.id) | (ActionTask.assignee_id == current_user.id)
    )

    if status:
        query = query.where(ActionTask.status == status.lower())
    if priority:
        query = query.where(ActionTask.priority == priority.lower())

    res = await db.execute(query.order_by(desc(ActionTask.created_at)))
    tasks = res.scalars().all()

    return ApiResponse(data=[TaskResponse.model_validate(t) for t in tasks])

@router.post("/", response_model=ApiResponse[TaskResponse], status_code=status.HTTP_201_CREATED)
async def create_custom_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Manually create an actionable task linked to a document, obligation, or anomaly."""
    task = ActionTask(
        owner_id=current_user.id,
        assignee_id=payload.assignee_id or current_user.id,
        document_id=payload.document_id,
        obligation_id=payload.obligation_id,
        anomaly_id=payload.anomaly_id,
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
        priority=payload.priority or "medium",
        status="pending",
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    return ApiResponse(data=TaskResponse.model_validate(task), message="Task created successfully")

@router.patch("/{task_id}", response_model=ApiResponse[TaskResponse])
async def update_task(
    task_id: str,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update task status, priority, description, or due date."""
    res = await db.execute(select(ActionTask).where(ActionTask.id == task_id))
    task = res.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    if task.owner_id != current_user.id and task.assignee_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=404, detail="Task not found.")

    if payload.title:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description
    if payload.assignee_id:
        task.assignee_id = payload.assignee_id
    if payload.due_date:
        task.due_date = payload.due_date
    if payload.priority:
        task.priority = payload.priority
    if payload.status:
        task.status = payload.status

    await db.commit()
    await db.refresh(task)

    return ApiResponse(data=TaskResponse.model_validate(task), message="Task updated successfully")
