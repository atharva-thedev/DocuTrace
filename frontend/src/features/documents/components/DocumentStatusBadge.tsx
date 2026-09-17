import React from 'react';
import { DocumentStatus } from '../../../types';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
}

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="success" size="sm">
          <CheckCircle2 className="h-3 w-3" />
          <span className="capitalize">Ready</span>
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="warning" size="sm">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="capitalize">Processing</span>
        </Badge>
      );
    case 'queued':
      return (
        <Badge variant="info" size="sm">
          <Clock className="h-3 w-3" />
          <span className="capitalize">Queued</span>
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="danger" size="sm">
          <AlertCircle className="h-3 w-3" />
          <span className="capitalize">Failed</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size="sm">
          <span className="capitalize">{status}</span>
        </Badge>
      );
  }
};
