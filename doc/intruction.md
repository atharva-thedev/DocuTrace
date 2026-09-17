# Full-Stack Project Blueprint & Prompt Sheet

### FastAPI (Python) + PostgreSQL + React (TypeScript) — DocuTrace Edition

> **Version:** 3.0 (FastAPI + PostgreSQL + AI/ML Architecture)  
> **Document snapshot:** Practices are maintained over time — dependency pins in this file are **not** authoritative.  
> **Audience:** Developers, AI coding assistants (Antigravity, Cursor, Copilot, Claude), team developers, technical architects  
> **Purpose:** Standardized patterns, security checklists, repository structure, API documentation standards, and master prompts tailored for the DocuTrace AI-Powered Business Document Intelligence Platform.

---

## ⚠️ Version Safety Rule (Read First)

> **Never copy hardcoded version numbers blindly into `requirements.txt`, `pyproject.toml`, or `package.json`.** Old pins stay vulnerable; docs go stale.

### For humans & AI assistants

1. **Python dependencies:** Check PyPI (`pip index versions <pkg>` or `pip show <pkg>`) and search for any known CVEs before locking dependencies. Prefer current Active Python (3.11 / 3.12).
2. **Frontend dependencies:** Use `npm show <pkg> version` and check for security advisories on npmjs.com.
3. **Security audit:** Run `pip-audit` / `safety` for Python, and `npm audit` for Node.js to guarantee zero high/critical vulnerabilities.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Repository Structure](#2-repository-structure)
3. [Environment Variables](#3-environment-variables)
4. [Backend Architecture (FastAPI + SQLAlchemy)](#4-backend-architecture-fastapi--sqlalchemy)
5. [AI/ML & Document Processing Architecture](#5-aiml--document-processing-architecture)
6. [API Documentation Standard](#6-api-documentation-standard)
7. [Backend Security Checklist](#7-backend-security-checklist)
8. [Frontend Architecture (React + Vite + TS)](#8-frontend-architecture-react--vite--ts)
9. [Frontend Security Checklist](#9-frontend-security-checklist)
10. [Testing & Quality Assurance](#10-testing--quality-assurance)
11. [Master Prompts](#11-master-prompts)

---

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| **Backend Runtime & Framework** | Python 3.11+ / FastAPI | High performance async ASGI, automatic OpenAPI docs |
| **Data Validation & Settings** | Pydantic v2 & Pydantic-Settings | Strict schema validation, typed configs |
| **Database & ORM** | PostgreSQL 16+ & SQLAlchemy 2.0 (Async) | Async engine (`asyncpg`), relational integrity |
| **Migrations** | Alembic | Version-controlled declarative database migrations |
| **Vector Search (RAG)** | `pgvector` / ChromaDB / FAISS | Evidence-grounded semantic search and chunk retrieval |
| **Document Parsing & OCR** | `pdfplumber`, `PyPDF2`, `pytesseract`, `python-docx` | PDF, image layout analysis, and text extraction |
| **Data & Statistical ML** | `pandas`, `numpy`, `scikit-learn` | Tabular data reconciliation, Isolation Forest anomaly detection |
| **LLM & Embeddings** | Google Gemini API / OpenAI API / LangChain | Structured entity extraction, RAG evidence grounding |
| **Authentication & Crypto** | JWT (`python-jose`/`PyJWT`), `passlib[bcrypt]`, `cryptography` | 15-min Access Token, 7-day HttpOnly Refresh Token rotation |
| **Task Queue & Caching** | FastAPI BackgroundTasks / Celery + Redis | Async document processing pipelines |
| **Security & Utilities** | `slowapi` (rate limiting), CORS middleware, `python-multipart` | Header security, file size limits, rate guards |
| **Logging & Monitoring** | `loguru` / Python `logging` + Sentry | Structured JSON logging with PII masking |
| **Frontend** | React 18+ & Vite (TypeScript) | Fast SPA with strict typing |
| **State & API Client** | TanStack Query v5 + Axios | Server-state caching, automatic JWT refresh interceptor |
| **UI Components & Styling** | Tailwind CSS / Vanilla CSS & Lucide Icons | Responsive, high-contrast accessible design |

**Token Lifetime Standard:**
- **Access JWT:** `15 minutes` — passed in `Authorization: Bearer <token>`
- **Refresh Token:** `7 days` — stored in `HttpOnly; Secure; SameSite=Strict` cookie with rotation and reuse detection in DB.

---

## 2. Repository Structure

```
DocuTrace/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── api.py                    # Root v1 APIRouter aggregator
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── auth.py               # Register, Login, Refresh, Logout, Me
│   │   │   │   │   ├── documents.py          # Upload, List, Get, Delete, Status
│   │   │   │   │   ├── document_sets.py      # Link/group related documents
│   │   │   │   │   ├── extractions.py        # Extracted fields, entities, clauses
│   │   │   │   │   ├── verifications.py      # Cross-document reconciliation
│   │   │   │   │   ├── anomalies.py          # Financial & statistical anomalies
│   │   │   │   │   ├── obligations.py        # Contract commitments & deadlines
│   │   │   │   │   ├── risk_scores.py        # Explainable document risk scoring
│   │   │   │   │   ├── qa.py                 # Evidence-grounded Q&A (RAG)
│   │   │   │   │   ├── tasks.py              # Obligation/Anomaly actionable tasks
│   │   │   │   │   └── summaries.py          # Single & multi-document summaries
│   │   │   │   └── deps.py                   # Dependency injection: get_db, get_current_user, role_guard
│   │   │   └── health.py                     # /health (liveness) and /ready (readiness with DB check)
│   │   ├── core/
│   │   │   ├── config.py                     # Pydantic Settings (validated on startup)
│   │   │   ├── database.py                   # Async SQLAlchemy engine & session factory
│   │   │   ├── security.py                   # Password hashing, JWT creation & verification
│   │   │   └── logging.py                    # Structured logging with PII redactors
│   │   ├── models/                           # SQLAlchemy ORM Models
│   │   │   ├── user.py                       # User, RefreshTokenSession
│   │   │   ├── document.py                   # Document, DocumentSet, DocumentChunk
│   │   │   ├── extraction.py                 # ExtractedField, ExtractedTable
│   │   │   ├── verification.py               # VerificationResult, MismatchItem
│   │   │   ├── anomaly.py                    # AnomalyRecord
│   │   │   ├── obligation.py                 # Obligation
│   │   │   ├── risk_score.py                 # RiskScore, RiskFactor
│   │   │   ├── task.py                       # ActionTask
│   │   │   └── audit_log.py                  # Audit trail records
│   │   ├── schemas/                          # Pydantic Schemas (Request/Response)
│   │   │   ├── common.py                     # ApiResponse[T], PaginatedResponse[T], ErrorResponse
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   ├── extraction.py
│   │   │   ├── verification.py
│   │   │   ├── anomaly.py
│   │   │   ├── obligation.py
│   │   │   ├── risk_score.py
│   │   │   ├── qa.py
│   │   │   └── task.py
│   │   ├── services/                         # Business & AI/ML Processing Engines
│   │   │   ├── ingestion_service.py          # File storage, hashing, layout parsing, OCR
│   │   │   ├── extraction_service.py         # LLM/Regex entity extraction & confidence scoring
│   │   │   ├── verification_service.py       # Cross-doc comparison logic (Pandas)
│   │   │   ├── anomaly_service.py            # ML Anomaly detection (Isolation Forest)
│   │   │   ├── obligation_service.py         # Contract obligation extractor
│   │   │   ├── risk_engine.py                # Explainable composite risk calculation
│   │   │   ├── rag_qa_service.py             # Vector search, citation bounding-box matcher
│   │   │   └── task_engine.py                # Task generation from obligations/anomalies
│   │   ├── utils/
│   │   │   ├── file_helpers.py               # Magic byte validation, safe file saving
│   │   │   ├── encryption.py                 # AES-256-GCM for sensitive fields
│   │   │   └── ownership.py                  # Resource ownership check (returns 404 on mismatch)
│   │   └── main.py                           # FastAPI app creation, middleware stack, exception handlers
│   ├── alembic/                              # DB migrations
│   ├── storage/                              # Local uploaded documents (or S3/GCS adapter)
│   ├── tests/
│   ├── .env.example
│   ├── requirements.txt / pyproject.toml
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/                              # Axios instance with refresh interceptor
│   │   ├── components/                       # Shared UI components
│   │   ├── features/                         # Modular features (documents, verification, QA, tasks)
│   │   ├── pages/                            # Routed view pages
│   │   ├── routes/                           # Protected route configuration
│   │   └── types/                            # TypeScript interfaces
│   ├── .env.example
│   └── package.json
│
└── doc/
    ├── Docutrace_prd.md                      # Product Requirements Document
    ├── intruction.md                         # This architecture guide & prompt sheet
    ├── BACKEND_PLANNING.md                   # Comprehensive backend execution spec
    └── FRONTEND_PLANNING.md                  # Comprehensive frontend architecture & execution spec
```

---

## 3. Environment Variables

### Backend `.env.example`

```env
# ── Application Environment ──────────────────────────────────────────
PROJECT_NAME="DocuTrace Backend"
ENVIRONMENT="development"                     # development, staging, production
DEBUG=True
API_V1_STR="/api/v1"
SECRET_KEY="replace_with_64_character_hex_string_for_general_crypto"

# ── Server & CORS ───────────────────────────────────────────────────
HOST="0.0.0.0"
PORT=8000
BACKEND_CORS_ORIGINS="http://localhost:5173,http://localhost:3000"

# ── Database (PostgreSQL) ───────────────────────────────────────────
POSTGRES_SERVER="localhost"
POSTGRES_PORT=5432
POSTGRES_USER="docutrace_user"
POSTGRES_PASSWORD="docutrace_password"
POSTGRES_DB="docutrace_db"
DATABASE_URL="postgresql+asyncpg://docutrace_user:docutrace_password@localhost:5432/docutrace_db"

# ── JWT Authentication ──────────────────────────────────────────────
JWT_ACCESS_SECRET="replace_with_separate_64_char_hex_for_access_tokens"
JWT_REFRESH_SECRET="replace_with_separate_64_char_hex_for_refresh_tokens"
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
ALGORITHM="HS256"

# ── Field Encryption (AES-256-GCM) ──────────────────────────────────
ENCRYPTION_KEY="replace_with_32_byte_hex_key_for_sensitive_doc_data"

# ── File Upload & Storage ───────────────────────────────────────────
UPLOAD_DIR="./storage/uploads"
MAX_UPLOAD_SIZE_MB=25
ALLOWED_MIME_TYPES="application/pdf,image/png,image/jpeg,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

# ── AI / LLM / Embeddings Configuration ─────────────────────────────
LLM_PROVIDER="gemini"                         # gemini, openai, local
GEMINI_API_KEY="your_gemini_api_key_here"
OPENAI_API_KEY="optional_openai_key"
EMBEDDING_MODEL="text-embedding-004"
VECTOR_STORE_TYPE="pgvector"                  # pgvector, chroma

# ── Logging & Monitoring ────────────────────────────────────────────
LOG_LEVEL="INFO"
SENTRY_DSN=""
```

---

## 4. Backend Architecture (FastAPI + SQLAlchemy)

### Middleware Stack Order (`main.py`)
1. **Sentry / Monitoring Middleware**
2. **CORS Middleware** (`CORSMiddleware`) with strictly defined origins and `allow_credentials=True`.
3. **Security Headers Middleware** (HSTS, Content-Type-Options, X-Frame-Options).
4. **Rate Limiting Middleware** (`SlowAPIMiddleware`).
5. **Request ID & Performance Timing Middleware**.
6. **Exception Handlers** for standard unified response formatting.

### Standard Response Shape

#### Success Response
```json
{
  "success": true,
  "data": {
    "id": "doc_8f1e2d3c",
    "filename": "invoice_1042.pdf",
    "status": "completed"
  }
}
```

#### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

#### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request payload failed validation.",
    "fields": {
      "file": ["Unsupported file format. Must be PDF, PNG, JPG, or DOCX."]
    }
  }
}
```

### Standard Error Codes

| HTTP Status | Error Code | Description |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Schema or field-level validation failed |
| 400 | `INVALID_FILE_TYPE` | Uploaded file MIME or magic bytes rejected |
| 400 | `FILE_TOO_LARGE` | Upload exceeds maximum permitted size |
| 401 | `UNAUTHORIZED` | Missing or malformed token |
| 401 | `TOKEN_EXPIRED` | Access JWT expired — client should trigger refresh |
| 401 | `TOKEN_INVALID` | Signature validation failure |
| 401 | `REFRESH_TOKEN_INVALID` | Expired, revoked, or reused refresh token |
| 403 | `FORBIDDEN` | Insufficient role or tenant permissions |
| 404 | `NOT_FOUND` | Resource does not exist or does not belong to user |
| 409 | `CONFLICT` | Resource already exists or duplicate detected |
| 422 | `UNPROCESSABLE_ENTITY` | Pydantic model parsing error |
| 429 | `RATE_LIMIT_EXCEEDED` | Request threshold reached |
| 500 | `INTERNAL_ERROR` | Unhandled internal server error |

---

## 5. AI/ML & Document Processing Architecture

DocuTrace is defined by its pipeline: **Document → Data → Verify → Detect → Explain → Trace → Act**.

```
[Upload Document]
       │
       ▼
[Ingestion & OCR] ──► Extracts text, tables, pages & visual bounding boxes (BBoxes)
       │
       ▼
[Information Extraction] ──► Structured fields, key-values, line items, confidence scores
       │
       ├────────────────────────┬───────────────────────┐
       ▼                        ▼                       ▼
[Cross-Doc Verification] [Anomaly Detection]   [Obligation Extraction]
(PO ↔ Invoice ↔ Contract) (Isolation Forest/    (Deadlines, parties,
 (Pandas reconciliation)   tax & price history)  commitments, clauses)
       │                        │                       │
       └────────────────────────┼───────────────────────┘
                                ▼
                     [Risk Scoring Engine]
                  (Composite explainable score)
                                │
                                ▼
                 [Obligation → Action Engine]
               (Tasks, reminders, assignments)
                                │
                                ▼
                 [Vector Indexing & RAG Q&A]
             (Evidence citations: doc, page, bbox)
```

---

## 6. API Documentation Standard

Every endpoint must be documented following this contract:

```
### METHOD /api/v1/<resource>/<action>

**Description:** One clear sentence describing the operation.
**Auth Required:** Yes / No
**Role Level:** Admin / Manager / Auditor / Member / Public

#### Request:
- Headers: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`
- Path Params: `:id` (UUID / Resource ID)
- Query Params: `?page=1&limit=20&status=completed`
- Body Schema: Pydantic Schema JSON

#### Response (200 / 201):
{
  "success": true,
  "data": { ... }
}

#### Error Responses:
400 (VALIDATION_ERROR), 401 (UNAUTHORIZED), 403 (FORBIDDEN), 404 (NOT_FOUND)
```

---

## 7. Backend Security Checklist

- [ ] **Secrets & Config:** All secrets loaded via Pydantic `BaseSettings` from `.env`; immediate startup failure on invalid config.
- [ ] **Password Security:** Salted bcrypt hashing with cost factor ≥ 12.
- [ ] **JWT & Refresh Tokens:** Access token (15m), HttpOnly Secure cookie refresh token (7d) with automatic rotation and DB-stored hashed tokens. Token reuse immediately invalidates all active sessions for that user.
- [ ] **Timing Attacks:** `hmac.compare_digest` used for all secure token comparisons.
- [ ] **IDOR Prevention:** Tenant and user ownership verification (`assert_ownership`) on all DB queries; return 404 on foreign resource access.
- [ ] **File Security:** File magic byte validation (prevent renamed executables), filename sanitization, disk storage path traversal checks (`pathlib.Path.resolve()`).
- [ ] **Input Sanitization:** Strict Pydantic models for all inputs; SQL injection prevented via SQLAlchemy parameterized ORM queries.
- [ ] **Rate Limiting:** IP and user-based rate limits on auth, upload, and Q&A endpoints.
- [ ] **Logging Hygiene:** Structured JSON logging masking PII, passwords, and raw JWTs.

---

## 8. Frontend Architecture (React + Vite + TS)

- **Token Storage:** Access token kept **in-memory only**; never in `localStorage` or `sessionStorage`.
- **Single-Flight Axios Interceptor:** Intercepts 401 `TOKEN_EXPIRED`, queues concurrent requests, fetches a new access token via `/api/v1/auth/refresh`, and retries seamlessly.
- **Dedicated Refresh Client:** Isolated Axios instance with no interceptors to prevent infinite refresh loops.
- **Server State:** TanStack Query (React Query) for automatic caching, background polling of document processing states, and cache invalidation on mutations.
- **Evidence Viewer:** Interactive PDF/Image viewer supporting page rendering and highlighted bounding-box overlays for RAG Q&A citations and extraction reviews.

---

## 9. Frontend Security Checklist

- [ ] No tokens or secrets stored in `localStorage` or `sessionStorage`.
- [ ] HTML sanitization via `DOMPurify` before any rich text rendering.
- [ ] File uploads validated client-side (size and MIME type) before initiating transfer.
- [ ] Route guards (`RequireAuth`, `RequireRole`) wrapping all protected paths.
- [ ] Form validations powered by `React Hook Form` and `Zod`.

---

## 10. Testing & Quality Assurance

- **Unit Tests:** `pytest` + `pytest-asyncio` for services and models.
- **API Tests:** `httpx.AsyncClient` for endpoint integration testing.
- **Postman Collection:** Exported collection and environment under `backend/postman/` covering full user and pipeline journeys.

---

## 11. Master Prompts

### 11.1 DocuTrace Backend Bootstrap Prompt
```
Build the production-ready FastAPI backend for DocuTrace:
- Stack: Python 3.11+, FastAPI, SQLAlchemy 2.0 (Async), PostgreSQL, Alembic, Pydantic v2.
- Ingestion & OCR: PDF/Image/DOCX parser with bounding box spatial metadata.
- Verification & ML: Cross-document reconciliation (Pandas), Anomaly detection (Isolation Forest).
- RAG & Evidence Q&A: Vector embeddings with strict page + bounding box source citations.
- Security: JWT auth (15m access + 7d HttpOnly cookie refresh with rotation), ownership checks (404 on foreign access), SlowAPI rate limits, file magic checks.
- Unified response envelope: { "success": true, "data": ... } and { "success": false, "error": { "code", "message", "fields" } }.
```
