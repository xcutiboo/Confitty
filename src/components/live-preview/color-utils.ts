const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;

function normalizeHex(hex: string): string {
  if (!hex || !hex.startsWith('#')) return hex;
  const body = hex.slice(1);
  if (body.length === 3) {
    return `#${body[0]}${body[0]}${body[1]}${body[1]}${body[2]}${body[2]}`;
  }
  return hex;
}

function toRgb(hex: string): [number, number, number] | null {
  const normalized = normalizeHex(hex);
  if (!normalized.startsWith('#') || normalized.length !== 7) return null;
  const r = Number.parseInt(normalized.slice(1, 3), 16);
  const g = Number.parseInt(normalized.slice(3, 5), 16);
  const b = Number.parseInt(normalized.slice(5, 7), 16);
  return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) ? null : [r, g, b];
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[r, g, b].map(n => clamp(n).toString(16).padStart(2, '0')).join('')}`;
}

export function rgba(hex: string, alpha: number): string {
  const rgb = toRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

export function shade(hex: string, percent: number): string {
  const rgb = toRgb(hex);
  if (!rgb) return hex;
  const isDark = luminance(hex) < 0.5;
  const direction = isDark ? 1 : -1;
  const delta = direction * percent * 255 / 100;
  return toHex(rgb[0] + delta, rgb[1] + delta, rgb[2] + delta);
}

export function luminance(hex: string): number {
  const rgb = toRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map(c => {
    const ch = c / 255;
    return ch <= 0.03928 ? ch / 12.92 : ((ch + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return LUMA_R * r + LUMA_G * g + LUMA_B * b;
}

export function isDark(hex: string): boolean {
  return luminance(hex) < 0.5;
}

export function readableOn(hex: string): string {
  return isDark(hex) ? '#ffffff' : '#111111';
}

export function ptToPx(pt: number): number {
  return pt * (96 / 72);
}
