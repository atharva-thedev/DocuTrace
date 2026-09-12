from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from datetime import datetime
from app.core.database import Base

class Obligation(Base):
    __tablename__ = "obligations"

    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=False)
    category: Mapped[str] = mapped_column(
        String(50), default="payment", nullable=False
    )  # payment, delivery, renewal, compliance, reporting
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    responsible_party: Mapped[str] = mapped_column(String(255), default="Internal", nullable=False)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    clause_reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    page_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    bbox: Mapped[Optional[List[float]]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="pending", nullable=False
    )  # pending, fulfilled, overdue, waived

    document: Mapped["Document"] = relationship("Document", back_populates="obligations")
    tasks: Mapped[List["ActionTask"]] = relationship("ActionTask", back_populates="obligation")
