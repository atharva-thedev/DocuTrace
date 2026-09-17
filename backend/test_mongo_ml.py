import asyncio
import sys
from app.services.ml_classifier_service import DocuTraceMLInferenceService
from app.core.mongodb import MongoDBManager

async def test_ml_to_mongodb():
    print("=" * 70)
    print("[*] Testing DocuTrace ML Inference -> MongoDB Atlas Logging Pipeline")
    print("=" * 70)

    # 1. Run full ML evaluation on a test document
    doc_payload = {
        "document_id": "DOC-MONGOTEST-001",
        "title": "Employment Verification - Marcus Lopez",
        "issuer_name": "Beacon Registry Services",
        "recipient_name": "Marcus Lopez",
        "recipient_email": "m.lopez@corpmail.org",
        "sha256_hash": "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01",
        "blockchain_tx_id": "0x111122223333444455556666777788889999aaaabbbbccccddddeeeeffff000011",
        "duration_hours": 3.5,
        "user_id": "usr_test_atharva"
    }

    print("\n[Step 1] Running ML models & logging to MongoDB Atlas...")
    result = await DocuTraceMLInferenceService.evaluate_and_log_document(**doc_payload)
    
    print(f"   [+] Predicted Document Type: {result['classification']['predicted_type']} ({result['classification']['confidence']*100:.1f}%)")
    print(f"   [+] Predicted Status       : {result['risk_assessment']['predicted_status']} (Risk Level: {result['risk_assessment']['risk_level']})")
    print(f"   [+] Trace Integrity Status : {result['trace_integrity']['status']}")
    print(f"   [+] MongoDB Inserted ID    : {result.get('mongodb_id')}")

    if not result.get("mongodb_id"):
        print("[FAIL] Failed to obtain MongoDB inserted ID.")
        return False

    # 2. Query prediction back from MongoDB Atlas
    print("\n[Step 2] Querying prediction history from MongoDB Atlas...")
    history = await DocuTraceMLInferenceService.get_prediction_history(limit=5)
    print(f"   [+] Successfully fetched {len(history)} record(s) from MongoDB collection 'ml_predictions':")
    for rec in history[:3]:
        print(f"       - Doc: {rec.get('document_id')} | Type: {rec.get('classification', {}).get('predicted_type')} | Logged: {rec.get('logged_at')}")

    await MongoDBManager.close_connections()
    print("\n[OK] Pipeline verified! ML Predictions are actively connected to MongoDB Atlas.")
    return True

if __name__ == "__main__":
    success = asyncio.run(test_ml_to_mongodb())
    sys.exit(0 if success else 1)
