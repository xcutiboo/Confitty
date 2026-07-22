export type KittyCursorShape = "block" | "beam" | "underline";
export type KittyCursorShapeUnfocused =
	| "block"
	| "beam"
	| "underline"
	| "hollow"
	| "unchanged";
export type KittyTabBarStyle =
	| "fade"
	| "slant"
	| "separator"
	| "powerline"
	| "custom"
	| "hidden";
export type KittyTabBarAlign =
	| "start"
	| "center"
	| "end"
	| "left"
	| "right";
/** left and right produce a vertical tab bar; added in Kitty 0.48. */
export type KittyTabBarEdge = "top" | "bottom" | "left" | "right";
export type KittyTabSwitchStrategy = "previous" | "left" | "right" | "last";
export type KittyTabPowerlineStyle = "angled" | "slanted" | "round";
export type KittyRemoteControl =
	| "yes"
	| "no"
	| "socket-only"
	| "socket"
	| "password";
export type KittyLigatureControl = "never" | "always" | "cursor";
export type KittyLayout =
	| "Fat"
	| "Grid"
	| "Horizontal"
	| "Splits"
	| "Stack"
	| "Tall"
	| "Vertical"
	| "*";
export type KittyUndercurlStyle =
	| "thin-sparse"
	| "thin-dense"
	| "thick-sparse"
	| "thick-dense";
export type KittyTextCompositionStrategy = "platform" | "legacy";
export type KittyMacosOptionAsAlt = "yes" | "no" | "both" | "left" | "right";
export type KittyCopyOnSelect = "yes" | "no" | "clipboard";
export type KittyUrlStyle =
	| "none"
	| "straight"
	| "double"
	| "curly"
	| "dotted"
	| "dashed";
export type KittyBackgroundImageLayout =
	| "tiled"
	| "mirror-tiled"
	| "scaled"
	| "clamped"
	| "centered"
	| "cscaled";
export type KittyPlacementStrategy =
	| "top-left"
	| "top"
	| "top-right"
	| "left"
	| "center"
	| "right"
	| "bottom-left"
	| "bottom"
	| "bottom-right";
export type KittyUnderlineHyperlinks = "hover" | "always" | "never";
export type KittyShowHyperlinkTargets =
	| "never"
	| "always"
	| "ctrl"
	| "cmd"
	| "alt"
	| "shift";
export type KittyStripTrailingSpaces = "never" | "smart" | "always";
export type KittyMacosColorspace = "srgb" | "default" | "displayp3";
export type KittyHideWindowDecorations =
	| boolean
	| "yes"
	| "no"
	| "titlebar-only"
	| "titlebar-and-corners";
export type KittyLinuxDisplayServer = "x11" | "wayland" | "auto";

export interface KittyKeyMap {
	chord: string;
	action: string;
}

export interface KittyMouseMap {
	button: string;
	event: string;
	modes: string;
	action: string;
}

export interface KittyFontsConfig {
	font_family: string;
	bold_font: string;
	italic_font: string;
	bold_italic_font: string;
	font_size: number;
	force_ltr: boolean;
	symbol_map: string[];
	narrow_symbols: string[];
	disable_ligatures: KittyLigatureControl;
	font_features: string[];
	modify_font: string[];
	box_drawing_scale: number[];
	undercurl_style: KittyUndercurlStyle;
	underline_exclusion: number;
	text_composition_strategy: KittyTextCompositionStrategy;
	text_fg_override_threshold: number;
}

export interface KittyCursorConfig {
	cursor: string;
	cursor_text_color: string;
	cursor_shape: KittyCursorShape;
	cursor_shape_unfocused: KittyCursorShapeUnfocused;
	cursor_beam_thickness: number;
	cursor_underline_thickness: number;
	cursor_blink_interval: number;
	cursor_stop_blinking_after: number;
	cursor_trail: number;
	cursor_trail_color: string;
	cursor_trail_decay: number[];
	cursor_trail_start_threshold: number;
}

export type KittyScrollbarMode =
	| "scrolled"
	| "always"
	| "never"
	| "hovered"
	| "scrolled-and-hovered";

export interface KittyScrollbackConfig {
	scrollback_lines: number;
	scrollback_pager: string;
	scrollback_pager_history_size: number;
	scrollback_fill_enlarged_window: boolean;
	wheel_scroll_multiplier: number;
	wheel_scroll_min_lines: number;
	touch_scroll_multiplier: number;
	pixel_scroll: boolean;
	/** Friction applied to inertial scrolling, 0 (off) to 1 (never stops). */
	momentum_scroll: number;
	scrollbar: KittyScrollbarMode;
	scrollbar_gap: number;
	scrollbar_handle_color: string;
	scrollbar_handle_opacity: number;
	scrollbar_hitbox_expansion: number;
	scrollbar_hover_width: number;
	scrollbar_interactive: boolean;
	scrollbar_jump_on_click: boolean;
	scrollbar_min_handle_height: number;
	scrollbar_radius: number;
	scrollbar_track_color: string;
	scrollbar_track_hover_opacity: number;
	scrollbar_track_opacity: number;
	scrollbar_width: number;
}

export interface KittyMouseConfig {
	mouse_hide_wait: number;
	url_color: string;
	url_style: KittyUrlStyle;
	open_url_with: string;
	url_prefixes: string[];
	detect_urls: boolean;
	show_hyperlink_targets: KittyShowHyperlinkTargets;
	underline_hyperlinks: KittyUnderlineHyperlinks;
	/** Pixels the pointer must travel before a tab or window drag begins; 0 disables dragging. */
	drag_threshold: number;
	copy_on_select: KittyCopyOnSelect;
	paste_actions: string[];
	strip_trailing_spaces: KittyStripTrailingSpaces;
	select_by_word_characters: string;
	select_by_word_characters_forward: string;
	click_interval: number;
	focus_follows_mouse: boolean;
	pointer_shape_when_grabbed: string;
	default_pointer_shape: string;
	pointer_shape_when_dragging: string;
	url_excluded_characters: string;
	clear_selection_on_clipboard_loss: boolean;
}

export interface KittyPerformanceConfig {
	repaint_delay: number;
	input_delay: number;
	sync_to_monitor: boolean;
}

export interface KittyBellConfig {
	enable_audio_bell: boolean;
	visual_bell_duration: number;
	visual_bell_color: string;
	window_alert_on_bell: boolean;
	bell_on_tab: string;
	command_on_bell: string;
	bell_path: string;
	linux_bell_theme: string;
}

export interface KittyWindowLayoutConfig {
	remember_window_size: boolean;
	remember_window_position: boolean;
	initial_window_width: number;
	initial_window_height: number;
	enabled_layouts: KittyLayout[];
	window_resize_step_cells: number;
	window_resize_step_lines: number;
	window_border_width: string;
	draw_minimal_borders: boolean;
	draw_window_borders_for_single_window: boolean;
	window_margin_width: number;
	single_window_margin_width: number;
	window_padding_width: number;
	single_window_padding_width: number;
	placement_strategy: KittyPlacementStrategy;
	active_border_color: string;
	inactive_border_color: string;
	bell_border_color: string;
	inactive_text_alpha: number;
	hide_window_decorations: KittyHideWindowDecorations;
	window_logo_path: string;
	window_logo_position: KittyPlacementStrategy;
	window_logo_alpha: number;
	window_logo_scale: number;
	resize_debounce_time: number;
	resize_in_steps: boolean;
	visual_window_select_characters: string;
	confirm_os_window_close: number;
	/** Folded into the `confirm_os_window_close` directive; never emitted on its own. */
	confirm_os_window_close_count_background: boolean;
	window_drag_tolerance: number;
	window_title_bar: "top" | "bottom";
	window_title_bar_active_background: string;
	window_title_bar_active_foreground: string;
	window_title_bar_inactive_background: string;
	window_title_bar_inactive_foreground: string;
	window_title_bar_align: "left" | "center" | "right";
	window_title_bar_min_windows: number;
	window_title_template: string;
	active_window_title_template: string;
}

export interface KittyTabBarConfig {
	tab_bar_edge: KittyTabBarEdge;
	tab_bar_margin_width: number;
	tab_bar_margin_height: number[];
	tab_bar_style: KittyTabBarStyle;
	tab_bar_align: KittyTabBarAlign;
	tab_bar_min_tabs: number;
	tab_switch_strategy: KittyTabSwitchStrategy;
	tab_fade: number[];
	tab_separator: string;
	tab_powerline_style: KittyTabPowerlineStyle;
	tab_activity_symbol: string;
	tab_title_max_length: number;
	tab_title_template: string;
	active_tab_title_template: string;
	active_tab_foreground: string;
	active_tab_background: string;
	active_tab_font_style: string;
	inactive_tab_foreground: string;
	inactive_tab_background: string;
	inactive_tab_font_style: string;
	tab_bar_background: string;
	tab_bar_margin_color: string;
	tab_bar_filter: string;
	tab_bar_show_new_tab_button: boolean;
	progress_bar: "left" | "right" | "top" | "bottom" | "hidden";
}

export interface KittyColorConfig {
	foreground: string;
	background: string;
	background_opacity: number;
	background_blur: number;
	background_image: string;
	background_image_layout: KittyBackgroundImageLayout;
	background_image_linear: boolean;
	background_tint: number;
	background_tint_gaps: number;
	dim_opacity: number;
	selection_foreground: string;
	selection_background: string;
	// ANSI standard colors (0-15) - always present
	color0: string;
	color1: string;
	color2: string;
	color3: string;
	color4: string;
	color5: string;
	color6: string;
	color7: string;
	color8: string;
	color9: string;
	color10: string;
	color11: string;
	color12: string;
	color13: string;
	color14: string;
	color15: string;
	// color16-color255 are not modelled: they round-trip as raw directives.
	mark1_foreground: string;
	mark1_background: string;
	mark2_foreground: string;
	mark2_background: string;
	mark3_foreground: string;
	mark3_background: string;
	dynamic_background_opacity: boolean;
	transparent_background_colors: string[];
	palette_generate: "fixed" | "yes";
}

export interface KittyAdvancedConfig {
	shell: string;
	editor: string;
	close_on_child_death: boolean;
	allow_remote_control: KittyRemoteControl;
	remote_control_password: string[];
	listen_on: string;
	env: Record<string, string>;
	env_read_from_shell: boolean;
	watcher: string[];
	exe_search_path: string[];
	update_check_interval: number;
	startup_session: string;
	clipboard_control: string[];
	clipboard_max_size: number;
	map_timeout: number;
	file_transfer_confirmation_bypass: string[];
	filter_notification: string;
	allow_hyperlinks: string;
	shell_integration: string;
	allow_cloning: string;
	clone_source_strategies: string[];
	term: string;
	forward_stdio: boolean;
	menu_map: string[];
	action_alias: string[];
	auto_reload_config: number;
	notify_on_cmd_finish: string;
	terminfo_type: "path" | "direct" | "none";
}

export interface KittyOSSpecificConfig {
	wayland_titlebar_color: string;
	wayland_enable_ime: boolean;
	macos_titlebar_color: string;
	macos_option_as_alt: KittyMacosOptionAsAlt;
	macos_hide_from_tasks: boolean;
	macos_quit_when_last_window_closed: boolean;
	macos_window_resizable: boolean;
	macos_thicken_font: number;
	macos_traditional_fullscreen: boolean;
	macos_show_window_title_in: "all" | "window" | "menubar" | "none";
	macos_menubar_title_max_length: number;
	macos_custom_beam_cursor: boolean;
	macos_colorspace: "srgb" | "displayp3" | "default";
	macos_dock_badge_on_bell: boolean;
	macos_fullscreen_ignore_safe_area_insets: boolean;
	/** NSWindow level for panel OS windows; "unset" leaves Kitty's handling alone. */
	macos_ns_window_layer: string;
	macos_use_physical_screen_frame: boolean;
	linux_display_server: "auto" | "wayland" | "x11";
}

export interface KittyConfigAST {
	fonts: KittyFontsConfig;
	cursor: KittyCursorConfig;
	scrollback: KittyScrollbackConfig;
	mouse: KittyMouseConfig;
	performance: KittyPerformanceConfig;
	bell: KittyBellConfig;
	window_layout: KittyWindowLayoutConfig;
	tab_bar: KittyTabBarConfig;
	colors: KittyColorConfig;
	advanced: KittyAdvancedConfig;
	os_specific: KittyOSSpecificConfig;
	keyboard_shortcuts: KittyKeyMap[];
	mouse_mappings: KittyMouseMap[];
	unrecognized_directives: string[];
	kitty_mod: string;
}
