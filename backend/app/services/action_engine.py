from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from app.models.document import Document
from app.models.obligation import Obligation
from app.models.anomaly import AnomalyRecord

class ObligationActionEngine:
    """Converts extracted obligations, deadlines, and critical anomaly findings into actionable tasks."""

    @staticmethod
    def generate_tasks_from_obligations(
        document: Document,
        obligations: List[Obligation],
        owner_id: str
    ) -> List[Dict[str, Any]]:
        """Auto-generate task blueprints from obligations."""
        tasks = []
        for obl in obligations:
            priority = "urgent" if obl.category in ["renewal", "compliance"] else "high" if obl.category == "payment" else "medium"
            due = obl.due_date or (datetime.now(timezone.utc) + timedelta(days=14))

            tasks.append({
                "owner_id": owner_id,
                "document_id": document.id,
                "obligation_id": obl.id,
                "anomaly_id": None,
                "title": f"Follow-up: {obl.title}",
                "description": f"Automated task generated from obligation: {obl.description} (Responsible: {obl.responsible_party}).",
                "due_date": due,
                "priority": priority,
                "status": "pending",
            })
        return tasks

    @staticmethod
    def generate_tasks_from_anomalies(
        document: Document,
        anomalies: List[AnomalyRecord],
        owner_id: str
    ) -> List[Dict[str, Any]]:
        """Auto-generate remediation tasks for high and critical severity anomalies."""
        tasks = []
        for anom in anomalies:
            if anom.severity in ["critical", "high"]:
                tasks.append({
                    "owner_id": owner_id,
                    "document_id": document.id,
                    "obligation_id": None,
                    "anomaly_id": anom.id,
                    "title": f"Investigate Anomaly: {anom.title}",
                    "description": f"Remediate detected issue: {anom.description}",
                    "due_date": datetime.now(timezone.utc) + timedelta(days=3),
                    "priority": "urgent" if anom.severity == "critical" else "high",
                    "status": "pending",
                })
        return tasks
