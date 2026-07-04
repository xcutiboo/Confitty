import type { KittyColorConfig, KittyTabBarConfig } from '../../models/kitty-types';
import { DEFAULT_KITTY_CONFIG } from '../../models/kitty-defaults';
import { mix } from './color-utils';

export interface TabPalette {
  barBg: string;
  activeBg: string;
  activeFg: string;
  inactiveBg: string;
  inactiveFg: string;
}

const TAB_DEFAULTS = DEFAULT_KITTY_CONFIG.tab_bar;

/**
 * When the user has not customised the tab bar slice, we derive colors
 * from the active palette so a theme swap is visible immediately.
 *
 * The mapping is more aggressive than Kitty's defaults: Kitty ships with
 * a static gray inactive tab that ignores theme color, which reads as
 * dead weight in a live preview. We mix 18% toward the foreground so the
 * inactive tab has a real outline against the bar background.
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

export function derivedFromPalette(colors: KittyColorConfig): TabPalette {
  return {
    barBg:      colors.background,
    activeBg:   colors.color5 ?? colors.foreground,
    activeFg:   colors.foreground,
    inactiveBg: mix(colors.background, colors.foreground, 0.22),
    inactiveFg: mix(colors.background, colors.foreground, 0.65),
  };
}
