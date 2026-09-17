import React from 'react';
import { RiskScore } from '../../../types';
import { RiskScoreGauge } from './RiskScoreGauge';
import { SegmentedProgressBar } from '../../../components/ui/SegmentedProgressBar';
import { Badge } from '../../../components/ui/Badge';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { EmptyState } from '../../../components/ui/EmptyState';

interface RiskTabProps {
  riskScore: RiskScore | null;
  documentId?: string;
}

export const RiskTab: React.FC<RiskTabProps> = ({ riskScore }) => {
  if (!riskScore) {
    return (
      <EmptyState
        icon={<ShieldCheck className="h-8 w-8 text-slate-700 dark:text-white" />}
        title="Risk Assessment Pending"
        description="Risk scoring is calculated automatically once extraction and anomaly detection complete."
      />
    );
  }

  const factorCount = riskScore.factor_breakdown?.length || 0;

  return (
    <div className="space-y-6">
      {/* Top Circular Gauge */}
      <RiskScoreGauge score={riskScore.overall_score} level={riskScore.risk_level} />

      {/* Summary Narrative */}
      {riskScore.summary && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300 shadow-sm">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Risk Factor Attribution Summary</span>
          </div>
          <p>{riskScore.summary}</p>
        </div>
      )}

      {/* Factor Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Contributing Risk Factors ({factorCount})
          </h4>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">Scale: 0 to 100 pts</span>
        </div>

        <div className="space-y-3">
          {riskScore.factor_breakdown?.map((factor, index) => {
            const severityVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
              low: 'neutral',
              medium: 'warning',
              high: 'danger',
              critical: 'danger',
            };

            const severityColorMap: Record<string, 'emerald' | 'amber' | 'red' | 'purple'> = {
              low: 'emerald',
              medium: 'amber',
              high: 'red',
              critical: 'red',
            };

            return (
              <div
                key={index}
                className="p-4 rounded-xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 text-xs space-y-3 shadow-sm hover:border-slate-400 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`h-4 w-4 shrink-0 ${
                        factor.severity === 'critical' || factor.severity === 'high'
                          ? 'text-rose-500'
                          : factor.severity === 'medium'
                          ? 'text-amber-500'
                          : 'text-blue-500 dark:text-blue-400'
                      }`}
                    />
                    <span className="font-bold text-slate-900 dark:text-white capitalize tracking-tight">
                      {factor.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-semibold">
                      Weight: {Math.round(factor.weight * 100)}%
                    </span>
                    <Badge variant={severityVariantMap[factor.severity] || 'neutral'} size="sm">
                      {factor.severity}
                    </Badge>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 leading-normal">{factor.description}</p>

                {/* Segmented Progress Meter */}
                <div className="pt-1">
                  <SegmentedProgressBar
                    score={factor.score}
                    max={100}
                    segments={8}
                    color={severityColorMap[factor.severity] || 'auto'}
                    scoreBadgeFormat={(val) => `${Math.round(val)} pts`}
                    size="sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

