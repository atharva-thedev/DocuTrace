from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from app.core.database import Base

class DocumentSet(Base):
    __tablename__ = "document_sets"

    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    items: Mapped[List["DocumentSetItem"]] = relationship("DocumentSetItem", back_populates="document_set", cascade="all, delete-orphan")
    verification_results: Mapped[List["VerificationResult"]] = relationship("VerificationResult", back_populates="document_set", cascade="all, delete-orphan")

class DocumentSetItem(Base):
    __tablename__ = "document_set_items"

    document_set_id: Mapped[str] = mapped_column(ForeignKey("document_sets.id", ondelete="CASCADE"), index=True, nullable=False)
    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=False)
    role_in_set: Mapped[str] = mapped_column(String(50), default="primary", nullable=False)  # invoice, po, contract, supporting

    document_set: Mapped["DocumentSet"] = relationship("DocumentSet", back_populates="items")
    document: Mapped["Document"] = relationship("Document")
