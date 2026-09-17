import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Document } from '../../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { FileText, Trash2, Eye } from 'lucide-react';
import { formatDate, formatFileSize, formatDocumentType } from '../../../utils/formatters';

interface DocumentTableProps {
  documents: Document[];
  onDelete: (id: string) => void;
  isDeletingId?: string | null;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  onDelete,
  isDeletingId,
}) => {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document File</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Pipeline Status</TableHead>
          <TableHead>Pages / Size</TableHead>
          <TableHead>Uploaded At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            {/* Filename & Icon */}
            <TableCell>
              <div
                onClick={() => navigate(`/documents/${doc.id}`)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 group-hover:scale-105 transition shadow-sm">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="truncate max-w-xs">
                  <p className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                    {doc.original_filename}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">{doc.id.slice(0, 16)}...</p>
                </div>
              </div>
            </TableCell>

            {/* Document Type */}
            <TableCell>
              <Badge variant="neutral" size="sm">
                {formatDocumentType(doc.document_type)}
              </Badge>
            </TableCell>

            {/* Status */}
            <TableCell>
              <DocumentStatusBadge status={doc.status} />
            </TableCell>

            {/* Pages & Size */}
            <TableCell>
              <div className="text-xs">
                <span className="font-medium text-slate-700 dark:text-gray-300">{doc.page_count || 1} pgs</span>
                <span className="text-slate-400 dark:text-gray-500 mx-1.5">•</span>
                <span className="text-slate-500 dark:text-gray-400">{formatFileSize(doc.file_size)}</span>
              </div>
            </TableCell>

            {/* Upload Date */}
            <TableCell>
              <span className="text-xs text-slate-500 dark:text-gray-400">{formatDate(doc.created_at)}</span>
            </TableCell>

            {/* Actions */}
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Eye className="h-3.5 w-3.5" />}
                  onClick={() => navigate(`/documents/${doc.id}`)}
                >
                  Studio
                </Button>
                <button
                  onClick={() => onDelete(doc.id)}
                  disabled={isDeletingId === doc.id}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition cursor-pointer"
                  title="Delete Document"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
