# DocuTrace — Intelligent Business Document Analysis & Verification Platform

<div align="center">

<a href="https://github.com/atharva-thedev/DocuTrace">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/darkthemelogo.png">
    <source media="(prefers-color-scheme: light)" srcset="assets/lightthemelogo.png">
    <img alt="DocuTrace Logo" src="assets/darkthemelogo.png" width="480">
  </picture>
</a>

<br/>

**Transform unstructured invoices, contracts, purchase orders, and financial reports into structured, verifiable, and actionable business intelligence.**

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.141+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.5+-F7931E.svg?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00.svg?style=flat&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Ready-47A248.svg?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 📖 Table of Contents

- [Executive Summary](#-executive-summary)
- [The Core Problem](#-the-core-problem)
- [Key Value Proposition](#-key-value-proposition)
- [Core Features & Capabilities](#-core-features--capabilities)
- [Machine Learning & AI Architecture](#-machine-learning--ai-architecture)
  - [ML Model Benchmark & Evaluation Results](#ml-model-benchmark--evaluation-results)
  - [Confusion Matrices & Visual Telemetry](#confusion-matrices--visual-telemetry)
- [System Architecture](#-system-architecture)
- [End-to-End Pipeline Workflow](#-end-to-end-pipeline-workflow)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started & Installation](#-getting-started--installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Machine Learning Training & Dataset Generation](#machine-learning-training--dataset-generation)
- [Environment Variables](#-environment-variables)
- [API Reference & Swagger Documentation](#-api-reference--swagger-documentation)
- [Security, Cryptography & Governance](#-security-cryptography--governance)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Screenshots & UI Walkthrough](#-screenshots--ui-walkthrough)
- [Future Roadmap](#-future-roadmap)
- [Project Information & License](#-project-information--license)

---

## 🌟 Executive Summary

**DocuTrace** is an enterprise-grade document intelligence, verification, and auditing platform engineered to bridge the gap between unstructured business documents and mission-critical enterprise workflows. Rather than treating documents as passive text files, DocuTrace ingests PDFs, scanned images, and commercial records, extracts structured properties, recalculates mathematical integrity, performs automated **3-way cross-document reconciliation** (Invoice ↔ Purchase Order ↔ Contract), detects anomalies using unsupervised machine learning and statistical models, runs multi-class document categorization, and generates auditable, coordinate-grounded action items.

Every extracted number, entity, obligation, and risk alert is verifiable down to precise **pixel-level bounding box coordinates** (`[x0, y0, x1, y1]`) on the rendered document page.

---

## ⚠️ The Core Problem

Modern enterprises process millions of mission-critical commercial documents annually across accounts payable, procurement, legal, and compliance departments. Manual inspection and legacy black-box OCR tools suffer from critical vulnerabilities:

1. **Unchecked Vendor Price Creep**: Invoices subtly deviate from approved Purchase Order quantities or contracted Master Service Agreement (MSA) rate cards.
2. **Buried Deadlines & Automatic Rollovers**: Contractual notice periods, warranty expirations, and renewal windows hidden in dense legalese cause costly unwanted commitments.
3. **Arithmetic & Tax Inconsistencies**: Tax miscalculations, discount errors, and duplicate invoice submissions slip through manual spot-checks.
4. **Zero Auditability**: Conventional AI systems output plain text figures with zero verifiable evidence, exposing organizations to compliance and financial audit failures.

DocuTrace eliminates these vulnerabilities through automated, transparent, and reproducible document intelligence.

---

## 💡 Key Value Proposition

> *"Don't just extract data. Understand it, verify it, explain it, and turn it into action."*

```text
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │   EXTRACT    │ ──► │    VERIFY    │ ──► │   EXPLAIN    │ ──► │    DETECT    │ ──► │     ACT      │
  │ Spatial OCR  │     │ 3-Way Match  │     │ Risk Scoring │     │  ML Models   │     │ Action Tasks │
  │ Coordinates  │     │ Math Checks  │     │ Evidence BBox│     │ Isolation ML │     │ Kanban Board │
  └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

- **Extract**: High-precision layout-aware extraction of key-value pairs, tables, and entities with exact spatial bounding box coordinates.
- **Verify**: Multi-document reconciliation across transaction sets to enforce rate cards, quantities, and contractual terms.
- **Explain**: Transparent composite risk ratings from 0 to 100 with clear factor attribution breakdowns.
- **Detect**: Dual-engine anomaly detection combining deterministic formula verification with Scikit-learn `IsolationForest` statistical outlier models and multi-class classification.
- **Act**: Automatic generation of prioritized tasks, assignees, and deadlines derived directly from contractual obligations and audit findings.

---

## 🚀 Core Features & Capabilities

### 1. Multimodal Document Analysis & Spatial OCR
- Ingests multiple enterprise formats: **PDF, scanned images (PNG, JPG, JPEG), and DOCX**.
- Implements spatial layout analysis with word-level and block-level coordinate mapping.
- Generates high-resolution page renderings for synchronous side-by-side canvas inspection with interactive SVG bounding boxes.

### 2. Intelligent Information Extraction
- Automatically extracts structured entity fields:
  - **Financial**: Subtotals, tax breakdowns, shipping fees, currency, and grand totals.
  - **Commercial**: Vendor name, buyer details, invoice number, PO reference, and tax IDs.
  - **Temporal**: Invoice issue date, due date, delivery milestones, and payment terms (e.g., Net 30, Net 60).
- Assigns granular confidence scores (`0.00` to `1.00`) to every extracted entity.

### 3. Machine Learning Document Classification & Risk Suite
- **Multi-Class Document Classifier**: Categorizes incoming documents into 10 enterprise document classes using TF-IDF and calibrated classifiers.
- **Status & Compliance Risk Predictor**: Evaluates lifecycle risk stages across 5 status categories (Issued, Pending, Verified, Revoked, Expired).
- **Cryptographic Trace Anomaly Detector**: Unsupervised `IsolationForest` model identifying irregular document payloads, anomalous turnaround times, and signature drifts.
- **MongoDB Atlas Telemetry**: Persists ML prediction payloads and telemetry history to MongoDB Atlas (`docutrace.ml_predictions`).

### 4. Cross-Document 3-Way Reconciliation
- Clusters documents into logical transaction groups (e.g., *Acme Cloud Q3 Renewal*).
- Compares field values across **Invoice ↔ Purchase Order ↔ Contract**:
  - Highlights unit rate variances and unapproved markups.
  - Detects quantity mismatches against authorized purchase caps.
  - Flags conflicting payment terms (e.g., Invoice demanding Net 30 while Contract specifies Net 60).

### 5. Financial Anomaly Detection & Fraud Guard
- **Formula Verification**: Deterministically recomputes line items: $\sum (\text{Qty} \times \text{Rate}) + \text{Tax} - \text{Discount} = \text{Total}$.
- **Duplicate Detection**: SHA-256 binary fingerprinting and composite key hashing (`Vendor + Invoice# + Total`) prevent double billing.
- **Statistical Outliers**: Unsupervised Scikit-learn `IsolationForest` model flags unusual spending spikes compared to historical vendor baselines.

### 6. Evidence-Grounded Q&A (RAG Studio)
- Natural language conversational assistant for asking arbitrary questions against single or multi-document sets.
- Employs chunked spatial retrieval with semantic embeddings (`text-embedding-004`).
- Every generated answer includes direct citation chips with page numbers and spatial bounding box highlighting.

### 7. Obligation & Event Detection
- Parses complex contractual text to identify commitments, warranty clauses, SLA response times, indemnities, and penalty conditions.
- Extracts explicit due dates and recurring milestones.

### 8. Explainable Risk Scoring Engine
- Computes a dynamic composite risk rating (**0–100 score**) with categorizations (**Low**, **Moderate**, **High**, **Critical**).
- Factor-weighted explainability report highlights exactly which discrepancies, math anomalies, and missing clauses contributed to the risk level.

### 9. Obligation → Action Engine (Kanban Workflow)
- Directly converts extracted obligations and anomaly remediation requirements into assignable tasks.
- Includes full Kanban workflow tracking (**Todo**, **In Progress**, **Review**, **Done**), due dates, and priority indicators.

### 10. Executive Analytics & Telemetry Dashboard
- High-level KPI summary cards, 4-tier risk distribution charts, document breakdown statistics, and active audit alerts.

---

## 🧠 Machine Learning & AI Architecture

DocuTrace incorporates a dedicated production machine learning pipeline located in `ml/` and integrated into the backend inference service (`backend/app/services/ml_classifier_service.py`):

```mermaid
flowchart LR
    Doc[Document Payload & Snippet] --> Pre[TF-IDF & Categorical Preprocessing]
    Pre --> C1[Document Type Classifier<br/>LinearSVC / LogisticRegression]
    Pre --> C2[Status & Risk Predictor<br/>RandomForestClassifier]
    Pre --> C3[Trace Anomaly Detector<br/>IsolationForest]
    C1 --> Out[Class Probabilities & Confidence]
    C2 --> Out
    C3 --> Out
    Out --> Mongo[(MongoDB Atlas Telemetry)]
    Out --> API[FastAPI /api/v1/ml/evaluate]
```

### ML Model Benchmark & Evaluation Results

Evaluated across **60,000 document records** (including standard enterprise datasets and tricky adversarial edge cases):

| Model Task | Architecture | Dataset Size | Test Accuracy | Precision | Recall | Macro F1 | ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Document Type Classification** | `CalibratedClassifierCV(LinearSVC)` + TF-IDF (1-3 ngrams) | 60,000 samples (10 classes) | **100.0%** | **1.0000** | **1.0000** | **1.0000** | **1.0000** |
| **Financial Anomaly Detection** | `sklearn.ensemble.IsolationForest` | 1,320 transaction records | **98.86%** | **0.8889** | **1.0000** | **0.9412** | **1.0000** |
| **Status & Compliance Prediction** | `RandomForestClassifier` (5 classes) | 50,000 samples | **56.62%** | **0.6124** | **0.5662** | **0.6219** | — |

#### Supported Document Classes:
1. `Academic Certificate / Transcript`
2. `Compliance Certificate`
3. `Employment Verification`
4. `Export Declaration`
5. `Financial Statement`
6. `Identity Document / Credential`
7. `Legal Contract / MSA`
8. `Medical Record`
9. `Patent Filing`
10. `Real Estate / Property Deed`

---

### Confusion Matrices & Visual Telemetry

The models were validated using holdout test sets and tricky adversarial samples:

<div align="center">

| Document Type Confusion Matrix | Status Risk Confusion Matrix | Tricky Classifier Matrix |
| :---: | :---: | :---: |
| <img src="assets/doc_type_confusion_matrix.png" width="280" alt="Document Type Confusion Matrix"/> | <img src="assets/status_confusion_matrix.png" width="280" alt="Status Confusion Matrix"/> | <img src="assets/tricky_doc_type_confusion_matrix.png" width="280" alt="Tricky Document Matrix"/> |

</div>

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend Client (React 19.2 + TypeScript + Vite)"]
        UI["Dual-Theme UI (Light #3B82F6 / Dark #121212)"]
        Landing["Landing Page & Live Demo"]
        Studio["Document Studio & Spatial Canvas Viewer"]
        Recon["3-Way Reconciliation View"]
        Kanban["Action Engine / Kanban Board"]
        QAScreen["Evidence Q&A Studio"]
        Dash["Executive Analytics Dashboard"]
    end

    subgraph API ["API & Gateway Layer (FastAPI)"]
        AuthMid["JWT Auth & Role Guard (RBAC)"]
        RateLim["SlowAPI Rate Limiter"]
        SecHeaders["Security & CORS Middleware"]
        V1Router["API v1 Router (/api/v1)"]
    end

    subgraph Processing ["Document Intelligence Pipeline"]
        Ingest["Magic-Byte Validation & SHA-256 Hashing"]
        OCR["Spatial OCR & BBox Extractor (pdfplumber / pypdfium2)"]
        EntityExt["Deterministic & LLM Entity Extraction"]
        MLService["DocuTrace ML Inference Service (3 Models)"]
        AnomalyEng["Anomaly Engine (Formula Check + IsolationForest)"]
        ReconcileEng["3-Way Cross-Doc Matching Engine"]
        RiskEng["Explainable Risk Scoring Engine (0-100)"]
        ActionEng["Obligation-to-Task Engine"]
        RAG["Evidence-Grounded RAG Q&A (text-embedding-004)"]
    end

    subgraph Storage ["Data & Persistence Layer"]
        DB[(Relational DB: SQLite / PostgreSQL + SQLAlchemy Async)]
        MongoDBAtlas[(MongoDB Atlas: ML Predictions & Telemetry)]
        FileStore[("Encrypted Document Storage (AES-256-GCM)")]
    end

    Client <-->|REST API / JSON| API
    API --> V1Router
    V1Router --> Processing
    Processing <--> Storage
    Storage --> DB
    Storage --> MongoDBAtlas
```

---

## 🔄 End-to-End Pipeline Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Auditor as User / Auditor
    participant FE as Frontend Dashboard
    participant API as FastAPI Gateway
    participant Pipe as Pipeline Orchestrator
    participant OCR as Spatial OCR & Layout
    participant ML as ML Inference Service
    participant Ext as Extraction & AI
    participant Anom as Anomaly & Risk Engine
    participant DB as Storage (SQLAlchemy + Mongo)

    Auditor->>FE: Upload Document (PDF/Image)
    FE->>API: POST /api/v1/documents/upload
    API->>Pipe: Validate Magic Bytes & SHA-256
    Pipe->>DB: Store Document Record & Encrypted File
    Pipe->>OCR: Extract Spatial Bounding Boxes & Text Grids
    OCR-->>Pipe: Spatial BBoxes [x0, y0, x1, y1]
    Pipe->>ML: Run Document Classifier & Trace Anomaly Detector
    ML-->>Pipe: Document Type, Confidence & Softmax Probabilities
    Pipe->>Ext: Extract Entities & Contract Obligations
    Ext-->>Pipe: Structured Properties & Confidence Scores
    Pipe->>Anom: Run Formula Verification & IsolationForest Outlier Model
    Anom-->>Pipe: Detected Anomalies & Risk Score (0-100)
    Pipe->>DB: Persist Extractions, Anomalies, Tasks, Risk & Mongo Telemetry
    Pipe-->>API: Processing Complete
    API-->>FE: Stream Complete Processed Document
    FE-->>Auditor: Display Interactive Studio with Spatial Highlights
```

---

## 💻 Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | `React 19.2`, `TypeScript 5+`, `Vite 8.3` | Reactive, high-performance user interface and component architecture |
| **Styling & Design** | `Tailwind CSS v4`, `@tailwindcss/vite`, `clsx`, `tailwind-merge` | Dual-theme system (Adaptive Dark & Light themes with custom brand tokens) |
| **UI Components & Charts** | `Lucide React`, `Recharts 3.10`, `Framer Motion` | Data visualization, metrics telemetry, interactive gauges, and icons |
| **Document Rendering** | `PDF.js` (`pdfjs-dist`), HTML5 Canvas | Spatial document rendering and coordinate bounding-box overlays |
| **State & Networking** | `@tanstack/react-query 5.102`, `Axios`, `React Router v7` | Client-side cache synchronization, async queries, and route orchestration |
| **Backend Framework** | `Python 3.11+`, `FastAPI 0.141`, `Starlette`, `Uvicorn` | Asynchronous RESTful API layer with OpenAPI auto-documentation |
| **Security & Auth** | `PyJWT`, `Passlib (Bcrypt)`, `Cryptography (AES-256-GCM)` | Token-based authentication, password hashing, and field-level encryption |
| **Rate Limiting & Logging** | `SlowAPI`, `Loguru` | API rate limiting, structured logging, and request execution timing |
| **Relational Database** | `SQLAlchemy 2.0 (Async)`, `PostgreSQL (asyncpg)`, `aiosqlite`, `Alembic` | Relational schema management, transactions, and migration support |
| **Telemetry & NoSQL** | `MongoDB Atlas`, `Motor / PyMongo` | ML prediction history and model telemetry logging |
| **Data Validation** | `Pydantic v2`, `pydantic-settings`, `email-validator` | Strict payload schema validation and environment management |
| **OCR & Layout Engine** | `pdfplumber`, `pypdfium2`, `pypdf`, `pdfminer.six`, `python-docx`, `Pillow` | Coordinate bounding-box extraction, text extraction, and page rendering |
| **Machine Learning & ML** | `scikit-learn`, `joblib`, `pandas`, `numpy`, `scipy` | Multi-class document classification, status risk prediction, and IsolationForest anomaly detection |
| **AI / LLM Integration** | `Google Gemini API` (`text-embedding-004`) / `OpenAI API` | Evidence-grounded semantic Q&A and complex clause understanding |
| **Testing & Quality** | `pytest 9.1`, `pytest-asyncio`, `oxlint` | Automated unit testing and frontend static analysis |

---

## 📁 Repository Structure

```text
DocuTrace/
├── assets/                          # Repository brand assets & confusion matrices
│   ├── darkthemelogo.png            # Dark theme brand logo
│   ├── lightthemelogo.png           # Light theme brand logo
│   ├── logo.png                     # Square app icon
│   ├── hero.png                     # Hero preview graphic
│   ├── doc_type_confusion_matrix.png
│   ├── status_confusion_matrix.png
│   └── tricky_doc_type_confusion_matrix.png
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py              # Dependency injections (Auth, DB session, Roles)
│   │   │   └── v1/
│   │   │       ├── api.py           # V1 Router aggregator
│   │   │       └── endpoints/       # Route handlers
│   │   │           ├── anomalies.py
│   │   │           ├── auth.py
│   │   │           ├── dashboard.py
│   │   │           ├── document_sets.py
│   │   │           ├── documents.py
│   │   │           ├── extractions.py
│   │   │           ├── ml.py        # ML multi-model evaluation & MongoDB telemetry
│   │   │           ├── obligations.py
│   │   │           ├── qa.py
│   │   │           ├── risk_scores.py
│   │   │           ├── tasks.py
│   │   │           └── verifications.py
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic v2 settings & environment configuration
│   │   │   ├── database.py          # SQLAlchemy async engine & session maker
│   │   │   ├── logging.py           # Loguru structured logging configuration
│   │   │   ├── security.py          # JWT, password hashing, and AES-256 encryption
│   │   │   └── seed.py              # Initial demo seed data generator
│   │   ├── models/                  # SQLAlchemy ORM database models
│   │   │   ├── anomaly.py
│   │   │   ├── document.py
│   │   │   ├── document_set.py
│   │   │   ├── extraction.py
│   │   │   ├── obligation.py
│   │   │   ├── qa.py
│   │   │   ├── risk_score.py
│   │   │   ├── task.py
│   │   │   ├── user.py
│   │   │   └── verification.py
│   │   ├── schemas/                 # Pydantic request & response schemas
│   │   ├── services/                # Core business logic & AI pipelines
│   │   │   ├── action_engine.py
│   │   │   ├── anomaly_service.py
│   │   │   ├── extraction_service.py
│   │   │   ├── ml_classifier_service.py # Production ML inference loader
│   │   │   ├── obligation_service.py
│   │   │   ├── ocr_service.py
│   │   │   ├── pipeline_orchestrator.py
│   │   │   ├── rag_qa_service.py
│   │   │   ├── risk_engine.py
│   │   │   ├── summary_service.py
│   │   │   └── verification_service.py
│   │   ├── utils/                   # File validation, bounding box formatters, helpers
│   │   └── main.py                  # FastAPI application entrypoint & middleware
│   ├── postman/                     # Postman API collection
│   ├── tests/                       # Pytest test suite
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_document_sets.py
│   │   ├── test_documents.py
│   │   └── test_pipeline.py
│   ├── .env.example                 # Backend environment variable template
│   ├── pytest.ini                   # Pytest configuration
│   ├── requirements.txt             # Python production dependencies
│   └── storage/                     # Upload storage & local document artifacts
├── doc/
│   ├── BACKEND_PLANNING.md          # Backend architecture specification
│   ├── Docutrace_prd.md             # Product Requirements Document (PRD)
│   ├── FRONTEND_PLANNING.md         # Frontend design specification
│   └── intruction.md                # System instructions & reference notes
├── frontend/
│   ├── public/                      # Static web assets & logos
│   ├── src/
│   │   ├── auth/                    # Auth context & in-memory token management
│   │   ├── components/              # Global UI design system
│   │   │   ├── layout/              # Sidebar, Header, AppLayout
│   │   │   └── ui/                  # BrandLogo, Button, Card, Badge, Modal, etc.
│   │   ├── context/                 # ThemeContext (Light & Dark mode state)
│   │   ├── features/                # Domain-specific feature modules
│   │   │   ├── anomalies/
│   │   │   ├── dashboard/
│   │   │   ├── documents/
│   │   │   ├── extractions/
│   │   │   ├── obligations/
│   │   │   ├── qa/
│   │   │   ├── risk_scores/
│   │   │   ├── tasks/
│   │   │   └── verification/
│   │   ├── pages/                   # Application route views
│   │   │   ├── auth/                # LoginPage, RegisterPage
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DocumentSetsPage.tsx
│   │   │   ├── DocumentStudioPage.tsx
│   │   │   ├── DocumentsPage.tsx
│   │   │   ├── LandingPage.tsx      # Landing page & live product showcase
│   │   │   ├── QAStudioPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── TasksPage.tsx
│   │   ├── services/                # Axios API client integrations
│   │   ├── types/                   # TypeScript interfaces & enums
│   │   ├── utils/                   # Formatters, bounding box helpers, security sanitize
│   │   ├── App.tsx                  # Main router configuration
│   │   ├── index.css                # Tailwind CSS v4 design tokens & theme layers
│   │   └── main.tsx                 # React DOM mount point
│   ├── package.json                 # Frontend dependencies & scripts
│   ├── tsconfig.json                # TypeScript compiler configuration
│   └── vite.config.ts               # Vite bundler configuration
├── ml/                              # Machine Learning Pipeline & Training Suite
│   ├── models/                      # Serialized .joblib model artifacts
│   │   ├── document_type_classifier.joblib
│   │   ├── status_risk_model.joblib
│   │   └── trace_anomaly_detector.joblib
│   ├── doctrace_50k_mock_data.csv   # 50,000 enterprise document dataset
│   ├── doctrace_tricky_train_10k.csv# 10,000 adversarial edge cases dataset
│   ├── evaluation_results.json      # Benchmark metrics
│   ├── tricky_evaluation_results.json
│   ├── generate_dataset.py          # Synthetic dataset generator
│   ├── train_models.py              # Main training script for models
│   └── train_tricky_classifier.py   # Adversarial classifier training
├── package.json                     # Root monorepo scripts
└── README.md                        # Primary project documentation
```

---

## 🛠️ Getting Started & Installation

### Prerequisites

Ensure the following tools are installed on your machine:
- **Python 3.11+** ([Download Python](https://www.python.org/downloads/))
- **Node.js 18+ & npm** ([Download Node.js](https://nodejs.org/))
- **Git** ([Download Git](https://git-scm.com/))
- *(Optional)* **MongoDB Atlas URI** for ML telemetry logging.
- *(Optional)* **PostgreSQL 14+** if using PostgreSQL instead of default SQLite.

---

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/atharva-thedev/DocuTrace.git
   cd DocuTrace/backend
   ```

2. **Create and activate a Python virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux (Bash)**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

5. **Start the FastAPI server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   - **Backend API**: `http://localhost:8000`
   - **Interactive Swagger Docs**: `http://localhost:8000/docs`
   - **Health Check**: `http://localhost:8000/health`

---

### Frontend Setup

1. **Navigate to the frontend directory** (in a new terminal):
   ```bash
   cd DocuTrace/frontend
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```

   - **Frontend Application**: `http://localhost:5173`

4. **Build for production** (optional verification):
   ```bash
   npm run build
   ```

---

### Machine Learning Training & Dataset Generation

To retrain the ML classifiers or regenerate the benchmark datasets:

```bash
# Generate 50,000 synthetic records and 10,000 adversarial edge cases
python ml/generate_dataset.py

# Train Document Classifier, Status Predictor & IsolationForest Anomaly Detector
python ml/train_models.py

# Train Adversarial Calibrated LinearSVC Classifier
python ml/train_tricky_classifier.py
```

The trained `.joblib` models are automatically saved to `ml/models/` and loaded by the backend inference service.

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory using the provided `.env.example` template:

```env
# ── Application Settings ──────────────────────────────────────
PROJECT_NAME="DocuTrace"
ENVIRONMENT="development"
DEBUG=True
API_V1_STR="/api/v1"

# ── Server & CORS ─────────────────────────────────────────────
HOST="0.0.0.0"
PORT=8000
BACKEND_CORS_ORIGINS="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

# ── Database Configuration ────────────────────────────────────
# Default local SQLite (Async):
DATABASE_URL="sqlite+aiosqlite:///./docutrace.db"
# Or PostgreSQL production:
# DATABASE_URL="postgresql+asyncpg://postgres:password@localhost:5432/docutrace_db"

# ── MongoDB Atlas Telemetry (Optional) ────────────────────────
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/docutrace?retryWrites=true&w=majority"

# ── JWT Authentication (Generate random 64-char secrets) ─────
JWT_ACCESS_SECRET="your_custom_jwt_access_secret_key_minimum_64_characters_long"
JWT_REFRESH_SECRET="your_custom_jwt_refresh_secret_key_minimum_64_characters_long"
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
ALGORITHM="HS256"

# ── Field-Level Encryption (AES-256-GCM 32-byte hex) ──────────
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# ── Document Upload Storage ───────────────────────────────────
UPLOAD_DIR="./storage/uploads"
MAX_UPLOAD_SIZE_MB=25

# ── AI / LLM Configuration ────────────────────────────────────
LLM_PROVIDER="gemini"
GEMINI_API_KEY="your_google_gemini_api_key_here"
OPENAI_API_KEY=""
EMBEDDING_MODEL="text-embedding-004"

# ── Logging & Monitoring ──────────────────────────────────────
LOG_LEVEL="INFO"
SENTRY_DSN=""
```

---

## 📡 API Reference & Swagger Documentation

When the backend is running, complete interactive OpenAPI documentation is available at:
- **Swagger UI**: [`http://localhost:8000/docs`](http://localhost:8000/docs)
- **ReDoc UI**: [`http://localhost:8000/redoc`](http://localhost:8000/redoc)

### Core API Endpoints

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **System** | `GET` | `/health` | Liveness health probe returning timestamp |
| **System** | `GET` | `/ready` | Readiness probe verifying database connection |
| **Auth** | `POST` | `/api/v1/auth/register` | Create user organization account with role |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate with credentials and receive JWT tokens |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Rotate access token using valid refresh token |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch active authenticated user profile |
| **Documents** | `GET` | `/api/v1/documents` | List ingested documents with pagination & filters |
| **Documents** | `POST` | `/api/v1/documents/upload` | Upload new PDF/Image document with binary validation |
| **Documents** | `GET` | `/api/v1/documents/{id}` | Retrieve document metadata and spatial page layout |
| **Extractions**| `GET` | `/api/v1/extractions/document/{id}` | Get extracted properties with bounding boxes |
| **Extractions**| `PATCH`| `/api/v1/extractions/{id}` | Update/correct an extracted field with audit history |
| **ML Inference**| `POST`| `/api/v1/ml/evaluate` | Multi-model inference (Type, Risk, Isolation Anomaly) & Atlas logging |
| **ML Telemetry**| `GET` | `/api/v1/ml/predictions` | Query historical ML prediction records from MongoDB Atlas |
| **Reconcile** | `POST` | `/api/v1/verifications/match-set` | Trigger 3-way matching across a document set |
| **Anomalies** | `GET` | `/api/v1/anomalies` | Query detected math errors, outliers, and duplicates |
| **Anomalies** | `PATCH`| `/api/v1/anomalies/{id}/resolve` | Resolve or dismiss an anomaly with auditor remarks |
| **Obligations**| `GET` | `/api/v1/obligations` | List contractual commitments, penalties, and dates |
| **Risk** | `GET` | `/api/v1/risk-scores/document/{id}` | Retrieve explainable 0–100 risk score and factor weights |
| **Tasks** | `GET` | `/api/v1/tasks` | Get obligation-derived Kanban tasks and assignees |
| **Tasks** | `PATCH`| `/api/v1/tasks/{id}/status` | Update task status (`todo`, `in_progress`, `review`, `done`) |
| **Q&A Studio** | `POST` | `/api/v1/qa/query` | Ask natural language question with citation coordinates |
| **Dashboard** | `GET` | `/api/v1/dashboard/metrics` | Retrieve executive analytics and pipeline telemetry |

---

## 🔒 Security, Cryptography & Governance

DocuTrace incorporates enterprise security standards at every layer:

1. **Magic-Byte File Validation**: Inspects raw binary header bytes before writing to disk, preventing malicious file spoofing.
2. **AES-256-GCM Field Encryption**: Sensitive financial figures and vendor tax IDs are encrypted at the field level in the database.
3. **Tenant & User Isolation**: Uploaded files and embeddings are segregated in strict user-isolated storage partitions.
4. **Token Security**: Dual-token architecture using short-lived access tokens (15 minutes) and rotating refresh tokens (7 days).
5. **Rate Limiting & Headers**: SlowAPI rate limiting per IP address, along with strict security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`).
6. **No Leaked Credentials**: All secrets, encryption keys, and tokens are read exclusively from environment variables.

---

## 🧪 Testing & Quality Assurance

### Running Backend Tests (Pytest)

The backend includes automated tests covering authentication, document ingestion, information extraction, anomaly detection, 3-way reconciliation, and RAG Q&A services.

```bash
cd backend
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux

pytest -v
```

### Running Frontend Type Checks & Linter

```bash
cd frontend
npm run build
npm run lint
```

---

## 📸 Screenshots & UI Walkthrough

### 1. Executive Analytics & Telemetry Dashboard
*Comprehensive real-time overview displaying pipeline throughput, ingestion by document category, 4-tier risk distribution, and active anomalies.*

### 2. Document Studio & Spatial Coordinate Inspector
*Side-by-side split screen rendering high-resolution documents with interactive OCR bounding boxes mapped directly to structured properties and confidence ratings.*

### 3. 3-Way Cross-Document Reconciliation
*Automated multi-document comparison table aligning Commercial Invoices, Purchase Orders, and Master Contracts to highlight unit price creep and payment term conflicts.*

### 4. Action Engine (Obligation Kanban Board)
*Dynamic task orchestration board converting extracted contractual commitments into actionable items with assignees and due dates.*

---

## 🗺️ Future Roadmap

- [ ] **Automated ERP & Accounting Connectors**: Bi-directional synchronization with SAP, Oracle NetSuite, and QuickBooks.
- [ ] **Multilingual Document Parsing**: Extended spatial OCR models for multi-lingual and non-Latin character scripts.
- [ ] **Webhook & Collaboration Integrations**: Real-time notifications for critical risk alerts via Slack, Microsoft Teams, and email.
- [ ] **Interactive Visual Knowledge Graph Topology**: Interactive Force-Directed Graph UI connecting vendors, contracts, and payment transactions.
- [ ] **Human-in-the-Loop Bulk Correction Queue**: Accelerated keyboard-first audit interface for high-volume invoice reviews.

---

## 👥 Project Information & License

- **Project**: DocuTrace
- **Repository**: [https://github.com/atharva-thedev/DocuTrace](https://github.com/atharva-thedev/DocuTrace)
- **Type**: AI-Powered Intelligent Business Document Analysis & Verification Platform
- **Purpose**: Enterprise Document Intelligence, Auditing Automation & Compliance Platform
- **License**: Distributed under the [MIT License](LICENSE).

---

<div align="center">

**Built with precision for enterprise document verification and automated auditing.**

</div>
