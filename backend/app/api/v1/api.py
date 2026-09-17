from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    documents,
    document_sets,
    extractions,
    verifications,
    anomalies,
    obligations,
    risk_scores,
    tasks,
    qa,
    dashboard,
    ml,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Session"])
api_router.include_router(documents.router, prefix="/documents", tags=["Document Management & Upload"])
api_router.include_router(document_sets.router, prefix="/document-sets", tags=["Document Sets & Grouping"])
api_router.include_router(extractions.router, prefix="/extractions", tags=["Information Extraction"])
api_router.include_router(verifications.router, prefix="/verifications", tags=["Cross-Document Verification"])
api_router.include_router(anomalies.router, prefix="/anomalies", tags=["Financial & Integrity Anomalies"])
api_router.include_router(obligations.router, prefix="/obligations", tags=["Obligations & Commitments"])
api_router.include_router(risk_scores.router, prefix="/risk-scores", tags=["Explainable Risk Scoring"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Action & Task Engine"])
api_router.include_router(qa.router, prefix="/qa", tags=["Evidence-Grounded Q&A (RAG)"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Executive Dashboard Analytics"])
api_router.include_router(ml.router, prefix="/ml", tags=["Machine Learning Inference & MongoDB Telemetry"])
