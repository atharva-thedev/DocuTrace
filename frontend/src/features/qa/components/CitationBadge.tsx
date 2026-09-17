import React from 'react';
import { QACitation } from '../../../types';
import { Bookmark, ExternalLink } from 'lucide-react';

interface CitationBadgeProps {
  citation: QACitation;
  onClick?: (citation: QACitation) => void;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({ citation, onClick }) => {
  return (
    <button
      onClick={() => onClick && onClick(citation)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition group select-none shadow-sm"
      title={citation.quote ? `"${citation.quote}"` : 'Jump to citation in document'}
    >
      <Bookmark className="h-3 w-3 text-purple-400 group-hover:scale-110 transition" />
      <span>Page {citation.page}</span>
      <ExternalLink className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100" />
    </button>
  );
};
