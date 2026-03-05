import { Injectable } from '@angular/core';

export interface ConfigPreset {
  id: string;
  name: string;
  description: string;
  category: 'theme' | 'performance' | 'minimal' | 'feature-rich' | 'gaming';
  author?: string;
  tags?: string[];
  config: Partial<Record<string, string | number | boolean | string[] | number[]>>;
}

function preset(
  id: string, name: string, description: string, category: ConfigPreset['category'],
  author: string | undefined, tags: string[] | undefined, config: ConfigPreset['config']
): ConfigPreset {
  return { id, name, description, category, author, tags, config };
}

const baseTheme = {
  font_size: 12, disable_ligatures: 'cursor', scrollback_lines: 10000,
  wheel_scroll_multiplier: 5, detect_urls: true, url_style: 'curly',
  copy_on_select: 'clipboard', strip_trailing_spaces: 'smart',
  enable_audio_bell: false, window_alert_on_bell: true,
  repaint_delay: 10, input_delay: 3, sync_to_monitor: true,
  remember_window_size: true, confirm_os_window_close: 1,
  window_border_width: '1pt', draw_minimal_borders: true,
  inactive_text_alpha: 0.7
};

const themeColors = (fg: string, bg: string, cursor: string, selBg: string, ...colors: string[]) => ({
  foreground: fg, background: bg, cursor, cursor_text_color: bg,
  selection_foreground: bg, selection_background: selBg,
  color0: colors[0], color1: colors[1], color2: colors[2], color3: colors[3],
  color4: colors[4], color5: colors[5], color6: colors[6], color7: colors[7],
  color8: colors[8], color9: colors[9], color10: colors[10], color11: colors[11],
  color12: colors[12], color13: colors[13], color14: colors[14], color15: colors[15]
});

const tabConfig = (style: string, edge: string, powerline?: string) => ({
  tab_bar_style: style, tab_bar_edge: edge, tab_bar_min_tabs: 2,
  ...(powerline && { tab_powerline_style: powerline })
});

const tabColors = (activeBg: string, activeFg: string = '#000000', inactiveBg: string = '#999999', inactiveFg: string = '#444444') => ({
  active_tab_background: activeBg,
  active_tab_foreground: activeFg,
  inactive_tab_background: inactiveBg,
  inactive_tab_foreground: inactiveFg
});

@Injectable({ providedIn: 'root' })
export class PresetsService {
  private readonly presets: ConfigPreset[] = [
    // === QUICK START THEME PRESETS ===
    // Official Confitty Theme
    preset('confitty', 'Confitty', 'Official Confitty theme with soft pinks and confetti accents', 'theme',
      'Confitty', ['official', 'pastel', 'cat'],
      { ...baseTheme, ...themeColors('#FFFFFF', '#564D50', '#FFB5C6', '#FFB5C6',
        '#564D50', '#FE8AEC', '#76D36E', '#FAF089', '#9DC3CA', '#C1A3C4', '#B2DAB3', '#FFFFFF',
        '#6B6164', '#FF9DED', '#8EE486', '#FBF59D', '#B0D4DA', '#D4B8D7', '#C2E4C3', '#F0F0F0'),
        font_family: 'JetBrains Mono', font_size: 12, modify_font: 'cell_height 120%',
        scrollback_lines: 15000, touch_scroll_multiplier: 1.5,
        url_color: '#9DC3CA', active_border_color: '#FFB5C6',
        ...tabConfig('powerline', 'top', 'slanted'),
        ...tabColors('#FFB5C6', '#564D50', '#6B6164', '#FFFFFF'),
        tab_bar_background: '#564D50'
      }),

    // Catppuccin Mocha - Most popular dark theme
    preset('catppuccin-mocha', 'Catppuccin Mocha', 'Soothing pastel dark theme — warm and cozy', 'theme',
      'Catppuccin', ['dark', 'pastel', 'modern', 'popular'],
      { ...baseTheme, ...themeColors('#cdd6f4', '#1e1e2e', '#1e1e2e', '#585b70',
        '#45475a', '#f38ba8', '#a6e3a1', '#f9e2af', '#89b4fa', '#f5c2e7', '#94e2d5', '#bac2de',
        '#585b70', '#f38ba8', '#a6e3a1', '#f9e2af', '#89b4fa', '#f5c2e7', '#94e2d5', '#a6adc8'),
        cursor_shape: 'beam', cursor_blink_interval: 0.5, cursor_beam_thickness: 1.5,
        font_family: 'JetBrains Mono', font_size: 12,
        url_color: '#89b4fa', active_border_color: '#f5c2e7',
        ...tabConfig('fade', 'top'),
        ...tabColors('#f5c2e7', '#1e1e2e', '#313244', '#a6adc8')
      }),

    // Catppuccin Latte - Light variant
    preset('catppuccin-latte', 'Catppuccin Latte', 'Soothing pastel light theme — clean and bright', 'theme',
      'Catppuccin', ['light', 'pastel', 'modern'],
      { ...baseTheme, ...themeColors('#4c4f69', '#eff1f5', '#eff1f5', '#acb0be',
        '#5c5f77', '#d20f39', '#40a02b', '#df8e1d', '#1e66f5', '#ea76cb', '#179299', '#acb0be',
        '#6c6f85', '#d20f39', '#40a02b', '#df8e1d', '#1e66f5', '#ea76cb', '#179299', '#bcc0cc'),
        cursor_shape: 'beam', cursor_blink_interval: 0.5,
        font_family: 'JetBrains Mono', font_size: 12,
        url_color: '#1e66f5', active_border_color: '#ea76cb',
        ...tabConfig('fade', 'top'),
        ...tabColors('#ea76cb', '#ffffff', '#ccd0da', '#4c4f69')
      }),

    // Tokyo Night - Popular dark blue theme
    preset('tokyo-night', 'Tokyo Night', 'Dark theme inspired by the Tokyo night sky', 'theme',
      'Tokyo Night', ['dark', 'blue', 'modern', 'popular'],
      { ...baseTheme, ...themeColors('#c0caf5', '#1a1b26', '#1a1b26', '#283457',
        '#15161e', '#f7768e', '#9ece6a', '#e0af68', '#7aa2f7', '#bb9af7', '#7dcfff', '#a9b1d6',
        '#414868', '#f7768e', '#9ece6a', '#e0af68', '#7aa2f7', '#bb9af7', '#7dcfff', '#c0caf5'),
        cursor_shape: 'beam', cursor_blink_interval: 0.5,
        font_family: 'JetBrains Mono', font_size: 12,
        url_color: '#7aa2f7', active_border_color: '#bb9af7',
        ...tabConfig('powerline', 'top', 'slanted'),
        ...tabColors('#bb9af7', '#1a1b26', '#24283b', '#565f89')
      }),

    // Dracula - Classic popular theme
    preset('dracula', 'Dracula', 'Popular dark theme with vibrant purple/pink accents', 'theme',
      'Dracula Theme', ['dark', 'vibrant', 'popular', 'classic'],
      { ...baseTheme, ...themeColors('#f8f8f2', '#282a36', '#ffffff', '#44475a',
        '#21222c', '#ff5555', '#50fa7b', '#f1fa8c', '#bd93f9', '#ff79c6', '#8be9fd', '#f8f8f2',
        '#6272a4', '#ff6e6e', '#69ff94', '#ffffa5', '#d6acff', '#ff92df', '#a4ffff', '#ffffff'),
        cursor_shape: 'block', cursor_blink_interval: 0,
        font_family: 'FiraCode Nerd Font', font_size: 12,
        url_color: '#8be9fd', active_border_color: '#bd93f9',
        ...tabConfig('powerline', 'top', 'slanted'),
        ...tabColors('#bd93f9', '#282a36', '#44475a', '#f8f8f2')
      }),

    // Gruvbox Dark - Retro theme
    preset('gruvbox-dark', 'Gruvbox Dark', 'Retro groove with warm earthy tones', 'theme',
      'Gruvbox', ['dark', 'warm', 'retro', 'popular'],
      { ...baseTheme, font_size: 11, ...themeColors('#ebdbb2', '#282828', '#ebdbb2', '#ebdbb2',
        '#282828', '#cc241d', '#98971a', '#d79921', '#458588', '#b16286', '#689d6a', '#a89984',
        '#928374', '#fb4934', '#b8bb26', '#fabd2f', '#83a598', '#d3869b', '#8ec07c', '#ebdbb2'),
        cursor_shape: 'block', cursor_blink_interval: 0,
        font_family: 'Source Code Pro',
        url_color: '#83a598', active_border_color: '#fabd2f',
        ...tabConfig('separator', 'bottom'), tab_separator: ' ┇',
        inactive_text_alpha: 0.75,
        ...tabColors('#fabd2f', '#282828', '#3c3836', '#a89984')
      }),

    // Nord - Elegant blue theme
    preset('nord', 'Nord', 'Arctic, north-bluish color palette', 'theme',
      'Nord Theme', ['dark', 'blue', 'elegant'],
      { ...baseTheme, font_size: 11, ...themeColors('#d8dee9', '#2e3440', '#d8dee9', '#88c0d0',
        '#3b4252', '#bf616a', '#a3be8c', '#ebcb8b', '#81a1c1', '#b48ead', '#88c0d0', '#e5e9f0',
        '#4c566a', '#bf616a', '#a3be8c', '#ebcb8b', '#81a1c1', '#b48ead', '#8fbcbb', '#eceff4'),
        cursor_shape: 'beam', cursor_beam_thickness: 1.5,
        font_family: 'JetBrains Mono',
        url_color: '#88c0d0', active_border_color: '#88c0d0',
        ...tabConfig('fade', 'bottom'),
        ...tabColors('#88c0d0', '#2e3440', '#4c566a', '#d8dee9')
      }),

    // Rose Pine - Soft aesthetic theme
    preset('rose-pine', 'Rose Pine', 'All natural pine with soho vibes', 'theme',
      'Rose Pine', ['dark', 'soft', 'aesthetic'],
      { ...baseTheme, ...themeColors('#e0def4', '#191724', '#191724', '#524f67',
        '#26233a', '#eb6f92', '#31748f', '#f6c177', '#9ccfd8', '#c4a7e7', '#ebbcba', '#e0def4',
        '#6e6a86', '#eb6f92', '#31748f', '#f6c177', '#9ccfd8', '#c4a7e7', '#ebbcba', '#e0def4'),
        cursor_shape: 'beam', cursor_blink_interval: 0.5,
        font_family: 'JetBrains Mono', font_size: 12,
        url_color: '#9ccfd8', active_border_color: '#c4a7e7',
        ...tabConfig('fade', 'top'),
        ...tabColors('#c4a7e7', '#191724', '#26233a', '#e0def4')
      }),

    // One Dark - Atom editor theme
    preset('one-dark', 'One Dark', 'Atom One Dark theme', 'theme',
      'Atom', ['dark', 'ide', 'popular'],
      { ...baseTheme, ...themeColors('#abb2bf', '#282c34', '#abb2bf', '#3e4451',
        '#282c34', '#e06c75', '#98c379', '#e5c07b', '#61afef', '#c678dd', '#56b6c2', '#abb2bf',
        '#5c6370', '#e06c75', '#98c379', '#e5c07b', '#61afef', '#c678dd', '#56b6c2', '#ffffff'),
        cursor_shape: 'block', cursor_blink_interval: 0,
        font_family: 'Fira Code', font_size: 12,
        url_color: '#61afef', active_border_color: '#61afef',
        ...tabConfig('powerline', 'top', 'slanted'),
        ...tabColors('#61afef', '#282c34', '#3e4451', '#abb2bf')
      }),

    // Kanagawa - Japanese art inspired
    preset('kanagawa', 'Kanagawa', 'Dark theme inspired by Hokusai paintings', 'theme',
      'Kanagawa', ['dark', 'artistic', 'japanese'],
      { ...baseTheme, ...themeColors('#dcd7ba', '#1f1f28', '#1f1f28', '#2d4f67',
        '#16161d', '#c34043', '#76946a', '#c0a36e', '#7e9cd8', '#957fb8', '#6a9589', '#c8c093',
        '#717c7c', '#e82424', '#98bb6c', '#e6c384', '#7fb4ca', '#938aa9', '#7aa89f', '#dcd7ba'),
        cursor_shape: 'beam', cursor_blink_interval: 0.5,
        font_family: 'JetBrains Mono', font_size: 12,
        url_color: '#7e9cd8', active_border_color: '#957fb8',
        ...tabConfig('fade', 'top'),
        ...tabColors('#957fb8', '#1f1f28', '#2a2a37', '#dcd7ba')
      }),

    // === FUNCTIONAL PRESETS ===
    preset('performance-optimized', 'Performance Optimized', 'Maximum speed for resource-constrained systems', 'performance',
      undefined, ['fast', 'efficient', 'minimal'],
      { repaint_delay: 5, input_delay: 1, sync_to_monitor: true,
        scrollback_lines: 5000, scrollback_pager_history_size: 0,
        wheel_scroll_multiplier: 3, touch_scroll_multiplier: 1,
        cursor_shape: 'block', cursor_blink_interval: 0,
        font_size: 10, font_family: 'monospace', disable_ligatures: 'always',
        background_opacity: 1, background_blur: 0,
        tab_bar_style: 'fade', tab_bar_min_tabs: 2, window_padding_width: 2, window_border_width: '0pt',
        enable_audio_bell: false, confirm_os_window_close: 0,
        ...tabColors('#eeeeee', '#000000', '#999999', '#444444')
      }),

    preset('minimal-clean', 'Minimal & Clean', 'Distraction-free setup for focused work', 'minimal',
      undefined, ['minimal', 'focused', 'clean'],
      { hide_window_decorations: true, tab_bar_style: 'hidden',
        window_padding_width: 16, window_margin_width: 0, window_border_width: '0pt',
        background_opacity: 1, font_size: 12, font_family: 'JetBrains Mono', disable_ligatures: 'cursor',
        cursor_shape: 'beam', cursor_blink_interval: 0, cursor_beam_thickness: 1.5,
        scrollback_lines: 10000, enable_audio_bell: false,
        remember_window_size: true, confirm_os_window_close: -1,
        inactive_text_alpha: 1
      }),

    preset('developer-default', 'Developer Default', 'Balanced configuration for development workflows', 'feature-rich',
      undefined, ['developer', 'balanced', 'productivity'],
      { font_family: 'JetBrains Mono', font_size: 12, disable_ligatures: 'cursor',
        cursor_shape: 'beam', cursor_blink_interval: 0.5, cursor_beam_thickness: 1.5,
        scrollback_lines: 10000, mouse_hide_wait: 3,
        detect_urls: true, url_style: 'curly', copy_on_select: 'clipboard', strip_trailing_spaces: 'smart',
        enable_audio_bell: false, window_padding_width: 8, window_border_width: '1pt',
        tab_bar_style: 'fade', tab_bar_edge: 'bottom',
        background_opacity: 0.98, confirm_os_window_close: 1,
        allow_remote_control: 'socket-only', shell_integration: 'enabled',
        repaint_delay: 10, input_delay: 3, sync_to_monitor: true,
        ...tabColors('#eeeeee', '#000000', '#999999', '#444444')
      }),

    preset('gaming-responsive', 'Gaming & Responsive', 'Ultra-low latency for gaming and real-time apps', 'gaming',
      undefined, ['gaming', 'fast', 'low-latency'],
      { repaint_delay: 3, input_delay: 0, sync_to_monitor: true,
        scrollback_lines: 3000, cursor_shape: 'block', cursor_blink_interval: 0,
        font_size: 11, font_family: 'JetBrains Mono', disable_ligatures: 'always',
        foreground: '#e0e0e0', background: '#0a0a0a', cursor: '#00ff00',
        background_opacity: 1, background_blur: 0,
        mouse_hide_wait: 1, detect_urls: true, focus_follows_mouse: false,
        enable_audio_bell: false, tab_bar_style: 'hidden', window_padding_width: 2,
        window_border_width: '0pt', confirm_os_window_close: 0
      }),

    preset('streaming', 'Streaming/Recording', 'Optimized for screen recording and streaming', 'feature-rich',
      undefined, ['streaming', 'recording', 'content-creation'],
      { font_family: 'JetBrains Mono', font_size: 14, disable_ligatures: 'always',
        cursor_shape: 'block', cursor_blink_interval: 0,
        scrollback_lines: 5000,
        detect_urls: false,
        enable_audio_bell: false, visual_bell_duration: 0,
        window_padding_width: 24, window_margin_width: 0,
        tab_bar_style: 'hidden',
        background_opacity: 1, confirm_os_window_close: -1,
        repaint_delay: 10, sync_to_monitor: true
      }),

    preset('accessibility', 'Accessibility Focused', 'Enhanced accessibility settings with high visibility', 'feature-rich',
      undefined, ['accessibility', 'a11y', 'readable'],
      { font_family: 'JetBrains Mono', font_size: 14, disable_ligatures: 'always',
        cursor_shape: 'block', cursor_blink_interval: 0.8, cursor_beam_thickness: 2.5,
        scrollback_lines: 5000,
        detect_urls: true, url_style: 'curly', underline_hyperlinks: 'always',
        enable_audio_bell: true, visual_bell_duration: 0.2,
        window_padding_width: 12,
        tab_bar_style: 'fade', tab_bar_min_tabs: 1,
        background_opacity: 1, confirm_os_window_close: 1,
        mark1_foreground: '#000000', mark1_background: '#ffff00',
        mark2_foreground: '#000000', mark2_background: '#00ffff',
        mark3_foreground: '#ffffff', mark3_background: '#ff0000',
        ...tabColors('#ffff00', '#000000', '#666666', '#ffffff')
      }),

    // Additional utility presets
    preset('presentation', 'Presentation Mode', 'Large fonts for demos and screen sharing', 'feature-rich',
      undefined, ['presentation', 'demo', 'large-font'],
      { font_family: 'JetBrains Mono', font_size: 16, disable_ligatures: 'always',
        cursor_shape: 'block', cursor_blink_interval: 0,
        scrollback_lines: 5000,
        detect_urls: true,
        enable_audio_bell: false,
        window_padding_width: 20, window_margin_width: 0,
        tab_bar_style: 'fade', tab_bar_min_tabs: 1,
        background_opacity: 1,
        ...tabColors('#eeeeee', '#000000', '#999999', '#444444')
      }),

    preset('remote-server', 'Remote Server', 'Optimized for SSH and remote connections', 'performance',
      undefined, ['remote', 'ssh', 'server'],
      { repaint_delay: 10, input_delay: 3, sync_to_monitor: true,
        scrollback_lines: 50000, scrollback_pager_history_size: 0,
        cursor_shape: 'beam', cursor_blink_interval: 0.5,
        font_size: 11, font_family: 'monospace', disable_ligatures: 'always',
        detect_urls: true, copy_on_select: 'clipboard',
        enable_audio_bell: false, window_padding_width: 4,
        tab_bar_style: 'fade', tab_bar_min_tabs: 2,
        background_opacity: 1, confirm_os_window_close: 0,
        shell_integration: 'enabled'
      })
  ];

  getPresets(): ConfigPreset[] { return this.presets; }
  getPresetsByCategory(category: ConfigPreset['category']): ConfigPreset[] {
    return this.presets.filter(p => p.category === category);
  }
  getPresetById(id: string): ConfigPreset | undefined {
    return this.presets.find(p => p.id === id);
  }
  getCategories(): Array<{id: ConfigPreset['category'], label: string, description: string}> {
    return [
      { id: 'theme', label: 'Color Themes', description: 'Beautiful color schemes' },
      { id: 'minimal', label: 'Minimal', description: 'Clean & distraction-free' },
      { id: 'performance', label: 'Performance', description: 'Speed optimized' },
      { id: 'gaming', label: 'Gaming', description: 'Low-latency & responsive' },
      { id: 'feature-rich', label: 'Power User', description: 'Feature complete' }
    ];
  }
}
