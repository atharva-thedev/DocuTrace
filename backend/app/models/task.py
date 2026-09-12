from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from datetime import datetime
from app.core.database import Base

class ActionTask(Base):
    __tablename__ = "action_tasks"

    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    assignee_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    document_id: Mapped[Optional[str]] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=True)
    obligation_id: Mapped[Optional[str]] = mapped_column(ForeignKey("obligations.id", ondelete="SET NULL"), index=True, nullable=True)
    anomaly_id: Mapped[Optional[str]] = mapped_column(ForeignKey("anomalies.id", ondelete="SET NULL"), index=True, nullable=True)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    priority: Mapped[str] = mapped_column(
        String(50), default="medium", nullable=False
    )  # low, medium, high, urgent
    status: Mapped[str] = mapped_column(
        String(50), default="pending", nullable=False
    )  # pending, in_progress, completed, cancelled

    assignee: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assignee_id], back_populates="tasks")
    obligation: Mapped[Optional["Obligation"]] = relationship("Obligation", back_populates="tasks")
