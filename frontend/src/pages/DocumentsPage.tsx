import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi, ListDocumentsParams } from '../features/documents/api/documentsApi';
import { DocumentTable } from '../features/documents/components/DocumentTable';
import { DocumentFilterBar } from '../features/documents/components/DocumentFilterBar';
import { DocumentUploadModal } from '../features/documents/components/DocumentUploadModal';
import { DocumentType, DocumentStatus } from '../types';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Upload, FileText, RefreshCw } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<DocumentType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | ''>('');
  const [page, setPage] = useState<number>(1);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const queryParams: ListDocumentsParams = {
    page,
    limit: 20,
    search: search || undefined,
    document_type: selectedType || undefined,
    status: selectedStatus || undefined,
  };

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['documents', queryParams],
    queryFn: () => documentsApi.list(queryParams),
    refetchInterval: (query) => {
      // If any document is actively processing or queued, poll every 3 seconds!
      const docs = query.state.data?.data;
      const hasActive = docs?.some((d) => d.status === 'queued' || d.status === 'processing');
      return hasActive ? 3000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      await documentsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const documents = response?.data || [];
  const pagination = response?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Action Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Corporate Document Vault</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage ingested invoices, POs, agreements, and view real-time pipeline status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Upload className="h-3.5 w-3.5" />}
            onClick={() => setIsUploadOpen(true)}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <DocumentFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Main Table / Loading / Empty State */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="md" label="Loading document vault..." />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8 text-blue-500" />}
          title="No Documents Found"
          description={
            search || selectedType || selectedStatus
              ? 'No documents matched your current search and filter criteria.'
              : 'Your vault is currently empty. Upload an invoice, contract, or PO to get started.'
          }
          actionLabel="Upload First Document"
          onAction={() => setIsUploadOpen(true)}
          actionIcon={<Upload className="h-4 w-4" />}
        />
      ) : (
        <div className="space-y-4">
          <DocumentTable
            documents={documents}
            onDelete={(id) => {
              if (window.confirm('Are you sure you want to delete this document?')) {
                deleteMutation.mutate(id);
              }
            }}
            isDeletingId={deletingId}
          />

          {/* Pagination Controls */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
              <span>
                Showing {documents.length} of {pagination.total} records
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="font-semibold text-slate-900 dark:text-white px-2">
                  Page {page} of {pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.total_pages}
                  onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
};
