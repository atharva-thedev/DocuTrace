from typing import List, Dict, Any, Optional
from app.models.document import Document
from app.models.extraction import ExtractedField
from app.models.anomaly import AnomalyRecord
from app.models.obligation import Obligation
from app.models.risk_score import RiskScore

class DocumentSummaryService:
    """Generates concise executive summaries of documents and document sets."""

    @staticmethod
    def generate_document_summary(
        document: Document,
        fields: List[ExtractedField],
        anomalies: List[AnomalyRecord],
        obligations: List[Obligation],
        risk_score: Optional[RiskScore] = None
    ) -> str:
        """Create a human-readable intelligent executive summary."""
        fields_map = {f.field_key: f.field_value for f in fields}
        doc_type_title = document.document_type.replace("_", " ").title()

        parts = [f"### Executive Summary — {doc_type_title} ({document.filename})"]

        # Key Entities & Financials
        vendor = fields_map.get("vendor_name", "Unspecified Vendor")
        total = fields_map.get("total_amount", "Unspecified Total")
        inv_date = fields_map.get("invoice_date") or fields_map.get("effective_date") or "Unspecified Date"
        
        parts.append(f"- **Primary Entity:** {vendor}")
        parts.append(f"- **Financial / Total Value:** {total}")
        parts.append(f"- **Document Date:** {inv_date}")

        # Risk & Anomaly Status
        if risk_score:
            parts.append(f"- **Risk Assessment:** {risk_score.risk_level.upper()} (Score: {risk_score.overall_score}/100)")
        
        if anomalies:
            parts.append(f"- **Integrity Flags:** {len(anomalies)} anomaly issue(s) detected requiring review.")
            for anom in anomalies[:3]:
                parts.append(f"  • *[{anom.severity.upper()}]* {anom.title}")
        else:
            parts.append("- **Integrity Status:** No mathematical or duplicate anomalies detected.")

        # Obligations Status
        if obligations:
            parts.append(f"- **Actionable Commitments:** {len(obligations)} obligation(s) tracked.")
            for obl in obligations[:2]:
                parts.append(f"  • {obl.title} (Assigned: {obl.responsible_party})")

        return "\n".join(parts)
