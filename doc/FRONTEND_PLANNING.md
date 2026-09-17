# DocuTrace Frontend Architecture & Technical Planning

**Document Version:** 1.0  
**Target Platform:** DocuTrace — AI-Powered Business Document Intelligence Platform  
**Technology Stack:** React 18+ / 19, TypeScript, Vite, Tailwind CSS, TanStack Query v5, Axios, Lucide Icons, Recharts, React Hook Form, Zod, DOMPurify, HTML5 Canvas / SVG Bounding-Box Overlay.

---

## 1. Executive Summary & Vision

DocuTrace is an enterprise-grade document intelligence platform designed to process, verify, analyze, and act upon complex business documents (invoices, purchase orders, contracts, financial reports, compliance records).

The frontend serves as the primary visual interface for the DocuTrace active intelligence workflow:

$$\text{Document} \longrightarrow \text{Data} \longrightarrow \text{Verify} \longrightarrow \text{Detect} \longrightarrow \text{Explain} \longrightarrow \text{Trace} \longrightarrow \text{Act}$$

### Core Design Philosophy: "Transparent & Evidence-Grounded Intelligence"
1. **Visual Evidence First:** Every AI extraction, detected anomaly, and RAG answer is visually tied to an exact spatial bounding box `[x0, y0, x1, y1]` on the rendered document page.
2. **Synchronized Split-Screen Studio:** A side-by-side workspace connecting the high-resolution document viewer directly with interactive intelligence tabs (Extractions, Risk Engine, Anomaly Guard, Obligations, and Evidence Q&A).
3. **Enterprise Security by Design:** Zero persistent access tokens in browser storage (`localStorage` / `sessionStorage`), automatic single-flight JWT refresh token rotation with HttpOnly cookies, and strict DOMPurify sanitization.
4. **Actionable Automation:** Seamless conversion of contract obligations and financial anomalies into assignable, trackable tasks with deadline monitoring.

---

## 2. Frontend System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   React + Vite Client (SPA)                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                  Application Providers Layer                                │
│   [QueryClientProvider] ──► [AuthProvider (tokenStore)] ──► [ThemeProvider] ──► [Router]   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                     Routing & Guards Layer                                  │
│   ├── Public Routes: /login, /register, /forgot-password                                    │
│   └── Protected Routes (<RequireAuth>):                                                     │
│       ├── /dashboard                     (Executive Analytics & KPI Metrics)                │
│       ├── /documents                     (Document Ingestion, Filtering & Status Polling)   │
│       ├── /documents/:id                 (Split-Screen Intelligence Studio)                 │
│       ├── /document-sets                 (Document Grouping & 3-Way Reconciliation)         │
│       ├── /verification/:setId           (Cross-Document Variance Matrix)                   │
│       ├── /tasks                         (Action Engine & Kanban Task Board)                │
│       ├── /qa                            (Dedicated Evidence-Grounded Q&A Studio)           │
│       └── /settings                      (User Profile, Session Management & Security)      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                      Component Architecture                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │   Interactive Viewer    │  │   Intelligence Studio   │  │   Reconciliation Matrix     │  │
│  │  ├── PDF/Canvas Renderer│  │  ├── Extracted Fields   │  │  ├── 3-Way Matching View   │  │
│  │  ├── SVG BBox Overlays  │  │  ├── Risk Gauge & Radar │  │  ├── Line-Item Diffing     │  │
│  │  └── Zoom & Page Nav    │  │  ├── Anomaly Resolvers  │  │  └── Mismatch Flags        │  │
│  │                         │  │  ├── Obligation Tracker │  │                             │  │
│  │                         │  │  └── Evidence RAG Chat  │  │                             │  │
│  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────────┘  │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │   Action Kanban Board   │  │   Executive Analytics   │  │   Shared UI Primitives      │  │
│  │  ├── Drag & Drop Tasks  │  │  ├── KPI Metric Cards   │  │  ├── Cards, Modals, Badges │  │
│  │  ├── Priority Badges    │  │  ├── Risk Distribution  │  │  ├── Data Tables & Tabs    │  │
│  │  └── Due Date Alerts    │  │  └── Live Activity Feed │  │  └── Tooltips & Spinners   │  │
│  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                     State & Network Layer                                   │
│  ┌───────────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐  │
│  │ In-Memory Token Store         │  │ Dual Axios Client      │  │ TanStack Query v5      │  │
│  │ (Zero localStorage footprint) │  │ (401 Refresh Queue)    │  │ (Cache & Polling)      │  │
│  └───────────────────────────────┘  └────────────────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
                                                 ▼ (HTTPS + HttpOnly Cookies)
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FastAPI Backend (Port 8000)                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack & Technical Rationale

| Layer / Capability | Technology | Rationale & Enterprise Standards |
|---|---|---|
| **Core Framework** | React 18+ / 19 (TypeScript) | Strict type safety, high rendering performance, component reusability |
| **Build & Dev Tool** | Vite | Instant HMR, optimized tree-shaking, fast production builds |
| **Styling & Theme** | Tailwind CSS + CSS Variables | Cohesive design system, fluid dark/light themes, sleek glassmorphism |
| **Server State & Caching** | `@tanstack/react-query` v5 | Declarative data fetching, automatic caching, deduplication, live polling |
| **HTTP & Interceptors** | Axios | Custom interceptors for transparent 401 token refresh queue |
| **Document Rendering** | HTML5 Canvas + SVG Overlay Layer | Multi-page PDF/image rendering with pixel-perfect responsive bounding box scaling |
| **Data Visualization** | Recharts | Composable, accessible charts (Risk Gauges, Radars, Donut Breakdown, Activity Trends) |
| **Form Management** | `react-hook-form` + `zod` | High performance uncontrolled inputs with schema validation |
| **Sanitization** | `DOMPurify` | XSS protection against arbitrary OCR text and LLM responses |
| **Iconography** | `lucide-react` | Clean, modern SVG icon set with consistent visual weight |

---

## 4. State Management & Authentication Flow

### 4.1 In-Memory Token Architecture
To mitigate cross-site scripting (XSS) token leakage, access tokens are never stored in `localStorage` or `sessionStorage`.

```
[Page Load / Initial Visit]
        │
        ▼
[AuthProvider: POST /api/v1/auth/refresh] ──(HttpOnly Cookie)──► [FastAPI Backend]
        │                                                              │
        ├───────────────────────────┬──────────────────────────────────┘
        ▼ (Success)                 ▼ (Failure / No Cookie)
[Save Access Token in Memory]   [Set User = null]
        │                               │
        ▼                               ▼
[Fetch GET /api/v1/auth/me]     [Redirect to /login]
```

### 4.2 Single-Flight 401 Refresh Interceptor Queue
When an access token expires mid-session (15-minute lifetime):
1. The first failed request intercepts the `401 TOKEN_EXPIRED` response.
2. Subsequent concurrent requests are enqueued in `refreshQueue`.
3. An isolated `refreshClient` (without interceptors to prevent recursion) calls `POST /api/v1/auth/refresh`.
4. On success: The new access token is stored in memory, all queued requests are replayed with the new token header, and execution resumes seamlessly without user interruption.
5. On failure: The queue is rejected, token store cleared, and user redirected to `/login`.

```typescript
// Dual-client architecture pattern
// src/api/client.ts (main application client with interceptors)
// src/api/refreshClient.ts (isolated refresh client)
```

---

## 5. Visual Evidence & Interactive Document Viewer Engine

The centerpiece of DocuTrace is the **Split-Screen Document Studio (`/documents/:id`)**.

### 5.1 Spatial Coordinate & Bounding Box System
Backend OCR and extraction engines provide bounding boxes normalized to the document page dimensions:
$$\text{bbox} = [x_0, y_0, x_1, y_1]$$
- $x_0, y_0$: Top-left coordinate
- $x_1, y_1$: Bottom-right coordinate

The frontend `BoundingBoxOverlay` component calculates responsive SVG rectangles mapped to the rendered canvas scale factor:

$$\text{scaleX} = \frac{\text{canvasWidth}}{\text{pageWidth}}, \quad \text{scaleY} = \frac{\text{canvasHeight}}{\text{pageHeight}}$$
$$\text{rect.x} = x_0 \times \text{scaleX}, \quad \text{rect.y} = y_0 \times \text{scaleY}$$
$$\text{rect.width} = (x_1 - x_0) \times \text{scaleX}, \quad \text{rect.height} = (y_1 - y_0) \times \text{scaleY}$$

### 5.2 Bidirectional Interactive Synchronization
- **Sidebar $\to$ Document Canvas:** Clicking any extracted field, anomaly card, obligation, or Q&A citation badge:
  1. Switches the document canvas to the target `page_number`.
  2. Smooth-scrolls the viewport to bring the bounding box into center focus.
  3. Triggers a prominent glowing pulse animation on the target SVG box.
- **Document Canvas $\to$ Sidebar:** Clicking any bounding box on the document canvas highlights and reveals the corresponding field in the inspector sidebar.

### 5.3 Color-Coded Semantic Overlays
| Category | Border Color | Fill Color | Indicator |
|---|---|---|---|
| **High-Confidence Extraction** | `#10B981` (Emerald) | `rgba(16, 185, 129, 0.15)` | Verified Data Point |
| **Low-Confidence Extraction** | `#F59E0B` (Amber) | `rgba(245, 158, 11, 0.18)` | Needs Review |
| **Financial / Math Anomaly** | `#EF4444` (Crimson) | `rgba(239, 68, 68, 0.20)` | Discrepancy / Risk |
| **Contract Obligation** | `#3B82F6` (Blue) | `rgba(59, 130, 246, 0.15)` | Commitment / Term |
| **RAG Q&A Citation Source** | `#8B5CF6` (Purple) | `rgba(139, 92, 246, 0.25)` | Cited Evidence |

---

## 6. Page & Feature Specifications

### 6.1 Executive Analytics Dashboard (`/dashboard`)
- **Metric KPI Cards:** Total Documents, In Processing, Flagged Risks, Unresolved Anomalies, Active Action Tasks.
- **Explainable Risk Distribution:** Circular gauge and donut chart showing document breakdown by risk tiers (`Low`, `Medium`, `High`, `Critical`).
- **Document Type Breakdown:** Interactive bar chart displaying volume by document class (`Invoice`, `PO`, `Contract`, `Financial Report`, `Compliance`).
- **Live Pipeline Activity Feed:** Real-time event log tracking document uploads, verification completions, anomaly resolutions, and task completions.
- **Quick Action Bar:** One-click shortcuts to upload documents, create document sets, or query AI assistant.

### 6.2 Document Ingestion & Repository (`/documents`)
- **Data Table View:**
  - Column sorting, pagination, and multi-parameter search (filename, vendor, date, status, document type).
  - Status Pills (`Queued`, `Processing`, `Completed`, `Error`) with automated background polling for active pipelines.
  - Actions menu: Open Studio, Download File, Add to Document Set, Soft Delete.
- **Drag-and-Drop Ingestion Modal:**
  - Multi-file dropzone with file size limit checking ($\le 25\text{ MB}$) and MIME-type validation (`PDF`, `PNG`, `JPG`, `DOCX`).
  - Document type selector with auto-classification hints.
  - Upload progress indicator and immediate transition to pipeline tracking.

### 6.3 Split-Screen Document Intelligence Studio (`/documents/:id`)
- **Left Panel (Document Canvas):**
  - High-res multi-page canvas viewer with thumbnail navigation drawer.
  - Zoom controls (50% to 300%), fit-width, fit-height, and page rotation.
  - Responsive SVG bounding box overlay layer with hover tooltips and selection highlight.
- **Right Panel (Intelligence Suite Tabs):**
  1. **Tab 1: Extracted Fields & Inspector:**
     - Searchable key-value cards grouped by category (Header, Financials, Dates, Entities, Line Items).
     - Confidence score badge (`>90%` green, `70–90%` amber, `<70%` red).
     - Human-in-the-loop "Edit Value" button opening an inline modal with audit-trail tagging.
  2. **Tab 2: Risk Scoring & Attribution:**
     - Overall explainable risk score (0–100) with dynamic gauge animation.
     - Radar/bar chart illustrating risk factor attribution (Calculation Mismatch, Missing Clauses, Statistical Price Outlier, Unfulfilled Obligations).
  3. **Tab 3: Anomaly & Fraud Guard:**
     - List of detected anomalies with severity chips (`Critical`, `High`, `Medium`, `Low`).
     - "Resolve Anomaly" workflow with resolution notes and status tracking.
  4. **Tab 4: Contract Obligations:**
     - Extracted contractual commitments, SLA terms, payment milestones, due dates, and responsible parties.
     - "Convert to Task" button to instantly create actionable items.
  5. **Tab 5: Evidence-Grounded Q&A (RAG):**
     - Natural language conversational assistant grounded exclusively on document content.
     - Interactive Citation Cards displaying snippet text, page number, and bounding box triggers.

### 6.4 3-Way Cross-Document Reconciliation (`/document-sets` & `/verification/:setId`)
- **Document Bundle Manager:** Group related documents into cohesive sets (e.g., *Vendor ACME — Invoice #4092 + PO #8810 + Master Contract*).
- **Trigger 3-Way Reconciliation:** Runs Pandas-based multi-way comparison on the backend.
- **Interactive Reconciliation Matrix:**
  - Side-by-side comparative table matching line items, unit prices, total amounts, tax rates, payment terms, and vendor identities.
  - Severity-coded mismatch badges with detailed discrepancy delta values (e.g., *Invoice $12,500 vs. PO $10,000 — Discrepancy +$2,500 [Critical]*).

### 6.5 Action Engine & Task Board (`/tasks`)
- **Dual View Modes:**
  - **Kanban Board:** Columns for `Pending`, `In Progress`, `Completed`, `Cancelled` with smooth drag-and-drop or click-to-move updates.
  - **Table View:** Structured list with multi-column filtering and bulk status actions.
- **Contextual Linkage Badges:** Displays direct links to source documents, anomalies, or contract obligations.
- **Priority Indicators:** Urgent (Red), High (Orange), Medium (Blue), Low (Gray) with deadline countdown alerts.

### 6.6 Evidence Q&A Studio (`/qa`)
- Standalone multi-thread chat studio allowing natural language investigation across single documents or entire document sets.
- Thread management history drawer.
- Citation badges linking directly to page views and bounding boxes.

### 6.7 User Profile & Security Settings (`/settings`)
- User profile information, role display (`admin`, `auditor`, `manager`, `member`).
- Active session overview and security credentials.
- GDPR Data Portability export trigger.

---

## 7. Design System & UI Tokens

### 7.1 Color Palette
```css
/* Core Enterprise Brand Palette */
--color-bg-primary: #0B0F17;       /* Deep slate dark background */
--color-bg-secondary: #111827;     /* Elevated card & sidebar surface */
--color-bg-tertiary: #1F2937;      /* Input & hover states */
--color-border: #374151;           /* Subtle structural dividers */

/* Accent & Semantic Accents */
--color-accent-blue: #3B82F6;      /* Primary actions & navigation */
--color-accent-indigo: #6366F1;    /* Deep accents & gradients */
--color-success: #10B981;          /* Verified extractions & clean reconciliations */
--color-warning: #F59E0B;          /* Low confidence & warnings */
--color-danger: #EF4444;           /* Critical risk & anomalies */
--color-purple: #8B5CF6;           /* RAG citations & AI insights */

/* Typography Colors */
--color-text-primary: #F9FAFB;     /* High-contrast headings & primary values */
--color-text-secondary: #9CA3AF;   /* Subtitles & metadata labels */
--color-text-muted: #6B7280;       /* Form hints & disabled elements */
```

### 7.2 Typography & Glassmorphism Tokens
- **Font Family:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`.
- **Card Glassmorphism:** `backdrop-filter: blur(12px); background: rgba(17, 24, 39, 0.85); border: 1px solid rgba(55, 65, 81, 0.6);`.
- **Micro-Animations:** Smooth 150ms–200ms ease-out transitions for buttons, tab switches, and hover states.

---

## 8. Frontend Security & Hardening Checklist

- [x] **Memory-Only Access Token:** Token stored in `tokenStore.ts` closure; zero tokens in `localStorage` or `sessionStorage`.
- [x] **HttpOnly Refresh Cookie:** 7-day refresh token stored securely with `SameSite=Strict`.
- [x] **Single-Flight Interceptor:** Concurrency-safe refresh queue preventing multiple simultaneous refresh calls.
- [x] **XSS Prevention:** `DOMPurify.sanitize()` executed before rendering any LLM or OCR output.
- [x] **Client-Side Upload Validation:** Size limit ($25\text{ MB}$) and MIME-type verification prior to network dispatch.
- [x] **Route Guards:** `<RequireAuth>` protecting private workspace routes with redirection state.
- [x] **Strict Form Validation:** All forms validated with Zod schemas and React Hook Form before submission.
- [x] **Bounded Data Fetching:** Paginated list retrieval avoiding unbounded memory consumption.
- [x] **Error Boundaries:** Top-level and studio-level error boundaries preventing application crashes on corrupted documents.

---

## 9. Implementation Roadmap & Execution Milestones

### Milestone 1: Project Setup & Core Infrastructure (Day 1)
- Scaffold Vite + React 19 + TypeScript application.
- Install and configure Tailwind CSS, Lucide icons, Recharts, and dependencies.
- Build in-memory `tokenStore`, dual Axios clients, and `AuthProvider`.
- Implement shared UI library (Buttons, Cards, Badges, Modals, Tabs, Tables, Spinners).
- Implement main application layout (`AppLayout`, `Sidebar`, `Header`).

### Milestone 2: Document Ingestion & Executive Dashboard (Day 2)
- Build `/dashboard` analytics page with KPI cards, risk distribution chart, and activity stream.
- Build `/documents` repository page with data table, status pills, and filters.
- Build drag-and-drop document upload modal with background pipeline polling.

### Milestone 3: Interactive Document Viewer & Intelligence Studio (Day 3)
- Build canvas/image document viewer with multi-page navigation and zoom controls.
- Build responsive SVG bounding box overlay layer with color-coded categories.
- Build 5-tab intelligence suite:
  - Extracted Fields Inspector with confidence ratings and edit modal.
  - Risk Scoring gauge and factor attribution chart.
  - Anomaly & Fraud Guard list with resolution modal.
  - Contract Obligations tracker with task conversion.
  - Evidence-Grounded Q&A chat with clickable citation badges.

### Milestone 4: Cross-Document Reconciliation & Action Engine (Day 4)
- Build `/document-sets` and `/verification/:setId` 3-way matching workspace with line-item comparison table and severity flags.
- Build `/tasks` Action Engine with Kanban board (drag-and-drop status columns) and table views.
- Build `/qa` standalone natural language RAG studio.

### Milestone 5: Hardening, Polish & Verification (Day 5)
- End-to-end integration testing against the live FastAPI backend.
- Performance optimization (canvas rendering, query caching).
- Verification of zero TypeScript errors and clean production build.
