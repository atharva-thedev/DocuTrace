import re
from typing import List, Dict, Any, Tuple
from loguru import logger

class InformationExtractionService:
    """Extracts structured fields, financial amounts, entities, dates, and clauses from document text."""

    @staticmethod
    def extract_fields(
        full_text: str,
        document_type: str,
        pages_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Execute multi-strategy information extraction.
        Returns a list of ExtractedField dictionaries with bounding-box locations and confidence scores.
        """
        extracted = []

        # 1. Deterministic Rule & Regex Extraction
        extracted.extend(InformationExtractionService._extract_regex_patterns(full_text, document_type, pages_data))

        # 2. Heuristic Entity & Clause Extraction
        extracted.extend(InformationExtractionService._extract_entities_and_clauses(full_text, document_type, pages_data))

        # Deduplicate fields by field_key
        seen_keys = set()
        deduped = []
        for field in extracted:
            if field["field_key"] not in seen_keys:
                seen_keys.add(field["field_key"])
                deduped.append(field)

        return deduped

    @staticmethod
    def _extract_regex_patterns(
        text: str,
        document_type: str,
        pages_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        results = []

        # Total Amount / Grand Total / Subtotal / Tax
        amount_patterns = [
            (r'(?i)\b(?:grand\s+total|total\s+amount|total\s+due|balance\s+due|\btotal\b)\s*[:=]?\s*[\$€£]?\s*([0-9,]+\.[0-9]{2})', "total_amount", "financial"),
            (r'(?i)\b(?:subtotal|sub-total|sub\s+total)\s*[:=]?\s*[\$€£]?\s*([0-9,]+\.[0-9]{2})', "subtotal_amount", "financial"),
            (r'(?i)\b(?:tax|vat|gst|sales\s+tax)\b(?:\s*\([^)]*\))?\s*[:=]?\s*[\$€£]?\s*([0-9,]+\.[0-9]{2})', "tax_amount", "financial"),
        ]

        for pattern, key, cat in amount_patterns:
            match = re.search(pattern, text)
            if match:
                raw_val = match.group(1).replace(",", "")
                bbox, page = InformationExtractionService._find_match_location(match.group(0), pages_data)
                results.append({
                    "field_category": cat,
                    "field_key": key,
                    "field_value": f"${raw_val}",
                    "normalized_value": str(float(raw_val)),
                    "confidence_score": 0.95,
                    "page_number": page,
                    "bbox": bbox
                })

        # Dates (Invoice Date, Due Date, Order Date)
        date_patterns = [
            (r'(?i)\b(?:invoice\s+date|date\s+of\s+issue|bill\s+date)\s*[:=]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]+\s+[0-9]{1,2},?\s+[0-9]{4})', "invoice_date", "date"),
            (r'(?i)\b(?:due\s+date|payment\s+due|pay\s+by)\s*[:=]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]+\s+[0-9]{1,2},?\s+[0-9]{4})', "due_date", "date"),
            (r'(?i)\b(?:po\s+date|order\s+date)\s*[:=]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]+\s+[0-9]{1,2},?\s+[0-9]{4})', "order_date", "date"),
            (r'(?i)\b(?:effective\s+date|start\s+date)\s*[:=]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]+\s+[0-9]{1,2},?\s+[0-9]{4})', "effective_date", "date"),
            (r'(?i)\b(?:expiration\s+date|expiry\s+date|termination\s+date)\s*[:=]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]+\s+[0-9]{1,2},?\s+[0-9]{4})', "expiration_date", "date"),
        ]

        for pattern, key, cat in date_patterns:
            match = re.search(pattern, text)
            if match:
                raw_val = match.group(1).strip()
                bbox, page = InformationExtractionService._find_match_location(match.group(0), pages_data)
                results.append({
                    "field_category": cat,
                    "field_key": key,
                    "field_value": raw_val,
                    "normalized_value": raw_val,
                    "confidence_score": 0.92,
                    "page_number": page,
                    "bbox": bbox
                })

        # Identifiers (Invoice #, PO #, Tax ID)
        id_patterns = [
            (r'(?i)\b(?:invoice\s+(?:number|num|no|#))\s*[:=]?\s*([A-Za-z0-9\-_/]+)', "invoice_number", "metadata"),
            (r'(?i)\b(?:p\.?o\.?\s+(?:number|num|no|#)|purchase\s+order\s+(?:number|num|no|#)?)\s*[:=]?\s*([A-Za-z0-9\-_/]+)', "po_number", "metadata"),
            (r'(?i)\b(?:tax\s+id|ein|vat\s+(?:number|num|no|#)|gstin)\s*[:=]?\s*([A-Za-z0-9\-]+)', "tax_id", "entity"),
            (r'(?i)\b(?:payment\s+terms?)\s*[:=]?\s*([A-Za-z0-9\s]+(?:Net\s+\d+|Due\s+on\s+Receipt|Upon\s+Approval)?)', "payment_terms", "clause"),
        ]

        for pattern, key, cat in id_patterns:
            match = re.search(pattern, text)
            if match:
                raw_val = match.group(1).strip()
                bbox, page = InformationExtractionService._find_match_location(match.group(0), pages_data)
                results.append({
                    "field_category": cat,
                    "field_key": key,
                    "field_value": raw_val,
                    "normalized_value": raw_val,
                    "confidence_score": 0.90,
                    "page_number": page,
                    "bbox": bbox
                })

        return results

    @staticmethod
    def _extract_entities_and_clauses(
        text: str,
        document_type: str,
        pages_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        results = []

        # Vendor Name detection
        vendor_match = re.search(r'(?i)\b(?:vendor|supplier|from|seller|contractor)\s*[:=]?\s*([A-Za-z0-9\s.,&]+?)(?:\n|$|\s{2,})', text)
        if vendor_match:
            vname = vendor_match.group(1).strip()[:60]
            if len(vname) > 2:
                bbox, page = InformationExtractionService._find_match_location(vendor_match.group(0), pages_data)
                results.append({
                    "field_category": "entity",
                    "field_key": "vendor_name",
                    "field_value": vname,
                    "normalized_value": vname.upper(),
                    "confidence_score": 0.88,
                    "page_number": page,
                    "bbox": bbox
                })

        # Buyer/Client Name detection
        buyer_match = re.search(r'(?i)\b(?:bill\s+to|client|buyer|customer|to)\s*[:=]?\s*([A-Za-z0-9\s.,&]+?)(?:\n|$|\s{2,})', text)
        if buyer_match:
            bname = buyer_match.group(1).strip()[:60]
            if len(bname) > 2:
                bbox, page = InformationExtractionService._find_match_location(buyer_match.group(0), pages_data)
                results.append({
                    "field_category": "entity",
                    "field_key": "buyer_name",
                    "field_value": bname,
                    "normalized_value": bname.upper(),
                    "confidence_score": 0.85,
                    "page_number": page,
                    "bbox": bbox
                })

        # Contract Clauses
        if document_type == "contract" or "agreement" in text.lower():
            clauses = [
                ("confidentiality_clause", r'(?i)(?:confidentiality|non-disclosure).*?(?:shall\s+not\s+disclose|proprietary\s+information)', "clause"),
                ("indemnification_clause", r'(?i)(?:indemnification|hold\s+harmless).*?(?:indemnify,\s+defend|against\s+all\s+claims)', "clause"),
                ("renewal_clause", r'(?i)(?:renewal|term\s+extension).*?(?:automatically\s+renew|written\s+notice\s+prior)', "clause"),
                ("termination_clause", r'(?i)(?:termination).*?(?:may\s+terminate|written\s+notice\s+of\s+\d+\s+days)', "clause"),
            ]
            for key, pattern, cat in clauses:
                m = re.search(pattern, text, re.DOTALL)
                if m:
                    clause_snippet = m.group(0)[:200]
                    bbox, page = InformationExtractionService._find_match_location(clause_snippet[:30], pages_data)
                    results.append({
                        "field_category": cat,
                        "field_key": key,
                        "field_value": clause_snippet,
                        "normalized_value": "PRESENT",
                        "confidence_score": 0.90,
                        "page_number": page,
                        "bbox": bbox
                    })

        return results

    @staticmethod
    def _find_match_location(snippet: str, pages_data: List[Dict[str, Any]]) -> Tuple[List[float], int]:
        """Search across layout chunks for the matching bounding box."""
        snippet_clean = snippet.strip()[:25].lower()
        for page in pages_data:
            page_num = page.get("page_number", 1)
            for chunk in page.get("chunks", []):
                chunk_text = chunk.get("text", "").lower()
                if snippet_clean in chunk_text or any(word in chunk_text for word in snippet_clean.split() if len(word) > 3):
                    return chunk.get("bbox", [50.0, 50.0, 300.0, 80.0]), page_num
        return [50.0, 50.0, 300.0, 80.0], 1
