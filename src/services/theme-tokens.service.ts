import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { ConfigStoreService } from './config-store.service';
import type { KittyColorConfig } from '../models/kitty-types';

/**
 * Theme token system - Centralized CSS custom properties for Kitty theming.
 * Provides runtime theme switching with seamless transitions and no visual glitches.
 */

export interface ThemeTokens {
  // Core terminal colors
  'terminal-fg': string;
  'terminal-bg': string;
  'terminal-bg-opacity': string;
  'terminal-selection-fg': string;
  'terminal-selection-bg': string;

  // ANSI 16 colors
  'terminal-color-0': string;
  'terminal-color-1': string;
  'terminal-color-2': string;
  'terminal-color-3': string;
  'terminal-color-4': string;
  'terminal-color-5': string;
  'terminal-color-6': string;
  'terminal-color-7': string;
  'terminal-color-8': string;
  'terminal-color-9': string;
  'terminal-color-10': string;
  'terminal-color-11': string;
  'terminal-color-12': string;
  'terminal-color-13': string;
  'terminal-color-14': string;
  'terminal-color-15': string;

  // Cursor
  'terminal-cursor': string;
  'terminal-cursor-text': string;

  // Tab bar
  'terminal-tab-active-fg': string;
  'terminal-tab-active-bg': string;
  'terminal-tab-inactive-fg': string;
  'terminal-tab-inactive-bg': string;
  'terminal-tab-bar-bg': string;

  // Window
  'terminal-window-border': string;
  'terminal-window-titlebar-bg': string;
  'terminal-url-color': string;
}

/**
 * Generate CSS variable name from token key
 */
export function tokenToCssVar(key: keyof ThemeTokens): string {
  return `--${key}`;
}

/**
 * Apply theme tokens to CSS variables on a target element (usually :root or terminal container)
 */
export function applyThemeTokens(element: HTMLElement, tokens: Partial<ThemeTokens>): void {
  for (const [key, value] of Object.entries(tokens)) {
    if (value !== undefined) {
      element.style.setProperty(tokenToCssVar(key as keyof ThemeTokens), value);
    }
  }
}

/**
 * Convert hex color to RGB values for CSS rgb() function
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6 && normalized.length !== 3) return null;

  let fullHex = normalized;
  if (normalized.length === 3) {
    fullHex = normalized.split('').map(c => c + c).join('');
  }

  const r = parseInt(fullHex.slice(0, 2), 16);
  const g = parseInt(fullHex.slice(2, 4), 16);
  const b = parseInt(fullHex.slice(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

/**
 * Convert hex to CSS rgb() string
 */
export function hexToRgbString(hex: string): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
}

/**
 * Generate tokens from Kitty color configuration
 */
export function generateTokensFromKittyColors(
  colors: KittyColorConfig,
  tabBarConfig: { active_tab_foreground: string; active_tab_background: string; inactive_tab_foreground: string; inactive_tab_background: string; tab_bar_background: string },
  cursorConfig: { cursor: string; cursor_text_color: string },
  mouseConfig: { url_color: string },
  windowConfig: { active_border_color: string }
): Partial<ThemeTokens> {
  const getColor = (hex: string | undefined, fallback: string): string => {
    if (!hex || hex === 'none') return fallback;
    const rgb = hexToRgbString(hex);
    return rgb ? rgb : fallback;
  };

  const toRgb = (hex: string) => hexToRgbString(hex) || hex;

  return {
    // Core
    'terminal-fg': toRgb(colors.foreground),
    'terminal-bg': toRgb(colors.background),
    'terminal-bg-opacity': String(colors.background_opacity ?? 1),
    'terminal-selection-fg': toRgb(colors.selection_foreground),
    'terminal-selection-bg': toRgb(colors.selection_background),

    // ANSI colors
    'terminal-color-0': toRgb(colors.color0),
    'terminal-color-1': toRgb(colors.color1),
    'terminal-color-2': toRgb(colors.color2),
    'terminal-color-3': toRgb(colors.color3),
    'terminal-color-4': toRgb(colors.color4),
    'terminal-color-5': toRgb(colors.color5),
    'terminal-color-6': toRgb(colors.color6),
    'terminal-color-7': toRgb(colors.color7),
    'terminal-color-8': toRgb(colors.color8),
    'terminal-color-9': toRgb(colors.color9),
    'terminal-color-10': toRgb(colors.color10),
    'terminal-color-11': toRgb(colors.color11),
    'terminal-color-12': toRgb(colors.color12),
    'terminal-color-13': toRgb(colors.color13),
    'terminal-color-14': toRgb(colors.color14),
    'terminal-color-15': toRgb(colors.color15),

    // Cursor
    'terminal-cursor': toRgb(cursorConfig.cursor),
    'terminal-cursor-text': toRgb(cursorConfig.cursor_text_color),

    // Tab bar
    'terminal-tab-active-fg': toRgb(tabBarConfig.active_tab_foreground),
    'terminal-tab-active-bg': toRgb(tabBarConfig.active_tab_background),
    'terminal-tab-inactive-fg': toRgb(tabBarConfig.inactive_tab_foreground),
    'terminal-tab-inactive-bg': toRgb(tabBarConfig.inactive_tab_background),
    'terminal-tab-bar-bg': tabBarConfig.tab_bar_background === 'none'
      ? toRgb(colors.background)
      : toRgb(tabBarConfig.tab_bar_background),

    // Window
    'terminal-window-border': toRgb(windowConfig.active_border_color),
    'terminal-window-titlebar-bg': getColor(undefined, '30 30 30'),
    'terminal-url-color': toRgb(mouseConfig.url_color),
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeTokensService {
  private readonly configStore = inject(ConfigStoreService);

  private readonly _currentTokens = signal<Partial<ThemeTokens>>({});
  readonly currentTokens = this._currentTokens.asReadonly();

  constructor() {
    effect(() => {
      const config = this.configStore.configState();
      const tokens = generateTokensFromKittyColors(
        config.colors,
        config.tab_bar,
        config.cursor,
        config.mouse,
        config.window_layout
      );
      this._currentTokens.set(tokens);

      // Apply to document root
      applyThemeTokens(document.documentElement, tokens);
    });
  }

  /**
   * Get a specific token value
   */
  getToken(key: keyof ThemeTokens): string | undefined {
    return this._currentTokens()[key];
  }

  /**
   * Get all tokens as CSS custom property declarations
   */
  getTokenStyles(): Record<string, string> {
    const tokens = this._currentTokens();
    const styles: Record<string, string> = {};

    for (const [key, value] of Object.entries(tokens)) {
      if (value !== undefined) {
        styles[tokenToCssVar(key as keyof ThemeTokens)] = value;
      }
    }

    return styles;
  }

  /**
   * Generate inline style string for tokens
   */
  generateTokenStyleString(): string {
    const tokens = this._currentTokens();
    return Object.entries(tokens)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${tokenToCssVar(key as keyof ThemeTokens)}: ${value};`)
      .join(' ');
  }
}
