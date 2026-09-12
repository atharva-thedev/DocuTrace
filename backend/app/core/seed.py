import os
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from loguru import logger

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.document import Document
from app.models.extraction import ExtractedField
from app.models.anomaly import AnomalyRecord
from app.models.obligation import Obligation
from app.models.risk_score import RiskScore
from app.models.task import ActionTask
from app.models.document_set import DocumentSet, DocumentSetItem
from app.models.verification import VerificationResult

async def seed_demo_data() -> None:
    """Seed initial demo accounts and rich document intelligence data."""
    async with AsyncSessionLocal() as db:
        # 1. Seed Users
        demo_users = [
            {
                "email": "auditor@docutrace.io",
                "full_name": "Eleanor Vance (Senior Auditor)",
                "role": "auditor",
                "password": "DocuTrace@2026!",
            },
            {
                "email": "admin@docutrace.io",
                "full_name": "Marcus Sterling (Administrator)",
                "role": "admin",
                "password": "DocuTrace@2026!",
            },
            {
                "email": "auditor@gmail.com",
                "full_name": "Demo Auditor",
                "role": "auditor",
                "password": "DocuTrace@2026!",
            },
            {
                "email": "auditor@gmai.com",
                "full_name": "Demo Auditor",
                "role": "auditor",
                "password": "DocuTrace@2026!",
            },
        ]

        seeded_user_map = {}

        for u_data in demo_users:
            res = await db.execute(select(User).where(User.email == u_data["email"]))
            existing_user = res.scalar_one_or_none()
            if not existing_user:
                new_user = User(
                    email=u_data["email"],
                    full_name=u_data["full_name"],
                    role=u_data["role"],
                    hashed_password=get_password_hash(u_data["password"]),
                    is_active=True,
                    is_verified=True,
                )
                db.add(new_user)
                await db.flush()
                seeded_user_map[u_data["email"]] = new_user
            else:
                seeded_user_map[u_data["email"]] = existing_user

        await db.commit()

        # Check if documents already exist for primary auditor
        primary_user = seeded_user_map.get("auditor@docutrace.io") or seeded_user_map.get("auditor@gmail.com")
        if not primary_user:
            return

        doc_check = await db.execute(select(Document).where(Document.owner_id == primary_user.id))
        if doc_check.scalars().first():
            return  # Already seeded

        # 2. Seed Sample Invoices, POs & Contracts for Auditor
        os.makedirs("./storage/uploads", exist_ok=True)
        dummy_file_path = "./storage/uploads/sample_invoice_1042.pdf"
        if not os.path.exists(dummy_file_path):
            with open(dummy_file_path, "wb") as f:
                f.write(b"%PDF-1.4 sample synthetic invoice document for DocuTrace intelligence testing")

        # Document 1: ACME Supply Invoice
        doc1 = Document(
            owner_id=primary_user.id,
            filename="sample_invoice_1042.pdf",
            original_filename="INV-2026-1042-AcmeCorp.pdf",
            file_path=dummy_file_path,
            file_size=1048576,
            mime_type="application/pdf",
            file_hash="hash_inv_1042_acme",
            document_type="invoice",
            status="completed",
            page_count=2,
            summary="Vendor invoice from Acme Corp totaling $14,850.00 for IT hardware and server racks. Discrepancy detected in tax calculation.",
            doc_metadata={"vendor": "Acme Corp", "total": 14850.00, "po_ref": "PO-9081"},
        )
        db.add(doc1)
        await db.flush()

        # Document 2: ACME Purchase Order
        doc2 = Document(
            owner_id=primary_user.id,
            filename="sample_po_9081.pdf",
            original_filename="PO-9081-ServerHardware.pdf",
            file_path=dummy_file_path,
            file_size=786432,
            mime_type="application/pdf",
            file_hash="hash_po_9081_acme",
            document_type="po",
            status="completed",
            page_count=1,
            summary="Corporate Purchase Order #9081 approved for Acme Corp covering 10x Server Units at $1,200/unit (Approved Subtotal $12,000.00).",
            doc_metadata={"vendor": "Acme Corp", "approved_amount": 12000.00},
        )
        db.add(doc2)
        await db.flush()

        # Document 3: Master Services Agreement (Contract)
        doc3 = Document(
            owner_id=primary_user.id,
            filename="sample_contract_msa.pdf",
            original_filename="MSA-AcmeCorp-2026.pdf",
            file_path=dummy_file_path,
            file_size=2097152,
            mime_type="application/pdf",
            file_hash="hash_contract_msa",
            document_type="contract",
            status="completed",
            page_count=4,
            summary="Master Services Agreement with Acme Corp specifying Net-30 payment terms, 99.9% uptime SLA, and $5,000 late delivery penalty.",
            doc_metadata={"vendor": "Acme Corp", "terms": "Net-30"},
        )
        db.add(doc3)
        await db.flush()

        # 3. Seed Extracted Fields with Bounding Boxes
        fields_data = [
            # Doc 1 Fields
            ExtractedField(
                document_id=doc1.id,
                field_key="vendor_name",
                field_value="Acme Corporation Ltd.",
                normalized_value="Acme Corp",
                confidence_score=0.98,
                page_number=1,
                bbox=[50, 60, 260, 90],
                field_category="Vendor Details",
            ),
            ExtractedField(
                document_id=doc1.id,
                field_key="invoice_number",
                field_value="INV-2026-1042",
                normalized_value="INV-2026-1042",
                confidence_score=0.99,
                page_number=1,
                bbox=[420, 60, 580, 85],
                field_category="Header",
            ),
            ExtractedField(
                document_id=doc1.id,
                field_key="invoice_date",
                field_value="August 14, 2026",
                normalized_value="2026-08-14",
                confidence_score=0.95,
                page_number=1,
                bbox=[420, 95, 580, 115],
                field_category="Dates",
            ),
            ExtractedField(
                document_id=doc1.id,
                field_key="subtotal_amount",
                field_value="$12,000.00",
                normalized_value="12000.00",
                confidence_score=0.97,
                page_number=1,
                bbox=[400, 480, 590, 505],
                field_category="Financials",
            ),
            ExtractedField(
                document_id=doc1.id,
                field_key="tax_amount",
                field_value="$2,850.00",
                normalized_value="2850.00",
                confidence_score=0.91,
                page_number=1,
                bbox=[400, 510, 590, 535],
                field_category="Financials",
            ),
            ExtractedField(
                document_id=doc1.id,
                field_key="total_amount",
                field_value="$14,850.00",
                normalized_value="14850.00",
                confidence_score=0.99,
                page_number=1,
                bbox=[390, 545, 600, 575],
                field_category="Financials",
            ),
            ExtractedField(
                document_id=doc1.id,
                field_key="po_reference",
                field_value="PO-9081",
                normalized_value="PO-9081",
                confidence_score=0.88,
                page_number=1,
                bbox=[50, 180, 200, 205],
                field_category="Header",
            ),
            # Doc 3 (Contract) Fields
            ExtractedField(
                document_id=doc3.id,
                field_key="payment_terms",
                field_value="Net 30 Days from Invoice Receipt",
                normalized_value="Net-30",
                confidence_score=0.96,
                page_number=2,
                bbox=[60, 220, 450, 250],
                field_category="Contract Terms",
            ),
        ]
        db.add_all(fields_data)

        # 4. Seed Anomalies
        anom1 = AnomalyRecord(
            document_id=doc1.id,
            anomaly_type="tax_calculation_mismatch",
            severity="high",
            title="Tax Rate Calculation Inconsistency",
            description="The stated tax of $2,850.00 represents a 23.75% rate on $12,000 subtotal, exceeding standard statutory state tax rate of 10.00% ($1,200.00).",
            score=0.85,
            details={
                "expected_value": "$1,200.00 (10%)",
                "actual_value": "$2,850.00 (23.75%)",
                "page_number": 1,
                "bbox": [400, 510, 590, 535],
            },
            is_resolved=False,
        )
        anom2 = AnomalyRecord(
            document_id=doc1.id,
            anomaly_type="vendor_historical_outlier",
            severity="medium",
            title="Isolation Forest Statistical Amount Outlier",
            description="Historical invoices from Acme Corp average $4,200.00 with standard deviation $1,100.00. Current invoice ($14,850.00) is +3.1 sigma above historical mean.",
            score=0.68,
            details={
                "expected_value": "<$8,000.00",
                "actual_value": "$14,850.00",
                "page_number": 1,
                "bbox": [390, 545, 600, 575],
            },
            is_resolved=False,
        )
        db.add_all([anom1, anom2])

        # 5. Seed Obligations
        now = datetime.now(timezone.utc)
        obl1 = Obligation(
            document_id=doc3.id,
            clause_reference="Clause 4.2 (Payment Milestones)",
            title="Payment within Net-30 Days",
            description="Buyer must remit payment of undisputed invoices within thirty (30) calendar days of electronic receipt.",
            responsible_party="Internal Finance / Accounts Payable",
            due_date=now + timedelta(days=5),
            status="pending",
            category="payment",
            page_number=2,
            bbox=[60, 220, 450, 250],
        )
        obl2 = Obligation(
            document_id=doc3.id,
            clause_reference="Clause 8.1 (Service Level Agreement)",
            title="Quarterly Infrastructure Audit & 99.9% Uptime SLA",
            description="Vendor must deliver quarterly SOC2 audit compliance reports and maintain 99.9% cluster availability.",
            responsible_party="Acme Corp Technical Lead",
            due_date=now + timedelta(days=20),
            status="in_progress",
            category="compliance",
            page_number=3,
            bbox=[60, 310, 500, 345],
        )
        db.add_all([obl1, obl2])

        # 6. Seed Risk Score
        risk1 = RiskScore(
            document_id=doc1.id,
            overall_score=72,
            risk_level="high",
            factors={
                "summary": "High composite risk score driven by unexplained tax rate variance (+13.75%) and price outlier (+3.1 sigma) compared to vendor baseline.",
                "factors": [
                    {
                        "category": "Tax Math Discrepancy",
                        "weight": 0.45,
                        "score": 85,
                        "severity": "high",
                        "description": "Calculated tax exceeds expected statutory rate by $1,650.00.",
                    },
                    {
                        "category": "Historical Vendor Outlier",
                        "weight": 0.35,
                        "score": 68,
                        "severity": "medium",
                        "description": "Invoice amount is significantly higher than historical 12-month baseline.",
                    },
                    {
                        "category": "Missing Sign-Off Signature",
                        "weight": 0.20,
                        "score": 40,
                        "severity": "low",
                        "description": "Receiving warehouse confirmation signature pending.",
                    },
                ],
            },
        )
        db.add(risk1)

        # 7. Seed Document Set & 3-Way Reconciliation
        doc_set = DocumentSet(
            owner_id=primary_user.id,
            name="Acme Corp — Q3 Server Cluster Infrastructure",
            description="3-Way Reconciliation bundle for Server Hardware Expansion (INV-1042 + PO-9081 + MSA)",
        )
        db.add(doc_set)
        await db.flush()

        item1 = DocumentSetItem(document_set_id=doc_set.id, document_id=doc1.id, role_in_set="invoice")
        item2 = DocumentSetItem(document_set_id=doc_set.id, document_id=doc2.id, role_in_set="po")
        item3 = DocumentSetItem(document_set_id=doc_set.id, document_id=doc3.id, role_in_set="contract")
        db.add_all([item1, item2, item3])
        await db.flush()

        verif = VerificationResult(
            document_set_id=doc_set.id,
            status="mismatched",
            overall_summary="3-way reconciliation detected tax rate variance ($2,850.00 on invoice vs $1,200.00 PO estimate) and invoice total exceeding approved PO by +$1,650.00.",
            mismatch_count=2,
            details={
                "items_checked": 8,
                "passed_checks": 6,
                "mismatches": [
                    {
                        "field_name": "total_amount",
                        "severity": "high",
                        "description": "Invoice total ($14,850.00) exceeds PO approved total ($13,200.00 with standard tax) by +$1,650.00.",
                        "values": {"invoice": "$14,850.00", "po": "$13,200.00", "delta": "+$1,650.00"},
                    },
                    {
                        "field_name": "tax_rate",
                        "severity": "medium",
                        "description": "Tax rate charged is 23.75% vs contracted 10.00%.",
                        "values": {"invoice_tax": "$2,850.00 (23.75%)", "contract_tax": "$1,200.00 (10.00%)"},
                    },
                ],
            },
        )
        db.add(verif)

        # 8. Seed Action Tasks
        task1 = ActionTask(
            owner_id=primary_user.id,
            assignee_id=primary_user.id,
            document_id=doc1.id,
            anomaly_id=anom1.id,
            title="Clarify 23.75% Tax Discrepancy with Acme Corp Billing",
            description="Contact Acme Corp accounts receivable to request an updated credit memo or revised invoice reflecting the 10% tax rate.",
            due_date=now + timedelta(days=3),
            priority="high",
            status="pending",
        )
        task2 = ActionTask(
            owner_id=primary_user.id,
            assignee_id=primary_user.id,
            document_id=doc3.id,
            obligation_id=obl1.id,
            title="Approve Net-30 Payment Schedule for Server Expansion",
            description="Schedule final wire transfer pending approval of revised credit memo.",
            due_date=now + timedelta(days=10),
            priority="medium",
            status="in_progress",
        )
        db.add_all([task1, task2])

        await db.commit()
        logger.info("Demo intelligence data successfully seeded!")
