import pytest
import time
from app.services.ml_classifier_service import DocuTraceMLInferenceService

def test_ml_document_type_classifier_loading():
    model = DocuTraceMLInferenceService.get_document_type_model()
    assert model is not None
    assert hasattr(model, 'predict')

def test_ml_document_type_prediction_accuracy():
    # Test sample 1: Legal Contract
    res1 = DocuTraceMLInferenceService.classify_document(
        title="Master Services Legal Contract - Ortiz",
        issuer="Nexus Legal Documents",
        recipient="Jeffrey Ortiz",
        email_domain="example.com"
    )
    assert res1["predicted_type"] == "Legal Contract"
    assert res1["confidence"] > 0.50
    assert len(res1["top_classes"]) == 3

    # Test sample 2: Compliance Certificate
    res2 = DocuTraceMLInferenceService.classify_document(
        title="ISO 27001 Compliance Certificate - Williams",
        issuer="TrustVerify Standards",
        recipient="Paul Williams",
        email_domain="globalid.org"
    )
    assert res2["predicted_type"] == "Compliance Certificate"
    assert res2["confidence"] > 0.50

    # Test sample 3: Employment Verification
    res3 = DocuTraceMLInferenceService.classify_document(
        title="Employment Verification - Rogers",
        issuer="Beacon Registry Services",
        recipient="Timothy Rogers",
        email_domain="globalid.org"
    )
    assert res3["predicted_type"] == "Employment Verification"

def test_ml_status_risk_prediction():
    res = DocuTraceMLInferenceService.predict_verification_risk(
        document_type="Legal Contract",
        issuer_name="Nexus Legal Documents",
        recipient_email="test@corpmail.org",
        duration_hours=24.5
    )
    assert "predicted_status" in res
    assert "risk_level" in res
    assert "risk_score" in res
    assert isinstance(res["is_high_risk"], bool)

def test_ml_trace_anomaly_detection():
    # Normal transaction with 64-char sha256 hash and 66-char tx id
    normal_res = DocuTraceMLInferenceService.inspect_trace_integrity(
        sha256_hash="ad2ffc6e2e566bf0800edd65c35967cacf3a1f6f306ca920964ba2acab9fdc16",
        blockchain_tx_id="0x2497802586a8eefe93ef848a859a17a071a4af52ad8b0bf1c325ddd9b5cf21ef",
        duration_hours=36.5
    )
    assert "is_anomalous" in normal_res
    assert "anomaly_score" in normal_res
    assert normal_res["status"] in ["verified_valid", "flagged_suspicious"]

    # Corrupted / Extreme anomalous transaction (abnormal hash length and 10000hr duration)
    anom_res = DocuTraceMLInferenceService.inspect_trace_integrity(
        sha256_hash="invalid_short_hash",
        blockchain_tx_id="0x123",
        duration_hours=9999.0
    )
    assert anom_res["is_anomalous"] is True
    assert anom_res["status"] == "flagged_suspicious"

def test_ml_inference_speed():
    start = time.time()
    for _ in range(20):
        DocuTraceMLInferenceService.classify_document(
            title="Academic Certificate - Taylor",
            issuer="Apex Educational Board",
            recipient="Patrick Taylor"
        )
    elapsed = time.time() - start
    avg_ms = (elapsed / 20) * 1000
    assert avg_ms < 25.0  # <25ms per inference
