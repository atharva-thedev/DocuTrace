# DocuTrace Backend

AI-Powered Business Document Intelligence Platform backend built with **FastAPI**, **SQLAlchemy 2.0 (Async)**, **PostgreSQL / SQLite**, and **Scikit-learn**.

---

## 🚀 Quick Start

### 1. Setup Virtual Environment & Install Dependencies
```bash
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger API Docs: `http://localhost:8000/docs`
- ReDoc Docs: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

### 4. Run Automated Test Suite
```bash
pytest -v
```

---

## 📦 System Architecture & Features

1. **Document Ingestion & Upload (`/api/v1/documents`)**:
   - Magic byte validation, SHA-256 integrity verification, safe user-isolated disk storage.
2. **Layout Understanding & OCR (`OCRAndLayoutService`)**:
   - Layout-aware word & chunk bounding box extraction `[x0, y0, x1, y1]` with page mapping.
3. **Structured Information Extraction (`/api/v1/extractions`)**:
   - Financial figures, entities, contract clauses, dates, and confidence ratings.
4. **Cross-Document Verification (`/api/v1/verifications`)**:
   - 3-way matching across document sets (Invoice ↔ PO ↔ Contract) detecting total, vendor, and terms discrepancies.
5. **Financial Anomaly Detection (`/api/v1/anomalies`)**:
   - Duplicate invoice checks, Scikit-learn `IsolationForest` statistical outlier analysis, tax and math formula re-evaluation.
6. **Obligation Extraction & Action Engine (`/api/v1/obligations`, `/api/v1/tasks`)**:
   - Extracted deadlines and commitments auto-converted to assignable tasks.
7. **Explainable Risk Scoring (`/api/v1/risk-scores`)**:
   - Transparent 0–100 composite risk score with factor attribution breakdown.
8. **Evidence-Grounded Q&A (`/api/v1/qa`)**:
   - Natural language Q&A with visual bounding-box citations.
