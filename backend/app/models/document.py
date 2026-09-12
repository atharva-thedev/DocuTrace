from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional, Any, Dict
from datetime import datetime
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)  # SHA-256
    
    document_type: Mapped[str] = mapped_column(
        String(50), default="invoice", nullable=False
    )  # invoice, po, contract, financial_report, compliance, other
    
    status: Mapped[str] = mapped_column(
        String(50), default="queued", nullable=False
    )  # queued, processing, completed, failed
    
    page_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    doc_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="documents")
    pages: Mapped[List["DocumentPage"]] = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    chunks: Mapped[List["DocumentChunk"]] = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    fields: Mapped[List["ExtractedField"]] = relationship("ExtractedField", back_populates="document", cascade="all, delete-orphan")
    anomalies: Mapped[List["AnomalyRecord"]] = relationship("AnomalyRecord", back_populates="document", cascade="all, delete-orphan")
    obligations: Mapped[List["Obligation"]] = relationship("Obligation", back_populates="document", cascade="all, delete-orphan")
    risk_scores: Mapped[List["RiskScore"]] = relationship("RiskScore", back_populates="document", cascade="all, delete-orphan")

class DocumentPage(Base):
    __tablename__ = "document_pages"

    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=False)
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    width: Mapped[float] = mapped_column(Float, default=612.0, nullable=False)
    height: Mapped[float] = mapped_column(Float, default=792.0, nullable=False)
    text_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    layout_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)  # Bounding boxes, word coordinates

    document: Mapped["Document"] = relationship("Document", back_populates="pages")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=False)
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    bbox: Mapped[Optional[List[float]]] = mapped_column(JSON, nullable=True)  # [x0, y0, x1, y1]
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[Optional[List[float]]] = mapped_column(JSON, nullable=True)  # Vector representation

    document: Mapped["Document"] = relationship("Document", back_populates="chunks")
