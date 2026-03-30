import { Injectable, signal } from '@angular/core';

export interface KittyVersion {
  version: string;
  label: string;
  description?: string;
}

export interface FeatureRequirement {
  minVersion: string;
  description: string;
  warning?: string;
}

@Injectable({
  providedIn: 'root'
})
export class KittyVersionService {
  readonly versions: KittyVersion[] = [
    { version: '0.15.0', label: '0.15.0', description: 'Ubuntu 20.04 LTS' },
    { version: '0.19.3', label: '0.19.3', description: 'Debian 11 (bullseye)' },
    { version: '0.21.2', label: '0.21.2', description: 'Ubuntu 22.04 LTS' },
    { version: '0.23.1', label: '0.23.1', description: 'Debian 12' },
    { version: '0.24.0', label: '0.24.0', description: 'Sessions support' },
    { version: '0.25.0', label: '0.25.0', description: 'Dynamic includes' },
    { version: '0.26.5', label: '0.26.5', description: 'Debian 12 (bookworm)' },
    { version: '0.32.2', label: '0.32.2', description: 'Ubuntu 23.10' },
    { version: '0.34.0', label: '0.34.0', description: 'Wayland panel kitten' },
    { version: '0.36.0', label: '0.36.0', description: 'notify kitten' },
    { version: '0.41.1', label: '0.41.1', description: 'Ubuntu 24.04 LTS' },
    { version: '0.42.1', label: '0.42.1', description: 'Alpine Linux 3.22' },
    { version: '0.43.0', label: '0.43.0', description: 'scrollbar' },
    { version: '0.44.0', label: '0.44.0', description: 'Alpine Linux 3.23' },
    { version: '0.45.0', label: '0.45.0', description: 'Latest Linux stable' },
    { version: '0.46.1', label: '0.46.1', description: 'Debian testing' },
    { version: '0.46.2', label: '0.46.2', description: 'Latest macOS' },
  ];

  readonly currentVersion = signal<string>('0.45.0');

  readonly featureRequirements: Record<string, FeatureRequirement> = {
    scrollback_pager: {
      minVersion: '0.13.0',
      description: 'External pager for scrollback',
      warning: 'Requires less or similar pager installed'
    },
    scrollbar: {
      minVersion: '0.43.0',
      description: 'Native scrollbar for scrollback buffer',
      warning: 'Replaces deprecated scrollback_indicator_opacity'
    },
    placement_strategy: {
      minVersion: '0.14.2',
      description: 'Window placement strategy for tiling WMs',
      warning: 'Required for Hyprland/Sway compatibility'
    },
    cursor_trail: {
      minVersion: '0.37.0',
      description: 'Cursor trail visual effects',
      warning: 'Adds smooth cursor animation'
    },
    cursor_trail_color: {
      minVersion: '0.43.0',
      description: 'Custom cursor trail color',
      warning: 'Requires cursor trail to be enabled'
    },
    cursor_stop_blinking_after: {
      minVersion: '0.43.0',
      description: 'Stop cursor blinking after inactivity',
      warning: 'Cursor blink timeout'
    },
    startup_session: {
      minVersion: '0.24.0',
      description: 'Session management on startup',
      warning: 'Allows restoring terminal sessions'
    },
    envinclude: {
      minVersion: '0.25.0',
      description: 'Dynamic config from environment',
      warning: 'Advanced dynamic configuration'
    },
    geninclude: {
      minVersion: '0.39.0',
      description: 'Dynamic config from scripts',
      warning: 'Advanced dynamic configuration'
    },
    tab_bar_style_powerline: {
      minVersion: '0.15.0',
      description: 'Powerline tab bar style with custom arrows',
      warning: 'Requires Nerd Font or symbol_map for arrows'
    },
    tab_bar_drag_threshold: {
      minVersion: '0.46.0',
      description: 'Drag tabs to reorder',
      warning: 'Mouse drag support'
    },
    transparent_background_colors: {
      minVersion: '0.36.3',
      description: 'Per-color transparency control',
      warning: 'Replaces deprecated second_transparent_bg'
    },
    underline_exclusion: {
      minVersion: '0.40.0',
      description: 'Gap padding around descenders for underlines',
      warning: 'Improved underline rendering'
    },
    clear_selection_on_clipboard_loss: {
      minVersion: '0.40.1',
      description: 'Clear selection when clipboard changes',
      warning: 'Linux primary selection behavior'
    },
    draw_window_borders_for_single_window: {
      minVersion: '0.44.0',
      description: 'Draw borders around single-pane windows',
      warning: 'Single window border support'
    },
    text_composition_strategy: {
      minVersion: '0.22.0',
      description: 'Font rendering override',
      warning: 'Platform vs legacy rendering'
    },
    text_fg_override_threshold: {
      minVersion: '0.41.0',
      description: 'Perceptual color space for contrast',
      warning: 'Automatic contrast enhancement'
    },
    window_drag_tolerance: {
      minVersion: '0.46.0',
      description: 'Resize splits with mouse',
      warning: 'Window resizing'
    },
    pixel_scroll: {
      minVersion: '0.46.0',
      description: 'Smooth pixel scrolling',
      warning: 'Requires high precision mouse'
    },
    momentum_scroll: {
      minVersion: '0.46.0',
      description: 'Inertial scrolling',
      warning: 'Touchpad-style momentum'
    },
    macos_dock_badge_on_bell: {
      minVersion: '0.46.0',
      description: 'Show bell count in Dock badge',
      warning: 'macOS dock notification'
    },
    hide_window_decorations_wayland: {
      minVersion: '0.46.0',
      description: 'titlebar-only option for Wayland',
      warning: 'Requires Kitty 0.46.0+ on Wayland'
    },
    font_features: {
      minVersion: '0.16.0',
      description: 'OpenType font features',
      warning: 'Ligatures, stylistic sets'
    },
    modify_font: {
      minVersion: '0.26.0',
      description: 'Fine-tune font rendering',
      warning: 'Underline position/thickness'
    },
    symbol_map: {
      minVersion: '0.19.0',
      description: 'Nerd Fonts icon fallback',
      warning: 'Powerline symbols'
    },
    narrow_symbols: {
      minVersion: '0.19.0',
      description: 'Narrow symbol rendering',
      warning: 'Emoji width control'
    },
    notify: {
      minVersion: '0.19.0',
      description: 'Desktop notifications over SSH',
      warning: 'Remote notifications'
    },
    remember_window_position: {
      minVersion: '0.42.1',
      description: 'Remember window position on startup',
      warning: 'Not available on Wayland'
    },
    dynamic_background_opacity: {
      minVersion: '0.10.1',
      description: 'Adjust opacity based on focus',
      warning: 'Focus-aware transparency'
    },
    cursor_shape_unfocused: {
      minVersion: '0.35.2',
      description: 'Cursor shape when window is not focused',
      warning: 'Unfocused window cursor appearance'
    },
    filter_notification: {
      minVersion: '0.36.0',
      description: 'Filter desktop notifications',
      warning: 'Notification control'
    },
    window_logo_scale: {
      minVersion: '0.35.2',
      description: 'Scale window logo',
      warning: 'Logo size control'
    },
    watcher: {
      minVersion: '0.24.0',
      description: 'Python event watcher scripts',
      warning: 'Event-driven window hooks'
    },
    exe_search_path: {
      minVersion: '0.24.0',
      description: 'Custom executable search paths',
      warning: 'Modify PATH with +/- prefixes'
    },
    menu_map: {
      minVersion: '0.31.0',
      description: 'macOS menubar customization',
      warning: 'macOS only'
    },
    env_read_from_shell: {
      minVersion: '0.44.0',
      description: 'Read environment from login shell',
      warning: 'Dynamic env with read_from_shell=PATTERN'
    },
    clone_source_strategies: {
      minVersion: '0.25.0',
      description: 'Shell cloning strategies',
      warning: 'venv, conda, env_var, path'
    },
    file_transfer_confirmation_bypass: {
      minVersion: '0.25.0',
      description: 'Skip file transfer confirmation',
      warning: 'Security risk - trusted connections only'
    },
    linux_bell_theme: {
      minVersion: '0.28.0',
      description: 'XDG sound theme for Linux bell',
      warning: 'Requires compatible XDG theme'
    },
    map_timeout: {
      minVersion: '0.32.0',
      description: 'Timeout for multi-key sequences and modal mappings',
      warning: 'Seconds as float (0 = no timeout)'
    },
    clear_all_shortcuts: {
      minVersion: '0.13.0',
      description: 'Directive to clear all keyboard shortcuts',
      warning: 'Place at top of keybindings section'
    },
    clear_all_mouse_actions: {
      minVersion: '0.23.0',
      description: 'Directive to clear all mouse mappings',
      warning: 'Place at top of mouse section'
    },
    kitty_mod: {
      minVersion: '0.13.0',
      description: 'Global modifier key for default shortcuts',
      warning: 'Default: ctrl+shift. Changes all default shortcuts.'
    },
    action_alias: {
      minVersion: '0.25.0',
      description: 'Define aliases for remote control actions',
      warning: 'Used with kitten remote control'
    }
  };

  // Deprecated options → their modern replacements
  readonly deprecatedOptions: Record<string, { replacement: string; since: string; autoConvert?: boolean }> = {
    scrollback_indicator_opacity: {
      replacement: 'scrollbar',
      since: '0.43.0',
      autoConvert: false
    },
    second_transparent_bg: {
      replacement: 'transparent_background_colors',
      since: '0.36.3',
      autoConvert: false
    },
    macos_thicken_font: {
      replacement: 'text_composition_strategy',
      since: '0.22.0',
      autoConvert: false
    },
    adjust_baseline: {
      replacement: 'modify_font baseline',
      since: '0.26.0',
      autoConvert: true
    },
    adjust_line_height: {
      replacement: 'modify_font cell_height',
      since: '0.26.0',
      autoConvert: true
    },
    adjust_column_width: {
      replacement: 'modify_font cell_width',
      since: '0.26.0',
      autoConvert: true
    },
    terminal_select_modifiers: {
      replacement: 'mouse_map',
      since: '0.21.0',
      autoConvert: false
    },
    rectangle_select_modifiers: {
      replacement: 'mouse_map',
      since: '0.21.0',
      autoConvert: false
    },
    open_url_modifiers: {
      replacement: 'mouse_map',
      since: '0.21.0',
      autoConvert: false
    },
    kitten_alias: {
      replacement: 'action_alias',
      since: '0.25.0',
      autoConvert: false
    }
  };

  // Backward incompatible changes by version
  readonly breakingChanges: Record<string, string[]> = {
    '0.21.0': ['terminal_select_modifiers, rectangle_select_modifiers, open_url_modifiers removed - use mouse_map'],
    '0.22.0': ['background_opacity no longer affects background_image'],
    '0.26.0': ['adjust_baseline, adjust_line_height, adjust_column_width deprecated - use modify_font'],
    '0.36.3': ['second_transparent_bg removed - use transparent_background_colors'],
    '0.43.0': ['scrollback_indicator_opacity replaced by scrollbar']
  };

  getDeprecatedWarning(option: string): string | null {
    const dep = this.deprecatedOptions[option];
    if (!dep) return null;
    return `${option} is deprecated since v${dep.since}. Use ${dep.replacement} instead.`;
  }

  shouldAutoConvert(option: string): boolean {
    return this.deprecatedOptions[option]?.autoConvert ?? false;
  }

  getBreakingChangesForVersion(version: string): string[] {
    const changes: string[] = [];
    for (const [changeVersion, changeList] of Object.entries(this.breakingChanges)) {
      if (this.compareVersions(version, changeVersion) < 0) {
        changes.push(...changeList);
      }
    }
    return changes;
  }

  isFeatureAvailable(feature: string): boolean {
    const requirement = this.featureRequirements[feature];
    if (!requirement) return true;
    return this.compareVersions(this.currentVersion(), requirement.minVersion) >= 0;
  }

  isOptionAvailable(option: string): boolean {
    return this.isFeatureAvailable(option);
  }

  getFeatureWarning(feature: string): string | null {
    if (this.isFeatureAvailable(feature)) return null;
    const req = this.featureRequirements[feature];
    if (!req) return null;
    return `${req.description} requires Kitty ${req.minVersion}+ (you have ${this.currentVersion()})`;
  }

  getVersionRequirement(feature: string): { minVersion: string; description: string; warning?: string } | null {
    return this.featureRequirements[feature] ?? null;
  }

  setVersion(version: string): void {
    this.currentVersion.set(version);
  }

  parseVersion(output: string): string | null {
    const match = /kitty\s+(\d+\.\d+\.?\d*)/i.exec(output);
    return match?.[1] ?? null;
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 !== p2) return p1 - p2;
    }
    return 0;
  }
}
