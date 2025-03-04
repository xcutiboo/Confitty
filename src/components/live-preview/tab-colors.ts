import type { KittyColorConfig, KittyTabBarConfig } from '../../models/kitty-types';
import { DEFAULT_KITTY_CONFIG } from '../../models/kitty-defaults';
import { shade } from './color-utils';

export interface TabPalette {
  barBg: string;
  activeBg: string;
  activeFg: string;
  inactiveBg: string;
  inactiveFg: string;
}

const TAB_DEFAULTS = DEFAULT_KITTY_CONFIG.tab_bar;

/**
 * Tab bar colors in kitty.conf are independent from the main palette by default.
 * When the user has not touched the tab bar fields, fall back to palette-derived
 * values so a Colors-form edit visibly carries through to the preview's tab bar.
 *
 * The raw config is never mutated; the export pipeline keeps its source values.
 */
export function effectiveTabColors(tabBar: KittyTabBarConfig, colors: KittyColorConfig): TabPalette {
  const fallback = derivedFromPalette(colors);

  return {
    barBg: tabBar.tab_bar_background !== 'none'
      ? tabBar.tab_bar_background
      : fallback.barBg,

    activeBg: tabBar.active_tab_background === TAB_DEFAULTS.active_tab_background
      ? fallback.activeBg
      : tabBar.active_tab_background,

    activeFg: tabBar.active_tab_foreground === TAB_DEFAULTS.active_tab_foreground
      ? fallback.activeFg
      : tabBar.active_tab_foreground,

    inactiveBg: tabBar.inactive_tab_background === TAB_DEFAULTS.inactive_tab_background
      ? fallback.inactiveBg
      : tabBar.inactive_tab_background,

    inactiveFg: tabBar.inactive_tab_foreground === TAB_DEFAULTS.inactive_tab_foreground
      ? fallback.inactiveFg
      : tabBar.inactive_tab_foreground,
  };
}

/**
 * Pure derivation from the active palette. Exported so the store can
 * reuse the same recipe when it syncs the tab_bar slice on Colors changes.
 */
export function derivedFromPalette(colors: KittyColorConfig): TabPalette {
  return {
    barBg:      shade(colors.background, 6),
    activeBg:   colors.color5 ?? colors.foreground,
    // Foreground (not background) keeps tabs readable in fade/separator styles
    // where the tab itself has no bg fill, so text sits directly on the bar bg.
    activeFg:   colors.foreground,
    inactiveBg: shade(colors.background, 10),
    inactiveFg: colors.foreground,
  };
}
