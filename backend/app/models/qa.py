from sqlalchemy import String, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List, Dict, Any
from app.core.database import Base

class QAThread(Base):
    __tablename__ = "qa_threads"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    document_id: Mapped[Optional[str]] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=True)
    document_set_id: Mapped[Optional[str]] = mapped_column(ForeignKey("document_sets.id", ondelete="CASCADE"), index=True, nullable=True)
    title: Mapped[str] = mapped_column(String(255), default="Document Inquiry", nullable=False)

    messages: Mapped[List["QAMessage"]] = relationship("QAMessage", back_populates="thread", cascade="all, delete-orphan")

class QAMessage(Base):
    __tablename__ = "qa_messages"

    thread_id: Mapped[str] = mapped_column(ForeignKey("qa_threads.id", ondelete="CASCADE"), index=True, nullable=False)
    sender_type: Mapped[str] = mapped_column(String(50), nullable=False)  # user, assistant
    content: Mapped[str] = mapped_column(Text, nullable=False)
    citations: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(
        JSON, nullable=True
    )  # List of {doc_id, page_number, bbox: [x0,y0,x1,y1], quote, confidence}

    thread: Mapped["QAThread"] = relationship("QAThread", back_populates="messages")
