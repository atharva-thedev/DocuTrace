# DocuTrace — Full-Stack Project Blueprint & Prompt Sheet

### FastAPI + PostgreSQL + React/Vite + TypeScript — Document Intelligence Platform

> **Version:** 1.0
> **Document snapshot:** Practices are maintained over time — dependency numbers in this file are **not** authoritative.
> **Audience:** Solo developers, AI coding assistants (Cursor, Copilot, Claude), team developers, non-technical stakeholders
> **Purpose:** Copy-paste prompts, security checklists, folder structure, and API documentation standards for DocuTrace, built on its actual stack (FastAPI + PostgreSQL + SQLAlchemy + React/Vite + Scikit-learn), not a generic MERN stack.
> **Source:** Adapted from a MERN blueprint template, re-targeted to the stack defined in `DocuTrace_PRD.md` Section 3.1.

---

## ⚠️ Version Safety Rule (Read First)

> **Never copy version numbers from this document (or from memory) into `requirements.txt`, `pyproject.toml`, or `package.json`.** Old pins stay vulnerable; docs go stale the day they ship.

### For humans

1. Check [PyPI](https://pypi.org/) for backend packages and [npmjs.com](https://www.npmjs.com/) for frontend packages — confirm **latest** and read advisory/changelog links if shown.
2. Prefer the **newest patched release** on a supported major line — not an old pin "because the tutorial said so."
3. After install: `pip-audit` (backend) and `npm audit` (frontend) — fix **high/critical** before shipping.

```bash
pip index versions <package-name>        # available versions (pip >= 21.2)
pip-audit                                # installed Python tree
npm show <package-name> version          # latest published (frontend)
npm audit                                # installed tree
```

### For AI assistants (mandatory)

Before you write or edit **`requirements.txt`**, **`pyproject.toml`**, **`package.json`**, or recommend install commands:

1. **Web search** for each non-trivial dependency, for example:
   - `"fastapi latest version"`, `"sqlalchemy latest version 2.x"`, `"pydantic v2 latest"`
   - `"<package-name> CVE"` or `"<package-name> security advisory"`
   For **Python**, search `"Python current stable release"`. For **Node.js**, search `"Node.js LTS current release"` and align with Active LTS.
2. Cross-check with `pip index versions <package>` or `npm show <package> version` when the environment allows.
3. If search turns up an **unpatched CVE** on `latest`, search again for a **patched version** or mitigation.
4. In your reply, briefly state what you verified — do not silently invent versions.
5. Pin backend deps with `>=` + upper bound or a lockfile (`poetry.lock` / `uv.lock` / `pip-compile` output); pin frontend deps with `^` ranges unless documented otherwise.

**No hardcoded version table in this file** — the list below is only **names to verify** (not versions):

| Package (verify each) | What to search / check |
|---|---|
| `fastapi`, `uvicorn`, `starlette` | Latest stable; FastAPI/Starlette compatibility matrix |
| `sqlalchemy` (2.x), `alembic` | Latest stable 2.x line; migration compatibility |
| `psycopg` (or `asyncpg`) | Latest stable; PostgreSQL driver compatibility |
| `pydantic`, `pydantic-settings` | Latest v2.x; breaking-change notes |
| `python-jose[cryptography]` or `pyjwt` | Latest stable; known CVEs on JWT libs |
| `passlib[bcrypt]` or `argon2-cffi` | Latest stable; hashing backend availability |
| `slowapi` | Latest stable; Starlette compatibility |
| `pandas`, `scikit-learn` | Latest stable; NumPy compatibility pin |
| `celery`, `redis` (or `arq`) | Latest stable; broker compatibility |
| `sentry-sdk` | Latest stable; FastAPI integration docs |
| `react`, `vite`, `typescript` | Latest stable each |
| `@tanstack/react-query`, `axios`, `react-router-dom`, `react-hook-form`, `zod`, `dompurify` | Same pattern: npm latest + advisory search |

Repeat for **every** dependency you add.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Repository Structure](#2-repository-structure)
3. [Environment Variables](#3-environment-variables)
4. [Backend Architecture](#4-backend-architecture)
5. [API Documentation Standard](#5-api-documentation-standard)
6. [Backend Security Checklist](#6-backend-security-checklist)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Frontend Security Checklist](#8-frontend-security-checklist)
9. [AI Workflow, CI & Git Hygiene](#9-ai-workflow-ci--git-hygiene)
10. [Postman & Testing Guide](#10-postman--testing-guide)
11. [Master Prompts](#11-master-prompts)
12. [Domain Add-On: Document Intelligence Pipeline](#12-domain-add-on-document-intelligence-pipeline)
13. [Document Maintenance](#13-document-maintenance)

---

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| **Backend runtime** | Python 3.12+ | **Web search** current stable — never hardcode a version |
| **Backend framework** | FastAPI (+ Uvicorn/Gunicorn) | Async, OpenAPI docs auto-generated |
| **Language (backend)** | Python + type hints | `mypy` or `pyright` strict mode enabled |
| **Database** | PostgreSQL | Self-hosted or managed (RDS/Cloud SQL/Supabase) |
| **ORM** | SQLAlchemy 2.0 (async) + Alembic | Migrations required, never hand-edit schema |
| **Validation** | Pydantic v2 | Request/response schemas + env settings |
| **Auth** | Email/password + optional Google OAuth | `python-jose`/`pyjwt` for JWT, `passlib`/`argon2` for hashing |
| **JWT** | `python-jose[cryptography]` or `pyjwt` | Access + refresh tokens |
| **Password hashing** | `passlib[bcrypt]` or `argon2-cffi` | Argon2id preferred for new projects |
| **Security headers** | `starlette` middleware / `secure` package | CSP tuned for the SPA |
| **CORS** | FastAPI `CORSMiddleware` | Explicit origin allowlist |
| **Rate limiting** | `slowapi` (or `fastapi-limiter` + Redis) | Per-route limits |
| **SQL injection prevention** | SQLAlchemy parameterized queries | Never string-format raw SQL |
| **Background jobs / OCR queue** | Celery + Redis (or `arq`) | Async document processing pipeline |
| **Object storage** | S3-compatible (AWS S3 / MinIO) | Uploaded documents, never stored in DB |
| **OCR** | Tesseract / PaddleOCR (or a hosted OCR API) | Layout-aware extraction for scans |
| **Vector store** | `pgvector` extension on PostgreSQL (or a dedicated vector DB) | Evidence-grounded Q&A embeddings |
| **LLM / embeddings** | Hosted LLM API (e.g. Claude API) + embedding model | Extraction, summarization, Q&A reasoning |
| **AI/ML (structured)** | Pandas + Scikit-learn | Cross-document verification, anomaly detection (Isolation Forest) |
| **Email** | `fastapi-mail` or `aiosmtplib` | SMTP / Resend / SendGrid |
| **Logging** | `structlog` or `loguru` | Structured production logs |
| **Monitoring** | `sentry-sdk[fastapi]` | Error tracking |
| **Frontend** | React + Vite | SPA |
| **Language (frontend)** | TypeScript | Strict mode enabled |
| **Routing** | react-router-dom | Protected routes |
| **Server state** | TanStack Query | Caching + retries |
| **HTTP client** | Axios | Interceptors for refresh |
| **Forms** | React Hook Form + Zod | Validated forms |
| **HTML sanitize** | DOMPurify | Frontend XSS prevention |
| **Document viewer** | `react-pdf` / `pdf.js` | Renders PDFs + evidence bounding-box overlays |
| **API testing** | Postman | Collection + environment committed to repo |
| **Deploy: Frontend** | Vercel / Netlify | Set env vars in dashboard |
| **Deploy: Backend** | Render / Railway / Fly.io | Set env vars in dashboard; run Alembic migrations on deploy |
| **Deploy: DB** | Managed PostgreSQL | IP allowlist / private networking required |
| **Deploy: Workers** | Same host or separate worker dyno | Celery worker + beat process for OCR/extraction queue |

**Token lifetime standard:**

- Access JWT: `15 minutes` — sent in `Authorization: Bearer` header
- Refresh token: `7 days` — stored in `HttpOnly; Secure; SameSite=Strict` cookie

---

## 2. Repository Structure

```
DocuTrace/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app factory + router mounts
│   │   ├── core/
│   │   │   ├── config.py              # Pydantic-settings — crash on startup if misconfigured
│   │   │   ├── security.py            # JWT sign/verify, password hashing
│   │   │   └── logging.py             # structlog/loguru config
│   │   ├── db/
│   │   │   ├── session.py             # Async SQLAlchemy engine + session factory
│   │   │   └── base.py                # Declarative base, model registry
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   ├── document_set.py
│   │   │   ├── extracted_field.py
│   │   │   ├── verification_result.py
│   │   │   ├── anomaly.py
│   │   │   ├── obligation.py
│   │   │   ├── risk_score.py
│   │   │   ├── evidence_link.py
│   │   │   └── task.py
│   │   ├── schemas/                   # Pydantic request/response schemas (mirrors models/)
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── routers/
│   │   │       │   ├── auth.py
│   │   │       │   ├── documents.py
│   │   │       │   ├── verification.py
│   │   │       │   ├── anomalies.py
│   │   │       │   ├── obligations.py
│   │   │       │   ├── risk_scores.py
│   │   │       │   ├── qa.py
│   │   │       │   └── tasks.py
│   │   │       └── deps.py            # get_current_user, ownership checks, pagination
│   │   ├── services/                  # Business logic, one module per domain concern
│   │   │   ├── ocr_service.py
│   │   │   ├── extraction_service.py
│   │   │   ├── verification_service.py     # Pandas-based comparison logic
│   │   │   ├── anomaly_service.py          # Scikit-learn Isolation Forest
│   │   │   ├── risk_scoring_service.py
│   │   │   ├── obligation_service.py
│   │   │   ├── qa_service.py               # embeddings + LLM reasoning
│   │   │   ├── action_engine.py            # obligation → task conversion
│   │   │   └── email_service.py
│   │   ├── workers/
│   │   │   ├── celery_app.py
│   │   │   └── tasks.py               # OCR, extraction, embedding jobs (async, queued)
│   │   └── middleware/
│   │       ├── error_handler.py       # Central exception → standard JSON response
│   │       └── rate_limit.py
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   ├── postman/
│   │   ├── collection.json
│   │   └── environment.json
│   ├── tests/
│   ├── .env.example
│   ├── .gitignore
│   ├── requirements.txt / pyproject.toml
│   └── alembic.ini
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                    # Route definitions
│   │   ├── lib/
│   │   │   ├── env.ts                 # VITE_* Zod validation
│   │   │   └── api/
│   │   │       ├── client.ts          # Axios base + withCredentials + interceptors
│   │   │       └── refreshClient.ts   # Separate instance for refresh (no loop)
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx
│   │   │   └── tokenStore.ts          # In-memory token (never localStorage)
│   │   ├── components/
│   │   │   ├── RequireAuth.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── DocumentViewer/        # PDF render + evidence bounding-box overlay
│   │   ├── features/                  # One folder per API resource
│   │   │   ├── documents/
│   │   │   ├── verification/
│   │   │   ├── anomalies/
│   │   │   ├── obligations/
│   │   │   ├── riskScores/
│   │   │   ├── qa/
│   │   │   └── tasks/
│   │   └── pages/
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
└── docs/
    ├── PROJECT_BLUEPRINT.md           # This file
    ├── DocuTrace_PRD.md
    └── BACKEND_PLANNING.md
```

**Rules — never break these:**

- Never commit `.env`, `node_modules/`, `__pycache__/`, `.venv/`, `dist/`, or `build/`
- Always commit `.env.example` with placeholder values and comments
- One source of truth for env validation: `app/core/config.py` (backend), `src/lib/env.ts` (frontend)
- TypeScript strict mode always on; backend uses type hints everywhere with `mypy`/`pyright` enabled in CI
- All schema changes go through Alembic migrations — never edit the database by hand

### `.gitignore` — dependencies, env files, secrets, and build output

**Commit:** source code, `requirements.txt`/`pyproject.toml`/lockfiles, `package.json`/lockfiles, `.env.example`, Postman templates, `alembic/versions/`, `README`, `docs/`.

**Never commit:** real secrets, `node_modules/`, `.venv/`, `__pycache__/`, or generated bundles.

```gitignore
# Python
__pycache__/
*.pyc
.venv/
.mypy_cache/
.pytest_cache/

# Dependencies (frontend)
node_modules/

# Environment & secrets — NEVER commit (only .env.example is allowed)
.env
.env.*
!.env.example

# Private keys and common secret filenames
*.pem
*.key
id_rsa
id_ed25519
*.p12
*.pfx

# Build output
dist/
build/
out/
*.tsbuildinfo

# Logs & coverage
*.log
coverage/
htmlcov/
.nyc_output/

# OS / editor noise
.DS_Store
Thumbs.db
```

**Rules:**

- **`node_modules/`, `.venv/`** — ignored everywhere. Lockfiles (`package-lock.json`, `poetry.lock`/`uv.lock`) **are** committed for reproducible installs.
- **`.env`, `.env.local`, `.env.production`** — all covered by `.env.*` with the `!.env.example` exception.
- **Verify before first push:** `git status` must not list `.env`, `node_modules/`, or `.venv/`. Use `git check-ignore -v path` if unsure.

---

## 3. Environment Variables

### Backend `.env.example`

```env
# ── Server ──────────────────────────────────────────────────────────────
ENVIRONMENT=development
PORT=8000

# ── Database ─────────────────────────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/docutrace
# Production: postgresql+asyncpg://<user>:<pass>@<host>/<db>?sslmode=require

# ── JWT ───────────────────────────────────────────────────────────────────
# Generate: python -c "import secrets; print(secrets.token_hex(64))"
JWT_ACCESS_SECRET=replace_with_64_char_hex
JWT_REFRESH_SECRET=replace_with_different_64_char_hex
JWT_ACCESS_EXPIRES_MINUTES=15
JWT_REFRESH_EXPIRES_DAYS=7

# ── Google OAuth (optional — remove if not using) ──────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/v1/auth/google/callback

# ── Frontend URL ──────────────────────────────────────────────────────────
CLIENT_URL=http://localhost:5173

# ── CORS (comma-separated for multiple origins) ────────────────────────
CORS_ORIGINS=http://localhost:5173

# ── Object storage (documents) ────────────────────────────────────────────
S3_ENDPOINT_URL=http://localhost:9000
S3_BUCKET_NAME=docutrace-documents
S3_ACCESS_KEY_ID=replace_me
S3_SECRET_ACCESS_KEY=replace_me

# ── Redis / Celery (background OCR & extraction queue) ─────────────────
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# ── LLM / Embeddings (Evidence-Grounded Q&A) ────────────────────────────
LLM_API_KEY=replace_me
LLM_MODEL=replace_with_model_name
EMBEDDING_MODEL=replace_with_embedding_model_name

# ── Encryption (for storing sensitive third-party tokens) ────────────
# Generate: python -c "import secrets; print(secrets.token_hex(32))"
ENCRYPTION_KEY=replace_with_64_char_hex

# ── Email ──────────────────────────────────────────────────────────────────
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=your_smtp_api_key
EMAIL_FROM=noreply@yourdomain.com

# ── Monitoring ────────────────────────────────────────────────────────────
SENTRY_DSN=https://your_sentry_dsn_here
```

### Frontend `.env.example`

```env
# ── API ───────────────────────────────────────────────────────────────────
VITE_API_BASE_URL=http://localhost:8000

# ── Feature Flags (optional) ─────────────────────────────────────────────
VITE_ENABLE_REALTIME_STATUS=true
```

### Env Validation Pattern (Backend)

```python
# app/core/config.py
from pydantic import Field, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="forbid")

    environment: str = Field(pattern="^(development|production|test)$")
    port: int = 8000
    database_url: str
    jwt_access_secret: str = Field(min_length=32)
    jwt_refresh_secret: str = Field(min_length=32)
    jwt_access_expires_minutes: int = 15
    jwt_refresh_expires_days: int = 7
    client_url: str
    cors_origins: str
    encryption_key: str = Field(min_length=64, max_length=64)

    # Optional — only required if the feature is enabled
    google_client_id: str | None = None
    google_client_secret: str | None = None
    smtp_host: str | None = None
    sentry_dsn: str | None = None

# Crash immediately on bad config — never run with invalid settings
settings = Settings()  # raises pydantic.ValidationError on startup if misconfigured
```

---

## 4. Backend Architecture

### Middleware Stack Order (`main.py`)

Every request passes through this chain in order. Order matters.

```python
# app/main.py
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
import sentry_sdk

# 1. Sentry init (must happen before app creation)
sentry_sdk.init(dsn=settings.sentry_dsn, traces_sample_rate=0.1)

app = FastAPI(title="DocuTrace API", version="1.0.0")

# 2. Trusted host / security headers
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])  # tighten in production

# 3. CORS — explicit origin list only, never "*" with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# 4. Rate limiting (slowapi) — applied per-router below
# 5. Central exception handlers — standard JSON response shape
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# 6. Routers
app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(documents_router, prefix="/api/v1/documents")
app.include_router(verification_router, prefix="/api/v1/verification")
app.include_router(qa_router, prefix="/api/v1/qa")
app.include_router(tasks_router, prefix="/api/v1/tasks")
```

### Health & readiness (production hosts)

- **`GET /health` (liveness)** — returns `200` if the process is up (no DB call).
- **`GET /ready` (readiness)** — returns `200` only if PostgreSQL and Redis are reachable; otherwise `503`.

Exclude both from strict rate limits if your host polls them frequently.

### Standard Error Response Shape

All errors across the entire API must follow this shape.

```python
# All error responses:
{
  "success": False,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable",
    "fields": {                      # Only present on VALIDATION_ERROR
      "email": ["Invalid email address"]
    }
  }
}

# All success responses:
{
  "success": True,
  "data": { }
}

# Paginated success:
{
  "success": True,
  "data": [],
  "pagination": {"total": 100, "page": 1, "limit": 20, "total_pages": 5}
}
```

### Ownership Check Dependency

Use this in every route that accesses a resource by ID. Never trust that a resource belongs to a user just because they're authenticated.

```python
# app/api/v1/deps.py
from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

async def get_owned_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Document:
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.owner_id == current_user.id)
    )
    document = result.scalar_one_or_none()
    if document is None:
        # Always 404, never 403 — don't confirm the resource exists
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Resource not found"})
    return document
```

### Timing-Safe Token Comparison

```python
# app/core/security.py
import secrets

def safe_compare(a: str, b: str) -> bool:
    return secrets.compare_digest(a, b)
```

---

## 5. API Documentation Standard

Every endpoint must be documented in this format (FastAPI's auto-generated OpenAPI docs at `/docs` supplement this, not replace it — this template captures business rules OpenAPI can't).

### Template (copy for each endpoint)

```
### METHOD /api/v1/<resource>/<action>

**Description:** One sentence describing what this does.
**Auth required:** Yes / No
**Minimum role:** owner / admin / member / public

#### Request

Headers:
  Authorization: Bearer <accessToken>   (if auth required)
  Content-Type: application/json

Path params:
  {id} — UUID of the resource

Query params:
  ?page=1&limit=20    — pagination
  ?filter=value        — filtering

Body:
  {
    "field": "value",        // Required. Description.
    "optional_field": "val"  // Optional. Default: null. Description.
  }

#### Response — 200 OK (GET, PATCH, DELETE)
  { "success": true, "data": { } }

#### Response — 201 Created (POST — new resource created)
  { "success": true, "data": { "id": "uuid", "...": "..." } }

#### Response — 400 Validation Error
  { "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Validation failed", "fields": {} } }

#### Response — 401 Unauthorized
  { "success": false, "error": { "code": "TOKEN_EXPIRED", "message": "Access token expired" } }

#### Response — 403 Forbidden
  { "success": false, "error": { "code": "FORBIDDEN", "message": "Insufficient permissions" } }

#### Response — 404 Not Found
  { "success": false, "error": { "code": "NOT_FOUND", "message": "Resource not found" } }

#### Postman example
  Method: POST
  URL: {{baseUrl}}/api/v1/<resource>
  Body (raw JSON): { "field": "example value" }
  Tests: pm.test("Status 200", () => pm.response.to.have.status(200));
         pm.environment.set("resourceId", pm.response.json().data.id);

#### Use cases
  - Use case 1: ...
  - Use case 2: ...

#### Business rules
  - Rule 1: ...
  - Rule 2: ...
```

### Error Codes Master Reference

| HTTP | Code | When to use |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Pydantic validation failed on body/query/params |
| 400 | `INVALID_REQUEST` | Logically invalid request |
| 401 | `UNAUTHORIZED` | No token provided |
| 401 | `TOKEN_EXPIRED` | Access token expired — client should refresh |
| 401 | `TOKEN_INVALID` | Token tampered or wrong secret |
| 401 | `REFRESH_TOKEN_INVALID` | Refresh token not found or already rotated |
| 403 | `FORBIDDEN` | Authenticated but wrong role |
| 404 | `NOT_FOUND` | Resource not found or doesn't belong to this user |
| 409 | `CONFLICT` | Duplicate resource (e.g. document already in set) |
| 422 | `PROCESSING_FAILED` | OCR/extraction pipeline failed for a document |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests in window |
| 500 | `INTERNAL_ERROR` | Unhandled server error — check Sentry |

---

## 6. Backend Security Checklist

Run through this before every production deployment.

### Environment & Configuration

- All secrets in `.env` — zero secrets hardcoded in source
- `.env` and all `.env.*` in `.gitignore`
- Env validated with Pydantic Settings at startup — app crashes on bad config
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are different, each ≥ 64 chars
- `ENCRYPTION_KEY` is 32 random bytes (64 hex chars) — stored in env only
- PostgreSQL connection uses a restricted DB role (not superuser)
- DB host allowlist / private networking configured — only app servers can connect

### Authentication

- Access tokens short-lived (15 min), refresh tokens long-lived (7 days)
- Access token sent in `Authorization` header only — never in URL
- Refresh token stored in `HttpOnly; Secure; SameSite=Strict` cookie
- Refresh tokens hashed before storing in DB
- Refresh token rotation implemented — new token on every `/auth/refresh` call
- Reused refresh token triggers full revocation for that user (breach signal)
- `secrets.compare_digest()` used for all token comparisons — no `==`
- OAuth `state` parameter validated to prevent CSRF on callback
- Account lockout after N failed login attempts

### API Security

- Security headers set (CSP, X-Frame-Options, X-Content-Type-Options)
- `CORSMiddleware` configured with explicit origin list — never `*` with credentials
- SQLAlchemy parameterized queries everywhere — no raw string-formatted SQL
- `slowapi` rate limiting on all routes — strict limits on auth and upload endpoints
- Request body size limits enforced (large PDFs go through pre-signed upload, not inline body)
- Pydantic validation on every route body/query/params
- Ownership dependency used on every route that accesses a resource by ID — no IDOR
- All queries filter by `owner_id`/`org_id` — cross-user data access impossible
- Soft-delete pattern — `is_deleted` filter on all document queries

### Data & Privacy

- Passwords hashed with bcrypt/argon2 (cost tuned) — never stored plain
- Sensitive third-party tokens encrypted with AES-256-GCM before storage
- Uploaded documents stored in object storage (S3/MinIO), not in the database
- Pre-signed URLs used for upload/download — documents never proxied through app memory unnecessarily
- `GET /users/me/export` endpoint exists (GDPR data portability)
- TTL/cleanup job for soft-deleted records past the 30-day trash window
- Vector store entries (embeddings) scoped and filtered by owner — no cross-tenant retrieval

### Infrastructure

- `GET /health` (liveness) implemented; `GET /ready` (readiness, DB + Redis check)
- Health/readiness routes excluded from aggressive rate limits
- Structured logging in production — **no passwords, tokens, API keys, or raw PII** in logs
- Sentry error monitoring configured with `before_send` scrubbing for sensitive fields
- `pip-audit` and `npm audit` clean — zero high/critical vulnerabilities
- Dependabot or Snyk monitoring dependencies
- Lockfiles used in CI (`pip-compile`/`poetry.lock`, `package-lock.json`) — no floating installs
- API versioning prefix (`/api/v1/`) in place
- Celery workers run under the same secret-management discipline as the API (no secrets in task args logs)
- HTTPS enforced in production — no HTTP

---

## 7. Frontend Architecture

### Axios Client Setup

```typescript
// src/lib/api/client.ts
import axios from 'axios';
import { tokenStore } from '../auth/tokenStore';
import { refreshClient } from './refreshClient';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1',
  withCredentials: true,
  timeout: 15_000,
});

client.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<{ resolve: Function; reject: Function }> = [];

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 &&
        error.response?.data?.error?.code === 'TOKEN_EXPIRED' &&
        !original._retry) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }
      isRefreshing = true;
      try {
        const { data } = await refreshClient.post('/auth/refresh');
        tokenStore.set(data.data.accessToken);
        refreshQueue.forEach((p) => p.resolve(data.data.accessToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return client(original);
      } catch {
        refreshQueue.forEach((p) => p.reject());
        refreshQueue = [];
        tokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

```typescript
// src/auth/tokenStore.ts — access token in MEMORY only, never localStorage
let _token: string | null = null;
export const tokenStore = {
  get: () => _token,
  set: (t: string) => { _token = t; },
  clear: () => { _token = null; },
};
```

### Document Upload + Status Polling Pattern

```typescript
// src/features/documents/api.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client } from '../../lib/api/client';

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return client.post('/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

// Poll processing status until it leaves "queued"/"processing"
export function useDocumentStatus(documentId: string) {
  return useQuery({
    queryKey: ['documents', documentId, 'status'],
    queryFn: () => client.get(`/documents/${documentId}`).then((r) => r.data.data),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'queued' || status === 'processing' ? 3000 : false;
    },
  });
}
```

### Route Protection

```typescript
// src/components/RequireAuth.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
```

---

## 8. Frontend Security Checklist

### Token & Session Security

- Access token stored in **memory only** — never `localStorage`/`sessionStorage`
- Refresh token is an HttpOnly cookie — JavaScript cannot read it
- Single-flight refresh queue implemented — no duplicate refresh calls
- On failed refresh → clear token store + redirect to login
- OAuth callback route reads token from URL param then immediately clears the URL
- No sensitive data (tokens, PII) logged to console in production

### XSS Prevention

- Never use `dangerouslySetInnerHTML` without sanitizing with `DOMPurify` first
- All user-generated content (extracted text, Q&A answers) rendered as React text nodes, not raw HTML
- URLs from documents/metadata validated before use in `href`/`src` — only `http:`/`https:`
- No direct `innerHTML` or `document.write()` usage
- CSP header verified working against the deployed backend

### CSRF Protection

- All state-changing requests use JWT in `Authorization` header — prevents CSRF by default
- Refresh cookie uses `SameSite=Strict`
- No state-changing logic triggered by GET requests

### Dependencies

- `npm audit` runs clean — no high/critical issues
- `npm ci` used in CI (reproducible installs)
- No hardcoded API keys or secrets in frontend source
- `VITE_*` env vars validated with Zod at build time

### Data Handling

- All forms validated with React Hook Form + Zod before submission
- File uploads: type (PDF/PNG/JPG/DOCX) and size validated client-side **and** server-side
- Loading and error states handled for every async operation (upload, processing, Q&A)
- Paginated lists for documents, tasks, and anomalies — no loading all records at once
- Evidence highlights (bounding boxes) rendered from server-provided coordinates only — never inferred client-side

### Route Security

- All authenticated routes wrapped in `<RequireAuth>`
- Role-based route guards where applicable (e.g. admin-only settings)
- 404 page exists for unknown routes
- Redirect after login goes to `state.from`, not always the dashboard

---

## 9. AI Workflow, CI & Git Hygiene

### Secrets and model context

- **Never paste** production `.env` values, API keys, JWT secrets, DB connection strings, or LLM API keys into chat. Use placeholders and describe the *shape* of config instead.
- **Treat AI output as untrusted** — review diffs like a junior developer's PR; pay extra attention to auth, DB queries, and anything that touches uploaded documents.
- **Repository trust:** README/comments/uploaded documents can contain hidden instructions (prompt injection risk is elevated here since DocuTrace ingests arbitrary user documents into an LLM pipeline). Never let extracted document text be interpreted as system instructions — treat it strictly as data in prompts.

### Dependency and package safety

- Before installing a package the AI suggested, **confirm the name on PyPI/npm** — typos and hallucinated names happen.
- **Web search** for `"<exact-package-name> pypi"` / `"<exact-package-name> npm"` + advisory/CVE before trusting a version.
- Prefer lockfiles and `npm ci` / `pip-compile` output in CI so installs are reproducible.

### `.cursorignore` (recommended)

```gitignore
.env
.env.*
!.env.example
node_modules/
.venv/
dist/
build/
*.pem
*.key
```

### Minimal CI baseline

| Step | Command | Purpose |
|---|---|---|
| Install (backend) | `pip install -r requirements.txt` (or `poetry install`) | Reproducible installs |
| Install (frontend) | `npm ci` | Reproducible installs |
| Lint | `ruff check .` / `npm run lint` | Consistent style, common bugs |
| Typecheck | `mypy app/` / `npx tsc --noEmit` | Catch type errors before merge |
| Test | `pytest` / `npm test` | Regressions |
| Migration check | `alembic check` (or dry-run upgrade against a test DB) | Catch missing/broken migrations |
| SCA | `pip-audit` / `npm audit --audit-level=high` | Known vulnerable dependencies |

Optional but valuable: secret scanning (`gitleaks`) so keys never land on `main`.

### What this document does *not* replace

- MFA/passkeys for high-risk deployments.
- Formal penetration tests or DAST, especially given DocuTrace handles financial and legal documents.
- Legal/compliance review (DPAs, data retention policy for uploaded documents, subprocessor list for the LLM/OCR providers).

---

## 10. Postman & Testing Guide

### Collection Setup

1. Import `backend/postman/collection.json`
2. Import `backend/postman/environment.json` and set `baseUrl`: `http://localhost:8000`
3. Leave token variables empty — pre-request scripts fill them

### Run Order (DocuTrace-specific)

```
Step 1:  POST  /auth/register              → creates user account
Step 2:  POST  /auth/login                 → sets refresh cookie + returns access token
Step 3:  GET   /users/me                   → verifies auth works
Step 4:  POST  /documents                  → upload a document (multipart)
Step 5:  GET   /documents/:id              → poll processing status until "complete"
Step 6:  POST  /documents/sets             → group related documents (invoice + PO)
Step 7:  GET   /verification/:setId        → cross-document verification results
Step 8:  GET   /anomalies?document_id=:id  → financial anomaly results
Step 9:  GET   /risk-scores/:id            → explainable risk score
Step 10: POST  /qa/:documentId             → ask a question, expect evidence-linked answer
Step 11: GET   /obligations?document_id=:id → extracted obligations
Step 12: POST  /tasks                      → verify Action Engine created a task
Step 13: POST  /auth/refresh               → verify token refresh works
Step 14: POST  /auth/logout                → verify cookie cleared
Step 15: GET   /users/me                   → verify 401 after logout
```

### Test Script Template

```javascript
pm.test("Status is 200", () => pm.response.to.have.status(200));

pm.test("Response has success: true", () => {
  const json = pm.response.json();
  pm.expect(json.success).to.be.true;
  pm.expect(json.data).to.exist;
});

const json = pm.response.json();
if (json.data?.id) {
  pm.environment.set('resourceId', json.data.id);
}
if (json.data?.accessToken) {
  pm.environment.set('accessToken', json.data.accessToken);
  pm.environment.set('tokenExpiry', Date.now() + 14 * 60 * 1000);
}
```

### Testing All Response Scenarios

| Test | How to trigger |
|---|---|
| Happy path (200/201) | Valid request |
| Validation error (400) | Missing required field |
| Unauthorized (401) | Remove Authorization header |
| Token expired (401) | Use expired token |
| Forbidden (403) | Use account with wrong role |
| Not found (404) | Use non-existent or other user's document ID |
| Processing failed (422) | Upload a corrupted/unreadable file |
| Rate limited (429) | Send 11+ requests in 1 minute on auth/upload route |
| Conflict (409) | Add the same document to a set twice |

---

## 11. Master Prompts

### 11.1 Full-Stack Bootstrap Prompt

```
Build a production-ready full-stack app with TypeScript (frontend) and Python (backend).

Project: DocuTrace — AI-powered business document intelligence platform
Primary resources: documents, document_sets, extracted_fields, verification_results,
anomalies, obligations, risk_scores, evidence_links, tasks

── Backend ──────────────────────────────────────────────────────────────
- Structure: backend/ (FastAPI + SQLAlchemy 2.0 async + Alembic + Pydantic v2) and
  frontend/ (Vite + React + TypeScript)
- Before writing requirements.txt/package.json: **web search** each dependency for latest
  stable + security advisories, then confirm with `pip index versions` / `npm show` — never
  copy versions from this doc
- app/core/config.py (Pydantic Settings, crash on bad config), db/session.py (async engine),
  main.py (app factory + router mounts)
- Modules under app/api/v1/routers/<resource>.py + app/services/<resource>_service.py +
  app/models/<resource>.py + app/schemas/<resource>.py
- Auth: Google OAuth + email/password; JWT access (15min) in JSON response;
  refresh (7d) in HttpOnly; Secure; SameSite=Strict cookie; rotation with hashed refresh
  token in DB; logout clears cookie + DB entry
- Security middleware: Sentry init, CORS (explicit origins), slowapi rate limiting,
  ownership dependency, Pydantic validation on every route
- All errors follow: { success: false, error: { code, message, fields? } }
- All success responses follow: { success: true, data: {} }
- secrets.compare_digest() for all token comparisons
- Structured logging in production — never log passwords, tokens, API keys, or raw PII
- Celery + Redis for the OCR/extraction/embedding pipeline (async, queued, retryable)
- S3-compatible object storage for uploaded documents (pre-signed URLs)
- pgvector (or dedicated vector DB) for evidence-grounded Q&A embeddings
- Pandas for cross-document field comparison; Scikit-learn (Isolation Forest) for anomaly
  detection on historical vendor amounts
- AES-256-GCM encryption for any sensitive third-party tokens stored in DB
- GET /health (liveness) and GET /ready (readiness — DB + Redis check); exclude from
  strict rate limits if the host polls often

── Frontend ─────────────────────────────────────────────────────────────
- Validate VITE_API_BASE_URL and all VITE_* vars with Zod in src/lib/env.ts
- Axios instance with withCredentials:true; single-flight refresh interceptor on 401
  using a separate refreshClient (no interceptors) to prevent infinite loops
- Access token in memory only (tokenStore.ts) — never localStorage or sessionStorage
- AuthProvider bootstraps session on load via POST /auth/refresh then GET /users/me
- RequireAuth wrapper for all protected routes
- TanStack Query for all server state, including polling document processing status
- React Hook Form + Zod for all forms
- DOMPurify for any user-generated HTML content (Q&A answers, extracted text)
- react-pdf/pdf.js document viewer with evidence bounding-box overlay for Q&A citations
- Error boundary at root level

── Deliverables ─────────────────────────────────────────────────────────
1. .env.example for both backend and frontend with comments
2. Root .gitignore — node_modules/, .venv/, .env*, keys, dist/build; only .env.example
   for secrets template; lockfiles committed
3. .cursorignore at repo root mirroring sensitive paths per Section 9
4. README with setup instructions (install, migrate, seed, run) + minimal CI instructions
   or a .github/workflows CI file
5. Postman collection + environment JSON under backend/postman/
6. Alembic migration setup with an initial migration for all core entities
7. Full API documentation for each endpoint following the template in PROJECT_BLUEPRINT.md
```

### 11.2 Backend-Only Prompt

```
Build a production-ready FastAPI + SQLAlchemy 2.0 + PostgreSQL backend for DocuTrace.

Resources: documents, document_sets, extracted_fields, verification_results, anomalies,
obligations, risk_scores, evidence_links, tasks

Before writing requirements.txt: web search (latest + CVE/advisory) for each dependency,
confirm with `pip index versions`; do not use hardcoded versions from any blueprint.

Requirements:
- Pydantic-Settings validated env at startup — crash if misconfigured
- Email/password + optional Google OAuth
- JWT access (15min) + refresh (7d) in HttpOnly cookie with rotation and breach detection
- CORS with explicit origin list, slowapi rate limiting (strict on auth/upload)
- Ownership dependency in every route accessing a resource by ID — 404 not 403 for wrong user
- secrets.compare_digest() for token comparisons
- passlib/argon2 for passwords and hashed refresh tokens
- Pydantic schemas on every route; consistent { success, error: {code, message, fields} } shape
- Structured logging in production — no passwords, tokens, or raw PII in logs; Sentry with scrubbing
- GET /health + GET /ready (DB + Redis connectivity)
- Soft delete pattern (is_deleted + deleted_at) with 30-day trash window on documents
- Celery worker pipeline: OCR → extraction → verification → anomaly detection → risk
  scoring → embedding generation, each stage retryable and independently observable
- Pandas-based cross-document verification service
- Scikit-learn Isolation Forest anomaly detection service, trained per-vendor where
  historical data exists, with a documented cold-start fallback
- pgvector-backed evidence retrieval for Q&A, always returning document/page/region
  citations alongside any generated answer

Deliver: .env.example, README, Postman collection, Alembic migrations, full endpoint
documentation per resource
```

### 11.3 Security Hardening Only Prompt

```
Audit and harden this FastAPI + SQLAlchemy + PostgreSQL API for production.

Check and implement if missing:
1. slowapi rate limiting — per-route (strict on auth/upload, general on API)
2. CORS with explicit origin list from env — no wildcard
3. Request body size limits — large files go through pre-signed upload, not inline JSON
4. All DB queries filtered by owner_id/org_id — no IDOR
5. Ownership dependency — 404 not 403 on wrong user
6. secrets.compare_digest() — all token comparisons
7. Refresh token: hashed in DB, rotate on use, revoke all on reuse
8. Account lockout: track failed attempts, lock after N for a cooldown window
9. Generic error messages on invite/auth — no email enumeration
10. AES-256-GCM for sensitive tokens stored in DB
11. Pydantic validation on every route body/query/params
12. Cleanup job for soft-deleted records past the trash window
13. Structured logging + Sentry in production, with scrubbing
14. pip-audit / npm audit — fix all high/critical before deploying
15. Vector store queries scoped to the requesting user/org — no cross-tenant retrieval
16. GDPR: GET /users/me/export endpoint
17. GET /health (liveness) + GET /ready (readiness); tune rate limits so health checks
    are not throttled
18. .gitignore verified — .env*, node_modules/, .venv/, dist, keys never tracked
19. Prompt-injection guardrails: extracted document text is always passed to the LLM as
    data, never concatenated in a way that could be interpreted as system instructions
```

### 11.4 Frontend Security Hardening Prompt

```
Audit and harden this React + TypeScript + Axios frontend for production.

Check and implement if missing:
1. Access token in memory only (tokenStore) — remove any localStorage usage
2. Single-flight refresh interceptor — no duplicate refresh calls
3. Separate refreshClient without interceptors — prevent refresh loops
4. DOMPurify on all dangerouslySetInnerHTML usage (Q&A answers, extracted text)
5. URL validation before href/src — only http: and https:
6. All forms validated with React Hook Form + Zod before submit
7. Error boundary at root level
8. RequireAuth on all protected routes
9. OAuth callback clears token from URL immediately after reading
10. No console.log of tokens or document content in production
11. npm audit clean
12. VITE_* env vars validated with Zod at build time
13. Loading + error states for every async operation, including long-running document
    processing
14. Paginated lists — no unbounded document/task fetching
15. File uploads validated client-side (type + size) before sending
16. Evidence bounding-box overlay coordinates trusted only from server responses
```

---

## 12. Domain Add-On: Document Intelligence Pipeline

This is the DocuTrace-specific add-on that replaces the generic "Domain UI" placeholders from the source blueprint.

```
Domain UI: react-pdf/pdf.js document viewer with page thumbnails, evidence highlight
overlays, and a side panel for extracted fields / risk factors / obligations
Resources: documents, document_sets, extracted_fields, verification_results, anomalies,
obligations, risk_scores, evidence_links, tasks

Special features:
- Async processing pipeline (Celery): upload → OCR → layout parsing → field extraction →
  cross-document verification → anomaly detection → obligation extraction → risk scoring →
  embedding generation, with per-stage status visible to the frontend
- Document classification step (invoice / PO / contract / financial report / compliance)
  before extraction, since extraction schemas differ per type
- Confidence scores stored alongside every extracted field; UI should visually distinguish
  low-confidence fields for manual review
- Cross-document verification via Pandas: join fields across a document_set on a shared key
  (vendor + PO number), diff amounts/quantities/dates/tax, flag with severity
- Anomaly detection via Scikit-learn Isolation Forest trained on historical per-vendor
  amount distributions; documented fallback (rule-based thresholds) for new vendors with
  no history (cold start)
- Explainable risk score: a composite score with a `contributing_factors` JSON array,
  each factor referencing the specific verification/anomaly/missing-field/obligation
  record that produced it — never a bare number
- Evidence-grounded Q&A: retrieval-augmented generation over pgvector embeddings, every
  answer required to carry document_id + page + bounding-box citations; if no supporting
  evidence is retrieved above a similarity threshold, return "insufficient evidence" rather
  than a generated guess
- Obligation → Action Engine: obligations extracted with due_date + responsible_party are
  auto-converted into tasks with reminders; anomalies/risk flags generate recommended
  (not automatic) actions requiring user confirmation
- 30-day soft-delete/trash window on documents, with a scheduled cleanup job for permanent
  deletion after expiry
- Rate limit the upload and Q&A endpoints separately from general reads — both are the
  most resource-intensive paths (OCR/LLM calls)
```

---

## 13. Document Maintenance

This document reflects **processes** that stay valid over time; **dependency numbers are never authoritative** here.

**When to update this file:**

- When you add a new integration (LLM provider, OCR service, object storage, email provider) → add its env vars to both `.env.example` files and to the Pydantic Settings schema, then update Section 12
- When you change auth strategy (e.g. add MFA, switch to Passkeys) → update Section 6 checklist and Section 11 prompts
- When you change AI/CI/git hygiene practices → update Section 9
- When a **CVE** is published for a dependency you use → rotate secrets if affected, upgrade to a patched release (verify via search + `pip-audit`/`npm audit`), document the incident in your own changelog
- When deploying to a new hosting provider → re-verify cookie `Secure` flag, CORS origins, HTTPS enforcement, and Celery worker connectivity to Redis/DB

**Security review triggers:**

- Any change to cookie domain, `SameSite`, or `Secure` attributes
- Any change to CORS `origin` list
- Any change to OAuth redirect URLs
- Any new public endpoint (no auth) — add to rate-limit config
- Any change to how extracted document text is passed into LLM prompts (prompt-injection surface)

**AI assistant instruction:**
When using this document as context, follow the **⚠️ Version Safety Rule** at the top: **web search** for each dependency, confirm with `pip index versions`/`npm show` when the shell is available, state what you verified in your answer, and **never** copy semver literals from this file into `requirements.txt`/`package.json`.

---

*Adapted from a generic MERN blueprint template. Tech stack sourced from `DocuTrace_PRD.md` Section 3.1 (FastAPI + PostgreSQL + SQLAlchemy + React/Vite + Pandas/Scikit-learn).*