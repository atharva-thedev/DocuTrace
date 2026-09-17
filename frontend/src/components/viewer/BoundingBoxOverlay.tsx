import React, { useState } from 'react';
import { BoundingBox } from '../../types';
import { scaleBoundingBox, getBBoxCategoryStyles } from '../../utils/bboxHelpers';

export interface BBoxItem {
  id: string;
  bbox: BoundingBox;
  page: number;
  label?: string;
  category?: string;
  confidence?: number;
  value?: string;
  active?: boolean;
}

interface BoundingBoxOverlayProps {
  boxes: BBoxItem[];
  activeBoxId?: string | null;
  canvasWidth?: number;
  canvasHeight?: number;
  containerWidth?: number;
  containerHeight?: number;
  pageWidth?: number;
  pageHeight?: number;
  currentPage: number;
  onBoxClick?: (box: BBoxItem) => void;
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  boxes,
  activeBoxId,
  canvasWidth,
  canvasHeight,
  containerWidth,
  containerHeight,
  pageWidth = 612,
  pageHeight = 792,
  currentPage,
  onBoxClick,
}) => {
  const [hoveredBox, setHoveredBox] = useState<BBoxItem | null>(null);

  const effectiveWidth = canvasWidth || containerWidth || 650;
  const effectiveHeight = canvasHeight || containerHeight || 840;

  if (!effectiveWidth || !effectiveHeight) return null;

  // Filter boxes belonging to current page
  const pageBoxes = boxes.filter((b) => b.page === currentPage && b.bbox);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <svg
        width={effectiveWidth}
        height={effectiveHeight}
        className="w-full h-full"
        viewBox={`0 0 ${effectiveWidth} ${effectiveHeight}`}
      >
        {pageBoxes.map((box) => {
          const rect = scaleBoundingBox(box.bbox, effectiveWidth, effectiveHeight, pageWidth, pageHeight);
          const isActive = box.id === activeBoxId || box.active;
          const styles = getBBoxCategoryStyles(box.category || 'extraction', box.confidence ?? 1.0);

          return (
            <g key={box.id} className="pointer-events-auto cursor-pointer">
              {/* Outer Bounding Box */}
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                fill={isActive ? styles.fill.replace(/0\.\d+/, '0.35') : styles.fill}
                stroke={isActive ? '#60A5FA' : styles.stroke}
                strokeWidth={isActive ? 2.5 : 1.5}
                strokeDasharray={isActive ? 'none' : '2 2'}
                rx={3}
                className={`transition-all duration-150 hover:opacity-100 ${
                  isActive ? 'bbox-active-pulse' : 'opacity-85 hover:stroke-white'
                }`}
                onClick={() => onBoxClick && onBoxClick(box)}
                onMouseEnter={() => setHoveredBox(box)}
                onMouseLeave={() => setHoveredBox(null)}
              />

              {/* Mini Top-Left Category Tag */}
              {(isActive || (hoveredBox && hoveredBox.id === box.id)) && (
                <g transform={`translate(${rect.x}, ${Math.max(rect.y - 18, 0)})`}>
                  <rect
                    x={0}
                    y={0}
                    width={Math.max((box.label || box.category || 'Field').length * 7 + 14, 45)}
                    height={16}
                    fill="#111827"
                    stroke={styles.stroke}
                    strokeWidth={1}
                    rx={3}
                  />
                  <text
                    x={6}
                    y={12}
                    fill="#F9FAFB"
                    fontSize="9"
                    fontWeight="bold"
                    className="select-none font-sans"
                  >
                    {box.label || box.category || 'Field'}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredBox && (
        <div
          className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-2 glass-panel-elevated rounded-lg px-3 py-2 text-xs shadow-xl border border-gray-700 select-none transition-opacity"
          style={{
            left: `${scaleBoundingBox(hoveredBox.bbox, effectiveWidth, effectiveHeight, pageWidth, pageHeight).x + scaleBoundingBox(hoveredBox.bbox, effectiveWidth, effectiveHeight, pageWidth, pageHeight).width / 2}px`,
            top: `${scaleBoundingBox(hoveredBox.bbox, effectiveWidth, effectiveHeight, pageWidth, pageHeight).y}px`,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1 font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span>{hoveredBox.label || hoveredBox.category || 'Extracted Element'}</span>
          </div>
          {hoveredBox.value && (
            <p className="font-mono text-blue-300 text-[11px] truncate max-w-xs">{hoveredBox.value}</p>
          )}
          {hoveredBox.confidence !== undefined && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              Confidence: {Math.round(hoveredBox.confidence * 100)}%
            </p>
          )}
        </div>
      )}
    </div>
  );
};
