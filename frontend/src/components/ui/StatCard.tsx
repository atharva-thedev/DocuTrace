import React from 'react';
import { Card } from './Card';
import { clsx } from 'clsx';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'purple' | 'red' | 'amber' | 'emerald';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  onClick,
}) => {
  const colorStyles = {
    blue: {
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40',
      border: 'hover:border-blue-500/40 dark:hover:border-blue-500/40',
    },
    purple: {
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40',
      border: 'hover:border-indigo-500/40 dark:hover:border-indigo-500/40',
    },
    red: {
      iconBg: 'bg-red-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
      border: 'hover:border-rose-500/40 dark:hover:border-rose-500/40',
    },
    amber: {
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
      border: 'hover:border-amber-500/40 dark:hover:border-amber-500/40',
    },
    emerald: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
      border: 'hover:border-emerald-500/40 dark:hover:border-emerald-500/40',
    },
  };

  const currentStyle = colorStyles[color];

  return (
    <Card
      variant="glass"
      className={clsx(
        'group p-5 sm:p-6 relative overflow-hidden transition-all duration-200 border border-slate-200/90 dark:border-slate-800 dark:bg-[#0E131F] flex flex-col justify-between h-full',
        currentStyle.border,
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div>
        {/* Top Header: Title & Icon in aligned row */}
        <div className="flex items-start justify-between gap-3">
          <div className="h-9 flex items-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
              {title}
            </p>
          </div>
          <div className={clsx('flex h-11 w-11 items-center justify-center rounded-2xl border shadow-xs shrink-0', currentStyle.iconBg)}>
            {icon}
          </div>
        </div>

        {/* Big Metric Number: Perfectly aligned across all cards */}
        <div className="mt-3 flex items-baseline">
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            {value}
          </p>
        </div>

        {/* Subtitle with consistent min-height */}
        <div className="min-h-[28px] flex items-center mt-1.5">
          {subtitle ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
              {subtitle}
            </p>
          ) : (
            <div className="h-4" />
          )}
        </div>
      </div>

      {/* Bottom Trend / Footer Slot with consistent baseline */}
      <div className="min-h-[20px] flex items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        {trend ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={clsx(
                'font-bold',
                trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {trend.value}
            </span>
            <span className="text-slate-400 dark:text-slate-500">vs last period</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Real-time sync</span>
        )}
      </div>
    </Card>
  );
};
