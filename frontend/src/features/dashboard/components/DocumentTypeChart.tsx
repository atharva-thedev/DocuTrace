import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { formatDocumentType } from '../../../utils/formatters';
import { Layers } from 'lucide-react';

interface DocumentTypeChartProps {
  data?: Record<string, number>;
}

export const DocumentTypeChart: React.FC<DocumentTypeChartProps> = ({ data = {} }) => {
  const entries = Object.entries(data || {});
  const totalCount = entries.reduce((acc, [, val]) => acc + val, 0);

  // If no data, provide standard template categories with 0%
  const defaultCategories: Array<[string, number]> = [
    ['invoice', 0],
    ['po', 0],
    ['contract', 0],
    ['compliance', 0],
  ];

  const displayEntries = totalCount > 0 ? entries : defaultCategories;
  const sorted = [...displayEntries].sort((a, b) => b[1] - a[1]);

  return (
    <Card variant="glass" className="h-full flex flex-col justify-between">
      <CardHeader className="flex items-center justify-between gap-4 w-full">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <CardTitle>Ingestion by Document Category</CardTitle>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Classification breakdown across corporate repositories
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0">
          %, total reach
        </span>
      </CardHeader>

      <CardContent className="p-6 flex-1 flex flex-col justify-start space-y-3.5">
        {sorted.map(([key, count], index) => {
          const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
          const isTop = totalCount > 0 && index === 0;
          // Set visual bar width: between 14% min (so number fits) and max percent
          const barWidthPercent = totalCount > 0 ? Math.max(percent, 14) : 10;

          return (
            <div key={key} className="flex items-center justify-between gap-4 select-none group">
              {/* Horizontal Pill Bar Track */}
              <div className="flex-1 bg-slate-100 dark:bg-[#080C13] rounded-full h-8 p-1 flex items-center overflow-hidden border border-slate-200/60 dark:border-slate-800">
                <div
                  style={{ width: `${barWidthPercent}%` }}
                  className={`h-full rounded-full transition-all duration-500 flex items-center justify-end px-2.5 ${
                    isTop
                      ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white shadow-sm shadow-blue-500/20 font-bold'
                      : totalCount > 0
                      ? 'bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold'
                      : 'bg-slate-200 text-slate-400 dark:bg-slate-900 dark:text-slate-500'
                  }`}
                >
                  <span className="text-xs font-mono font-bold">{percent}%</span>
                </div>
              </div>

              {/* Category Name & Count on Right */}
              <div className="w-44 text-right shrink-0">
                <p className={`text-xs font-bold tracking-tight truncate ${isTop ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                  {formatDocumentType(key)}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  {count} {count === 1 ? 'record' : 'records'}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
