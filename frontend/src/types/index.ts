// Common API Envelopes
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface ErrorDetail {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
}

export interface ErrorResponse {
  success: false;
  error: ErrorDetail;
}

// User & Auth Types
export type UserRole = 'admin' | 'manager' | 'auditor' | 'member';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// Bounding Box [x0, y0, x1, y1] normalized to page or pixel coords
export type BoundingBox = [number, number, number, number];

// Document Types
export type DocumentType = 'invoice' | 'po' | 'contract' | 'financial_report' | 'compliance' | 'other';
export type DocumentStatus = 'queued' | 'processing' | 'completed' | 'error';

export interface Document {
  id: string;
  owner_id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  file_hash: string;
  document_type: DocumentType;
  status: DocumentStatus;
  page_count: number;
  summary: string | null;
  error_message: string | null;
  doc_metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentDetail extends Document {
  extracted_fields_count: number;
  anomalies_count: number;
  obligations_count: number;
  risk_score: number | null;
  risk_level: RiskLevel | null;
}

// Extracted Fields Types
export interface ExtractedField {
  id: string;
  document_id: string;
  field_key?: string;
  field_name?: string;
  field_value: string;
  normalized_value: string | null;
  data_type?: string;
  confidence_score: number;
  page_number: number;
  bbox?: BoundingBox | null;
  bounding_box?: BoundingBox | null;
  field_category: string;
  is_corrected: boolean;
  corrected_by_user_id?: string | null;
  created_at?: string;
}

export interface ExtractionSummary {
  document_id: string;
  fields_count: number;
  fields_by_category: Record<string, ExtractedField[]>;
}

export interface FieldCorrectionPayload {
  field_value: string;
  normalized_value?: string;
}

// Verification & Document Sets
export interface DocumentSetItem {
  id: string;
  document_id: string;
  role_in_set: string;
  document?: Document;
}

export interface DocumentSet {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  items: DocumentSetItem[];
}

export interface DocumentSetCreatePayload {
  name: string;
  description?: string;
  document_ids?: string[];
}

export interface MismatchItem {
  field_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  values?: Record<string, any>;
  suggested_action?: string;
}

export interface VerificationDetails {
  items_checked?: number;
  passed_checks?: number;
  mismatches?: MismatchItem[];
  matrix?: Record<string, any>;
  comparison_table?: Array<Record<string, any>>;
}

export interface VerificationResult {
  id: string;
  document_set_id: string;
  status: 'passed' | 'warning' | 'mismatched' | 'critical';
  overall_summary: string;
  mismatch_count: number;
  details: VerificationDetails | null;
  created_at: string;
  updated_at: string;
}

// Anomaly Types
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AnomalyRecord {
  id: string;
  document_id: string;
  anomaly_type: string;
  severity: AnomalySeverity;
  title: string;
  description: string;
  expected_value: string | null;
  actual_value: string | null;
  bounding_box?: BoundingBox | null;
  bbox?: BoundingBox | null;
  page_number: number | null;
  is_resolved: boolean;
  resolved_by?: string | null;
  resolution_notes?: string | null;
  details?: Record<string, any> | null;
  created_at: string;
}

export interface AnomalyResolvePayload {
  resolution_notes: string;
}

// Obligation Types
export type ObligationStatus = 'pending' | 'in_progress' | 'fulfilled' | 'breached';

export interface Obligation {
  id: string;
  document_id: string;
  clause_reference: string | null;
  title: string;
  description: string;
  responsible_party: string | null;
  due_date: string | null;
  status: ObligationStatus;
  obligation_category: string;
  page_number: number | null;
  bounding_box?: BoundingBox | null;
  bbox?: BoundingBox | null;
  created_at: string;
}

export interface ObligationUpdatePayload {
  status?: ObligationStatus;
  responsible_party?: string;
  due_date?: string;
}

// Risk Score Types
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskFactor {
  category: string;
  weight: number;
  score: number;
  description: string;
  severity: RiskLevel;
}

export interface RiskScore {
  id: string;
  document_id: string;
  overall_score: number; // 0 - 100
  risk_level: RiskLevel;
  factor_breakdown: RiskFactor[];
  summary: string;
  created_at: string;
}

// Action Task Types
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface ActionTask {
  id: string;
  owner_id: string;
  assignee_id: string | null;
  document_id: string | null;
  obligation_id: string | null;
  anomaly_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  assignee_id?: string;
  document_id?: string;
  obligation_id?: string;
  anomaly_id?: string;
  due_date?: string;
  priority?: TaskPriority;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
}

// QA & RAG Types
export interface QACitation {
  doc_id?: string;
  document_name?: string;
  page: number;
  page_number?: number;
  bbox?: BoundingBox;
  quote?: string;
  confidence?: number;
}

export interface QAMessage {
  id: string;
  thread_id: string;
  sender_type: 'user' | 'assistant';
  content: string;
  citations: QACitation[] | null;
  created_at: string;
}

export interface QAThread {
  id: string;
  user_id: string;
  document_id: string | null;
  document_set_id: string | null;
  title: string;
  created_at: string;
  messages: QAMessage[];
}

export interface QAPromptPayload {
  query: string;
  document_id?: string;
  document_set_id?: string;
  thread_id?: string;
}

// Dashboard Summary Types
export interface RecentActivityItem {
  id: string;
  type: string;
  title: string;
  status: string;
  timestamp: string | null;
}

export interface DashboardSummary {
  total_documents: number;
  processing_documents: number;
  flagged_documents: number;
  total_anomalies: number;
  unresolved_anomalies: number;
  total_tasks: number;
  pending_tasks: number;
  risk_breakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  document_types: Record<string, number>;
  recent_activity: RecentActivityItem[];
}
