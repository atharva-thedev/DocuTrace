import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { documentsApi } from '../api/documentsApi';
import { DocumentType } from '../../../types';
import { Upload, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatFileSize } from '../../../utils/formatters';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('invoice');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected');
      return await documentsApi.upload(file, documentType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      handleReset();
      onClose();
    },
  });

  const handleReset = () => {
    setFile(null);
    setValidationError(null);
    setDocumentType('invoice');
    uploadMutation.reset();
  };

  const validateAndSetFile = (selectedFile: File) => {
    setValidationError(null);
    const validMimes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validMimes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf')) {
      setValidationError('Unsupported file format. Please upload PDF, PNG, JPG, or DOCX.');
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setValidationError('File size exceeds the 25 MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const docTypeOptions = [
    { value: 'invoice', label: 'Vendor Invoice / Bill' },
    { value: 'po', label: 'Purchase Order (PO)' },
    { value: 'contract', label: 'Contract / Master Agreement / NDA' },
    { value: 'financial_report', label: 'Financial Statement / Audit Report' },
    { value: 'compliance', label: 'Compliance & Tax Certificate' },
    { value: 'other', label: 'General Business Document' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Upload Document for Verification & Extraction"
      description="DocuTrace will OCR, extract structured entities, verify math/terms, and calculate risk scores."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Document Classification Selector */}
        <Select
          label="Document Classification Category"
          options={docTypeOptions}
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          helperText="Select the closest category to optimize layout understanding and extraction models."
        />

        {/* Dropzone Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-500/10'
              : file
              ? 'border-blue-500/60 bg-blue-950/20'
              : 'border-slate-300 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500/80 bg-slate-50/50 dark:bg-[#0E131F]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.docx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
            }}
          />

          {file ? (
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 border border-blue-200 dark:border-blue-800/50">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white max-w-sm truncate">{file.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatFileSize(file.size)}</p>
              <span className="mt-3 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Click or drop another file to replace
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-blue-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-3 shadow-inner">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Drag & drop your document here</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">or click to browse files from your computer</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3">
                Supported formats: PDF, PNG, JPG, DOCX (Max 25 MB)
              </p>
            </div>
          )}
        </div>

        {/* Validation or API Error Alerts */}
        {validationError && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {uploadMutation.isError && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              {(uploadMutation.error as any)?.response?.data?.error?.message ||
                'Upload failed. Please ensure the backend is reachable.'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" size="md" onClick={onClose} disabled={uploadMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Upload className="h-4 w-4" />}
            loading={uploadMutation.isPending}
            disabled={!file}
            onClick={() => uploadMutation.mutate()}
          >
            {uploadMutation.isPending ? 'Uploading & Queuing...' : 'Start Document Ingestion'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
