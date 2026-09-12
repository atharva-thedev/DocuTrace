import pytest
from app.services.extraction_service import InformationExtractionService
from app.services.verification_service import CrossDocumentVerificationService
from app.services.anomaly_service import FinancialAnomalyDetectionService
from app.services.obligation_service import ObligationExtractionService
from app.services.risk_engine import ExplainableRiskScoringEngine
from app.services.rag_qa_service import EvidenceGroundedQAService
from app.models.document import Document
from app.models.extraction import ExtractedField

def test_information_extraction_invoice():
    sample_invoice_text = """
    ACME INDUSTRIAL SUPPLIES
    Invoice Number: INV-2026-9081
    Vendor: Acme Supplies LLC
    Bill To: Global Tech Enterprises
    Invoice Date: 2026-09-01
    Due Date: 2026-09-30
    Payment Terms: Net 30
    PO Number: PO-88214
    Tax ID: US-9928172

    Subtotal: $4,500.00
    Tax (10%): $450.00
    Total Amount: $4,950.00
    """

    mock_pages = [{
        "page_number": 1,
        "text": sample_invoice_text,
        "chunks": [{"page_number": 1, "bbox": [50.0, 100.0, 300.0, 120.0], "text": sample_invoice_text[:100]}]
    }]

    fields = InformationExtractionService.extract_fields(sample_invoice_text, "invoice", mock_pages)
    field_keys = {f["field_key"]: f for f in fields}

    assert "total_amount" in field_keys
    assert field_keys["total_amount"]["normalized_value"] == "4950.0"
    assert "invoice_number" in field_keys
    assert field_keys["invoice_number"]["field_value"] == "INV-2026-9081"
    assert "vendor_name" in field_keys
    assert "Acme" in field_keys["vendor_name"]["field_value"]

def test_cross_document_verification_mismatch():
    inv_doc = Document(id="doc-inv-1", filename="invoice.pdf", document_type="invoice")
    po_doc = Document(id="doc-po-1", filename="purchase_order.pdf", document_type="po")

    inv_fields = [
        ExtractedField(document_id="doc-inv-1", field_key="total_amount", field_value="$5,200.00", normalized_value="5200.00"),
        ExtractedField(document_id="doc-inv-1", field_key="vendor_name", field_value="Acme Corp"),
        ExtractedField(document_id="doc-inv-1", field_key="po_number", field_value="PO-999")
    ]
    po_fields = [
        ExtractedField(document_id="doc-po-1", field_key="total_amount", field_value="$4,500.00", normalized_value="4500.00"),
        ExtractedField(document_id="doc-po-1", field_key="vendor_name", field_value="Acme Corp"),
        ExtractedField(document_id="doc-po-1", field_key="po_number", field_value="PO-999")
    ]

    docs_with_fields = [
        {"document": inv_doc, "fields": inv_fields},
        {"document": po_doc, "fields": po_fields},
    ]

    result = CrossDocumentVerificationService.verify_document_set(docs_with_fields)
    assert result["status"] == "failed"
    assert result["mismatch_count"] >= 1
    assert result["details"]["mismatches"][0]["field"] == "total_amount"

def test_anomaly_detection_math_inconsistency():
    doc = Document(id="doc-math-1", filename="broken_invoice.pdf", document_type="invoice")
    fields = [
        ExtractedField(document_id="doc-math-1", field_key="subtotal_amount", field_value="$1,000.00", normalized_value="1000.00"),
        ExtractedField(document_id="doc-math-1", field_key="tax_amount", field_value="$100.00", normalized_value="100.00"),
        ExtractedField(document_id="doc-math-1", field_key="total_amount", field_value="$1,500.00", normalized_value="1500.00"),  # Expected: 1100
        ExtractedField(document_id="doc-math-1", field_key="invoice_number", field_value="INV-100"),
        ExtractedField(document_id="doc-math-1", field_key="invoice_date", field_value="2026-09-01"),
        ExtractedField(document_id="doc-math-1", field_key="vendor_name", field_value="Supplier X"),
        ExtractedField(document_id="doc-math-1", field_key="tax_id", field_value="US-12345"),
    ]

    anomalies = FinancialAnomalyDetectionService.detect_anomalies(doc, fields)
    math_anomalies = [a for a in anomalies if a["anomaly_type"] == "math_mismatch"]
    assert len(math_anomalies) == 1
    assert math_anomalies[0]["severity"] == "critical"

def test_explainable_risk_scoring():
    anomalies = [
        {"title": "Math Error", "anomaly_type": "math_mismatch", "severity": "critical", "description": "Total discrepancy"}
    ]
    obligations = []
    
    score_res = ExplainableRiskScoringEngine.calculate_risk_score(anomalies, obligations, verification_mismatches=1)
    assert score_res["overall_score"] >= 55
    assert score_res["risk_level"] in ["high", "critical"]
    assert len(score_res["factors"]["breakdown"]) >= 2

def test_evidence_grounded_qa():
    doc = Document(id="doc-123", filename="Acme_Invoice.pdf", document_type="invoice")
    fields = [
        ExtractedField(document_id="doc-123", field_key="total_amount", field_value="$4,950.00", confidence_score=0.98, page_number=1, bbox=[50.0, 100.0, 200.0, 120.0])
    ]

    qa_res = EvidenceGroundedQAService.answer_query(
        query="What is the total amount due?",
        document=doc,
        fields=fields
    )

    assert "$4,950.00" in qa_res["answer"]
    assert len(qa_res["citations"]) == 1
    assert qa_res["citations"][0]["document_id"] == "doc-123"
    assert qa_res["citations"][0]["page_number"] == 1
