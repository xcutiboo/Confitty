/**
 * Kitty's own default keyboard actions, taken from the map() entries in
 * kitty/options/definition.py. Offered as suggestions when editing a
 * shortcut; the action field stays free text, because kitty accepts far more
 * than these, including launch, kitten and combine invocations.
 */
export interface KittyAction {
	/** The action as written after the chord in a map directive. */
	action: string;
	/** How kitty describes it in its documentation. */
	title: string;
	/** The chord kitty binds it to out of the box. */
	defaultChord: string;
}

export const KITTY_ACTIONS: readonly KittyAction[] = [
	{
		action: "show_last_command_output",
		title: "Browse output of the last shell command in pager",
		defaultChord: "kitty_mod+g",
	},
	{
		action: "show_scrollback",
		title: "Browse scrollback buffer in pager",
		defaultChord: "kitty_mod+h",
	},
	{
		action: "close_os_window",
		title: "Close OS window",
		defaultChord: "shift+cmd+w",
	},
	{
		action: "close_tab",
		title: "Close tab",
		defaultChord: "kitty_mod+q",
	},
	{
		action: "close_window",
		title: "Close window",
		defaultChord: "kitty_mod+w",
	},
	{
		action: "copy_to_clipboard",
		title: "Copy to clipboard",
		defaultChord: "kitty_mod+c",
	},
	{
		action: "copy_or_noop",
		title: "Copy to clipboard or pass through",
		defaultChord: "cmd+c",
	},
	{
		action: "debug_config",
		title: "Debug kitty configuration",
		defaultChord: "kitty_mod+f6",
	},
	{
		action: "edit_config_file",
		title: "Edit config file",
		defaultChord: "kitty_mod+f2",
	},
	{
		action: "eighth_window",
		title: "Eighth window",
		defaultChord: "kitty_mod+8",
	},
	{
		action: "fifth_window",
		title: "Fifth window",
		defaultChord: "kitty_mod+5",
	},
	{
		action: "first_window",
		title: "First window",
		defaultChord: "kitty_mod+1",
	},
	{
		action: "fourth_window",
		title: "Fourth window",
		defaultChord: "kitty_mod+4",
	},
	{
		action: "hide_macos_app",
		title: "Hide macOS kitty application",
		defaultChord: "cmd+h",
	},
	{
		action: "hide_macos_other_apps",
		title: "Hide macOS other applications",
		defaultChord: "opt+cmd+h",
	},
	{
		action: "minimize_macos_window",
		title: "Minimize macOS window",
		defaultChord: "cmd+m",
	},
	{
		action: "move_tab_backward",
		title: "Move tab backward",
		defaultChord: "kitty_mod+,",
	},
	{
		action: "move_tab_forward",
		title: "Move tab forward",
		defaultChord: "kitty_mod+.",
	},
	{
		action: "move_window_backward",
		title: "Move window backward",
		defaultChord: "kitty_mod+b",
	},
	{
		action: "move_window_forward",
		title: "Move window forward",
		defaultChord: "kitty_mod+f",
	},
	{
		action: "move_window_to_top",
		title: "Move window to top",
		defaultChord: "kitty_mod+`",
	},
	{
		action: "new_os_window",
		title: "New OS window",
		defaultChord: "kitty_mod+n",
	},
	{
		action: "new_tab",
		title: "New tab",
		defaultChord: "kitty_mod+t",
	},
	{
		action: "new_window",
		title: "New window",
		defaultChord: "kitty_mod+enter",
	},
	{
		action: "next_layout",
		title: "Next layout",
		defaultChord: "kitty_mod+l",
	},
	{
		action: "next_tab",
		title: "Next tab",
		defaultChord: "kitty_mod+right",
	},
	{
		action: "next_window",
		title: "Next window",
		defaultChord: "kitty_mod+]",
	},
	{
		action: "ninth_window",
		title: "Ninth window",
		defaultChord: "kitty_mod+9",
	},
	{
		action: "kitty_shell window",
		title: "Open the kitty command shell",
		defaultChord: "kitty_mod+escape",
	},
	{
		action: "pass_selection_to_program",
		title: "Pass selection to program",
		defaultChord: "kitty_mod+o",
	},
	{
		action: "paste_from_clipboard",
		title: "Paste from clipboard",
		defaultChord: "kitty_mod+v",
	},
	{
		action: "paste_from_selection",
		title: "Paste from selection",
		defaultChord: "kitty_mod+s",
	},
	{
		action: "previous_tab",
		title: "Previous tab",
		defaultChord: "kitty_mod+left",
	},
	{
		action: "previous_window",
		title: "Previous window",
		defaultChord: "kitty_mod+[",
	},
	{
		action: "quit",
		title: "Quit kitty",
		defaultChord: "cmd+q",
	},
	{
		action: "scroll_line_down smooth",
		title: "Scroll line down",
		defaultChord: "kitty_mod+down",
	},
	{
		action: "scroll_line_up smooth",
		title: "Scroll line up",
		defaultChord: "kitty_mod+up",
	},
	{
		action: "scroll_page_down",
		title: "Scroll page down",
		defaultChord: "kitty_mod+page_down",
	},
	{
		action: "scroll_page_up",
		title: "Scroll page up",
		defaultChord: "kitty_mod+page_up",
	},
	{
		action: "scroll_end",
		title: "Scroll to bottom",
		defaultChord: "kitty_mod+end",
	},
	{
		action: "scroll_home",
		title: "Scroll to top",
		defaultChord: "kitty_mod+home",
	},
	{
		action: "search_scrollback",
		title: "Search the scrollback within a pager",
		defaultChord: "kitty_mod+/",
	},
	{
		action: "second_window",
		title: "Second window",
		defaultChord: "kitty_mod+2",
	},
	{
		action: "send_text all Hello World",
		title: "Send arbitrary text on key presses",
		defaultChord: "ctrl+shift+alt+h",
	},
	{
		action: "set_tab_title",
		title: "Set tab title",
		defaultChord: "kitty_mod+alt+t",
	},
	{
		action: "seventh_window",
		title: "Seventh window",
		defaultChord: "kitty_mod+7",
	},
	{
		action: "sixth_window",
		title: "Sixth window",
		defaultChord: "kitty_mod+6",
	},
	{
		action: "start_resizing_window",
		title: "Start resizing window",
		defaultChord: "kitty_mod+r",
	},
	{
		action: "tenth_window",
		title: "Tenth window",
		defaultChord: "kitty_mod+0",
	},
	{
		action: "third_window",
		title: "Third window",
		defaultChord: "kitty_mod+3",
	},
	{
		action: "toggle_fullscreen",
		title: "Toggle fullscreen",
		defaultChord: "kitty_mod+f11",
	},
	{
		action: "toggle_macos_secure_keyboard_entry",
		title: "Toggle macOS secure keyboard entry",
		defaultChord: "opt+cmd+s",
	},
	{
		action: "toggle_maximized",
		title: "Toggle maximized",
		defaultChord: "kitty_mod+f10",
	},
	{
		action: "focus_visible_window",
		title: "Visually select and focus window",
		defaultChord: "kitty_mod+f7",
	},
	{
		action: "swap_with_window",
		title: "Visually swap window with another",
		defaultChord: "kitty_mod+f8",
	},
];
