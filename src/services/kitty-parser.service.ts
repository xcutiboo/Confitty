import { Injectable } from '@angular/core';
import {
  KittyConfigAST,
  KittyLigatureControl,
  KittyCursorShape,
  KittyCursorShapeUnfocused,
  KittyCopyOnSelect,
  KittyTabBarEdge,
  KittyTabBarStyle,
  KittyTabBarAlign,
  KittyTabSwitchStrategy,
  KittyTabPowerlineStyle,
  KittyRemoteControl,
  KittyLayout,
  KittyUndercurlStyle,
  KittyTextCompositionStrategy,
  KittyMacosOptionAsAlt,
  KittyUrlStyle,
  KittyUnderlineHyperlinks,
  KittyStripTrailingSpaces,
  KittyBackgroundImageLayout,
  KittyPlacementStrategy,
  KittyMacosColorspace,
  KittyLinuxDisplayServer,
} from '../models/kitty-types';
import { DEFAULT_KITTY_CONFIG } from '../models/kitty-defaults';

@Injectable({
  providedIn: 'root'
})
export class KittyParserService {

  parseConfig(configText: string): KittyConfigAST {
    const config: KittyConfigAST = structuredClone(DEFAULT_KITTY_CONFIG);
    const lines = this.normalizeLines(configText);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      if (this.isIncludeDirective(trimmed)) {
        config.unrecognized_directives.push(trimmed);
        continue;
      }

      const [key, ...valueParts] = trimmed.split(/\s+/);
      const value = valueParts.join(' ');

      if (!key || !value) continue;

      this.parseKeyValue(config, key, value);
    }

    return config;
  }

  private normalizeLines(text: string): string[] {
    const rawLines = text.replaceAll('\r\n', '\n').split('\n');
    const normalized: string[] = [];
    let buffer = '';

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (!line) continue;

      if (line.endsWith('\\') && i < rawLines.length - 1) {
        buffer += line.slice(0, -1);
      } else {
        normalized.push(buffer + line);
        buffer = '';
      }
    }

    if (buffer) {
      normalized.push(buffer);
    }

    return normalized;
  }

  private isIncludeDirective(line: string): boolean {
    return line.startsWith('include ') ||
           line.startsWith('globinclude ') ||
           line.startsWith('envinclude ') ||
           line.startsWith('geninclude ');
  }

  private parseKeyValue(config: KittyConfigAST, key: string, value: string): void {
    if (this.handleSpecialKeys(config, key, value)) {
      return;
    }
    
    this.routeToConfigSection(config, key, value);
  }

  private handleSpecialKeys(config: KittyConfigAST, key: string, value: string): boolean {
    if (key === 'map') {
      this.parseKeyboardShortcut(config, value);
      return true;
    }

    if (key === 'mouse_map') {
      this.parseMouseMapping(config, value);
      return true;
    }

    if (key === 'env') {
      this.parseEnvironmentVariable(config, value);
      return true;
    }

    if (key === 'clear_all_shortcuts') {
      config.unrecognized_directives.push(`clear_all_shortcuts ${value}`);
      return true;
    }

    if (key === 'clear_all_mouse_actions') {
      config.unrecognized_directives.push(`clear_all_mouse_actions ${value}`);
      return true;
    }

    return false;
  }

  private parseKeyboardShortcut(config: KittyConfigAST, value: string): void {
    const parts = value.split(/\s+/);
    if (parts.length >= 2 && parts[0]) {
      config.keyboard_shortcuts.push({
        chord: parts[0],
        action: parts.slice(1).join(' ')
      });
    }
  }

  private parseMouseMapping(config: KittyConfigAST, value: string): void {
    const parts = value.split(/\s+/);
    if (parts.length >= 4 && parts[0] && parts[1] && parts[2]) {
      config.mouse_mappings.push({
        button: parts[0],
        event: parts[1],
        modes: parts[2],
        action: parts.slice(3).join(' ')
      });
    }
  }

  private parseEnvironmentVariable(config: KittyConfigAST, value: string): void {
    // Handle special env read_from_shell directive
    if (value === 'read_from_shell') {
      config.advanced.env_read_from_shell = true;
      return;
    }
    const eqIdx = value.indexOf('=');
    if (eqIdx > 0) {
      const envKey = value.slice(0, eqIdx).trim();
      const envVal = value.slice(eqIdx + 1);
      config.advanced.env[envKey] = envVal;
    }
  }

  private routeToConfigSection(config: KittyConfigAST, key: string, value: string): void {
    if (this.isFontKey(key)) {
      this.parseFontConfig(config, key, value);
    } else if (this.isCursorKey(key)) {
      this.parseCursorConfig(config, key, value);
    } else if (this.isScrollbackKey(key)) {
      this.parseScrollbackConfig(config, key, value);
    } else if (this.isMouseKey(key)) {
      this.parseMouseConfig(config, key, value);
    } else if (this.isPerformanceKey(key)) {
      this.parsePerformanceConfig(config, key, value);
    } else if (this.isBellKey(key)) {
      this.parseBellConfig(config, key, value);
    } else if (this.isWindowLayoutKey(key)) {
      this.parseWindowLayoutConfig(config, key, value);
    } else if (this.isTabBarKey(key)) {
      this.parseTabBarConfig(config, key, value);
    } else if (this.isColorKey(key)) {
      this.parseColorConfig(config, key, value);
    } else if (this.isOSSpecificKey(key)) {
      this.parseOSSpecificConfig(config, key, value);
    } else {
      this.parseAdvancedConfig(config, key, value);
    }
  }

  private isFontKey(key: string): boolean {
    return key.startsWith('font_') || ['symbol_map', 'narrow_symbols', 'disable_ligatures', 
      'force_ltr', 'box_drawing_scale', 'undercurl_style', 'underline_exclusion',
      'text_composition_strategy', 'text_fg_override_threshold', 'modify_font',
      'bold_font', 'italic_font', 'bold_italic_font'].includes(key);
  }

  private isCursorKey(key: string): boolean {
    return key.startsWith('cursor_') || key === 'cursor';
  }

  private isScrollbackKey(key: string): boolean {
    return key.startsWith('scrollback_') || ['wheel_scroll_multiplier', 
      'wheel_scroll_min_lines', 'touch_scroll_multiplier', 'scrollbar', 'pixel_scroll', 'momentum_scroll'].includes(key);
  }

  private isMouseKey(key: string): boolean {
    return ['mouse_hide_wait', 'url_color', 'url_style', 'url_prefixes', 'open_url_with',
      'detect_urls', 'show_hyperlink_targets', 'underline_hyperlinks', 'copy_on_select',
      'paste_actions', 'strip_trailing_spaces', 'select_by_word_characters',
      'select_by_word_characters_forward', 'click_interval', 'focus_follows_mouse',
      'default_pointer_shape', 'url_excluded_characters', 'clear_selection_on_clipboard_loss'].includes(key) || key.startsWith('pointer_shape');
  }

  private isPerformanceKey(key: string): boolean {
    return ['repaint_delay', 'input_delay', 'sync_to_monitor'].includes(key);
  }

  private isBellKey(key: string): boolean {
    return ['enable_audio_bell', 'visual_bell_duration', 'visual_bell_color',
      'window_alert_on_bell', 'bell_on_tab', 'command_on_bell', 'bell_path',
      'linux_bell_theme'].includes(key);
  }

  private isWindowLayoutKey(key: string): boolean {
    return ['remember_window_size', 'remember_window_position', 'initial_window_width', 'initial_window_height',
      'enabled_layouts', 'placement_strategy', 'hide_window_decorations',
      'window_border_width', 'window_margin_width', 'single_window_margin_width',
      'window_padding_width', 'single_window_padding_width', 'draw_minimal_borders', 'draw_window_borders_for_single_window',
      'active_border_color', 'inactive_border_color', 'bell_border_color', 'inactive_text_alpha',
      'window_resize_step_cells', 'window_resize_step_lines', 'confirm_os_window_close',
      'window_logo_path', 'window_logo_position', 'window_logo_alpha',
      'resize_debounce_time', 'resize_in_steps', 'visual_window_select_characters', 'startup_window'].includes(key);
  }

  private isTabBarKey(key: string): boolean {
    return key.startsWith('tab_') || ['active_tab_foreground', 'active_tab_background',
      'active_tab_font_style', 'inactive_tab_foreground', 'inactive_tab_background',
      'inactive_tab_font_style'].includes(key);
  }

  private isColorKey(key: string): boolean {
    return key.startsWith('color') || key.startsWith('mark') || 
      ['foreground', 'background', 'background_opacity', 'background_blur',
       'background_image', 'background_image_layout', 'background_image_linear',
       'background_tint', 'background_tint_gaps', 'dim_opacity',
       'selection_foreground', 'selection_background'].includes(key);
  }

  private isOSSpecificKey(key: string): boolean {
    return key.startsWith('macos_') || key.startsWith('wayland_') || key.startsWith('linux_');
  }

  private parseFontConfig(config: KittyConfigAST, key: string, value: string): void {
    switch (key) {
      case 'font_family':
        config.fonts.font_family = value;
        break;
      case 'bold_font':
        config.fonts.bold_font = value;
        break;
      case 'italic_font':
        config.fonts.italic_font = value;
        break;
      case 'bold_italic_font':
        config.fonts.bold_italic_font = value;
        break;
      case 'font_size':
        config.fonts.font_size = Number.parseFloat(value);
        break;
      case 'force_ltr':
        config.fonts.force_ltr = value === 'yes' || value === 'true';
        break;
      case 'disable_ligatures':
        config.fonts.disable_ligatures = value as KittyLigatureControl;
        break;
      case 'symbol_map':
        if (!config.fonts.symbol_map) config.fonts.symbol_map = [];
        config.fonts.symbol_map.push(value);
        break;
      case 'narrow_symbols':
        if (!config.fonts.narrow_symbols) config.fonts.narrow_symbols = [];
        config.fonts.narrow_symbols.push(value);
        break;
      case 'font_features':
        if (!config.fonts.font_features) config.fonts.font_features = [];
        config.fonts.font_features.push(value);
        break;
      case 'modify_font':
        if (!config.fonts.modify_font) config.fonts.modify_font = [];
        config.fonts.modify_font.push(value);
        break;
      case 'box_drawing_scale':
        config.fonts.box_drawing_scale = value.split(/\s+/).map(Number);
        break;
      case 'undercurl_style':
        config.fonts.undercurl_style = value as KittyUndercurlStyle;
        break;
      case 'underline_exclusion':
        config.fonts.underline_exclusion = Number.parseInt(value, 10);
        break;
      case 'text_composition_strategy':
        config.fonts.text_composition_strategy = value as KittyTextCompositionStrategy;
        break;
      case 'text_fg_override_threshold':
        config.fonts.text_fg_override_threshold = Number.parseFloat(value);
        break;
    }
  }

  private parseCursorConfig(config: KittyConfigAST, key: string, value: string): void {
    switch (key) {
      case 'cursor':
        config.cursor.cursor = value;
        break;
      case 'cursor_text_color':
        config.cursor.cursor_text_color = value;
        break;
      case 'cursor_shape':
        config.cursor.cursor_shape = value as KittyCursorShape;
        break;
      case 'cursor_shape_unfocused':
        config.cursor.cursor_shape_unfocused = value as KittyCursorShapeUnfocused;
        break;
      case 'cursor_beam_thickness':
        config.cursor.cursor_beam_thickness = Number.parseFloat(value);
        break;
      case 'cursor_underline_thickness':
        config.cursor.cursor_underline_thickness = Number.parseFloat(value);
        break;
      case 'cursor_blink_interval':
        config.cursor.cursor_blink_interval = Number.parseFloat(value);
        break;
      case 'cursor_stop_blinking_after':
        config.cursor.cursor_stop_blinking_after = Number.parseFloat(value);
        break;
      case 'cursor_trail':
        config.cursor.cursor_trail = Number.parseInt(value, 10);
        break;
      case 'cursor_trail_color':
        config.cursor.cursor_trail_color = value;
        break;
      case 'cursor_trail_decay':
        config.cursor.cursor_trail_decay = value.split(/\s+/).map(Number);
        break;
      case 'cursor_trail_start_threshold':
        config.cursor.cursor_trail_start_threshold = Number.parseInt(value, 10);
        break;
    }
  }

  private parseScrollbackConfig(config: KittyConfigAST, key: string, value: string): void {
    switch (key) {
      case 'scrollback_lines':
        config.scrollback.scrollback_lines = Number.parseInt(value, 10);
        break;
      case 'scrollback_pager':
        config.scrollback.scrollback_pager = value;
        break;
      case 'scrollback_pager_history_size':
        config.scrollback.scrollback_pager_history_size = Number.parseInt(value, 10);
        break;
      case 'scrollback_fill_enlarged_window':
        config.scrollback.scrollback_fill_enlarged_window = value === 'yes' || value === 'true';
        break;
      case 'wheel_scroll_multiplier':
        config.scrollback.wheel_scroll_multiplier = Number.parseFloat(value);
        break;
      case 'wheel_scroll_min_lines':
        config.scrollback.wheel_scroll_min_lines = Number.parseInt(value, 10);
        break;
      case 'touch_scroll_multiplier':
        config.scrollback.touch_scroll_multiplier = Number.parseFloat(value);
        break;
      case 'scrollbar':
        config.scrollback.scrollbar = value;
        break;
      case 'pixel_scroll':
        config.scrollback.pixel_scroll = value === 'yes' || value === 'true';
        break;
      case 'momentum_scroll':
        config.scrollback.momentum_scroll = value === 'yes' || value === 'true';
        break;
    }
  }

  private parseMouseConfig(config: KittyConfigAST, key: string, value: string): void {
    switch (key) {
      case 'mouse_hide_wait':
        config.mouse.mouse_hide_wait = Number.parseFloat(value);
        break;
      case 'url_color':
        config.mouse.url_color = value;
        break;
      case 'url_style':
        config.mouse.url_style = value as KittyUrlStyle;
        break;
      case 'url_prefixes':
        config.mouse.url_prefixes = value.split(/\s+/);
        break;
      case 'open_url_with':
        config.mouse.open_url_with = value;
        break;
      case 'detect_urls':
        config.mouse.detect_urls = value === 'yes' || value === 'true';
        break;
      case 'show_hyperlink_targets':
        config.mouse.show_hyperlink_targets = value === 'yes' || value === 'true';
        break;
      case 'underline_hyperlinks':
        config.mouse.underline_hyperlinks = value as KittyUnderlineHyperlinks;
        break;
      case 'copy_on_select':
        config.mouse.copy_on_select = value as KittyCopyOnSelect;
        break;
      case 'paste_actions':
        config.mouse.paste_actions = value.split(/\s+/);
        break;
      case 'strip_trailing_spaces':
        config.mouse.strip_trailing_spaces = value as KittyStripTrailingSpaces;
        break;
      case 'select_by_word_characters':
        config.mouse.select_by_word_characters = value;
        break;
      case 'select_by_word_characters_forward':
        config.mouse.select_by_word_characters_forward = value;
        break;
      case 'click_interval':
        config.mouse.click_interval = Number.parseFloat(value);
        break;
      case 'focus_follows_mouse':
        config.mouse.focus_follows_mouse = value === 'yes' || value === 'true';
        break;
      case 'pointer_shape_when_grabbed':
        config.mouse.pointer_shape_when_grabbed = value;
        break;
      case 'default_pointer_shape':
        config.mouse.default_pointer_shape = value;
        break;
      case 'pointer_shape_when_dragging':
        config.mouse.pointer_shape_when_dragging = value;
        break;
      case 'url_excluded_characters':
        config.mouse.url_excluded_characters = value;
        break;
      case 'clear_selection_on_clipboard_loss':
        config.mouse.clear_selection_on_clipboard_loss = value === 'yes' || value === 'true';
        break;
    }
  }

  private parsePerformanceConfig(config: KittyConfigAST, key: string, value: string): void {
    switch (key) {
      case 'repaint_delay':
        config.performance.repaint_delay = Number.parseInt(value, 10);
        break;
      case 'input_delay':
        config.performance.input_delay = Number.parseInt(value, 10);
        break;
      case 'sync_to_monitor':
        config.performance.sync_to_monitor = value === 'yes' || value === 'true';
        break;
    }
  }

  private parseBellConfig(config: KittyConfigAST, key: string, value: string): void {
    switch (key) {
      case 'enable_audio_bell':
        config.bell.enable_audio_bell = value === 'yes' || value === 'true';
        break;
      case 'visual_bell_duration':
        config.bell.visual_bell_duration = Number.parseFloat(value);
        break;
      case 'visual_bell_color':
        config.bell.visual_bell_color = value;
        break;
      case 'window_alert_on_bell':
        config.bell.window_alert_on_bell = value === 'yes' || value === 'true';
        break;
      case 'bell_on_tab':
        config.bell.bell_on_tab = value;
        break;
      case 'command_on_bell':
        config.bell.command_on_bell = value;
        break;
      case 'bell_path':
        config.bell.bell_path = value;
        break;
      case 'linux_bell_theme':
        config.bell.linux_bell_theme = value;
        break;
    }
  }

  private parseWindowLayoutConfig(config: KittyConfigAST, key: string, value: string): void {
    switch (key) {
      case 'remember_window_size':
        config.window_layout.remember_window_size = value === 'yes' || value === 'true';
        break;
      case 'remember_window_position':
        config.window_layout.remember_window_position = value === 'yes' || value === 'true';
        break;
      case 'initial_window_width':
        config.window_layout.initial_window_width = Number.parseInt(value, 10);
        break;
      case 'initial_window_height':
        config.window_layout.initial_window_height = Number.parseInt(value, 10);
        break;
      case 'enabled_layouts':
        config.window_layout.enabled_layouts = value.split(',').map(v => v.trim()) as KittyLayout[];
        break;
      case 'window_border_width':
        config.window_layout.window_border_width = value;
        break;
      case 'draw_minimal_borders':
        config.window_layout.draw_minimal_borders = value === 'yes' || value === 'true';
        break;
      case 'draw_window_borders_for_single_window':
        config.window_layout.draw_window_borders_for_single_window = value === 'yes' || value === 'true';
        break;
      case 'window_margin_width':
        config.window_layout.window_margin_width = Number.parseFloat(value);
        break;
      case 'single_window_margin_width':
        config.window_layout.single_window_margin_width = Number.parseFloat(value);
        break;
      case 'window_padding_width':
        config.window_layout.window_padding_width = Number.parseFloat(value);
        break;
      case 'single_window_padding_width':
        config.window_layout.single_window_padding_width = Number.parseFloat(value);
        break;
      case 'placement_strategy':
        config.window_layout.placement_strategy = value as KittyPlacementStrategy;
        break;
      case 'active_border_color':
        config.window_layout.active_border_color = value;
        break;
      case 'inactive_border_color':
        config.window_layout.inactive_border_color = value;
        break;
      case 'bell_border_color':
        config.window_layout.bell_border_color = value;
        break;
      case 'inactive_text_alpha':
        config.window_layout.inactive_text_alpha = Number.parseFloat(value);
        break;
      case 'hide_window_decorations':
        if (value === 'yes' || value === 'true') {
          config.window_layout.hide_window_decorations = true;
        } else if (value === 'no' || value === 'false') {
          config.window_layout.hide_window_decorations = false;
        } else {
          config.window_layout.hide_window_decorations = value as 'titlebar-only' | 'titlebar-and-corners';
        }
        break;
      case 'window_resize_step_cells':
        config.window_layout.window_resize_step_cells = Number.parseInt(value, 10);
        break;
      case 'window_resize_step_lines':
        config.window_layout.window_resize_step_lines = Number.parseInt(value, 10);
        break;
      case 'confirm_os_window_close': {
        // Handle both "N" and "N count-background" formats
        const parts = value.split(/\s+/);
        const numValue = parts[0] ? Number.parseInt(parts[0], 10) : -1;
        config.window_layout.confirm_os_window_close = Number.isNaN(numValue) ? -1 : numValue;
        if (parts[1] === 'count-background') {
          config.window_layout.confirm_os_window_close_count_background = true;
        }
        break;
      }
      case 'window_logo_path':
        config.window_layout.window_logo_path = value;
        break;
      case 'window_logo_position':
        config.window_layout.window_logo_position = value as KittyPlacementStrategy;
        break;
      case 'window_logo_alpha':
        config.window_layout.window_logo_alpha = Number.parseFloat(value);
        break;
      case 'resize_debounce_time':
        config.window_layout.resize_debounce_time = Number.parseFloat(value);
        break;
      case 'resize_in_steps':
        config.window_layout.resize_in_steps = value === 'yes' || value === 'true';
        break;
      case 'visual_window_select_characters':
        config.window_layout.visual_window_select_characters = value;
        break;
      case 'startup_window':
        config.window_layout.startup_window = value;
        break;
      case 'window_drag_tolerance':
        config.window_layout.window_drag_tolerance = Number.parseFloat(value);
        break;
    }
  }

  private parseTabBarConfig(config: KittyConfigAST, key: string, value: string): void {
    switch (key) {
      case 'tab_bar_edge':
        config.tab_bar.tab_bar_edge = value as KittyTabBarEdge;
        break;
      case 'tab_bar_margin_width':
        config.tab_bar.tab_bar_margin_width = Number.parseFloat(value);
        break;
      case 'tab_bar_margin_height':
        config.tab_bar.tab_bar_margin_height = value.split(/\s+/).map(Number);
        break;
      case 'tab_bar_style':
        config.tab_bar.tab_bar_style = value as KittyTabBarStyle;
        break;
      case 'tab_bar_align':
        config.tab_bar.tab_bar_align = value as KittyTabBarAlign;
        break;
      case 'tab_bar_min_tabs':
        config.tab_bar.tab_bar_min_tabs = Number.parseInt(value, 10);
        break;
      case 'tab_switch_strategy':
        config.tab_bar.tab_switch_strategy = value as KittyTabSwitchStrategy;
        break;
      case 'tab_fade':
        config.tab_bar.tab_fade = value.split(/\s+/).map(Number);
        break;
      case 'tab_separator':
        config.tab_bar.tab_separator = value;
        break;
      case 'tab_powerline_style':
        config.tab_bar.tab_powerline_style = value as KittyTabPowerlineStyle;
        break;
      case 'tab_activity_symbol':
        config.tab_bar.tab_activity_symbol = value;
        break;
      case 'tab_title_max_length':
        config.tab_bar.tab_title_max_length = Number.parseInt(value, 10);
        break;
      case 'tab_title_template':
        config.tab_bar.tab_title_template = value;
        break;
      case 'active_tab_title_template':
        config.tab_bar.active_tab_title_template = value;
        break;
      case 'active_tab_foreground':
        config.tab_bar.active_tab_foreground = value;
        break;
      case 'active_tab_background':
        config.tab_bar.active_tab_background = value;
        break;
      case 'active_tab_font_style':
        config.tab_bar.active_tab_font_style = value;
        break;
      case 'inactive_tab_foreground':
        config.tab_bar.inactive_tab_foreground = value;
        break;
      case 'inactive_tab_background':
        config.tab_bar.inactive_tab_background = value;
        break;
      case 'inactive_tab_font_style':
        config.tab_bar.inactive_tab_font_style = value;
        break;
      case 'tab_bar_background':
        config.tab_bar.tab_bar_background = value;
        break;
      case 'tab_bar_margin_color':
        config.tab_bar.tab_bar_margin_color = value;
        break;
      case 'tab_bar_hide_path':
        config.tab_bar.tab_bar_hide_path = value;
        break;
      case 'tab_bar_drag_threshold':
        config.tab_bar.tab_bar_drag_threshold = Number.parseFloat(value);
        break;
    }
  }

  private parseColorConfig(config: KittyConfigAST, key: string, value: string): void {
    if (key === 'background_opacity') {
      config.colors.background_opacity = Number.parseFloat(value);
    } else if (key === 'background_blur') {
      config.colors.background_blur = Number.parseInt(value, 10);
    } else if (key === 'background_image_linear') {
      config.colors.background_image_linear = value === 'yes' || value === 'true';
    } else if (key === 'background_tint') {
      config.colors.background_tint = Number.parseFloat(value);
    } else if (key === 'background_tint_gaps') {
      config.colors.background_tint_gaps = Number.parseFloat(value);
    } else if (key === 'dim_opacity') {
      config.colors.dim_opacity = Number.parseFloat(value);
    } else if (key === 'background_image_layout') {
      config.colors.background_image_layout = value as KittyBackgroundImageLayout;
    } else if (key === 'transparent_background_colors') {
      if (!config.colors.transparent_background_colors) config.colors.transparent_background_colors = [];
      config.colors.transparent_background_colors.push(value);
    } else if (key in config.colors) {
      (config.colors as unknown as Record<string, string | number | boolean>)[key] = value;
    }
  }

  private parseOSSpecificConfig(config: KittyConfigAST, key: string, value: string): void {
    switch (key) {
      case 'wayland_titlebar_color':
        config.os_specific.wayland_titlebar_color = value;
        break;
      case 'wayland_enable_ime':
        config.os_specific.wayland_enable_ime = value === 'yes' || value === 'true';
        break;
      case 'macos_titlebar_color':
        config.os_specific.macos_titlebar_color = value;
        break;
      case 'macos_option_as_alt':
        config.os_specific.macos_option_as_alt = value as KittyMacosOptionAsAlt;
        break;
      case 'macos_hide_from_tasks':
        config.os_specific.macos_hide_from_tasks = value === 'yes' || value === 'true';
        break;
      case 'macos_quit_when_last_window_closed':
        config.os_specific.macos_quit_when_last_window_closed = value === 'yes' || value === 'true';
        break;
      case 'macos_window_resizable':
        config.os_specific.macos_window_resizable = value === 'yes' || value === 'true';
        break;
      case 'macos_thicken_font':
        config.os_specific.macos_thicken_font = Number.parseFloat(value);
        break;
      case 'macos_traditional_fullscreen':
        config.os_specific.macos_traditional_fullscreen = value === 'yes' || value === 'true';
        break;
      case 'macos_show_window_title_in':
        config.os_specific.macos_show_window_title_in = value;
        break;
      case 'macos_menubar_title_max_length':
        config.os_specific.macos_menubar_title_max_length = Number.parseInt(value, 10);
        break;
      case 'macos_custom_beam_cursor':
        config.os_specific.macos_custom_beam_cursor = value === 'yes' || value === 'true';
        break;
      case 'macos_colorspace':
        config.os_specific.macos_colorspace = value as KittyMacosColorspace;
        break;
      case 'macos_dock_badge_on_bell':
        config.os_specific.macos_dock_badge_on_bell = value === 'yes' || value === 'true';
        break;
      case 'linux_display_server':
        config.os_specific.linux_display_server = value as KittyLinuxDisplayServer;
        break;
    }
  }

  private parseAdvancedConfig(config: KittyConfigAST, key: string, value: string): void {
    switch (key) {
      case 'shell':
        config.advanced.shell = value;
        break;
      case 'editor':
        config.advanced.editor = value;
        break;
      case 'close_on_child_death':
        config.advanced.close_on_child_death = value === 'yes' || value === 'true';
        break;
      case 'allow_remote_control':
        config.advanced.allow_remote_control = value as KittyRemoteControl;
        break;
      case 'remote_control_password':
        if (!config.advanced.remote_control_password) config.advanced.remote_control_password = [];
        config.advanced.remote_control_password.push(value);
        break;
      case 'listen_on':
        config.advanced.listen_on = value;
        break;
      case 'watcher':
        if (!config.advanced.watcher) config.advanced.watcher = [];
        config.advanced.watcher.push(value);
        break;
      case 'exe_search_path':
        if (!config.advanced.exe_search_path) config.advanced.exe_search_path = [];
        config.advanced.exe_search_path.push(value);
        break;
      case 'update_check_interval':
        config.advanced.update_check_interval = Number.parseInt(value, 10);
        break;
      case 'startup_session':
        config.advanced.startup_session = value;
        break;
      case 'clipboard_control':
        config.advanced.clipboard_control = value.split(/\s+/);
        break;
      case 'clipboard_max_size':
        config.advanced.clipboard_max_size = Number.parseFloat(value);
        break;
      case 'allow_hyperlinks':
        config.advanced.allow_hyperlinks = value;
        break;
      case 'shell_integration':
        config.advanced.shell_integration = value;
        break;
      case 'allow_cloning':
        config.advanced.allow_cloning = value;
        break;
      case 'clone_source_strategies':
        config.advanced.clone_source_strategies = value.split(/[,\s]+/).filter(Boolean);
        break;
      case 'term':
        config.advanced.term = value;
        break;
      case 'forward_stdio':
        config.advanced.forward_stdio = value === 'yes' || value === 'true';
        break;
      case 'menu_map':
        if (!config.advanced.menu_map) config.advanced.menu_map = [];
        config.advanced.menu_map.push(value);
        break;
    }
  }
}
