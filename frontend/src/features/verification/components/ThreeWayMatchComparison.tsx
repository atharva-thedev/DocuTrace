import React from 'react';
import { VerificationResult, MismatchItem } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { CheckCircle2, AlertTriangle, AlertOctagon, ShieldCheck, GitCompare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';

interface ThreeWayMatchComparisonProps {
  result: VerificationResult;
}

export const ThreeWayMatchComparison: React.FC<ThreeWayMatchComparisonProps> = ({ result }) => {
  const statusStyles = {
    passed: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300',
      icon: CheckCircle2,
      label: '3-Way Reconciliation Passed — Zero Variance',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-300',
      icon: AlertTriangle,
      label: 'Minor Discrepancies Detected — Within Tolerance',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    mismatched: {
      bg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-300',
      icon: AlertOctagon,
      label: 'Price / Quantity / Terms Mismatch Detected',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    critical: {
      bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-red-900 dark:text-red-300',
      icon: AlertOctagon,
      label: 'Critical Variance / Unauthorized Vendor / Duplicate',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  };

  const style = statusStyles[result.status] || statusStyles.mismatched;
  const Icon = style.icon;

  const mismatches: MismatchItem[] = result.details?.mismatches || [];

  return (
    <div className="space-y-6 select-none">
      {/* Top Status Banner */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${style.bg}`}>
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2 rounded-xl bg-white/80 dark:bg-[#0E131F] shrink-0 shadow-xs border border-transparent dark:border-slate-800">
            <Icon className={`h-6 w-6 ${style.iconColor}`} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">{style.label}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {result.overall_summary}
            </p>
          </div>
        </div>
        <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60 dark:border-slate-800 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{result.mismatch_count}</span>
          <span className="text-[10px] block text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            {result.mismatch_count === 1 ? 'Mismatch' : 'Mismatches'}
          </span>
        </div>
      </div>

      {/* Discrepancy Breakdown Table */}
      <Card variant="glass" className="overflow-hidden">
        <CardHeader className="flex items-center justify-between gap-4 w-full">
          <div>
            <div className="flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <CardTitle>Cross-Document Discrepancy Matrix</CardTitle>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Line-item, vendor, tax, and term comparisons across Invoice ↔ PO ↔ Contract
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0">
            {mismatches.length} {mismatches.length === 1 ? 'discrepancy' : 'discrepancies'}
          </span>
        </CardHeader>

        <CardContent className="p-0">
          {mismatches.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center shadow-xs">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">All Line-Items and Terms Match Perfectly</p>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                  No price creep, duplicate lines, tax variances, or Net-30 payment term conflicts detected.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0B0F17]/90 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4 pl-6 w-48">Field / Condition</th>
                    <th className="p-4 w-28">Severity</th>
                    <th className="p-4 min-w-[280px]">Discrepancy Details</th>
                    <th className="p-4 pr-6 w-72 text-right sm:text-left">Document Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-300">
                  {mismatches.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white align-top">
                        <span className="capitalize">{item.field_name.replace(/_/g, ' ')}</span>
                      </td>

                      <td className="p-4 align-top">
                        <Badge
                          variant={
                            item.severity === 'critical' || item.severity === 'high'
                              ? 'danger'
                              : item.severity === 'medium'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {item.severity}
                        </Badge>
                      </td>

                      <td className="p-4 align-top">
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                          {item.description}
                        </p>
                      </td>

                      <td className="p-4 pr-6 align-top">
                        {item.values ? (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080C13] border border-slate-200/70 dark:border-slate-800 text-[11px] font-mono space-y-1">
                            {Object.entries(item.values).map(([k, v]) => (
                              <div key={k} className="flex items-center justify-between gap-2">
                                <span className="text-slate-400 dark:text-slate-500 uppercase font-semibold text-[10px]">{k}:</span>
                                <span className="text-slate-900 dark:text-white font-bold">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
