import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { DEFAULT_KITTY_CONFIG } from "../../models/kitty-defaults";
import type { KittyConfigAST } from "../../models/kitty-types";
import { ConfigStoreService } from "../../services/config-store.service";
import {
	type ConfigPreset,
	PresetsService,
} from "../../services/presets.service";

/** Routes a flat preset key onto a config section. Keys not in this map go to `colors`. */
const KEY_TO_SECTION: Readonly<Record<string, keyof KittyConfigAST>> = {
	cursor_shape: "cursor",
	cursor_blink_interval: "cursor",
	cursor_stop_blinking_after: "cursor",
	cursor_beam_thickness: "cursor",
	cursor_underline_thickness: "cursor",

	font_size: "fonts",
	font_family: "fonts",
	bold_font: "fonts",
	italic_font: "fonts",
	bold_italic_font: "fonts",
	disable_ligatures: "fonts",
	force_ltr: "fonts",
	box_drawing_scale: "fonts",

	scrollback_lines: "scrollback",
	scrollback_pager: "scrollback",
	scrollback_pager_history_size: "scrollback",
	scrollback_fill_enlarged_window: "scrollback",
	wheel_scroll_multiplier: "scrollback",
	wheel_scroll_min_lines: "scrollback",
	touch_scroll_multiplier: "scrollback",

	mouse_hide_wait: "mouse",
	url_style: "mouse",
	open_url_with: "mouse",
	url_prefixes: "mouse",
	detect_urls: "mouse",
	copy_on_select: "mouse",
	strip_trailing_spaces: "mouse",
	show_hyperlink_targets: "mouse",
	underline_hyperlinks: "mouse",
	focus_follows_mouse: "mouse",

	repaint_delay: "performance",
	input_delay: "performance",
	sync_to_monitor: "performance",

	enable_audio_bell: "bell",
	visual_bell_duration: "bell",
	visual_bell_color: "bell",
	window_alert_on_bell: "bell",
	bell_on_tab: "bell",
	command_on_bell: "bell",

	remember_window_size: "window_layout",
	initial_window_width: "window_layout",
	initial_window_height: "window_layout",
	window_padding_width: "window_layout",
	window_margin_width: "window_layout",
	single_window_margin_width: "window_layout",
	window_border_width: "window_layout",
	hide_window_decorations: "window_layout",
	confirm_os_window_close: "window_layout",
	draw_minimal_borders: "window_layout",
	inactive_text_alpha: "window_layout",
	window_resize_step_cells: "window_layout",
	window_resize_step_lines: "window_layout",
	active_border_color: "window_layout",
	inactive_border_color: "window_layout",
	bell_border_color: "window_layout",

	tab_bar_style: "tab_bar",
	tab_bar_edge: "tab_bar",
	tab_bar_min_tabs: "tab_bar",
	tab_title_template: "tab_bar",
	tab_powerline_style: "tab_bar",
	tab_separator: "tab_bar",
	tab_bar_background: "tab_bar",
	active_tab_foreground: "tab_bar",
	active_tab_background: "tab_bar",
	inactive_tab_foreground: "tab_bar",
	inactive_tab_background: "tab_bar",

	shell: "advanced",
	editor: "advanced",
	close_on_child_death: "advanced",
	allow_remote_control: "advanced",
	update_check_interval: "advanced",
	shell_integration: "advanced",
};

const COLOR_OVERRIDES = new Set([
	"foreground",
	"background",
	"cursor",
	"cursor_text_color",
	"selection_foreground",
	"selection_background",
	"url_color",
	"background_opacity",
	"background_blur",
	"background_image",
	"dim_opacity",
]);

/** Enough to browse without burying the settings form underneath. */
const PRESET_PAGE_SIZE = 6;

const TAB_BAR_COLOR_KEYS = new Set([
	"active_tab_background",
	"active_tab_foreground",
	"inactive_tab_background",
	"inactive_tab_foreground",
	"tab_bar_background",
]);

function sectionFor(key: string): keyof KittyConfigAST | undefined {
	if (key.startsWith("color") || COLOR_OVERRIDES.has(key)) return "colors";
	return KEY_TO_SECTION[key];
}

@Component({
	selector: "app-preset-selector",
	imports: [CommonModule],
	template: `
    <div class="px-7 pt-5 pb-6">
      <div class="mb-5">
        <p class="text-xs text-kitty-text-dim mb-4 leading-relaxed">
          Pick a preset to get going, then tweak whatever you want from there.
        </p>
        <div class="flex gap-1.5 flex-wrap">
          @for (cat of categories; track cat.id) {
            <button
              type="button"
              (click)="selectCategory(cat.id)"
              class="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors"
              [class.bg-kitty-primary]="selectedCategory() === cat.id"
              [class.text-kitty-dark]="selectedCategory() === cat.id"
              [class.bg-kitty-bg]="selectedCategory() !== cat.id"
              [class.text-kitty-text-dim]="selectedCategory() !== cat.id"
              [class.hover:text-kitty-text]="selectedCategory() !== cat.id"
              [title]="cat.description"
            >{{ cat.label }}</button>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 gap-2">
        @for (preset of visiblePresets(); track preset.id) {
          <button
            type="button"
            (click)="applyPreset(preset)"
            class="w-full text-left p-3.5 rounded-lg bg-kitty-bg hover:bg-kitty-surface border border-kitty-border hover:border-kitty-primary/60 transition-colors group"
          >
            <div class="flex items-start gap-3">
              @if (preset.category === 'theme' && preset.config['background']) {
                <div
                  class="flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border border-kitty-border group-hover:border-kitty-primary/50 transition-colors flex flex-col"
                  [style.background]="getPresetColor(preset, 'background')"
                >
                  <div class="flex-1 grid place-items-center font-mono text-sm font-bold tracking-tight"
                       [style.color]="getPresetColor(preset, 'foreground')">
                    Aa
                  </div>
                  <div class="grid grid-cols-8 h-2">
                    @for (key of paletteKeys; track key) {
                      <div [style.background]="getPresetColor(preset, key)"></div>
                    }
                  </div>
                </div>
              }
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-kitty-text group-hover:text-kitty-primary transition-colors leading-tight">{{ preset.name }}</div>
                <p class="text-2xs leading-relaxed text-kitty-text-dim line-clamp-2 mt-0.5">{{ preset.description }}</p>
                @if (preset.tags && preset.tags.length > 0) {
                  <div class="flex gap-1 flex-wrap mt-1.5">
                    @for (tag of preset.tags.slice(0, 3); track tag) {
                      <span class="text-2xs px-1.5 py-0.5 rounded bg-kitty-surface-light text-kitty-text-dim border border-kitty-border">{{ tag }}</span>
                    }
                  </div>
                }
              </div>
            </div>
          </button>
        }
      </div>

      @if (hiddenPresetCount() > 0) {
        <button
          type="button"
          (click)="showAllPresets.set(!showAllPresets())"
          class="mt-3 w-full py-2.5 rounded-lg text-xs font-medium border border-kitty-border text-kitty-text-dim hover:text-kitty-text hover:border-kitty-primary/60 transition-colors"
          [attr.aria-expanded]="showAllPresets()"
        >
          @if (showAllPresets()) {
            Show fewer
          } @else {
            Show {{ hiddenPresetCount() }} more
          }
        </button>
      }
    </div>
  `,
})
export class PresetSelectorComponent {
	private readonly presetsService = inject(PresetsService);
	private readonly configStore = inject(ConfigStoreService);

	readonly categories = this.presetsService.getCategories();
	readonly selectedCategory = signal<ConfigPreset["category"]>("theme");

	readonly filteredPresets = computed(() =>
		this.presetsService.getPresetsByCategory(this.selectedCategory()),
	);

	readonly showAllPresets = signal(false);

	/**
	 * The themes list runs to 47 entries. It used to sit in its own scroll box
	 * inside the already-scrolling editor, so the wheel would move the inner list
	 * until it bottomed out and only then the page. Showing a first page and
	 * expanding on request keeps one scrollbar on screen.
	 */
	readonly visiblePresets = computed(() => {
		const presets = this.filteredPresets();
		return this.showAllPresets() ? presets : presets.slice(0, PRESET_PAGE_SIZE);
	});

	readonly hiddenPresetCount = computed(() =>
		Math.max(0, this.filteredPresets().length - PRESET_PAGE_SIZE),
	);

	selectCategory(id: ConfigPreset["category"]): void {
		this.selectedCategory.set(id);
		this.showAllPresets.set(false);
	}

	readonly paletteKeys: readonly string[] = [
		"color1",
		"color2",
		"color3",
		"color4",
		"color5",
		"color6",
		"color11",
		"color14",
	];

	applyPreset(preset: ConfigPreset): void {
		const next = structuredClone(
			this.configStore.configState(),
		) as unknown as Record<string, unknown>;

		// Themes are the only category that wipes the palette before applying, so
		// switching between two themes doesn't leak the previous one's stray colors.
		// Every other category (performance, minimal, gaming, feature-rich) layers
		// additively on top of whatever the user already configured.
		// Theme presets fully replace any palette-derived fields. Reset the
		// colors slice plus every tab bar / border / url color back to Kitty
		// defaults BEFORE applying the preset's keys, so a previous theme's
		// value never leaks through fields the new theme stayed silent on.
		if (preset.category === "theme") {
			next["colors"] = structuredClone(DEFAULT_KITTY_CONFIG.colors);

			const tabBarSlice = next["tab_bar"] as Record<string, unknown>;
			const defaultTabBar = DEFAULT_KITTY_CONFIG.tab_bar as unknown as Record<
				string,
				unknown
			>;
			for (const key of TAB_BAR_COLOR_KEYS) {
				tabBarSlice[key] = defaultTabBar[key];
			}

			// biome-ignore lint/complexity/useLiteralKeys: Requires index access on Record<string, unknown>
			(next["window_layout"] as Record<string, unknown>)[
				"active_border_color"
			] = DEFAULT_KITTY_CONFIG.window_layout.active_border_color;
			// biome-ignore lint/complexity/useLiteralKeys: Requires index access on Record<string, unknown>
			(next["mouse"] as Record<string, unknown>)["url_color"] =
				DEFAULT_KITTY_CONFIG.mouse.url_color;
		}

		for (const [key, value] of Object.entries(preset.config)) {
			if (value === undefined) continue;
			const section = sectionFor(key);
			if (!section) continue;
			(next[section] as Record<string, unknown>)[key] = value;
		}

		this.configStore.loadConfig(next as unknown as KittyConfigAST);

		// If the preset stayed silent on tab bar colors, derive them from the
		// resulting palette so we never end up with a previous preset's tab
		// text on a new theme's bar (which is the "broken / black" look).
		const presetSetsTabColors = Object.keys(preset.config).some((k) =>
			TAB_BAR_COLOR_KEYS.has(k),
		);
		if (!presetSetsTabColors) {
			this.configStore.syncTabBarFromPalette();
		}
	}

	getPresetColor(preset: ConfigPreset, key: string): string {
		const value = preset.config[key];
		return typeof value === "string" ? value : "#000000";
	}
}
