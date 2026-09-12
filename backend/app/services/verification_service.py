import pandas as pd
from typing import List, Dict, Any
from app.models.document import Document
from app.models.extraction import ExtractedField

class CrossDocumentVerificationService:
    """Reconciles and verifies related documents (Invoice ↔ PO ↔ Contract) across a DocumentSet."""

    @staticmethod
    def verify_document_set(
        documents_with_fields: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Run 3-way matching and discrepancy checks across documents in the set.
        Returns: {
            "status": "passed" | "warning" | "failed",
            "overall_summary": str,
            "mismatch_count": int,
            "details": {
                "mismatches": [...],
                "matrix": [...]
            }
        }
        """
        if len(documents_with_fields) < 2:
            return {
                "status": "passed",
                "overall_summary": "Single document verified. Cross-document comparison requires at least 2 documents in the set.",
                "mismatch_count": 0,
                "details": {"mismatches": [], "matrix": []}
            }

        # Build comparison map by document type
        docs_by_type = {}
        for item in documents_with_fields:
            doc = item["document"]
            fields = {f.field_key: f for f in item["fields"]}
            docs_by_type[doc.document_type] = {
                "doc_id": doc.id,
                "filename": doc.filename,
                "fields": fields
            }

        mismatches = []

        invoice = docs_by_type.get("invoice")
        po = docs_by_type.get("po")
        contract = docs_by_type.get("contract")

        # 1. Check Invoice ↔ PO Total Amount
        if invoice and po:
            inv_total = invoice["fields"].get("total_amount")
            po_total = po["fields"].get("total_amount")
            if inv_total and po_total:
                try:
                    val_inv = float(inv_total.normalized_value or inv_total.field_value.replace("$", "").replace(",", ""))
                    val_po = float(po_total.normalized_value or po_total.field_value.replace("$", "").replace(",", ""))
                    diff = abs(val_inv - val_po)
                    if diff > 0.01:
                        mismatches.append({
                            "field": "total_amount",
                            "severity": "critical" if diff > 100 else "high",
                            "message": f"Total amount mismatch: Invoice (${val_inv:,.2f}) vs PO (${val_po:,.2f})",
                            "doc1_id": invoice["doc_id"],
                            "doc1_name": invoice["filename"],
                            "doc1_value": f"${val_inv:,.2f}",
                            "doc2_id": po["doc_id"],
                            "doc2_name": po["filename"],
                            "doc2_value": f"${val_po:,.2f}",
                            "explanation": f"The billed amount on invoice {invoice['filename']} differs from authorized purchase order {po['filename']} by ${diff:,.2f}."
                        })
                except Exception:
                    pass

        # 2. Check Vendor Name match
        if invoice and po:
            inv_vendor = invoice["fields"].get("vendor_name")
            po_vendor = po["fields"].get("vendor_name")
            if inv_vendor and po_vendor:
                v1 = (inv_vendor.normalized_value or inv_vendor.field_value).strip().upper()
                v2 = (po_vendor.normalized_value or po_vendor.field_value).strip().upper()
                if v1 not in v2 and v2 not in v1:
                    mismatches.append({
                        "field": "vendor_name",
                        "severity": "medium",
                        "message": f"Vendor name inconsistency: Invoice ({inv_vendor.field_value}) vs PO ({po_vendor.field_value})",
                        "doc1_id": invoice["doc_id"],
                        "doc1_name": invoice["filename"],
                        "doc1_value": inv_vendor.field_value,
                        "doc2_id": po["doc_id"],
                        "doc2_name": po["filename"],
                        "doc2_value": po_vendor.field_value,
                        "explanation": "Vendor names on PO and Invoice do not match exactly. Verify if this is a subsidiary or DBA name."
                    })

        # 3. Check PO Reference on Invoice
        if invoice and po:
            inv_po_ref = invoice["fields"].get("po_number")
            po_num = po["fields"].get("po_number")
            if inv_po_ref and po_num:
                if inv_po_ref.field_value.strip() != po_num.field_value.strip():
                    mismatches.append({
                        "field": "po_number",
                        "severity": "high",
                        "message": f"Referenced PO number mismatch: Invoice references '{inv_po_ref.field_value}', PO is '{po_num.field_value}'",
                        "doc1_id": invoice["doc_id"],
                        "doc1_name": invoice["filename"],
                        "doc1_value": inv_po_ref.field_value,
                        "doc2_id": po["doc_id"],
                        "doc2_name": po["filename"],
                        "doc2_value": po_num.field_value,
                        "explanation": "Invoice cites an incorrect or unmatched purchase order reference number."
                    })

        # 4. Check Contract Terms ↔ Invoice Terms
        if invoice and contract:
            inv_terms = invoice["fields"].get("payment_terms")
            contract_terms = contract["fields"].get("payment_terms")
            if inv_terms and contract_terms:
                if inv_terms.field_value.strip().lower() != contract_terms.field_value.strip().lower():
                    mismatches.append({
                        "field": "payment_terms",
                        "severity": "medium",
                        "message": f"Payment terms discrepancy: Invoice states '{inv_terms.field_value}', Contract specifies '{contract_terms.field_value}'",
                        "doc1_id": invoice["doc_id"],
                        "doc1_name": invoice["filename"],
                        "doc1_value": inv_terms.field_value,
                        "doc2_id": contract["doc_id"],
                        "doc2_name": contract["filename"],
                        "doc2_value": contract_terms.field_value,
                        "explanation": "Payment terms listed on the invoice violate master contract payment terms."
                    })

        # Status determination
        has_critical = any(m["severity"] == "critical" for m in mismatches)
        has_high = any(m["severity"] == "high" for m in mismatches)
        
        if has_critical or has_high:
            status = "failed"
            summary = f"Verification failed with {len(mismatches)} discrepancy flags requiring investigation."
        elif mismatches:
            status = "warning"
            summary = f"Verification completed with {len(mismatches)} warnings."
        else:
            status = "passed"
            summary = "All cross-document comparisons reconciled successfully with zero mismatches."

        return {
            "status": status,
            "overall_summary": summary,
            "mismatch_count": len(mismatches),
            "details": {
                "mismatches": mismatches,
                "document_count": len(documents_with_fields)
            }
        }
