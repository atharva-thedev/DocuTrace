import { BoundingBox } from '../types';

export interface ViewportRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Converts a normalized or page-coordinate bounding box [x0, y0, x1, y1]
 * into scaled viewport rectangle coordinates based on canvas dimensions.
 *
 * Handles both:
 * 1. Normalized coords (0.0 to 1.0)
 * 2. Absolute PDF points / pixel coords (e.g. 0 to 612, 0 to 792)
 */
export function scaleBoundingBox(
  bbox: BoundingBox,
  canvasWidth: number,
  canvasHeight: number,
  pageWidth: number = 612,
  pageHeight: number = 792
): ViewportRect {
  const [x0, y0, x1, y1] = bbox;

  // Check if coordinates are normalized [0.0 - 1.0]
  const isNormalized = x0 <= 1 && y0 <= 1 && x1 <= 1 && y1 <= 1 && (x1 > 0 || y1 > 0);

  let scaledX0: number;
  let scaledY0: number;
  let scaledX1: number;
  let scaledY1: number;

  if (isNormalized) {
    scaledX0 = x0 * canvasWidth;
    scaledY0 = y0 * canvasHeight;
    scaledX1 = x1 * canvasWidth;
    scaledY1 = y1 * canvasHeight;
  } else {
    // Scaled by actual page dimension ratio
    const scaleX = canvasWidth / pageWidth;
    const scaleY = canvasHeight / pageHeight;

    scaledX0 = x0 * scaleX;
    scaledY0 = y0 * scaleY;
    scaledX1 = x1 * scaleX;
    scaledY1 = y1 * scaleY;
  }

  const width = Math.max(Math.abs(scaledX1 - scaledX0), 6);
  const height = Math.max(Math.abs(scaledY1 - scaledY0), 6);
  const x = Math.min(scaledX0, scaledX1);
  const y = Math.min(scaledY0, scaledY1);

  return { x, y, width, height };
}

export function getBBoxCategoryStyles(category: string, confidence: number = 1.0): {
  stroke: string;
  fill: string;
  borderClass: string;
  badgeClass: string;
} {
  const cat = category.toLowerCase();

  if (cat.includes('anomaly') || cat.includes('mismatch') || cat.includes('error')) {
    return {
      stroke: '#EF4444',
      fill: 'rgba(239, 68, 68, 0.20)',
      borderClass: 'border-red-500',
      badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
  }

  if (cat.includes('citation') || cat.includes('qa') || cat.includes('evidence')) {
    return {
      stroke: '#8B5CF6',
      fill: 'rgba(139, 92, 246, 0.25)',
      borderClass: 'border-purple-500',
      badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };
  }

  if (cat.includes('obligation') || cat.includes('clause') || cat.includes('contract')) {
    return {
      stroke: '#3B82F6',
      fill: 'rgba(59, 130, 246, 0.20)',
      borderClass: 'border-blue-500',
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
  }

  // Low confidence extraction
  if (confidence < 0.75) {
    return {
      stroke: '#F59E0B',
      fill: 'rgba(245, 158, 11, 0.20)',
      borderClass: 'border-amber-500',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
  }

  // High confidence extraction standard
  return {
    stroke: '#10B981',
    fill: 'rgba(16, 185, 129, 0.15)',
    borderClass: 'border-emerald-500',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
}
