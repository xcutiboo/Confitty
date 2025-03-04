/**
 * Shared constants for the live terminal preview.
 *
 * Every magic number that used to live inline in terminal-window,
 * terminal-tab-bar, terminal-chrome, or terminal-screen now resolves
 * through here. One file to edit, one ratio to tune.
 */

export const FONT_SIZE_PT = { min: 6, max: 36 } as const;

/** Cell line-height as a multiple of font-size in px. Kitty default is ~1.0; 1.15 keeps room for descenders without web-text bleed. */
export const LINE_HEIGHT_RATIO = 1.15;

/** Tab bar height as a multiple of cell font-size in px. ~1.45 fits a single line plus 4px chrome. */
export const TAB_BAR_RATIO = 1.45;

/** Powerline arrow width in px. Wider = more dramatic slope; 14 reads at common preview sizes. */
export const POWERLINE_ARROW_PX = 14;

/** macOS-style traffic light cluster. */
export const CHROME_LIGHTS = {
  size: 11,
  gap: 6,
  closeColor:    '#ff5f57',
  minimizeColor: '#febc2e',
  maximizeColor: '#28c840',
} as const;

/** Checkerboard shown only when background_opacity < 1, signalling transparency. */
export const WALLPAPER = {
  base:     '#1a1a1f',
  check:    '#25252b',
  cellPx:   16,
} as const;

/** Tab bar fade fallback when the user-set tab_fade array is empty. */
export const DEFAULT_FADE_STEPS: readonly number[] = [0.25, 0.5, 0.75, 1];

/** Animation timings, in milliseconds. */
export const TIMINGS = {
  themeSwap: 200,
  blink:     500,
} as const;
