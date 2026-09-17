export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  DOCUMENTS: {
    LIST: '/documents',
    UPLOAD: '/documents/upload',
    DETAIL: (id: string) => `/documents/${id}`,
    FILE: (id: string) => `/documents/${id}/file`,
    DELETE: (id: string) => `/documents/${id}`,
  },
  EXTRACTIONS: {
    FIELDS: (docId: string) => `/extractions/documents/${docId}/fields`,
    SUMMARY: (docId: string) => `/extractions/documents/${docId}/summary`,
    UPDATE_FIELD: (fieldId: string) => `/extractions/fields/${fieldId}`,
  },
  DOCUMENT_SETS: {
    LIST: '/document-sets',
    CREATE: '/document-sets',
    DETAIL: (id: string) => `/document-sets/${id}`,
    ADD_DOC: (id: string) => `/document-sets/${id}/documents`,
  },
  VERIFICATIONS: {
    TRIGGER: (setId: string) => `/verifications/document-sets/${setId}/verify`,
    RESULTS: (setId: string) => `/verifications/document-sets/${setId}/results`,
  },
  ANOMALIES: {
    LIST: (docId: string) => `/anomalies/documents/${docId}/anomalies`,
    RESOLVE: (anomalyId: string) => `/anomalies/anomalies/${anomalyId}/resolve`,
  },
  OBLIGATIONS: {
    LIST: (docId: string) => `/obligations/documents/${docId}/obligations`,
    UPDATE: (obligationId: string) => `/obligations/obligations/${obligationId}`,
  },
  RISK_SCORES: {
    DETAIL: (docId: string) => `/risk-scores/documents/${docId}/risk`,
  },
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    UPDATE: (id: string) => `/tasks/${id}`,
  },
  QA: {
    QUERY: '/qa/query',
    THREADS: '/qa/threads',
  },
  DASHBOARD: {
    SUMMARY: '/dashboard/summary',
  },
};
