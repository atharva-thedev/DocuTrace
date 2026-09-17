import os
import sys
import json
import time
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier, IsolationForest, RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_auc_score
)

def build_and_train_models():
    start_time = time.time()
    print("=" * 80)
    print("   DOCUTRACE MACHINE LEARNING TRAINING & EVALUATION PIPELINE")
    print("=" * 80)
    
    # Create output directories
    os.makedirs('ml/models', exist_ok=True)
    os.makedirs('backend/app/models_ml', exist_ok=True)
    
    # 1. Load Dataset
    csv_path = 'ml/doctrace_50k_mock_data.csv'
    print(f"\n[Step 1] Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    total_rows = len(df)
    print(f"         Total records loaded: {total_rows:,}")
    
    # 2. Feature Engineering
    print("\n[Step 2] Engineering features...")
    df['created_at'] = pd.to_datetime(df['created_at'])
    df['updated_at'] = pd.to_datetime(df['updated_at'])
    df['duration_hours'] = (df['updated_at'] - df['created_at']).dt.total_seconds() / 3600.0
    df['email_domain'] = df['recipient_email'].apply(lambda x: x.split('@')[-1] if '@' in str(x) else 'unknown')
    df['text_content'] = df['document_title'] + " " + df['issuer_name'] + " " + df['recipient_name'] + " " + df['email_domain']
    
    # =========================================================================
    # MODEL 1: DOCUMENT TYPE CLASSIFIER (Multi-Class NLP)
    # =========================================================================
    print("\n" + "-" * 80)
    print("[Step 3] Training Model 1: Document Type Multi-Class Classifier (10 Categories)")
    print("-" * 80)
    
    X_text = df['text_content']
    y_doctype = df['document_type']
    
    X_train_text, X_test_text, y_train_doc, y_test_doc = train_test_split(
        X_text, y_doctype, test_size=0.20, random_state=42, stratify=y_doctype
    )
    
    doc_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=10000, sublinear_tf=True)),
        ('clf', LogisticRegression(max_iter=500, C=1.0, random_state=42, n_jobs=-1))
    ])
    
    doc_pipeline.fit(X_train_text, y_train_doc)
    
    # Evaluate Document Type Classifier
    y_train_doc_pred = doc_pipeline.predict(X_train_text)
    y_test_doc_pred = doc_pipeline.predict(X_test_text)
    y_test_doc_proba = doc_pipeline.predict_proba(X_test_text)
    
    doc_train_acc = accuracy_score(y_train_doc, y_train_doc_pred)
    doc_test_acc = accuracy_score(y_test_doc, y_test_doc_pred)
    doc_precision = precision_score(y_test_doc, y_test_doc_pred, average='weighted')
    doc_recall = recall_score(y_test_doc, y_test_doc_pred, average='weighted')
    doc_f1_macro = f1_score(y_test_doc, y_test_doc_pred, average='macro')
    doc_f1_weighted = f1_score(y_test_doc, y_test_doc_pred, average='weighted')
    doc_roc_auc = roc_auc_score(pd.get_dummies(y_test_doc), y_test_doc_proba, multi_class='ovr', average='weighted')
    
    print(f"    Train Accuracy: {doc_train_acc*100:.2f}% | Test Accuracy: {doc_test_acc*100:.2f}%")
    print(f"    Weighted Precision: {doc_precision*100:.2f}% | Weighted Recall: {doc_recall*100:.2f}%")
    print(f"    Macro F1-Score: {doc_f1_macro*100:.2f}% | Weighted F1-Score: {doc_f1_weighted*100:.2f}%")
    print(f"    ROC-AUC (One-vs-Rest): {doc_roc_auc*100:.2f}%")
    
    # Save Model 1
    doc_model_path = 'ml/models/document_type_classifier.joblib'
    backend_doc_model_path = 'backend/app/models_ml/document_type_classifier.joblib'
    joblib.dump(doc_pipeline, doc_model_path)
    joblib.dump(doc_pipeline, backend_doc_model_path)
    print(f"    [+] Saved model to: {doc_model_path}")
    
    # Generate & Save Document Type Confusion Matrix
    cm_doc = confusion_matrix(y_test_doc, y_test_doc_pred, labels=doc_pipeline.classes_)
    plt.figure(figsize=(10, 8))
    plt.imshow(cm_doc, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('DocuTrace Document Type Classifier - Confusion Matrix', fontsize=14, pad=15)
    plt.colorbar()
    tick_marks = np.arange(len(doc_pipeline.classes_))
    plt.xticks(tick_marks, doc_pipeline.classes_, rotation=45, ha='right', fontsize=9)
    plt.yticks(tick_marks, doc_pipeline.classes_, fontsize=9)
    plt.ylabel('Actual Document Type', fontsize=11)
    plt.xlabel('Predicted Document Type', fontsize=11)
    plt.tight_layout()
    plt.savefig('ml/doc_type_confusion_matrix.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # =========================================================================
    # MODEL 2: STATUS & COMPLIANCE RISK CLASSIFIER (5 Status Classes)
    # =========================================================================
    print("\n" + "-" * 80)
    print("[Step 4] Training Model 2: Verification Status & Risk Predictor (5 Categories)")
    print("-" * 80)
    
    # Feature columns for status prediction
    categorical_features = ['document_type', 'issuer_name', 'email_domain']
    numerical_features = ['duration_hours']
    
    X_status = df[categorical_features + numerical_features]
    y_status = df['status']
    
    X_train_st, X_test_st, y_train_st, y_test_st = train_test_split(
        X_status, y_status, test_size=0.20, random_state=42, stratify=y_status
    )
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features),
            ('num', StandardScaler(), numerical_features)
        ]
    )
    
    status_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('clf', RandomForestClassifier(
            n_estimators=100,
            max_depth=15,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        ))
    ])
    
    status_pipeline.fit(X_train_st, y_train_st)
    
    y_train_st_pred = status_pipeline.predict(X_train_st)
    y_test_st_pred = status_pipeline.predict(X_test_st)
    y_test_st_proba = status_pipeline.predict_proba(X_test_st)
    
    st_train_acc = accuracy_score(y_train_st, y_train_st_pred)
    st_test_acc = accuracy_score(y_test_st, y_test_st_pred)
    st_precision = precision_score(y_test_st, y_test_st_pred, average='weighted', zero_division=0)
    st_recall = recall_score(y_test_st, y_test_st_pred, average='weighted', zero_division=0)
    st_f1_macro = f1_score(y_test_st, y_test_st_pred, average='macro', zero_division=0)
    st_f1_weighted = f1_score(y_test_st, y_test_st_pred, average='weighted', zero_division=0)
    
    print(f"    Train Accuracy: {st_train_acc*100:.2f}% | Test Accuracy: {st_test_acc*100:.2f}%")
    print(f"    Weighted Precision: {st_precision*100:.2f}% | Weighted Recall: {st_recall*100:.2f}%")
    print(f"    Macro F1-Score: {st_f1_macro*100:.2f}% | Weighted F1-Score: {st_f1_weighted*100:.2f}%")
    
    # Save Model 2
    status_model_path = 'ml/models/status_risk_model.joblib'
    backend_status_model_path = 'backend/app/models_ml/status_risk_model.joblib'
    joblib.dump(status_pipeline, status_model_path)
    joblib.dump(status_pipeline, backend_status_model_path)
    print(f"    [+] Saved model to: {status_model_path}")
    
    # Generate & Save Status Confusion Matrix
    cm_status = confusion_matrix(y_test_st, y_test_st_pred, labels=status_pipeline.classes_)
    plt.figure(figsize=(8, 6))
    plt.imshow(cm_status, interpolation='nearest', cmap=plt.cm.Purples)
    plt.title('DocuTrace Status & Risk Predictor - Confusion Matrix', fontsize=14, pad=15)
    plt.colorbar()
    tick_marks = np.arange(len(status_pipeline.classes_))
    plt.xticks(tick_marks, status_pipeline.classes_, rotation=30, ha='right', fontsize=10)
    plt.yticks(tick_marks, status_pipeline.classes_, fontsize=10)
    
    thresh = cm_status.max() / 2.
    for i in range(cm_status.shape[0]):
        for j in range(cm_status.shape[1]):
            plt.text(j, i, format(cm_status[i, j], 'd'),
                     ha="center", va="center",
                     color="white" if cm_status[i, j] > thresh else "black",
                     fontsize=11, weight='bold')
                     
    plt.ylabel('Actual Status', fontsize=11)
    plt.xlabel('Predicted Status', fontsize=11)
    plt.tight_layout()
    plt.savefig('ml/status_confusion_matrix.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # =========================================================================
    # MODEL 3: CRYPTOGRAPHIC LEDGER & TRACE ANOMALY DETECTOR
    # =========================================================================
    print("\n" + "-" * 80)
    print("[Step 5] Training Model 3: Trace Anomaly Detector (IsolationForest)")
    print("-" * 80)
    
    # Feature extraction on durations and hash characteristics
    df['hash_len'] = df['sha256_hash'].apply(lambda x: len(str(x)))
    df['tx_len'] = df['blockchain_tx_id'].apply(lambda x: len(str(x)))
    df['created_hour'] = df['created_at'].dt.hour
    df['created_dayofweek'] = df['created_at'].dt.dayofweek
    
    anomaly_features = ['duration_hours', 'hash_len', 'tx_len', 'created_hour', 'created_dayofweek']
    X_anomaly = df[anomaly_features].values
    
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_anomaly)
    
    anomaly_preds = iso_forest.predict(X_anomaly)
    outlier_count = np.sum(anomaly_preds == -1)
    print(f"    Identified Trace Outliers / Suspicious Ledger Records: {outlier_count:,} ({outlier_count/len(df)*100:.2f}%)")
    
    # Save Model 3
    trace_model_path = 'ml/models/trace_anomaly_detector.joblib'
    backend_trace_model_path = 'backend/app/models_ml/trace_anomaly_detector.joblib'
    joblib.dump(iso_forest, trace_model_path)
    joblib.dump(iso_forest, backend_trace_model_path)
    print(f"    [+] Saved model to: {trace_model_path}")
    
    # =========================================================================
    # EXPORT METRICS & EVALUATION ARTIFACTS
    # =========================================================================
    elapsed_time = round(time.time() - start_time, 2)
    
    metrics_payload = {
        "dataset": {
            "source": "ml/doctrace_50k_mock_data.csv",
            "total_records": total_rows,
            "training_samples": len(X_train_text),
            "testing_samples": len(X_test_text),
            "document_types": list(y_doctype.unique()),
            "status_categories": list(y_status.unique())
        },
        "document_type_classifier": {
            "model_type": "LogisticRegression with TF-IDF Vectorizer (10 Classes)",
            "train_accuracy": round(float(doc_train_acc), 4),
            "test_accuracy": round(float(doc_test_acc), 4),
            "weighted_precision": round(float(doc_precision), 4),
            "weighted_recall": round(float(doc_recall), 4),
            "macro_f1": round(float(doc_f1_macro), 4),
            "weighted_f1": round(float(doc_f1_weighted), 4),
            "roc_auc_ovr": round(float(doc_roc_auc), 4),
            "classes": list(doc_pipeline.classes_)
        },
        "status_risk_predictor": {
            "model_type": "RandomForestClassifier with Categorical & Duration Preprocessing (5 Classes)",
            "train_accuracy": round(float(st_train_acc), 4),
            "test_accuracy": round(float(st_test_acc), 4),
            "weighted_precision": round(float(st_precision), 4),
            "weighted_recall": round(float(st_recall), 4),
            "macro_f1": round(float(st_f1_macro), 4),
            "weighted_f1": round(float(st_f1_weighted), 4),
            "classes": list(status_pipeline.classes_)
        },
        "trace_anomaly_detector": {
            "model_type": "IsolationForest (Contamination 5%)",
            "contamination_rate": 0.05,
            "detected_anomalies": int(outlier_count),
            "total_evaluated": total_rows
        },
        "training_time_seconds": elapsed_time
    }
    
    # Write JSON summaries
    for json_path in ['ml/metrics.json', 'ml/evaluation_results.json']:
        with open(json_path, 'w') as f:
            json.dump(metrics_payload, f, indent=2)
        print(f"    [+] Saved metrics to: {json_path}")
        
    print("\n" + "=" * 80)
    print(f"   ALL 3 MODELS SUCCESSFULLY TRAINED & EVALUATED IN {elapsed_time}s")
    print("=" * 80)

if __name__ == "__main__":
    build_and_train_models()
