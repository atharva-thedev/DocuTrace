import numpy as np
from sklearn.ensemble import IsolationForest
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models.document import Document
from app.models.extraction import ExtractedField

class FinancialAnomalyDetectionService:
    """Detects statistical outliers, math calculation inconsistencies, duplicates, and missing required info."""

    REQUIRED_FIELDS_BY_TYPE = {
        "invoice": ["total_amount", "invoice_date", "invoice_number", "vendor_name", "tax_id"],
        "po": ["total_amount", "order_date", "po_number", "vendor_name"],
        "contract": ["effective_date", "expiration_date", "vendor_name"],
        "financial_report": ["total_amount"],
        "compliance": ["effective_date"],
    }

    @staticmethod
    def detect_anomalies(
        document: Document,
        fields: List[ExtractedField],
        historical_docs_with_fields: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Execute full anomaly suite for a document.
        Returns a list of anomaly records with title, severity, score, and explanation.
        """
        anomalies = []
        fields_map = {f.field_key: f for f in fields}

        # 1. Missing Required Information Check
        missing_anomalies = FinancialAnomalyDetectionService._check_missing_fields(document.document_type, fields_map)
        anomalies.extend(missing_anomalies)

        # 2. Math & Tax Calculation Consistency Check
        math_anomalies = FinancialAnomalyDetectionService._check_math_consistency(fields_map)
        anomalies.extend(math_anomalies)

        # 3. Duplicate Invoice / Document Pattern Check
        if historical_docs_with_fields:
            dup_anomalies = FinancialAnomalyDetectionService._check_duplicates(document, fields_map, historical_docs_with_fields)
            anomalies.extend(dup_anomalies)

        # 4. Statistical ML Outlier Check (Isolation Forest / Z-score)
        if historical_docs_with_fields:
            outlier_anomalies = FinancialAnomalyDetectionService._check_statistical_outliers(document, fields_map, historical_docs_with_fields)
            anomalies.extend(outlier_anomalies)

        return anomalies

    @staticmethod
    def _check_missing_fields(
        doc_type: str,
        fields_map: Dict[str, ExtractedField]
    ) -> List[Dict[str, Any]]:
        anomalies = []
        required = FinancialAnomalyDetectionService.REQUIRED_FIELDS_BY_TYPE.get(doc_type, ["total_amount"])

        for req in required:
            if req not in fields_map or not fields_map[req].field_value.strip():
                friendly_name = req.replace("_", " ").title()
                anomalies.append({
                    "anomaly_type": "missing_field",
                    "severity": "high" if req in ["total_amount", "invoice_number", "tax_id"] else "medium",
                    "title": f"Missing Mandatory Field: {friendly_name}",
                    "description": f"The document is missing the required field '{friendly_name}', which is required for {doc_type.upper()} processing and compliance.",
                    "score": 0.75,
                    "details": {"missing_field_key": req, "document_type": doc_type}
                })

        return anomalies

    @staticmethod
    def _check_math_consistency(
        fields_map: Dict[str, ExtractedField]
    ) -> List[Dict[str, Any]]:
        anomalies = []
        subtotal_f = fields_map.get("subtotal_amount")
        tax_f = fields_map.get("tax_amount")
        total_f = fields_map.get("total_amount")

        if subtotal_f and tax_f and total_f:
            try:
                subtotal = float(subtotal_f.normalized_value or subtotal_f.field_value.replace("$", "").replace(",", ""))
                tax = float(tax_f.normalized_value or tax_f.field_value.replace("$", "").replace(",", ""))
                total = float(total_f.normalized_value or total_f.field_value.replace("$", "").replace(",", ""))

                expected_total = round(subtotal + tax, 2)
                diff = abs(expected_total - total)

                if diff > 0.05:  # tolerance for minor rounding
                    anomalies.append({
                        "anomaly_type": "math_mismatch",
                        "severity": "critical" if diff > 50 else "high",
                        "title": "Mathematical / Tax Inconsistency Detected",
                        "description": f"Calculated subtotal (${subtotal:,.2f}) + tax (${tax:,.2f}) equals ${expected_total:,.2f}, but billed total is ${total:,.2f} (Discrepancy of ${diff:,.2f}).",
                        "score": 0.95,
                        "details": {
                            "subtotal": subtotal,
                            "tax": tax,
                            "expected_total": expected_total,
                            "billed_total": total,
                            "discrepancy": diff
                        }
                    })
            except Exception:
                pass

        return anomalies

    @staticmethod
    def _check_duplicates(
        current_doc: Document,
        current_fields: Dict[str, ExtractedField],
        history: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        anomalies = []
        curr_total = current_fields.get("total_amount")
        curr_vendor = current_fields.get("vendor_name")
        curr_inv_num = current_fields.get("invoice_number")

        for past in history:
            past_doc = past["document"]
            if past_doc.id == current_doc.id:
                continue

            past_fields = {f.field_key: f for f in past["fields"]}
            
            # Exact duplicate invoice number check
            if curr_inv_num and past_fields.get("invoice_number"):
                if curr_inv_num.field_value.strip().lower() == past_fields["invoice_number"].field_value.strip().lower():
                    anomalies.append({
                        "anomaly_type": "duplicate",
                        "severity": "critical",
                        "title": f"Duplicate Invoice Number Detected: {curr_inv_num.field_value}",
                        "description": f"Invoice number '{curr_inv_num.field_value}' was previously processed in document '{past_doc.filename}' (ID: {past_doc.id}). Potential double billing.",
                        "score": 1.0,
                        "details": {
                            "duplicate_doc_id": past_doc.id,
                            "duplicate_filename": past_doc.filename,
                            "invoice_number": curr_inv_num.field_value
                        }
                    })
                    return anomalies

            # Pattern duplicate: same vendor + exact same total amount
            if curr_total and curr_vendor and past_fields.get("total_amount") and past_fields.get("vendor_name"):
                v1 = curr_vendor.field_value.strip().lower()
                v2 = past_fields["vendor_name"].field_value.strip().lower()
                t1 = curr_total.field_value.strip()
                t2 = past_fields["total_amount"].field_value.strip()

                if v1 == v2 and t1 == t2:
                    anomalies.append({
                        "anomaly_type": "duplicate",
                        "severity": "high",
                        "title": "Suspected Duplicate Transaction Pattern",
                        "description": f"Identical billing amount ({t1}) from vendor '{curr_vendor.field_value}' matches existing document '{past_doc.filename}'.",
                        "score": 0.85,
                        "details": {
                            "matching_doc_id": past_doc.id,
                            "matching_filename": past_doc.filename,
                            "vendor": curr_vendor.field_value,
                            "amount": t1
                        }
                    })
                    break

        return anomalies

    @staticmethod
    def _check_statistical_outliers(
        current_doc: Document,
        current_fields: Dict[str, ExtractedField],
        history: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        anomalies = []
        curr_total = current_fields.get("total_amount")
        if not curr_total:
            return anomalies

        try:
            curr_val = float(curr_total.normalized_value or curr_total.field_value.replace("$", "").replace(",", ""))
        except Exception:
            return anomalies

        # Gather historical amounts
        historical_amounts = []
        for item in history:
            for f in item["fields"]:
                if f.field_key == "total_amount":
                    try:
                        v = float(f.normalized_value or f.field_value.replace("$", "").replace(",", ""))
                        historical_amounts.append(v)
                    except Exception:
                        pass

        # If we have at least 5 historical data points, run Isolation Forest
        if len(historical_amounts) >= 5:
            data = np.array(historical_amounts).reshape(-1, 1)
            clf = IsolationForest(contamination=0.1, random_state=42)
            clf.fit(data)
            pred = clf.predict([[curr_val]])

            mean_val = np.mean(historical_amounts)
            std_val = np.std(historical_amounts)

            # If classified as outlier and significantly above historical mean
            if pred[0] == -1 and (curr_val > mean_val + 2 * std_val):
                anomalies.append({
                    "anomaly_type": "vendor_outlier",
                    "severity": "high",
                    "title": "Statistical Amount Outlier Detected",
                    "description": f"The document amount (${curr_val:,.2f}) is significantly higher than the historical average (${mean_val:,.2f} ± ${std_val:,.2f}) for this category.",
                    "score": 0.80,
                    "details": {
                        "billed_amount": curr_val,
                        "historical_mean": round(float(mean_val), 2),
                        "historical_std": round(float(std_val), 2),
                        "historical_count": len(historical_amounts)
                    }
                })

        return anomalies
