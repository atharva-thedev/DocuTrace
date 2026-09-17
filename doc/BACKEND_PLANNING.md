# DocuTrace Backend Architecture & Technical Planning

**Document Version:** 1.0  
**Target Platform:** DocuTrace — AI-Powered Business Document Intelligence Platform  
**Technology Stack:** Python 3.11+, FastAPI, PostgreSQL 16+ (with `pgvector`), SQLAlchemy 2.0 (Async), Alembic, Pydantic v2, Pandas, Scikit-learn, LangChain / Google Gemini API.

---

## 1. Executive Summary & Vision

DocuTrace is an enterprise-grade document intelligence platform that processes business documents (invoices, purchase orders, contracts, financial reports, compliance documents) through an end-to-end active intelligence workflow:

$$\text{Document} \longrightarrow \text{Data} \longrightarrow \text{Verify} \longrightarrow \text{Detect} \longrightarrow \text{Explain} \longrightarrow \text{Trace} \longrightarrow \text{Act}$$

This document specifies the backend system architecture, data models, pipeline services, API contracts, security mechanisms, and execution roadmap.

---

## 2. System Architecture & Component Design

```
                                  ┌───────────────────────────┐
                                  │   React + Vite Frontend   │
                                  └─────────────┬─────────────┘
                                                │ HTTPS / REST / WS
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FastAPI Backend (ASGI)                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  Middleware Stack: Sentry -> CORS -> Security Headers -> SlowAPI RateLimiter -> Request ID  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                     API Routers (/api/v1)                                   │
│  [Auth] [Documents] [DocSets] [Extractions] [Verifications] [Anomalies] [Obligations] [QA] │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                      Service Layer                                          │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │ Ingestion & OCR Service │  │ Extraction Engine (LLM) │  │ Verification Engine(Pandas) │  │
│  └────────────┬────────────┘  └────────────┬────────────┘  └──────────────┬──────────────┘  │
│  ┌────────────┴────────────┐  ┌────────────┴────────────┐  ┌──────────────┴──────────────┐  │
│  │ Anomaly Service (ML)    │  │ Risk Scoring Engine     │  │ Evidence RAG & QA Service   │  │
│  └────────────┬────────────┘  └────────────┬────────────┘  └──────────────┬──────────────┘  │
│  ┌────────────┴────────────┐                                                                │
│  │ Action & Task Engine    │                                                                │
│  └─────────────────────────┘                                                                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                               Data Access & Storage Layer                                   │
│  ┌───────────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐  │
│  │ PostgreSQL 16+ (SQLAlchemy)   │  │ pgvector / Embeddings  │  │ Local / S3 File Store  │  │
│  └───────────────────────────────┘  └────────────────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema & Data Models

### 3.1 Entity Relationship Overview
- **`users`**: Platform users with role-based access (`admin`, `finance`, `legal`, `auditor`, `member`).
- **`refresh_tokens`**: Active refresh token sessions with hash storage and breach detection flags.
- **`document_sets`**: Logical grouping of related documents (e.g., Invoice #1024 + PO #9081 + Master Service Agreement).
- **`documents`**: Document metadata, raw file path, SHA-256 hash, OCR status, page count, mime type, document type (`invoice`, `po`, `contract`, `financial_report`, `compliance`).
- **`document_pages`**: Page-level dimensions, raw text, and layout metadata.
- **`document_chunks`**: Text chunks with spatial bounding-box coordinates `[x0, y0, x1, y1]`, page number, and vector embeddings (`vector(768)` or `vector(1536)`).
- **`extracted_fields`**: Extracted structured key-values (field name, normalized value, raw text, data type, confidence score, source page, bounding box).
- **`verification_results`**: Cross-document comparison summaries, mismatch matrices, severity levels (`low`, `medium`, `high`, `critical`).
- **`anomalies`**: Financial, statistical, and missing-field anomalies detected by rule engines or Scikit-learn models.
- **`obligations`**: Contract commitments, clause references, responsible parties, deadlines, obligation category (`payment`, `delivery`, `renewal`, `compliance`, `reporting`).
- **`risk_scores`**: Calculated composite risk scores (0–100), risk tier (`low`, `medium`, `high`, `critical`), factor breakdowns (JSON), and historical trends.
- **`action_tasks`**: Actionable tasks generated from obligations or anomalies, assigned to users with status, priority, and reminders.
- **`qa_threads` & `qa_messages`**: Evidence-grounded conversational threads with cited document IDs, page numbers, and bounding-box coordinates.
- **`audit_logs`**: Immutable audit logs of verification overrides, task updates, and document operations.

---

## 4. Pipeline Engine Specifications

### 4.1 Ingestion & OCR Service
- **Supported Formats:** PDF (digital & scanned), PNG, JPEG, TIFF, DOCX.
- **Pipeline:**
  1. File Upload -> Magic byte check -> SHA-256 duplicate check -> Safe disk/cloud storage.
  2. PDF layout parsing via `pdfplumber` / `pypdf`.
  3. If scanned/image: Tesseract OCR (`pytesseract`) with word-level bounding-box calculation.
  4. Page & block segmentation -> Chunking with page & bounding-box metadata preservation.

### 4.2 Information Extraction Engine
- **Heuristic + LLM Pipeline:**
  1. Regex/Rule-based pre-extraction for known standard fields (dates, currencies, tax IDs, invoice numbers).
  2. LLM Prompting (Google Gemini / OpenAI) with strict JSON schema output for high-level semantic extraction (parties, clauses, terms, conditions).
  3. Spatial mapping: Linking extracted values back to document page and bounding box.
  4. Confidence score assignment ($0.0 - 1.0$).

### 4.3 Cross-Document Verification Engine
- **Cross-Doc Reconciliation:**
  1. Group documents into `DocumentSet` (e.g., PO + Invoice + Contract).
  2. Align line items, vendor names, currencies, unit prices, total amounts, dates, and terms via Pandas DataFrames.
  3. Mismatch evaluation:
     - **Exact Mismatch:** Price/Quantity difference between PO and Invoice.
     - **Tolerance Mismatch:** Tax calculation discrepancy $> \$0.05$.
     - **Term Mismatch:** Payment due date violates Contract Net-30 terms.
  4. Generate detailed discrepancy records with severity scoring.

### 4.4 Financial Anomaly Detection Engine
- **Statistical & ML Anomaly Detection:**
  1. **Duplicate Detection:** Exact hash matching + fuzzy matching on `(vendor_name, total_amount, invoice_date)`.
  2. **Vendor Outlier Detection:** `IsolationForest` (Scikit-learn) trained on historical vendor transaction amounts and frequency distributions.
  3. **Tax & Math Consistency:** Automatic formula re-evaluation: $\sum(\text{subtotal}) + \text{tax} - \text{discount} = \text{total}$.
  4. **Missing Information Detector:** Evaluates required field schema by document type (e.g., missing vendor tax ID, unsigned contract, missing PO reference).

### 4.5 Obligation & Event Extraction
- **Contract Analysis:**
  1. Extract commitments, renewal windows, milestone dates, reporting deadlines, and penalty clauses.
  2. Standardize dates to UTC and link to specific contract clauses.
  3. Tag responsible entities (Internal vs. Vendor).

### 4.6 Obligation $\to$ Action Engine
- Convert extracted obligations and high-severity anomalies into assignable `ActionTasks`.
- Configure due dates, priority, assignee notification triggers, and auto-reminders.

### 4.7 Explainable Risk Scoring Engine
- Composite Weighted Risk Formula:
  $$\text{Risk Score} = w_v \cdot S_{\text{verif}} + w_a \cdot S_{\text{anomaly}} + w_m \cdot S_{\text{missing}} + w_o \cdot S_{\text{obligation}}$$
- Produces a transparent, human-readable breakdown of every contributing risk item.

### 4.8 Evidence-Grounded Q&A (RAG)
- Vector indexing of document chunks into `pgvector`.
- Semantic search retrieval ($top\_k$).
- Prompting with strict evidence-grounding constraint:
  - Every assertion must reference `[doc_id, page_number, bounding_box]`.
  - If evidence is absent in context, response explicitly states inability to verify.

---

## 5. API Endpoint Specifications

### 5.1 Authentication (`/api/v1/auth`)
- `POST /register`: Register user account.
- `POST /login`: Authenticate; returns 15-min JWT access token + sets 7-day HttpOnly refresh cookie.
- `POST /refresh`: Rotates refresh token, returns new access token.
- `POST /logout`: Revokes refresh token in database and clears cookie.
- `GET /me`: Returns current authenticated user profile.

### 5.2 Documents (`/api/v1/documents`)
- `POST /upload`: Upload document (`multipart/form-data`) with doc type tag.
- `GET /`: List user/organization documents with filtering & pagination.
- `GET /{id}`: Retrieve document details, processing status, and metadata.
- `GET /{id}/file`: Stream raw file / rendered page for viewer.
- `DELETE /{id}`: Soft delete document and associated extractions.

### 5.3 Document Sets (`/api/v1/document-sets`)
- `POST /`: Create document set.
- `POST /{id}/documents`: Link documents to a set.
- `GET /{id}`: Retrieve set overview, linked docs, and reconciliation status.

### 5.4 Extractions & Verifications (`/api/v1/extractions` & `/api/v1/verifications`)
- `GET /documents/{doc_id}/fields`: Get extracted structured key-values with bboxes.
- `PATCH /fields/{field_id}`: User manual override / correction of extracted field.
- `POST /document-sets/{set_id}/verify`: Trigger cross-document verification.
- `GET /document-sets/{set_id}/results`: Get detailed reconciliation matrix.

### 5.5 Anomalies & Risk Scores (`/api/v1/anomalies` & `/api/v1/risk-scores`)
- `GET /documents/{doc_id}/anomalies`: List detected anomalies with explanations.
- `POST /anomalies/{id}/resolve`: Confirm or dismiss anomaly.
- `GET /documents/{doc_id}/risk`: Get composite risk score with factor breakdown.

### 5.6 Obligations & Tasks (`/api/v1/obligations` & `/api/v1/tasks`)
- `GET /documents/{doc_id}/obligations`: List extracted obligations & deadlines.
- `POST /tasks/from-obligation/{id}`: Create actionable task from obligation.
- `GET /tasks`: List actionable tasks (filtered by assignee, status, due date).
- `PATCH /tasks/{id}`: Update task status (`pending`, `in_progress`, `completed`).

### 5.7 Evidence-Grounded Q&A (`/api/v1/qa`)
- `POST /query`: Submit natural language question for document or document set.
  - Returns answer text with exact citation list: `[{ "doc_id": "...", "page": 1, "bbox": [10, 20, 100, 50], "quote": "..." }]`.

---

## 6. Implementation Roadmap

- **Phase 1 (Foundations & Ingestion):**
  - Project structure, FastAPI configuration, async SQLAlchemy engine, Alembic migrations.
  - Auth system (JWT access + HttpOnly refresh cookie rotation).
  - Document upload, file validation, storage, OCR & layout parsing pipeline.
- **Phase 2 (Extraction & Reconciliation):**
  - Structured field extraction with spatial bounding boxes.
  - Cross-document verification engine using Pandas.
  - Missing information rule engine.
- **Phase 3 (ML & Intelligence):**
  - Isolation Forest anomaly detection & financial math validation.
  - Explainable composite risk scoring engine.
  - Obligation & clause extractor.
- **Phase 4 (Action & RAG Q&A):**
  - Obligation $\to$ Action Task engine.
  - Vector embeddings & Evidence-Grounded Q&A with bounding-box citations.
- **Phase 5 (Hardening & Delivery):**
  - Rate limiting, security headers, comprehensive unit/integration tests, Postman collection.
