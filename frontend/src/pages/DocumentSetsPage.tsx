import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { verificationApi } from '../features/verification/api/verificationApi';
import { documentsApi } from '../features/documents/api/documentsApi';
import { CreateSetModal } from '../features/verification/components/CreateSetModal';
import { ThreeWayMatchComparison } from '../features/verification/components/ThreeWayMatchComparison';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { GitCompare, Plus, Play, FileText, Layers, ExternalLink, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatDate, formatDocumentType } from '../utils/formatters';

export const DocumentSetsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Fetch Sets
  const { data: sets = [], isLoading: setsLoading } = useQuery({
    queryKey: ['document-sets'],
    queryFn: verificationApi.listSets,
  });

  // Fetch All Documents for the Create Modal
  const { data: docResponse } = useQuery({
    queryKey: ['documents', { limit: 100 }],
    queryFn: () => documentsApi.list({ limit: 100 }),
  });

  // Automatically select first set if none selected
  const activeSet = sets.find((s) => s.id === selectedSetId) || sets[0] || null;

  // Fetch Verification Result for active set
  const {
    data: verificationResult = null,
    isLoading: verifLoading,
  } = useQuery({
    queryKey: ['verification-results', activeSet?.id],
    queryFn: () => verificationApi.getResults(activeSet!.id),
    enabled: Boolean(activeSet?.id),
    retry: false,
  });

  // Trigger Reconciliation Mutation
  const verifyMutation = useMutation({
    mutationFn: async (setId: string) => {
      return await verificationApi.triggerVerification(setId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-results', activeSet?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  if (setsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" label="Loading cross-document reconciliation bundles..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            3-Way Cross-Document Reconciliation
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Automated multi-way comparison across Vendor Invoices, Purchase Orders, and Master Contracts
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Bundle Set
        </Button>
      </div>

      {sets.length === 0 ? (
        <EmptyState
          icon={<GitCompare className="h-8 w-8 text-slate-700 dark:text-white" />}
          title="No Document Bundles Created"
          description="Create a document set containing an Invoice, PO, or Contract to perform automated 3-way matching and discrepancy checks."
          actionLabel="Create First Bundle Set"
          onAction={() => setIsCreateModalOpen(true)}
          actionIcon={<Plus className="h-4 w-4" />}
        />
      ) : (
        <div className="space-y-6">
          {/* Active Bundle Control & Selector Strip */}
          <Card variant="glass" className="overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full bg-slate-50/50 dark:bg-[#0B0F17]/80">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                  Active Bundle:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {sets.map((s) => {
                    const isSelected = activeSet?.id === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSetId(s.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border ${
                          isSelected
                            ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white border-blue-600 dark:border-blue-500 shadow-sm shadow-blue-500/20'
                            : 'bg-white dark:bg-[#0E131F] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                        }`}
                      >
                        <span>{s.name}</span>
                        <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                          isSelected
                            ? 'bg-blue-700 dark:bg-blue-800 text-white dark:text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {s.items?.length || 0} Docs
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeSet && (
                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                    Created {formatDate(activeSet.created_at)}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Play className="h-3.5 w-3.5" />}
                    loading={verifyMutation.isPending}
                    onClick={() => verifyMutation.mutate(activeSet.id)}
                  >
                    {verifyMutation.isPending ? 'Reconciling...' : 'Run 3-Way Reconciliation'}
                  </Button>
                </div>
              )}
            </CardHeader>

            {activeSet && (
              <CardContent className="p-6 space-y-6">
                {/* Bundle Description & Metadata */}
                {activeSet.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 -mt-1 leading-relaxed">
                    {activeSet.description}
                  </p>
                )}

                {/* 3-Way Interconnected Document Cards */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Linked Documents in Reconciliation Bundle ({activeSet.items?.length || 0})
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      Click card to inspect in Document Studio
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeSet.items?.map((item) => {
                      const docName = item.document?.original_filename || `Document ${item.document_id.slice(0, 8)}`;
                      const isInvoice = item.role_in_set === 'invoice';
                      const isPO = item.role_in_set === 'po';

                      const roleBadgeVariant = isInvoice ? 'neutral' : isPO ? 'warning' : 'neutral';

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (item.document_id) navigate(`/documents/${item.document_id}`);
                          }}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0E131F] hover:border-blue-500/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 dark:hover:border-slate-700 transition cursor-pointer group flex flex-col justify-between space-y-3 shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                              <FileText className="h-4 w-4" />
                            </div>
                            <Badge variant={roleBadgeVariant} size="sm">
                              {formatDocumentType(item.role_in_set)}
                            </Badge>
                          </div>

                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2 leading-snug">
                              {docName}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                              ID: {item.document_id.slice(0, 16)}...
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                            <span>Open in Studio</span>
                            <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Active Reconciliation Results & Discrepancy Matrix */}
          {activeSet && (
            verifLoading ? (
              <div className="p-12 text-center rounded-2xl glass-panel">
                <LoadingSpinner label="Evaluating 3-way line-item and variance matrix..." />
              </div>
            ) : verificationResult ? (
              <ThreeWayMatchComparison result={verificationResult} />
            ) : (
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0E131F] text-xs text-slate-500 dark:text-slate-400">
                <Layers className="h-10 w-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                <p className="font-bold text-sm text-slate-900 dark:text-white">No Reconciliation Run Yet</p>
                <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Click "Run 3-Way Reconciliation" above to cross-verify line-item amounts, payment terms, and vendor identities across all linked documents.
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* Create Set Modal */}
      <CreateSetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        availableDocuments={docResponse?.data || []}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['document-sets'] });
        }}
      />
    </div>
  );
};
