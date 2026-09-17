import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  LayoutGrid,
} from 'lucide-react';

interface ViewerControlsProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onFitWidth?: () => void;
  onRotate?: () => void;
  onToggleThumbnails?: () => void;
  showThumbnails?: boolean;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({
  currentPage,
  totalPages,
  zoom,
  onPageChange,
  onZoomChange,
  onFitWidth,
  onRotate,
  onToggleThumbnails,
  showThumbnails,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#0B0F17] border-b border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-white select-none transition-colors">
      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        {onToggleThumbnails && (
          <button
            onClick={onToggleThumbnails}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              showThumbnails
                ? 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 border-slate-200 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:border-slate-800 dark:hover:bg-slate-800/80'
            }`}
            title="Toggle Page Thumbnails"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center bg-slate-100 dark:bg-[#080C13] border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2.5 text-xs font-semibold text-slate-800 dark:text-white">
            {currentPage} <span className="text-slate-400 dark:text-slate-500 font-normal">/ {Math.max(1, totalPages)}</span>
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Zoom & View Controls */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center bg-slate-100 dark:bg-[#080C13] border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => onZoomChange(Math.max(50, zoom - 25))}
            className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => onZoomChange(100)}
            className="px-2 text-xs font-mono font-semibold text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
            title="Reset Zoom (100%)"
          >
            {zoom}%
          </button>
          <button
            onClick={() => onZoomChange(Math.min(250, zoom + 25))}
            className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {onFitWidth && (
          <button
            onClick={onFitWidth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#080C13] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Fit to Width"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}

        {onRotate && (
          <button
            onClick={onRotate}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#080C13] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Rotate Clockwise (90°)"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
