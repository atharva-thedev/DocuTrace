import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from datetime import datetime
from loguru import logger

class DocuTraceMLInferenceService:
    """Production ML Inference Service for Document Classification, Status Risk Scoring, and Trace Anomaly Detection."""
    
    _doc_type_model = None
    _status_model = None
    _trace_anomaly_model = None
    
    @classmethod
    def _get_model_path(cls, filename: str) -> Optional[str]:
        candidates = [
            os.path.join(os.path.dirname(__file__), "..", "models_ml", filename),
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml", "models", filename),
            os.path.join("ml", "models", filename),
            os.path.join("backend", "app", "models_ml", filename)
        ]
        for path in candidates:
            norm_path = os.path.abspath(path)
            if os.path.exists(norm_path):
                return norm_path
        return None

    @classmethod
    def get_document_type_model(cls):
        if cls._doc_type_model is None:
            path = cls._get_model_path("document_type_classifier.joblib")
            if path and os.path.exists(path):
                cls._doc_type_model = joblib.load(path)
                logger.info(f"Loaded ML Document Type Classifier from {path}")
            else:
                logger.warning("Document type model artifact not found.")
        return cls._doc_type_model

    @classmethod
    def get_status_model(cls):
        if cls._status_model is None:
            path = cls._get_model_path("status_risk_model.joblib")
            if path and os.path.exists(path):
                cls._status_model = joblib.load(path)
                logger.info(f"Loaded ML Status & Risk Model from {path}")
            else:
                logger.warning("Status risk model artifact not found.")
        return cls._status_model

    @classmethod
    def get_trace_anomaly_model(cls):
        if cls._trace_anomaly_model is None:
            path = cls._get_model_path("trace_anomaly_detector.joblib")
            if path and os.path.exists(path):
                cls._trace_anomaly_model = joblib.load(path)
                logger.info(f"Loaded ML Trace Anomaly Detector from {path}")
            else:
                logger.warning("Trace anomaly model artifact not found.")
        return cls._trace_anomaly_model

    @classmethod
    def classify_document(
        cls,
        title: str,
        text_snippet: str = "",
        issuer: str = "",
        recipient: str = "",
        email_domain: str = ""
    ) -> Dict[str, Any]:
        """
        Classify an incoming document into one of the 10 DocuTrace document types with calibrated probabilities.
        """
        model = cls.get_document_type_model()
        combined_text = f"{title} {issuer} {recipient} {email_domain} {text_snippet}".strip()
        
        if model is None:
            # Fallback heuristic
            title_lower = title.lower()
            if "invoice" in title_lower:
                return {"predicted_type": "invoice", "confidence": 0.90, "top_classes": []}
            elif "contract" in title_lower or "agreement" in title_lower:
                return {"predicted_type": "Legal Contract", "confidence": 0.88, "top_classes": []}
            return {"predicted_type": "general_document", "confidence": 0.50, "top_classes": []}
            
        probas = model.predict_proba([combined_text])[0]
        classes = model.classes_
        
        top_idx = np.argsort(probas)[::-1]
        best_class = classes[top_idx[0]]
        best_conf = float(probas[top_idx[0]])
        
        top_classes = [
            {"document_type": classes[i], "probability": round(float(probas[i]), 4)}
            for i in top_idx[:3]
        ]
        
        return {
            "predicted_type": best_class,
            "confidence": round(best_conf, 4),
            "top_classes": top_classes
        }

    @classmethod
    def predict_verification_risk(
        cls,
        document_type: str,
        issuer_name: str,
        recipient_email: str,
        duration_hours: float = 24.0
    ) -> Dict[str, Any]:
        """
        Predict document lifecycle verification status and compute risk level.
        """
        model = cls.get_status_model()
        email_domain = recipient_email.split('@')[-1] if '@' in recipient_email else 'unknown'
        
        input_df = pd.DataFrame([{
            "document_type": document_type,
            "issuer_name": issuer_name,
            "email_domain": email_domain,
            "duration_hours": float(duration_hours)
        }])
        
        if model is None:
            return {
                "predicted_status": "Issued",
                "risk_level": "low",
                "risk_score": 15,
                "is_high_risk": False
            }
            
        pred_status = model.predict(input_df)[0]
        probas = model.predict_proba(input_df)[0]
        prob_dict = {cls_name: round(float(p), 4) for cls_name, p in zip(model.classes_, probas)}
        
        # Risk assessment mapping
        is_high_risk = pred_status in ["Revoked", "Expired"]
        risk_level = "critical" if pred_status == "Revoked" else "high" if pred_status == "Expired" else "low" if pred_status == "Verified" else "medium"
        risk_score = 90 if pred_status == "Revoked" else 65 if pred_status == "Expired" else 15 if pred_status == "Verified" else 35
        
        return {
            "predicted_status": pred_status,
            "status_probabilities": prob_dict,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "is_high_risk": is_high_risk
        }

    @classmethod
    def inspect_trace_integrity(
        cls,
        sha256_hash: str,
        blockchain_tx_id: str,
        duration_hours: float,
        created_at: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Evaluate cryptographic integrity and detect anomalous ledger transactions.
        """
        model = cls.get_trace_anomaly_model()
        dt = created_at or datetime.now()
        
        features = np.array([[
            float(duration_hours),
            float(len(str(sha256_hash))),
            float(len(str(blockchain_tx_id))),
            float(dt.hour if hasattr(dt, 'hour') else 12),
            float(dt.weekday() if hasattr(dt, 'weekday') else 0)
        ]])
        
        if model is None:
            return {"is_anomalous": False, "anomaly_score": 0.0, "status": "valid"}
            
        pred = model.predict(features)[0]
        score = -float(model.decision_function(features)[0])
        
        is_anomalous = bool(pred == -1)
        
        return {
            "is_anomalous": is_anomalous,
            "anomaly_score": round(score, 4),
            "status": "flagged_suspicious" if is_anomalous else "verified_valid"
        }

    # =========================================================================
    # MONGODB PERSISTENCE & AUDIT TRAIL METHODS
    # =========================================================================

    @classmethod
    async def log_prediction_async(cls, payload: Dict[str, Any]) -> Optional[str]:
        """Persist an ML inference result asynchronously to MongoDB Atlas."""
        try:
            from app.core.mongodb import MongoDBManager
            db = MongoDBManager.get_async_db()
            if db is not None:
                record = {**payload, "logged_at": datetime.utcnow().isoformat()}
                res = await db.ml_predictions.insert_one(record)
                logger.info(f"Persisted ML prediction to MongoDB [ID: {res.inserted_id}]")
                return str(res.inserted_id)
        except Exception as e:
            logger.error(f"Error logging ML prediction to MongoDB: {e}")
        return None

    @classmethod
    def log_prediction_sync(cls, payload: Dict[str, Any]) -> Optional[str]:
        """Persist an ML inference result synchronously to MongoDB Atlas."""
        try:
            from app.core.mongodb import MongoDBManager
            db = MongoDBManager.get_sync_db()
            if db is not None:
                record = {**payload, "logged_at": datetime.utcnow().isoformat()}
                res = db.ml_predictions.insert_one(record)
                logger.info(f"Persisted ML prediction to MongoDB [ID: {res.inserted_id}]")
                return str(res.inserted_id)
        except Exception as e:
            logger.error(f"Error synchronously logging ML prediction to MongoDB: {e}")
        return None

    @classmethod
    async def evaluate_and_log_document(
        cls,
        document_id: str,
        title: str,
        text_snippet: str = "",
        issuer_name: str = "",
        recipient_name: str = "",
        recipient_email: str = "",
        sha256_hash: str = "",
        blockchain_tx_id: str = "",
        duration_hours: float = 24.0,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run multi-model ML inference (Classification + Status Risk + Trace Integrity)
        and automatically persist the complete telemetry bundle to MongoDB Atlas.
        """
        email_domain = recipient_email.split('@')[-1] if '@' in recipient_email else 'unknown'
        
        # 1. Document Type Classification
        classification = cls.classify_document(
            title=title,
            text_snippet=text_snippet,
            issuer=issuer_name,
            recipient=recipient_name,
            email_domain=email_domain
        )
        
        # 2. Status & Risk Scoring
        risk_scoring = cls.predict_verification_risk(
            document_type=classification["predicted_type"],
            issuer_name=issuer_name,
            recipient_email=recipient_email,
            duration_hours=duration_hours
        )
        
        # 3. Cryptographic Ledger Integrity
        trace_integrity = cls.inspect_trace_integrity(
            sha256_hash=sha256_hash,
            blockchain_tx_id=blockchain_tx_id,
            duration_hours=duration_hours
        )
        
        # Assemble complete document ML profile
        ml_profile = {
            "document_id": document_id,
            "document_title": title,
            "issuer_name": issuer_name,
            "recipient_name": recipient_name,
            "recipient_email": recipient_email,
            "classification": classification,
            "risk_assessment": risk_scoring,
            "trace_integrity": trace_integrity,
            "evaluated_at": datetime.utcnow().isoformat(),
            "user_id": user_id
        }
        
        # Async persist to MongoDB
        mongo_id = await cls.log_prediction_async(ml_profile)
        ml_profile["mongodb_id"] = mongo_id
        
        return ml_profile

    @classmethod
    async def get_prediction_history(cls, limit: int = 50, filter_query: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Retrieve recent ML predictions from MongoDB Atlas."""
        try:
            from app.core.mongodb import MongoDBManager
            db = MongoDBManager.get_async_db()
            if db is not None:
                query = filter_query or {}
                cursor = db.ml_predictions.find(query, {"_id": 0}).sort("logged_at", -1).limit(limit)
                return await cursor.to_list(length=limit)
        except Exception as e:
            logger.error(f"Error fetching ML predictions from MongoDB: {e}")
        return []

