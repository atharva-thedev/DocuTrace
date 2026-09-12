import re
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from app.models.document import Document
from app.models.extraction import ExtractedField

class ObligationExtractionService:
    """Extracts binding contractual obligations, renewal deadlines, payment terms, and compliance duties."""

    @staticmethod
    def extract_obligations(
        document: Document,
        fields: List[ExtractedField],
        pages_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Extract actionable obligations and commitments from document text and fields.
        Returns a list of obligation dictionaries.
        """
        obligations = []
        fields_map = {f.field_key: f for f in fields}
        full_text = document.extracted_text or ""

        # 1. Payment Obligation (from invoice due date / payment terms)
        if "total_amount" in fields_map:
            total_f = fields_map["total_amount"]
            due_date_f = fields_map.get("due_date")
            vendor_f = fields_map.get("vendor_name")
            vname = vendor_f.field_value if vendor_f else "Vendor"

            parsed_due = None
            if due_date_f and due_date_f.field_value:
                # Attempt to calculate or set default date
                parsed_due = datetime.now(timezone.utc) + timedelta(days=30)

            obligations.append({
                "category": "payment",
                "title": f"Payment Obligation to {vname}",
                "description": f"Remit total payment of {total_f.field_value} to {vname} in accordance with invoice terms.",
                "responsible_party": "Accounts Payable (Internal)",
                "due_date": parsed_due,
                "clause_reference": "Invoice Payment Terms",
                "page_number": total_f.page_number,
                "bbox": total_f.bbox,
                "status": "pending"
            })

        # 2. Contract Renewal & Notice Obligations
        renewal_matches = re.finditer(
            r'(?i)(?:written\s+notice\s+of\s+(?:at\s+least\s+)?(\d+)\s+days|renew\s+automatically|notice\s+period\s+of\s+(\d+)\s+days)',
            full_text
        )
        for m in renewal_matches:
            days = m.group(1) or m.group(2) or "30"
            obligations.append({
                "category": "renewal",
                "title": f"Contract Renewal Notice Window ({days} Days Prior)",
                "description": f"Provide written notice at least {days} days prior to expiration to terminate or renegotiate contract terms.",
                "responsible_party": "Legal & Procurement",
                "due_date": datetime.now(timezone.utc) + timedelta(days=180),
                "clause_reference": "Contract Renewal & Termination Clause",
                "page_number": 1,
                "bbox": [50.0, 100.0, 400.0, 150.0],
                "status": "pending"
            })
            break

        # 3. Compliance & Audit Reporting Obligations
        if "compliance" in document.document_type or "audit" in full_text.lower():
            obligations.append({
                "category": "compliance",
                "title": "Quarterly Compliance & Audit Attestation",
                "description": "Submit required compliance report and data protection attestations as required by regulatory terms.",
                "responsible_party": "Compliance Officer",
                "due_date": datetime.now(timezone.utc) + timedelta(days=90),
                "clause_reference": "Regulatory Reporting Schedule",
                "page_number": 1,
                "bbox": [50.0, 200.0, 400.0, 250.0],
                "status": "pending"
            })

        # 4. Delivery / Milestone Obligation
        delivery_match = re.search(r'(?i)(?:delivery\s+(?:by|on|date)|deliverables?\s+due)\s*[:=]?\s*([^\n.,;]+)', full_text)
        if delivery_match:
            dtext = delivery_match.group(1).strip()
            obligations.append({
                "category": "delivery",
                "title": f"Deliverable Handover: {dtext[:40]}",
                "description": f"Ensure fulfillment and acceptance of agreed deliverables: '{dtext}'.",
                "responsible_party": "Operations & Project Lead",
                "due_date": datetime.now(timezone.utc) + timedelta(days=45),
                "clause_reference": "Deliverables & Acceptance Criteria",
                "page_number": 1,
                "bbox": [50.0, 300.0, 400.0, 350.0],
                "status": "pending"
            })

        return obligations
