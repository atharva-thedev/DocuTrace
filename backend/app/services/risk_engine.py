from typing import List, Dict, Any
from app.models.anomaly import AnomalyRecord
from app.models.obligation import Obligation

class ExplainableRiskScoringEngine:
    """Calculates a transparent, composite document risk score with explainable contributing factors."""

    SEVERITY_WEIGHTS = {
        "critical": 35,
        "high": 20,
        "medium": 10,
        "low": 5,
    }

    @staticmethod
    def calculate_risk_score(
        anomalies: List[Dict[str, Any]],
        obligations: List[Dict[str, Any]],
        verification_mismatches: int = 0
    ) -> Dict[str, Any]:
        """
        Compute explainable risk score (0-100) and factor attribution.
        Returns: {
            "overall_score": int,
            "risk_level": "low" | "medium" | "high" | "critical",
            "factors": {
                "breakdown": [...],
                "summary": str,
                "recommended_action": str
            }
        }
        """
        factors = []
        raw_score = 0

        # 1. Anomaly Contributions
        for anomaly in anomalies:
            severity = anomaly.get("severity", "medium").lower()
            weight = ExplainableRiskScoringEngine.SEVERITY_WEIGHTS.get(severity, 10)
            raw_score += weight
            factors.append({
                "factor_name": anomaly.get("title", "Detected Anomaly"),
                "category": anomaly.get("anomaly_type", "anomaly"),
                "severity": severity,
                "score_impact": weight,
                "description": anomaly.get("description", ""),
            })

        # 2. Cross-Document Verification Mismatch Contribution
        if verification_mismatches > 0:
            impact = min(40, verification_mismatches * 20)
            raw_score += impact
            factors.append({
                "factor_name": "Cross-Document Reconciliation Mismatches",
                "category": "verification",
                "severity": "high" if verification_mismatches > 1 else "medium",
                "score_impact": impact,
                "description": f"Found {verification_mismatches} discrepancy points across linked purchase orders, invoices, or contracts.",
            })

        # 3. Overdue / High-Risk Obligation Contribution
        high_risk_obligations = [o for o in obligations if o.get("category") in ["renewal", "compliance"]]
        if len(high_risk_obligations) > 2:
            raw_score += 15
            factors.append({
                "factor_name": "Multiple Critical Contractual Obligations",
                "category": "obligation",
                "severity": "medium",
                "score_impact": 15,
                "description": "Document contains multiple time-sensitive compliance and renewal obligations requiring active tracking.",
            })

        # Base clean score
        final_score = min(100, max(0, raw_score))

        # Risk level determination
        if final_score >= 80:
            level = "critical"
            summary = "Critical risk detected. Requires immediate executive review before approval or payment release."
            recommended_action = "Hold all payment processing and initiate investigation into duplicate/math mismatch flags."
        elif final_score >= 55:
            level = "high"
            summary = "High risk detected. Significant discrepancies or missing mandatory information identified."
            recommended_action = "Request invoice/document revision from vendor and cross-check with original agreement."
        elif final_score >= 25:
            level = "medium"
            summary = "Moderate risk. Minor warning factors or non-critical formatting/term differences present."
            recommended_action = "Review flagged items and assign task to department manager for confirmation."
        else:
            level = "low"
            summary = "Low risk. Document passed verification and integrity checks with high confidence."
            recommended_action = "Proceed with standard business approval workflow."

        return {
            "overall_score": final_score,
            "risk_level": level,
            "factors": {
                "breakdown": factors,
                "total_factors": len(factors),
                "summary": summary,
                "recommended_action": recommended_action
            }
        }
