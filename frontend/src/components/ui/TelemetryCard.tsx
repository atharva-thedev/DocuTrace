import React from 'react';
import { clsx } from 'clsx';
import { ArrowRight, Box } from 'lucide-react';

export interface TelemetrySubStat {
  label: string;
  value: string;
  diff?: string;
  isPositive?: boolean; // If true, green badge. If false, red badge.
  isNeutral?: boolean;
}

export interface TelemetryCardProps {
  metric: string;
  metricLabel?: string;
  timestamp?: string;
  badge?: {
    text: string;
    icon?: React.ReactNode;
    count?: string;
    arrow?: boolean;
    onClick?: () => void;
  };
  subStats?: TelemetrySubStat[];
  footer?: string;
  size?: 'xl' | 'm' | 's';
  className?: string;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  metric,
  metricLabel,
  timestamp,
  badge,
  subStats,
  footer,
  size = 'xl',
  className,
}) => {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0E131F] shadow-lg hover:shadow-xl dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] transition-all select-none p-5 flex flex-col justify-between',
        size === 's' ? 'p-4 gap-3' : size === 'm' ? 'p-5 gap-4' : 'p-6 gap-5',
        className
      )}
    >
      {/* Top Row: Primary Metric & Timestamp */}
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <span className={clsx('font-extrabold text-slate-900 dark:text-white tracking-tight font-mono block', size === 's' ? 'text-xl' : size === 'm' ? 'text-2xl' : 'text-3xl')}>
            {metric}
          </span>
          {metricLabel && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5 block">
              {metricLabel}
            </span>
          )}
        </div>
        {timestamp && (
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 font-mono shrink-0">
            {timestamp}
          </span>
        )}
      </div>

      {/* Version / Pipeline Build Strip */}
      {badge && (
        <div
          onClick={badge.onClick}
          className={clsx(
            'flex items-center justify-between rounded-xl px-3 py-2 bg-slate-50 dark:bg-[#080C13] border border-slate-200/80 dark:border-slate-800 text-xs transition',
            badge.onClick && 'cursor-pointer hover:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:hover:border-slate-700'
          )}
        >
          <div className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400 truncate">
            {badge.icon || <Box className="h-3.5 w-3.5 shrink-0" />}
            <span className="font-mono text-xs">{badge.text}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {badge.count && (
              <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold font-mono">
                {badge.count}
              </span>
            )}
            {badge.arrow && <ArrowRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />}
          </div>
        </div>
      )}

      {/* Sub-Metrics Row / Grid */}
      {subStats && subStats.length > 0 && (
        <div
          className={clsx(
            'rounded-xl p-3 bg-slate-50/70 dark:bg-[#080C13] border border-slate-200/60 dark:border-slate-800',
            size === 's'
              ? 'grid grid-cols-3 gap-2 text-center'
              : size === 'm'
              ? 'space-y-2'
              : 'grid grid-cols-3 gap-3'
          )}
        >
          {subStats.map((stat, idx) => (
            <div
              key={idx}
              className={clsx(
                size === 'm'
                  ? 'flex items-center justify-between text-xs'
                  : 'flex flex-col gap-1'
              )}
            >
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {stat.label}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                  {stat.value}
                </span>
                {stat.diff && (
                  <span
                    className={clsx(
                      'text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-md',
                      stat.isNeutral
                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        : stat.isPositive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    )}
                  >
                    {stat.diff}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Metadata */}
      {footer && (
        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span>{footer}</span>
        </div>
      )}
    </div>
  );
};
