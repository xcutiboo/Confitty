import { lineHeightFor, cellWidthFor } from './preview-metrics';

export interface CellMetrics {
  width: number;
  height: number;
  baseline: number;
}

function approximate(family: string, fontPx: number): CellMetrics {
  const width = fontPx * cellWidthFor(family);
  const height = fontPx * lineHeightFor(family);
  return { width, height, baseline: height * 0.78 };
}

function measureViaCanvas(family: string, fontPx: number): CellMetrics | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const stack = `"${family}", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`;
  ctx.font = `${fontPx}px ${stack}`;
  const sample = ctx.measureText('Mg');
  const width = ctx.measureText('M').width;
  type Extended = TextMetrics & { fontBoundingBoxAscent?: number; fontBoundingBoxDescent?: number };
  const m = sample as Extended;
  const ascent = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent;
  const descent = m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent;
  if (!Number.isFinite(width) || width <= 0) return null;
  const height = (ascent + descent) || fontPx * lineHeightFor(family);
  return { width, height, baseline: ascent };
}

export function measureCell(family: string, fontPx: number): CellMetrics {
  return measureViaCanvas(family, fontPx) ?? approximate(family, fontPx);
}
