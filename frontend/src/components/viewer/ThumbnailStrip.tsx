import React from 'react';
import { FileText } from 'lucide-react';

interface ThumbnailStripProps {
  totalPages: number;
  currentPage: number;
  onSelectPage: (page: number) => void;
  documentName?: string;
}

export const ThumbnailStrip: React.FC<ThumbnailStripProps> = ({
  totalPages,
  currentPage,
  onSelectPage,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="w-40 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080C13] p-3 overflow-y-auto flex flex-col gap-3 shrink-0 select-none transition-colors">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">Pages</p>
      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <div
            key={p}
            onClick={() => onSelectPage(p)}
            className={`group cursor-pointer rounded-xl p-2 transition border flex flex-col items-center gap-1.5 ${
              isActive
                ? 'bg-blue-50 border-blue-500 shadow-sm dark:bg-blue-950/40 dark:border-blue-500/80 dark:shadow-md'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100 dark:bg-[#0E131F] dark:border-slate-800/80 dark:hover:border-slate-700 dark:hover:bg-slate-800/60'
            }`}
          >
            {/* Simulated mini page thumbnail representation */}
            <div className="w-full aspect-[1/1.3] bg-slate-100 dark:bg-[#0B0F17] rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between p-2 shadow-inner group-hover:border-slate-300 dark:group-hover:border-slate-700 transition">
              <div className="flex justify-between items-center text-[8px] text-slate-400 dark:text-slate-500 font-mono">
                <FileText className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                <span>P.{p}</span>
              </div>
              <div className="space-y-1 my-auto">
                <div className="h-1 w-3/4 bg-slate-300 dark:bg-slate-700 rounded"></div>
                <div className="h-1 w-full bg-slate-300/80 dark:bg-slate-700/80 rounded"></div>
                <div className="h-1 w-5/6 bg-slate-300/60 dark:bg-slate-700/60 rounded"></div>
                <div className="h-1 w-2/3 bg-slate-300/40 dark:bg-slate-700/40 rounded"></div>
              </div>
              <div className="h-1 w-1/3 bg-slate-400/40 dark:bg-blue-500/40 rounded self-end"></div>
            </div>
            <span
              className={`text-xs font-semibold ${
                isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white'
              }`}
            >
              Page {p}
            </span>
          </div>
        );
      })}
    </div>
  );
};
