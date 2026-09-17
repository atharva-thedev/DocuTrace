import React from 'react';
import { clsx } from 'clsx';

export interface SegmentedProgressBarProps {
  score: number; // 0 - 100 or 0 - 10
  max?: number;
  segments?: number;
  label?: string;
  sublabel?: string;
  color?: 'teal' | 'emerald' | 'amber' | 'red' | 'purple' | 'auto';
  showScoreBadge?: boolean;
  scoreBadgeFormat?: (val: number, max: number) => string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SegmentedProgressBar: React.FC<SegmentedProgressBarProps> = ({
  score,
  max = 10,
  segments = 8,
  label,
  sublabel,
  color = 'auto',
  showScoreBadge = true,
  scoreBadgeFormat,
  size = 'md',
  className,
}) => {
  // Normalize score to ratio 0 - 1
  const ratio = Math.min(Math.max(score / max, 0), 1);
  const activeSegmentsCount = Math.round(ratio * segments);

  // Auto determine color based on severity ratio if auto
  const resolvedColor =
    color === 'auto'
      ? ratio >= 0.75
        ? 'red'
        : ratio >= 0.5
        ? 'amber'
        : ratio >= 0.25
        ? 'teal'
        : 'emerald'
      : color;

  const colorStyles = {
    teal: {
      active: 'bg-blue-500 dark:bg-blue-400 shadow-xs',
      inactive: 'bg-slate-200/80 dark:bg-slate-800',
      badge: 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white',
      dot: 'bg-blue-500 dark:bg-blue-400',
    },
    emerald: {
      active: 'bg-emerald-500 dark:bg-emerald-400 shadow-xs',
      inactive: 'bg-slate-200/80 dark:bg-slate-800',
      badge: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white',
      dot: 'bg-emerald-500 dark:bg-emerald-400',
    },
    amber: {
      active: 'bg-amber-500 dark:bg-amber-400 shadow-xs',
      inactive: 'bg-slate-200/80 dark:bg-slate-800',
      badge: 'bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950',
      dot: 'bg-amber-500 dark:bg-amber-400',
    },
    red: {
      active: 'bg-rose-500 dark:bg-rose-400 shadow-xs',
      inactive: 'bg-slate-200/80 dark:bg-slate-800',
      badge: 'bg-rose-600 text-white dark:bg-rose-500 dark:text-white',
      dot: 'bg-rose-500 dark:bg-rose-400',
    },
    purple: {
      active: 'bg-indigo-500 dark:bg-indigo-400 shadow-xs',
      inactive: 'bg-slate-200/80 dark:bg-slate-800',
      badge: 'bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white',
      dot: 'bg-indigo-500 dark:bg-indigo-400',
    },
  };

  const style = colorStyles[resolvedColor];

  const sizeClasses = {
    sm: {
      height: 'h-2',
      segmentWidth: 'min-w-[12px] flex-1',
      gap: 'gap-1',
      badge: 'text-[10px] px-2 py-0.5',
      label: 'text-xs',
    },
    md: {
      height: 'h-3',
      segmentWidth: 'min-w-[16px] flex-1',
      gap: 'gap-1.5',
      badge: 'text-xs px-2.5 py-0.5 font-bold',
      label: 'text-xs font-semibold',
    },
    lg: {
      height: 'h-4',
      segmentWidth: 'min-w-[20px] flex-1',
      gap: 'gap-2',
      badge: 'text-sm px-3 py-1 font-extrabold',
      label: 'text-sm font-bold',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={clsx('w-full flex items-center justify-between gap-4 select-none', className)}>
      {/* Label and Sublabel */}
      {(label || sublabel) && (
        <div className="flex items-center gap-2.5 min-w-0 max-w-[45%]">
          <span className={clsx('h-2 w-2 rounded-full shrink-0', style.dot)} />
          <div className="truncate">
            {label && <p className={clsx('text-slate-800 dark:text-white truncate', currentSize.label)}>{label}</p>}
            {sublabel && <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{sublabel}</p>}
          </div>
        </div>
      )}

      {/* Segmented Bar Track */}
      <div className="flex-1 flex items-center gap-3">
        <div className={clsx('flex items-center w-full', currentSize.gap)}>
          {Array.from({ length: segments }).map((_, idx) => {
            const isActive = idx < activeSegmentsCount;
            return (
              <div
                key={idx}
                className={clsx(
                  'rounded-full transition-all duration-300',
                  currentSize.height,
                  currentSize.segmentWidth,
                  isActive ? style.active : style.inactive
                )}
              />
            );
          })}
        </div>

        {/* Score Pill Badge */}
        {showScoreBadge && (
          <span
            className={clsx(
              'rounded-full tracking-tight font-mono shrink-0 shadow-sm transition-colors',
              currentSize.badge,
              style.badge
            )}
          >
            {scoreBadgeFormat ? scoreBadgeFormat(score, max) : `${score.toFixed(1)}`}
          </span>
        )}
      </div>
    </div>
  );
};
