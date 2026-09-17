import os
import json
import time
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_auc_score
)

def train_production_document_classifier():
    start_time = time.time()
    print("=" * 80)
    print("   DOCUTRACE MULTI-DATASET ML TRAINING (TRICKY 10K + PRODUCTION 50K)")
    print("=" * 80)
    
    # 1. Load both datasets
    tricky_path = 'ml/doctrace_tricky_train_10k.csv'
    mock_path = 'ml/doctrace_50k_mock_data.csv'
    
    print(f"\n[1] Loading Tricky Dataset: {tricky_path}")
    df_tricky = pd.read_csv(tricky_path)
    print(f"    Tricky records loaded: {len(df_tricky):,}")
    
    print(f"\n[2] Loading Production Dataset: {mock_path}")
    df_mock = pd.read_csv(mock_path)
    print(f"    Production records loaded: {len(df_mock):,}")
    
    # Standardize text representations
    df_tricky_data = pd.DataFrame({
        'text': df_tricky['combined_text'],
        'target': df_tricky['document_type'],
        'source': 'tricky_10k'
    })
    
    mock_email_domain = df_mock['recipient_email'].apply(lambda x: x.split('@')[-1] if '@' in str(x) else 'unknown')
    mock_text = df_mock['document_title'] + " | " + df_mock['issuer_name'] + " | " + df_mock['recipient_name'] + " | " + mock_email_domain
    
    df_mock_data = pd.DataFrame({
        'text': mock_text,
        'target': df_mock['document_type'],
        'source': 'production_50k'
    })
    
    df_all = pd.concat([df_tricky_data, df_mock_data], ignore_index=True)
    total_samples = len(df_all)
    print(f"\n[3] Total Unified Training Corpus: {total_samples:,} documents across 10 categories.")
    
    # Stratified Train/Test Split (80% Train / 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        df_all['text'], df_all['target'], test_size=0.20, random_state=42, stratify=df_all['target']
    )
    print(f"    Train Samples: {len(X_train):,} | Held-Out Test Samples: {len(X_test):,}")
    
    # Calibrated High-Dimensional TF-IDF Pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 3), max_features=35000, sublinear_tf=True)),
        ('clf', CalibratedClassifierCV(estimator=LinearSVC(C=1.0, random_state=42), cv=5))
    ])
    
    print("\n[4] Training Pipeline with 5-Fold Calibration...")
    pipeline.fit(X_train, y_train)
    
    print("\n[5] Evaluating on 12,000 Held-Out Test Samples...")
    y_test_pred = pipeline.predict(X_test)
    y_test_proba = pipeline.predict_proba(X_test)
    
    test_accuracy = accuracy_score(y_test, y_test_pred)
    weighted_precision = precision_score(y_test, y_test_pred, average='weighted')
    weighted_recall = recall_score(y_test, y_test_pred, average='weighted')
    macro_f1 = f1_score(y_test, y_test_pred, average='macro')
    weighted_f1 = f1_score(y_test, y_test_pred, average='weighted')
    
    # Evaluate Standalone Tricky 10k dataset
    tricky_pred = pipeline.predict(df_tricky['combined_text'])
    tricky_accuracy = accuracy_score(df_tricky['document_type'], tricky_pred)
    
    y_test_dummies = pd.get_dummies(y_test)
    roc_auc = roc_auc_score(y_test_dummies, y_test_proba, multi_class='ovr', average='weighted')
    
    print("\n" + "=" * 80)
    print("   MODEL ACCURACY & PERFORMANCE SUMMARY")
    print("=" * 80)
    print(f"   Held-Out Test Accuracy (12,000 samples):  {test_accuracy*100:.2f}% ({np.sum(y_test == y_test_pred)} / {len(y_test)} correct)")
    print(f"   Tricky 10k Full Dataset Accuracy:        {tricky_accuracy*100:.2f}% ({np.sum(df_tricky['document_type'] == tricky_pred)} / {len(df_tricky)} correct)")
    print(f"   Weighted Precision:                       {weighted_precision*100:.2f}%")
    print(f"   Weighted Recall:                          {weighted_recall*100:.2f}%")
    print(f"   Macro F1-Score:                           {macro_f1*100:.2f}%")
    print(f"   Weighted F1-Score:                        {weighted_f1*100:.2f}%")
    print(f"   ROC-AUC (One-vs-Rest):                    {roc_auc*100:.2f}%")
    
    print("\n[6] Detailed Classification Report:")
    report_dict = classification_report(y_test, y_test_pred, output_dict=True, digits=4)
    print(classification_report(y_test, y_test_pred, digits=4))
    
    # Save Model Checkpoints
    os.makedirs('ml/models', exist_ok=True)
    os.makedirs('backend/app/models_ml', exist_ok=True)
    
    model_paths = [
        'ml/models/document_type_classifier.joblib',
        'backend/app/models_ml/document_type_classifier.joblib'
    ]
    for p in model_paths:
        joblib.dump(pipeline, p)
        print(f"    [+] Saved model artifact to: {p}")
        
    # Generate Confusion Matrix Plot
    classes = pipeline.classes_
    cm = confusion_matrix(y_test, y_test_pred, labels=classes)
    
    plt.figure(figsize=(11, 9))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('DocuTrace Document Classifier - Confusion Matrix (60,000 Documents)', fontsize=14, pad=15)
    plt.colorbar()
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=40, ha='right', fontsize=9)
    plt.yticks(tick_marks, classes, fontsize=9)
    
    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            val = cm[i, j]
            if val > 0:
                plt.text(j, i, format(val, 'd'),
                         ha="center", va="center",
                         color="white" if val > thresh else "black",
                         fontsize=10, weight='bold')
                         
    plt.ylabel('Actual Document Type', fontsize=11)
    plt.xlabel('Predicted Document Type', fontsize=11)
    plt.tight_layout()
    
    cm_path = 'ml/tricky_doc_type_confusion_matrix.png'
    plt.savefig(cm_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"    [+] Saved Confusion Matrix visualization to: {cm_path}")
    
    # Save metrics JSON
    elapsed = round(time.time() - start_time, 2)
    evaluation_payload = {
        "datasets": {
            "tricky_dataset": tricky_path,
            "production_dataset": mock_path,
            "total_records": total_samples,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "document_types": list(classes)
        },
        "model_architecture": "CalibratedClassifierCV(LinearSVC) + TF-IDF (1-3 N-Grams)",
        "test_metrics": {
            "held_out_accuracy": round(float(test_accuracy), 4),
            "tricky_10k_accuracy": round(float(tricky_accuracy), 4),
            "weighted_precision": round(float(weighted_precision), 4),
            "weighted_recall": round(float(weighted_recall), 4),
            "macro_f1": round(float(macro_f1), 4),
            "weighted_f1": round(float(weighted_f1), 4),
            "roc_auc_ovr": round(float(roc_auc), 4)
        },
        "per_class_metrics": {
            cls_name: {
                "precision": round(float(report_dict[cls_name]["precision"]), 4),
                "recall": round(float(report_dict[cls_name]["recall"]), 4),
                "f1_score": round(float(report_dict[cls_name]["f1-score"]), 4),
                "support": int(report_dict[cls_name]["support"])
            }
            for cls_name in classes
        },
        "training_duration_seconds": elapsed
    }
    
    with open('ml/tricky_evaluation_results.json', 'w') as f:
        json.dump(evaluation_payload, f, indent=2)
    print(f"    [+] Saved evaluation metrics to: ml/tricky_evaluation_results.json")
    print(f"\n[+] Pipeline completed in {elapsed}s")

if __name__ == "__main__":
    train_production_document_classifier()
