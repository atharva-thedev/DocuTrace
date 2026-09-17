import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../features/documents/api/documentsApi';
import { extractionsApi } from '../features/extractions/api/extractionsApi';
import { riskApi } from '../features/risk_scores/api/riskApi';
import { anomaliesApi } from '../features/anomalies/api/anomaliesApi';
import { obligationsApi } from '../features/obligations/api/obligationsApi';

import { DocumentViewer } from '../components/viewer/DocumentViewer';
import { BBoxItem } from '../components/viewer/BoundingBoxOverlay';
import { ExtractionsTab } from '../features/extractions/components/ExtractionsTab';
import { RiskTab } from '../features/risk_scores/components/RiskTab';
import { AnomaliesTab } from '../features/anomalies/components/AnomaliesTab';
import { ObligationsTab } from '../features/obligations/components/ObligationsTab';
import { QATab } from '../features/qa/components/QATab';
import { Tabs, TabItem } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { DocumentStatusBadge } from '../features/documents/components/DocumentStatusBadge';
import { Badge } from '../components/ui/Badge';
import {
  ArrowLeft,
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { formatDocumentType } from '../utils/formatters';

export const DocumentStudioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>('fields');
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);
  const [targetPage, setTargetPage] = useState<number>(1);

  // 1. Fetch Document Details
  const { data: document, isLoading: docLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsApi.getById(id!),
    enabled: Boolean(id),
  });

  // 2. Fetch Extracted Fields
  const { data: fields = [], refetch: refetchFields } = useQuery({
    queryKey: ['document-fields', id],
    queryFn: () => extractionsApi.getFields(id!),
    enabled: Boolean(id),
  });

  // 3. Fetch Risk Score
  const { data: riskScore = null } = useQuery({
    queryKey: ['document-risk', id],
    queryFn: () => riskApi.getByDocumentId(id!),
    enabled: Boolean(id),
  });

  // 4. Fetch Anomalies
  const { data: anomalies = [], refetch: refetchAnomalies } = useQuery({
    queryKey: ['document-anomalies', id],
    queryFn: () => anomaliesApi.listByDocumentId(id!),
    enabled: Boolean(id),
  });

  // 5. Fetch Obligations
  const { data: obligations = [], refetch: refetchObligations } = useQuery({
    queryKey: ['document-obligations', id],
    queryFn: () => obligationsApi.listByDocumentId(id!),
    enabled: Boolean(id),
  });

  // Aggregate All Bounding Boxes into unified viewer layer
  const allBBoxes: BBoxItem[] = useMemo(() => {
    const boxes: BBoxItem[] = [];

    // Fields
    fields.forEach((f) => {
      const boxCoords = f.bbox || f.bounding_box;
      if (boxCoords) {
        boxes.push({
          id: `field-${f.id}`,
          bbox: boxCoords,
          page: f.page_number || 1,
          label: (f.field_key || f.field_name || 'Field').replace(/_/g, ' '),
          category: f.field_category || 'extraction',
          confidence: f.confidence_score,
          value: f.field_value,
        });
      }
    });

    // Anomalies
    anomalies.forEach((a) => {
      const boxCoords = (a.details as any)?.bbox || a.bounding_box;
      if (boxCoords) {
        boxes.push({
          id: `anomaly-${a.id}`,
          bbox: boxCoords,
          page: a.page_number || 1,
          label: a.title,
          category: 'anomaly',
          confidence: 0.95,
          value: a.description,
        });
      }
    });

    // Obligations
    obligations.forEach((o) => {
      const boxCoords = (o as any).bbox || o.bounding_box;
      if (boxCoords) {
        boxes.push({
          id: `obligation-${o.id}`,
          bbox: boxCoords,
          page: o.page_number || 1,
          label: o.title,
          category: 'obligation',
          confidence: 0.9,
          value: o.description,
        });
      }
    });

    return boxes;
  }, [fields, anomalies, obligations]);

  if (docLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" label="Loading Document Studio & Spatial Coordinates..." />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl">
        <p className="text-base font-bold text-slate-900 dark:text-white">Document Not Found</p>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">The requested document may have been deleted.</p>
        <Button onClick={() => navigate('/documents')} className="mt-4" size="sm">
          Return to Vault
        </Button>
      </div>
    );
  }

  const studioTabs: TabItem[] = [
    {
      id: 'fields',
      label: 'Extracted Entities',
      count: fields.length,
      icon: <FileSpreadsheet className="h-4 w-4" />,
    },
    {
      id: 'risk',
      label: 'Explainable Risk',
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    {
      id: 'anomalies',
      label: 'Anomalies & Fraud',
      count: anomalies.filter((a) => !a.is_resolved).length,
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      id: 'obligations',
      label: 'Contract Commitments',
      count: obligations.length,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: 'qa',
      label: 'Evidence Q&A',
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-4 animate-fade-in">
      {/* Studio Header Bar */}
      <div className="flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/documents')}
          >
            Vault
          </Button>

          <div className="truncate max-w-lg">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {document.original_filename}
              </h2>
              <Badge variant="neutral" size="sm">
                {formatDocumentType(document.document_type)}
              </Badge>
              <DocumentStatusBadge status={document.status} />
            </div>
          </div>
        </div>

        {/* Risk Badge Summary */}
        {document.risk_score !== null && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Risk Assessment:</span>
            {riskScore ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  {riskScore.overall_score}/100
                </span>
                <Badge
                  variant={
                    riskScore.risk_level === 'critical' || riskScore.risk_level === 'high'
                      ? 'danger'
                      : riskScore.risk_level === 'medium'
                      ? 'warning'
                      : 'success'
                  }
                  size="sm"
                >
                  {riskScore.risk_level}
                </Badge>
              </div>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500">Calculating...</span>
            )}
          </div>
        )}
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Side: Document Viewer & Dynamic Bounding Box Overlay */}
        <div className="lg:col-span-6 h-full min-h-0 flex flex-col">
          <DocumentViewer
            documentId={document.id}
            filename={document.original_filename}
            totalPages={document.page_count || 1}
            mimeType={document.mime_type}
            boxes={allBBoxes}
            activeBoxId={activeBoxId}
            targetPage={targetPage}
            onBoxClick={(box) => {
              setActiveBoxId(box.id);
              if (box.category === 'anomaly') setActiveTab('anomalies');
              else if (box.category === 'obligation') setActiveTab('obligations');
              else setActiveTab('fields');
            }}
          />
        </div>

        {/* Right Side: Tabbed Active Intelligence Workspace */}
        <div className="lg:col-span-6 h-full min-h-0 flex flex-col glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-[#0E131F]">
          {/* Tabs Navigation Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0B0F17]/90 shrink-0">
            <Tabs
              tabs={studioTabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              variant="pills"
            />
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'fields' && (
              <ExtractionsTab
                fields={fields}
                selectedFieldId={activeBoxId?.replace('field-', '')}
                onSelectField={(f) => {
                  setActiveBoxId(`field-${f.id}`);
                  if (f.page_number) setTargetPage(f.page_number);
                }}
                onRefresh={refetchFields}
              />
            )}

            {activeTab === 'risk' && (
              <RiskTab riskScore={riskScore} documentId={document.id} />
            )}

            {activeTab === 'anomalies' && (
              <AnomaliesTab
                anomalies={anomalies}
                documentId={document.id}
                onSelectAnomaly={(a) => {
                  setActiveBoxId(`anomaly-${a.id}`);
                  if (a.page_number) setTargetPage(a.page_number);
                }}
                onRefresh={refetchAnomalies}
              />
            )}

            {activeTab === 'obligations' && (
              <ObligationsTab
                obligations={obligations}
                documentId={document.id}
                onSelectObligation={(o) => {
                  setActiveBoxId(`obligation-${o.id}`);
                  if (o.page_number) setTargetPage(o.page_number);
                }}
                onRefresh={refetchObligations}
              />
            )}

            {activeTab === 'qa' && (
              <QATab
                documentId={document.id}
                onJumpToCitation={(page) => setTargetPage(page)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
