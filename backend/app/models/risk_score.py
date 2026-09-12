from sqlalchemy import String, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, Dict, Any
from app.core.database import Base

class RiskScore(Base):
    __tablename__ = "risk_scores"

    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=False)
    overall_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # 0 to 100
    risk_level: Mapped[str] = mapped_column(
        String(50), default="low", nullable=False
    )  # low, medium, high, critical
    factors: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON, nullable=True
    )  # List of contributing risk factors with descriptions and weightings

    document: Mapped["Document"] = relationship("Document", back_populates="risk_scores")
