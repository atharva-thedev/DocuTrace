import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { ShieldAlert } from 'lucide-react';

interface RiskBreakdownChartProps {
  data?: {
    low?: number;
    medium?: number;
    high?: number;
    critical?: number;
  };
}

export const RiskBreakdownChart: React.FC<RiskBreakdownChartProps> = ({ data = {} }) => {
  const low = data?.low || 0;
  const medium = data?.medium || 0;
  const high = data?.high || 0;
  const critical = data?.critical || 0;
  const total = low + medium + high + critical;

  const tiers = [
    {
      id: 'low',
      label: 'Low',
      fullName: 'Low Risk',
      count: low,
      percent: total > 0 ? Math.round((low / total) * 100) : 0,
      activeBar: 'bg-emerald-500 dark:bg-emerald-500 shadow-sm shadow-emerald-500/20',
      inactiveBar: 'bg-slate-200 dark:bg-slate-800',
    },
    {
      id: 'medium',
      label: 'Medium',
      fullName: 'Medium Risk',
      count: medium,
      percent: total > 0 ? Math.round((medium / total) * 100) : 0,
      activeBar: 'bg-amber-500 dark:bg-amber-500 shadow-sm shadow-amber-500/20',
      inactiveBar: 'bg-slate-200 dark:bg-slate-800',
    },
    {
      id: 'high',
      label: 'High',
      fullName: 'High Risk',
      count: high,
      percent: total > 0 ? Math.round((high / total) * 100) : 0,
      activeBar: 'bg-orange-500 dark:bg-orange-500 shadow-sm shadow-orange-500/20',
      inactiveBar: 'bg-slate-200 dark:bg-slate-800',
    },
    {
      id: 'critical',
      label: 'Critical',
      fullName: 'Critical Risk',
      count: critical,
      percent: total > 0 ? Math.round((critical / total) * 100) : 0,
      activeBar: 'bg-rose-500 dark:bg-rose-500 shadow-sm shadow-rose-500/20',
      inactiveBar: 'bg-slate-200 dark:bg-slate-800',
    },
  ];

  // Find dominant tier
  const dominantTier = total > 0 ? [...tiers].sort((a, b) => b.count - a.count)[0] : tiers[0];
  const maxPercent = total > 0 ? Math.max(...tiers.map((t) => t.percent), 1) : 100;

  return (
    <Card variant="glass" className="h-full flex flex-col justify-between">
      <CardHeader className="flex items-center justify-between gap-4 w-full">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <CardTitle>Risk Distribution Analysis</CardTitle>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Portfolio risk posture across ingested documents
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0">
          {total} {total === 1 ? 'record' : 'records'}
        </span>
      </CardHeader>

      <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
        {/* Dominant Summary Highlight Strip */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 w-full">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Primary Risk Posture
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {total > 0 ? `${dominantTier.fullName} (${dominantTier.percent}%)` : 'No Risk Flags Detected'}
            </span>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 shrink-0">
            {total > 0 ? `${dominantTier.count} of ${total} evaluated` : '0 risk evaluations'}
          </span>
        </div>

        {/* 4-Column Bar Graph */}
        <div className="grid grid-cols-4 gap-3 items-end h-36 pt-2">
          {tiers.map((tier) => {
            const isDominant = total > 0 && tier.id === dominantTier.id && tier.count > 0;
            const heightPercent = total > 0 ? Math.max((tier.percent / maxPercent) * 100, 14) : 10;

            return (
              <div key={tier.id} className="flex flex-col items-center justify-end h-full gap-2 group select-none">
                {/* Percentage above bar */}
                <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-white">
                  {tier.percent}%
                </span>

                {/* Column Bar with Track */}
                <div className="w-full flex-1 flex items-end bg-slate-100 dark:bg-[#080C13] rounded-xl p-1 border border-slate-200/50 dark:border-slate-800">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-lg transition-all duration-500 ${
                      isDominant
                        ? tier.activeBar
                        : total > 0 && tier.count > 0
                        ? tier.activeBar
                        : tier.inactiveBar
                    }`}
                  />
                </div>

                {/* Bottom tier label badge */}
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md truncate max-w-full text-center ${
                    isDominant
                      ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white shadow-sm font-bold'
                      : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80'
                  }`}
                >
                  {tier.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
