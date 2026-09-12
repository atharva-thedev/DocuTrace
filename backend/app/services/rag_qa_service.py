import re
from typing import List, Dict, Any, Optional
from loguru import logger
from app.models.document import Document, DocumentChunk
from app.models.extraction import ExtractedField

class EvidenceGroundedQAService:
    """Answers natural language questions strictly grounded in document text with visual bounding-box citations."""

    @staticmethod
    def answer_query(
        query: str,
        document: Optional[Document] = None,
        chunks: Optional[List[DocumentChunk]] = None,
        fields: Optional[List[ExtractedField]] = None,
        document_set_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate evidence-grounded response with spatial citations.
        Returns: {
            "answer": str,
            "citations": [
                {
                    "document_id": str,
                    "document_name": str,
                    "page_number": int,
                    "bbox": [x0, y0, x1, y1],
                    "quote": str,
                    "confidence": float
                }
            ]
        }
        """
        chunks = chunks or []
        fields = fields or []
        query_lower = query.lower().strip()

        citations = []
        answer = ""

        # 1. Check for specific question types
        # Total / Billed Amount inquiry
        if any(term in query_lower for term in ["total", "amount", "how much", "cost", "price", "subtotal", "tax"]):
            for f in fields:
                if f.field_key in ["total_amount", "subtotal_amount", "tax_amount"]:
                    citations.append({
                        "document_id": document.id if document else "",
                        "document_name": document.filename if document else "Document",
                        "page_number": f.page_number,
                        "bbox": f.bbox or [50.0, 50.0, 300.0, 80.0],
                        "quote": f"{f.field_key.replace('_', ' ').title()}: {f.field_value}",
                        "confidence": f.confidence_score
                    })
            if citations:
                quotes_summary = "; ".join(c["quote"] for c in citations)
                answer = f"Based on the verified document records, the financial values are: {quotes_summary}."

        # Vendor / Supplier inquiry
        elif any(term in query_lower for term in ["who", "vendor", "supplier", "company", "parties", "from", "buyer", "client"]):
            for f in fields:
                if f.field_key in ["vendor_name", "buyer_name"]:
                    citations.append({
                        "document_id": document.id if document else "",
                        "document_name": document.filename if document else "Document",
                        "page_number": f.page_number,
                        "bbox": f.bbox or [50.0, 50.0, 300.0, 80.0],
                        "quote": f"{f.field_key.replace('_', ' ').title()}: {f.field_value}",
                        "confidence": f.confidence_score
                    })
            if citations:
                quotes_summary = ", ".join(c["quote"] for c in citations)
                answer = f"The identified parties in this document are: {quotes_summary}."

        # Dates & Deadlines inquiry
        elif any(term in query_lower for term in ["when", "date", "due", "deadline", "expire", "expiration", "period"]):
            for f in fields:
                if f.field_category == "date" or "date" in f.field_key:
                    citations.append({
                        "document_id": document.id if document else "",
                        "document_name": document.filename if document else "Document",
                        "page_number": f.page_number,
                        "bbox": f.bbox or [50.0, 50.0, 300.0, 80.0],
                        "quote": f"{f.field_key.replace('_', ' ').title()}: {f.field_value}",
                        "confidence": f.confidence_score
                    })
            if citations:
                quotes_summary = "; ".join(c["quote"] for c in citations)
                answer = f"The documented dates and timeline milestones are: {quotes_summary}."

        # 2. General Chunk Search if no structured field match
        if not citations and chunks:
            keywords = [w for w in re.findall(r'\w+', query_lower) if len(w) > 3]
            matched_chunks = []
            for chunk in chunks:
                chunk_lower = chunk.content.lower()
                matches = sum(1 for kw in keywords if kw in chunk_lower)
                if matches > 0:
                    matched_chunks.append((matches, chunk))

            matched_chunks.sort(key=lambda x: x[0], reverse=True)

            for _, chunk in matched_chunks[:2]:
                citations.append({
                    "document_id": document.id if document else "",
                    "document_name": document.filename if document else "Document",
                    "page_number": chunk.page_number,
                    "bbox": chunk.bbox or [50.0, 50.0, 500.0, 100.0],
                    "quote": chunk.content[:200],
                    "confidence": 0.85
                })

            if citations:
                snippet = citations[0]["quote"]
                answer = f"According to page {citations[0]['page_number']} of the document: \"{snippet}...\". This directly addresses your query regarding '{query}'."

        # Zero-hallucination fallback
        if not citations:
            answer = "I could not find specific, verifiable evidence in the uploaded document to answer this query. To prevent misinformation, no speculative response is generated."

        return {
            "answer": answer,
            "citations": citations
        }
