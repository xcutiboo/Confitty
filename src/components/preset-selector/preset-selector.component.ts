import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { DEFAULT_KITTY_CONFIG } from "../../models/kitty-defaults";
import type { KittyConfigAST } from "../../models/kitty-types";
import { ConfigStoreService } from "../../services/config-store.service";
import {
	type ConfigPreset,
	type PresetSettingKey,
	PresetsService,
} from "../../services/presets.service";

/**
 * Where each option lives, derived from the defaults rather than hand-listed.
 * The hand-written map had to be updated every time an option was added, and
 * silently dropped any key it had not been told about: that is how the mark
 * colours and modify_font stopped applying from presets entirely.
 */
const KEY_TO_SECTION: ReadonlyMap<string, keyof KittyConfigAST> = new Map(
	Object.entries(DEFAULT_KITTY_CONFIG).flatMap(([section, value]) =>
		typeof value === "object" && value !== null && !Array.isArray(value)
			? Object.keys(value).map(
					(key) => [key, section as keyof KittyConfigAST] as const,
				)
			: [],
	),
);

/** Enough to browse without burying the settings form underneath. */
const PRESET_PAGE_SIZE = 6;

const TAB_BAR_COLOR_KEYS = new Set([
	"active_tab_background",
	"active_tab_foreground",
	"inactive_tab_background",
	"inactive_tab_foreground",
	"tab_bar_background",
]);

@Component({
	selector: "app-preset-selector",
	imports: [CommonModule],
	template: `
    <div class="px-4 sm:px-6 pt-4 sm:pt-5 pb-5 sm:pb-6">
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

	readonly paletteKeys: readonly PresetSettingKey[] = [
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

		// Themes replace a palette rather than adding to one, so every colour-ish
		// field resets to Kitty's default first. Without it, a field the incoming
		// theme says nothing about keeps the outgoing theme's value, which is what
		// produced tab bars with unreadable text. Every other category layers on
		// top of whatever the user already has.
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
			const section = KEY_TO_SECTION.get(key);
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

	getPresetColor(preset: ConfigPreset, key: PresetSettingKey): string {
		const value = preset.config[key];
		return typeof value === "string" ? value : "#000000";
	}
}
