from sqlalchemy import String, Float, Boolean, Integer, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from app.core.database import Base

class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=False)
    field_category: Mapped[str] = mapped_column(String(50), default="financial", nullable=False)  # financial, entity, date, clause, metadata
    field_key: Mapped[str] = mapped_column(String(100), index=True, nullable=False)  # e.g., total_amount, vendor_name, due_date
    field_value: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # standardized string/number/date
    confidence_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)  # 0.0 - 1.0
    page_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    bbox: Mapped[Optional[List[float]]] = mapped_column(JSON, nullable=True)  # [x0, y0, x1, y1] coordinates
    
    is_corrected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    corrected_by_user_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    document: Mapped["Document"] = relationship("Document", back_populates="fields")
