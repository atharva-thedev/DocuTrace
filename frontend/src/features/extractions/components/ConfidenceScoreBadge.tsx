import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { formatConfidence } from '../../../utils/formatters';

interface ConfidenceScoreBadgeProps {
  score: number;
}

export const ConfidenceScoreBadge: React.FC<ConfidenceScoreBadgeProps> = ({ score }) => {
  const normScore = score > 1 ? score / 100 : score;

  if (normScore >= 0.85) {
    return (
      <Badge variant="success" size="sm" dot>
        <span>{formatConfidence(normScore)}</span>
      </Badge>
    );
  }

  if (normScore >= 0.7) {
    return (
      <Badge variant="warning" size="sm" dot>
        <span>{formatConfidence(normScore)}</span>
      </Badge>
    );
  }

  return (
    <Badge variant="danger" size="sm" dot>
      <span>{formatConfidence(normScore)}</span>
    </Badge>
  );
};
