"""
DocuTrace ML Probability & Inference Testing Utility
Evaluates the ML models and outputs detailed class probabilities, confidence scores,
risk distributions, and anomaly scores.
"""

import sys
import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

# Adjust path for backend service imports if needed
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
from app.services.ml_classifier_service import DocuTraceMLInferenceService

def run_probability_tests():
    print("=" * 80)
    print("      DOCUTRACE ML MODEL PROBABILITY & INFERENCE TEST SUITE")
    print("=" * 80)

    # -------------------------------------------------------------------------
    # TEST 1: DOCUMENT TYPE CLASSIFIER PROBABILITIES (Multi-Class NLP)
    # -------------------------------------------------------------------------
    print("\n[TEST 1] Document Type Classifier - Class Probabilities & Top Predictions")
    print("-" * 80)
    
    test_docs = [
        {
            "title": "Employment Verification - Marcus Lopez",
            "issuer": "Beacon Registry Services",
            "recipient": "Marcus Lopez",
            "domain": "corpmail.org"
        },
        {
            "title": "Commercial Lease Agreement - Apex Corp",
            "issuer": "Apex Legal Group",
            "recipient": "Sarah Jenkins",
            "domain": "company.com"
        },
        {
            "title": "Annual Tax Filing 2024 - Form 1040",
            "issuer": "State Tax Authority",
            "recipient": "David Vance",
            "domain": "trustnet.io"
        },
        {
            "title": "Quarterly Financial Statement Q2 Balance Sheet",
            "issuer": "Meridian Document Custody",
            "recipient": "Elena Rostova",
            "domain": "example.com"
        },
        {
            "title": "Official Academic Transcript - MIT Master of Science",
            "issuer": "Global Education Registry",
            "recipient": "Liam O'Connor",
            "domain": "corpmail.org"
        },
        {
            "title": "Patient Clinical Summary - ER Hospital Discharge",
            "issuer": "Metro Health Data Hub",
            "recipient": "Rachel Green",
            "domain": "company.com"
        },
        {
            "title": "Digital Passport Identity Credential & Citizenship",
            "issuer": "National Identity Bureau",
            "recipient": "Kenji Sato",
            "domain": "trustnet.io"
        },
        {
            "title": "Residential Property Real Estate Deed - Lot 42",
            "issuer": "County Land Registry",
            "recipient": "Maria Garcia",
            "domain": "example.com"
        },
        {
            "title": "Autonomous Navigation AI System Patent Filing",
            "issuer": "Global IP Office",
            "recipient": "Arthur Pendelton",
            "domain": "corpmail.org"
        },
        {
            "title": "ISO 27001 Information Security Compliance Certificate",
            "issuer": "TrustVerify Standards",
            "recipient": "Chloe Bennett",
            "domain": "company.com"
        },
        # Tricky / Edge case
        {
            "title": "Contractor Service Agreement & Wage Verification",
            "issuer": "Beacon Registry Services",
            "recipient": "Alex Morgan",
            "domain": "enterprise.net"
        }
    ]

    for i, doc in enumerate(test_docs, 1):
        res = DocuTraceMLInferenceService.classify_document(
            title=doc["title"],
            issuer=doc["issuer"],
            recipient=doc["recipient"],
            email_domain=doc["domain"]
        )
        print(f"\n({i}) Input Title: '{doc['title']}'")
        print(f"    Predicted Type : {res['predicted_type']} (Confidence: {res['confidence']*100:.2f}%)")
        print("    Class Probability Distribution (Top 3):")
        for tc in res["top_classes"]:
            bar_len = int(tc["probability"] * 30)
            bar = "#" * bar_len + "-" * (30 - bar_len)
            print(f"      - {tc['document_type']:<26} [{bar}] {tc['probability']*100:>6.2f}%")

    # -------------------------------------------------------------------------
    # TEST 2: STATUS RISK PREDICTOR PROBABILITIES (5 Lifecycle Classes)
    # -------------------------------------------------------------------------
    print("\n" + "=" * 80)
    print("[TEST 2] Verification Status & Risk Model - Full Probability Breakdown")
    print("-" * 80)

    test_scenarios = [
        {
            "doc_type": "Employment Verification",
            "issuer": "Beacon Registry Services",
            "email": "user@corpmail.org",
            "duration": 4.5,
            "desc": "Standard normal duration (~4.5h)"
        },
        {
            "doc_type": "Legal Contract",
            "issuer": "Apex Legal Group",
            "email": "john.doe@company.com",
            "duration": 0.2,
            "desc": "Instantaneous turnaround (<15m, typical for Pending/Anomalous)"
        },
        {
            "doc_type": "Real Estate Deed",
            "issuer": "County Land Registry",
            "email": "seller@example.com",
            "duration": 280.0,
            "desc": "Long duration (~11.6 days, typical for Expired/Revoked)"
        }
    ]

    for i, sc in enumerate(test_scenarios, 1):
        res = DocuTraceMLInferenceService.predict_verification_risk(
            document_type=sc["doc_type"],
            issuer_name=sc["issuer"],
            recipient_email=sc["email"],
            duration_hours=sc["duration"]
        )
        print(f"\n({i}) Scenario: {sc['desc']}")
        print(f"    Type: {sc['doc_type']} | Issuer: {sc['issuer']} | Duration: {sc['duration']} hrs")
        print(f"    --> Predicted Status: {res['predicted_status']} | Risk Level: {res['risk_level'].upper()} (Score: {res['risk_score']}/100)")
        print("    --> Status Class Probabilities:")
        for status_class, prob in sorted(res["status_probabilities"].items(), key=lambda x: x[1], reverse=True):
            bar_len = int(prob * 30)
            bar = "#" * bar_len + "-" * (30 - bar_len)
            print(f"        * {status_class:<12} [{bar}] {prob*100:>6.2f}%")

    # -------------------------------------------------------------------------
    # TEST 3: CRYPTOGRAPHIC LEDGER TRACE ANOMALY DETECTOR
    # -------------------------------------------------------------------------
    print("\n" + "=" * 80)
    print("[TEST 3] Cryptographic Ledger Anomaly Detector (IsolationForest)")
    print("-" * 80)

    test_traces = [
        {
            "desc": "Valid Authentic Ledger Record",
            "hash": "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01",
            "tx": "0x111122223333444455556666777788889999aaaabbbbccccddddeeeeffff000011",
            "duration": 18.5,
            "created_at": datetime(2025, 4, 15, 14, 30)
        },
        {
            "desc": "Tampered / Corrupted Hash Length (Suspicious)",
            "hash": "short_invalid_hash_value",
            "tx": "0x0001",
            "duration": 950.0,
            "created_at": datetime(2025, 4, 15, 3, 0)
        }
    ]

    for i, trace in enumerate(test_traces, 1):
        res = DocuTraceMLInferenceService.inspect_trace_integrity(
            sha256_hash=trace["hash"],
            blockchain_tx_id=trace["tx"],
            duration_hours=trace["duration"],
            created_at=trace["created_at"]
        )
        print(f"\n({i}) Trace Case: {trace['desc']}")
        print(f"    Duration: {trace['duration']} hrs | Hash Length: {len(trace['hash'])} | Tx Length: {len(trace['tx'])}")
        print(f"    --> Is Anomalous   : {res['is_anomalous']}")
        print(f"    --> Anomaly Score  : {res['anomaly_score']:+.4f} (Higher positive = higher anomaly probability)")
        print(f"    --> Status Label   : {res['status']}")

    print("\n" + "=" * 80)
    print("      ALL MODEL PROBABILITY TESTS COMPLETED SUCCESSFULLY")
    print("=" * 80)

if __name__ == "__main__":
    run_probability_tests()
