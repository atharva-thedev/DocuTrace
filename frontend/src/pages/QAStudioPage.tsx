import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '../features/documents/api/documentsApi';
import { QATab } from '../features/qa/components/QATab';
import { Select } from '../components/ui/Select';
import { Card, CardContent } from '../components/ui/Card';
import { Sparkles, Bot, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QAStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDocId, setSelectedDocId] = useState<string>('');

  // Fetch Documents
  const { data: docResponse } = useQuery({
    queryKey: ['documents', { limit: 100 }],
    queryFn: () => documentsApi.list({ limit: 100 }),
  });

  const docs = docResponse?.data || [];

  // Automatically select first doc if available
  const activeDocId = selectedDocId || docs[0]?.id || '';
  const activeDoc = docs.find((d) => d.id === activeDocId);

  const docOptions = docs.map((d) => ({
    value: d.id,
    label: `${d.original_filename} (${d.document_type.toUpperCase()})`,
  }));

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span>Evidence-Grounded Query Studio</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Natural language document querying grounded in vector embeddings with verifiable citations
        </p>
      </div>

      {/* Target Document Context Selector */}
      <Card variant="glass">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full sm:max-w-md">
            <Select
              label="Select Document Context"
              options={docOptions}
              value={activeDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
            />
          </div>

          {activeDoc && (
            <button
              onClick={() => navigate(`/documents/${activeDoc.id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 dark:bg-[#0E131F] dark:hover:bg-slate-800/80 dark:border-slate-800 dark:text-blue-400 text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Open in Split-Screen Studio →</span>
            </button>
          )}
        </CardContent>
      </Card>

      {/* Chat Container */}
      <Card variant="glass" className="h-[600px] flex flex-col overflow-hidden">
        <CardContent className="p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeDocId ? (
            <QATab
              documentId={activeDocId}
              onSelectCitation={(citation) => {
                navigate(`/documents/${activeDocId}`);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 dark:text-gray-500">
              <Bot className="h-10 w-10 mb-2 text-slate-400 dark:text-gray-600" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">No Document Ingested</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Upload a document to begin questioning with AI citations.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
