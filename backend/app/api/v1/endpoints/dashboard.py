from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.anomaly import AnomalyRecord
from app.models.task import ActionTask
from app.models.risk_score import RiskScore
from app.schemas.dashboard import DashboardSummaryResponse
from app.schemas.common import ApiResponse

router = APIRouter()

@router.get("/summary", response_model=ApiResponse[DashboardSummaryResponse])
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve high-level overview metrics for the executive analytics dashboard."""
    # Documents count
    doc_res = await db.execute(
        select(Document.status, Document.document_type, func.count(Document.id))
        .where(Document.owner_id == current_user.id, Document.is_deleted == False)
        .group_by(Document.status, Document.document_type)
    )
    doc_rows = doc_res.all()

    total_docs = 0
    processing_docs = 0
    doc_types = {}
    for st, dtype, count in doc_rows:
        total_docs += count
        if st in ["queued", "processing"]:
            processing_docs += count
        doc_types[dtype] = doc_types.get(dtype, 0) + count

    # Anomalies count
    anom_res = await db.execute(
        select(AnomalyRecord.is_resolved, func.count(AnomalyRecord.id))
        .join(Document, AnomalyRecord.document_id == Document.id)
        .where(Document.owner_id == current_user.id, Document.is_deleted == False)
        .group_by(AnomalyRecord.is_resolved)
    )
    anom_rows = anom_res.all()

    total_anomalies = 0
    unresolved_anomalies = 0
    for is_res, count in anom_rows:
        total_anomalies += count
        if not is_res:
            unresolved_anomalies += count

    # Tasks count
    task_res = await db.execute(
        select(ActionTask.status, func.count(ActionTask.id))
        .where(ActionTask.owner_id == current_user.id)
        .group_by(ActionTask.status)
    )
    task_rows = task_res.all()

    total_tasks = 0
    pending_tasks = 0
    for st, count in task_rows:
        total_tasks += count
        if st in ["pending", "in_progress"]:
            pending_tasks += count

    # Risk breakdown
    risk_res = await db.execute(
        select(RiskScore.risk_level, func.count(RiskScore.id))
        .join(Document, RiskScore.document_id == Document.id)
        .where(Document.owner_id == current_user.id, Document.is_deleted == False)
        .group_by(RiskScore.risk_level)
    )
    risk_breakdown = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    for rlevel, count in risk_res.all():
        if rlevel in risk_breakdown:
            risk_breakdown[rlevel] = count

    flagged_docs = risk_breakdown["high"] + risk_breakdown["critical"]

    # Recent activity / documents
    recent_docs_res = await db.execute(
        select(Document)
        .where(Document.owner_id == current_user.id, Document.is_deleted == False)
        .order_by(desc(Document.created_at))
        .limit(5)
    )
    recent_docs = recent_docs_res.scalars().all()
    recent_activity = [
        {
            "id": d.id,
            "type": "document_upload",
            "title": f"Uploaded {d.original_filename}",
            "status": d.status,
            "timestamp": d.created_at.isoformat() if d.created_at else None
        }
        for d in recent_docs
    ]

    return ApiResponse(
        data=DashboardSummaryResponse(
            total_documents=total_docs,
            processing_documents=processing_docs,
            flagged_documents=flagged_docs,
            total_anomalies=total_anomalies,
            unresolved_anomalies=unresolved_anomalies,
            total_tasks=total_tasks,
            pending_tasks=pending_tasks,
            risk_breakdown=risk_breakdown,
            document_types=doc_types,
            recent_activity=recent_activity
        )
    )
