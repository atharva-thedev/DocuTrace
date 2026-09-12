from sqlalchemy import String, Integer, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, Dict, Any, List
from app.core.database import Base

class VerificationResult(Base):
    __tablename__ = "verification_results"

    document_set_id: Mapped[str] = mapped_column(ForeignKey("document_sets.id", ondelete="CASCADE"), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="passed", nullable=False)  # passed, warning, failed
    overall_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    mismatch_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)  # List of mismatches and field comparisons

    document_set: Mapped["DocumentSet"] = relationship("DocumentSet", back_populates="verification_results")
