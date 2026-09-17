# DocuTrace Frontend

Enterprise AI-Powered Business Document Intelligence Platform frontend built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, **TanStack Query v5**, **Axios**, and **HTML5 Canvas / SVG Bounding-Box Overlay Engine**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default API target: `http://localhost:8000`

### 3. Run Development Server
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

---

## 📦 Key Features & Workspaces

1. **Split-Screen Document Studio (`/documents/:id`)**:
   - Multi-page canvas document viewer with scalable SVG bounding-box overlays (`[x0, y0, x1, y1]`).
   - Synchronized 5-tab intelligence suite:
     - **Fields Inspector**: Extracted key-values with confidence badges and inline correction overrides.
     - **Risk Attribution**: Circular gauge (0–100) and factor attribution breakdown.
     - **Anomalies & Fraud Guard**: Detected mathematical, statistical, and duplicate anomalies with resolution notes.
     - **Contract Obligations**: Commitments, deadlines, responsible parties, and task conversion.
     - **Evidence Q&A (RAG)**: Conversational assistant with interactive citation badges linking directly to document coordinates.
2. **3-Way Cross-Document Reconciliation (`/document-sets`)**:
   - Multi-way bundle matching across Invoices, Purchase Orders, and Master Contracts with line-item discrepancy matrices.
3. **Executive Analytics Dashboard (`/dashboard`)**:
   - Real-time KPI cards, risk distribution donut chart, document type breakdown, and live activity stream.
4. **Action & Task Engine (`/tasks`)**:
   - Kanban board with drag-and-drop status lanes and priority badges.
5. **In-Memory Security Architecture**:
   - Access tokens stored exclusively in memory (`tokenStore.ts`), with 7-day HttpOnly cookie refresh token rotation and breach detection.
