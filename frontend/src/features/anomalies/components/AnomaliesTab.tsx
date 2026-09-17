import React, { useState } from 'react';
import { AnomalyRecord } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ResolveAnomalyModal } from './ResolveAnomalyModal';
import { anomaliesApi } from '../api/anomaliesApi';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { EmptyState } from '../../../components/ui/EmptyState';

interface AnomaliesTabProps {
  anomalies: AnomalyRecord[];
  selectedAnomalyId?: string | null;
  onSelectAnomaly: (anomaly: AnomalyRecord) => void;
  onRefresh?: () => void;
  documentId?: string;
}

export const AnomaliesTab: React.FC<AnomaliesTabProps> = ({
  anomalies,
  selectedAnomalyId,
  onSelectAnomaly,
  onRefresh,
  documentId,
}) => {
  const [resolvingAnomaly, setResolvingAnomaly] = useState<AnomalyRecord | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(false);

  const handleResolve = async (anomalyId: string, notes: string) => {
    try {
      setIsResolving(true);
      await anomaliesApi.resolve(anomalyId, { resolution_notes: notes });
      if (onRefresh) onRefresh();
    } finally {
      setIsResolving(false);
    }
  };

  if (anomalies.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="h-8 w-8 text-emerald-500" />}
        title="Zero Anomalies Detected"
        description="The isolation forest ML and mathematical reconciliation checks found no discrepancies."
      />
    );
  }

  const severityVariantMap: Record<string, 'danger' | 'warning' | 'info' | 'neutral'> = {
    critical: 'danger',
    high: 'danger',
    medium: 'warning',
    low: 'info',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Detected Integrity & Financial Anomalies ({anomalies.length})
        </h4>
      </div>

      <div className="space-y-3">
        {anomalies.map((anomaly) => {
          const isSelected = anomaly.id === selectedAnomalyId;

          return (
            <div
              key={anomaly.id}
              onClick={() => onSelectAnomaly(anomaly)}
              className={`p-4 rounded-xl border transition-all cursor-pointer select-none space-y-3 ${
                isSelected
                  ? 'bg-red-50 border-red-400 shadow-md dark:bg-red-950/40 dark:border-red-600/80 dark:shadow-red-500/10'
                  : anomaly.is_resolved
                  ? 'bg-slate-50 dark:bg-[#080C13] border-slate-200 dark:border-slate-800 opacity-70'
                  : 'bg-white dark:bg-[#0E131F] border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-900/60 hover:bg-red-50/30 dark:hover:bg-slate-800/60 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white text-xs tracking-tight">{anomaly.title}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant={severityVariantMap[anomaly.severity] || 'danger'} size="sm">
                    {anomaly.severity}
                  </Badge>
                  {anomaly.is_resolved && (
                    <Badge variant="success" size="sm">
                      Resolved
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{anomaly.description}</p>

              {/* Expected vs Actual comparison box */}
              {(anomaly.expected_value || anomaly.actual_value) && (
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-[#080C13] rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase font-sans">Expected</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold truncate block">
                      {anomaly.expected_value || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase font-sans">Observed / In File</span>
                    <span className="text-red-700 dark:text-red-400 font-bold truncate block">
                      {anomaly.actual_value || '—'}
                    </span>
                  </div>
                </div>
              )}

              {/* Resolution Notes / Action Button */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                  {anomaly.page_number ? `Spatial anchor: Page ${anomaly.page_number}` : 'Global record anomaly'}
                </span>

                {!anomaly.is_resolved && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setResolvingAnomaly(anomaly);
                    }}
                  >
                    Resolve Anomaly
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolve Modal */}
      <ResolveAnomalyModal
        isOpen={Boolean(resolvingAnomaly)}
        onClose={() => setResolvingAnomaly(null)}
        anomaly={resolvingAnomaly}
        onResolve={handleResolve}
        isLoading={isResolving}
      />
    </div>
  );
};
