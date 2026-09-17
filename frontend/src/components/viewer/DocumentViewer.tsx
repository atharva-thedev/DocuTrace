import React, { useState, useRef, useEffect } from 'react';
import { ViewerControls } from './ViewerControls';
import { ThumbnailStrip } from './ThumbnailStrip';
import { BoundingBoxOverlay, BBoxItem } from './BoundingBoxOverlay';

interface DocumentViewerProps {
  documentId: string;
  filename: string;
  totalPages?: number;
  mimeType?: string;
  boxes?: BBoxItem[];
  activeBoxId?: string | null;
  onBoxClick?: (box: BBoxItem) => void;
  targetPage?: number;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  filename,
  totalPages = 1,
  mimeType = 'application/pdf',
  boxes = [],
  activeBoxId = null,
  onBoxClick,
  targetPage = 1,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(targetPage || 1);
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({
    width: 650,
    height: 840,
  });

  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Sync current page if targetPage prop changes (e.g. from citation or field click)
  useEffect(() => {
    if (targetPage && targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }
  }, [targetPage]);

  // Update canvas dimensions on resize / zoom
  useEffect(() => {
    if (pageContainerRef.current) {
      const rect = pageContainerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    }
  }, [zoom, currentPage, showThumbnails]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFitWidth = () => {
    setZoom(120);
  };

  const fileStreamUrl = `/api/v1/documents/${documentId}/file`;

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-[#080C13] rounded-2xl overflow-hidden border border-slate-200 dark:border-gray-800 shadow-xl relative transition-colors">
      {/* Top Controls Toolbar */}
      <ViewerControls
        currentPage={currentPage}
        totalPages={totalPages}
        zoom={zoom}
        onPageChange={setCurrentPage}
        onZoomChange={setZoom}
        onFitWidth={handleFitWidth}
        onRotate={handleRotate}
        onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
        showThumbnails={showThumbnails}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Thumbnail Drawer */}
        {showThumbnails && totalPages > 1 && (
          <ThumbnailStrip
            totalPages={totalPages}
            currentPage={currentPage}
            onSelectPage={setCurrentPage}
            documentName={filename}
          />
        )}

        {/* Center Scrollable Document Viewport */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-200/60 dark:bg-[#070A0F]/80">
          <div
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="relative"
          >
            {/* Rendered Document Sheet Container */}
            <div
              ref={pageContainerRef}
              className="relative w-[650px] min-h-[840px] bg-white rounded-lg shadow-xl overflow-hidden border border-slate-300 dark:border-gray-700 select-none flex flex-col"
            >
              {/* If image MIME type */}
              {mimeType.startsWith('image/') ? (
                <img
                  src={fileStreamUrl}
                  alt={filename}
                  className="w-full h-full object-contain pointer-events-none"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setCanvasDimensions({ width: img.clientWidth, height: img.clientHeight });
                  }}
                />
              ) : (
                /* PDF / Document Visual Canvas */
                <div className="w-full h-full flex flex-col p-10 text-slate-900 bg-white relative">
                  {/* Watermark / Header */}
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        DT
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 tracking-tight">{filename}</h4>
                        <p className="text-[10px] text-slate-400">DocuTrace Grounded Visual Evidence Layer</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  {/* Document Simulated Page Body */}
                  <div className="flex-1 space-y-4 font-sans text-xs leading-relaxed text-slate-700">
                    <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Document Name</span>
                        <p className="font-semibold text-slate-900 truncate">{filename}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Document Type</span>
                        <p className="font-semibold text-blue-600 uppercase">{mimeType.replace('application/', '')}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="h-3.5 bg-slate-200 rounded w-5/6"></div>
                      <div className="h-3.5 bg-slate-200 rounded w-full"></div>
                      <div className="h-3.5 bg-slate-200 rounded w-4/6"></div>
                      <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 my-6">
                      <p className="text-[11px] font-semibold text-blue-900 mb-1">
                        Active Spatial Intelligence Overlay
                      </p>
                      <p className="text-[10px] text-blue-700 leading-normal">
                        Click on any extracted key-value, anomaly card, or Q&A citation badge in the right-hand panel to highlight the corresponding region on this page.
                      </p>
                    </div>

                    <div className="space-y-2 pt-4">
                      <div className="h-3 bg-slate-100 rounded w-full"></div>
                      <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                      <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                    </div>
                  </div>

                  {/* Bottom Page Footer */}
                  <div className="pt-6 border-t border-slate-200 mt-auto flex justify-between items-center text-[10px] text-slate-400">
                    <span>DocuTrace AI Platform</span>
                    <span>Verified Audit Trail • Security Grounded</span>
                  </div>
                </div>
              )}

              {/* Bounding Box SVG Layer Overlay */}
              <BoundingBoxOverlay
                boxes={boxes}
                activeBoxId={activeBoxId}
                onBoxClick={onBoxClick}
                containerWidth={canvasDimensions.width}
                containerHeight={canvasDimensions.height}
                currentPage={currentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
