import React from 'react';
import { Obligation, ObligationStatus } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { obligationsApi } from '../api/obligationsApi';
import { tasksApi } from '../../tasks/api/tasksApi';
import { Calendar, User, FileText, ArrowRight } from 'lucide-react';
import { formatDateOnly } from '../../../utils/formatters';
import { EmptyState } from '../../../components/ui/EmptyState';

interface ObligationsTabProps {
  obligations: Obligation[];
  selectedObligationId?: string | null;
  onSelectObligation: (obligation: Obligation) => void;
  onRefresh?: () => void;
  documentId?: string;
}

export const ObligationsTab: React.FC<ObligationsTabProps> = ({
  obligations,
  selectedObligationId,
  onSelectObligation,
  onRefresh,
  documentId,
}) => {
  const handleStatusChange = async (obligationId: string, newStatus: ObligationStatus) => {
    await obligationsApi.update(obligationId, { status: newStatus });
    if (onRefresh) onRefresh();
  };

  const handleConvertToTask = async (obligation: Obligation) => {
    await tasksApi.create({
      title: `Obligation: ${obligation.title}`,
      description: obligation.description,
      document_id: documentId,
      obligation_id: obligation.id,
      due_date: obligation.due_date || undefined,
      priority: 'high',
    });
    alert('Task created successfully and added to Action Engine!');
  };

  if (obligations.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-8 w-8 text-blue-500" />}
        title="No Contract Obligations"
        description="No binding commitments or compliance deadlines were detected in this document."
      />
    );
  }

  const statusVariantMap: Record<ObligationStatus, 'neutral' | 'warning' | 'success' | 'danger'> = {
    pending: 'neutral',
    in_progress: 'warning',
    fulfilled: 'success',
    breached: 'danger',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Contractual Commitments & Obligations ({obligations.length})
        </h4>
      </div>

      <div className="space-y-3">
        {obligations.map((obl) => {
          const isSelected = obl.id === selectedObligationId;

          return (
            <div
              key={obl.id}
              onClick={() => onSelectObligation(obl)}
              className={`p-4 rounded-xl border transition-all cursor-pointer select-none space-y-3 ${
                isSelected
                  ? 'bg-blue-50 border-blue-500 shadow-md dark:bg-blue-950/40 dark:border-blue-500/80 dark:shadow-blue-500/10'
                  : 'bg-white border-slate-200 dark:bg-[#0E131F] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-xs tracking-tight">{obl.title}</span>
                <Badge variant={statusVariantMap[obl.status] || 'neutral'} size="sm">
                  {obl.status.replace(/_/g, ' ')}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{obl.description}</p>

              {/* Metadata row: Clause, Responsible Party, Due Date */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                {obl.responsible_party && (
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate">{obl.responsible_party}</span>
                  </div>
                )}
                {obl.due_date && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Due: {formatDateOnly(obl.due_date)}</span>
                  </div>
                )}
              </div>

              {/* Status Update Actions */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <select
                    value={obl.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(obl.id, e.target.value as ObligationStatus);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-[#080C13] border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="pending" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">Pending</option>
                    <option value="in_progress" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">In Progress</option>
                    <option value="fulfilled" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">Fulfilled</option>
                    <option value="breached" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">Breached</option>
                  </select>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  icon={<ArrowRight className="h-3 w-3" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConvertToTask(obl);
                  }}
                >
                  Action Task
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
