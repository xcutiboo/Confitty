import { computed, effect, Injectable, inject, signal } from "@angular/core";
import { derivedFromPalette } from "../components/live-preview/tab-colors";
import { sanitizeConfig } from "../models/config-serialization";
import { DEFAULT_KITTY_CONFIG } from "../models/kitty-defaults";
import type { KittyConfigAST } from "../models/kitty-types";
import { ConfigPersistenceService } from "./config-persistence.service";
import { KittyGeneratorService } from "./kitty-generator.service";

/** Long enough to coalesce a burst of typing, short enough to survive a tab close. */
const PERSIST_DEBOUNCE_MS = 400;

/** Matches the `lg` breakpoint where the layout switches from overlay to split pane. */
const WIDE_VIEWPORT = "(min-width: 1024px)";

function wideViewportQuery(): MediaQueryList | null {
	return typeof globalThis.matchMedia === "function"
		? globalThis.matchMedia(WIDE_VIEWPORT)
		: null;
}

function isWideViewport(): boolean {
	return wideViewportQuery()?.matches ?? true;
}

@Injectable({ providedIn: "root" })
export class ConfigStoreService {
	private readonly generator = inject(KittyGeneratorService);
	private readonly persistence = inject(ConfigPersistenceService);

	/** True when the editor opened onto restored work rather than a clean slate. */
	private readonly _restoredFromStorage = signal<boolean>(false);
	private readonly _configState = signal<KittyConfigAST>(this.hydrate());
	private persistTimer: ReturnType<typeof setTimeout> | null = null;
	private readonly _searchQuery = signal<string>("");
	private readonly _activeCategory = signal<string>("fonts");
	private readonly _advancedMode = signal<boolean>(false);
	private readonly _sidebarOpen = signal<boolean>(false);
	// Preview is hidden by default on narrow viewports; users see the editor first.
	private readonly _wideViewport = signal<boolean>(isWideViewport());
	private readonly _previewVisible = signal<boolean>(isWideViewport());
	/** Set once the user toggles the preview, so resizing stops overriding them. */
	private previewChosenByUser = false;
	/** Becomes true the moment the Tab Bar form writes a color, freezes palette auto-sync. */
	private readonly _tabBarColorsCustomised = signal<boolean>(false);

	constructor() {
		// Without this the initial measurement sticks forever: shrinking a desktop
		// window past the breakpoint left the preview mounted as a full-screen
		// overlay covering the header, with only its own close button to escape.
		wideViewportQuery()?.addEventListener("change", (event) => {
			this._wideViewport.set(event.matches);
			if (!this.previewChosenByUser) this._previewVisible.set(event.matches);
			if (event.matches) this._sidebarOpen.set(false);
		});

		// Signals fire per keystroke, so coalesce before touching storage.
		effect(() => {
			const snapshot = this._configState();
			if (this.persistTimer) clearTimeout(this.persistTimer);
			this.persistTimer = setTimeout(
				() => this.persistence.save(snapshot),
				PERSIST_DEBOUNCE_MS,
			);
		});
	}

	private hydrate(): KittyConfigAST {
		const stored = this.persistence.load();
		if (!stored) return structuredClone(DEFAULT_KITTY_CONFIG);
		this._restoredFromStorage.set(true);
		return stored;
	}

	readonly configState = this._configState.asReadonly();
	readonly restoredFromStorage = this._restoredFromStorage.asReadonly();
	readonly searchQuery = this._searchQuery.asReadonly();
	readonly activeCategory = this._activeCategory.asReadonly();
	readonly advancedMode = this._advancedMode.asReadonly();
	readonly sidebarOpen = this._sidebarOpen.asReadonly();
	readonly previewVisible = this._previewVisible.asReadonly();
	readonly wideViewport = this._wideViewport.asReadonly();
	readonly tabBarLocked = this._tabBarColorsCustomised.asReadonly();

	readonly rawConfigText = computed(() =>
		this.generator.generateConfig(this._configState()),
	);

	updateSection<T extends keyof KittyConfigAST>(
		section: T,
		data: Partial<KittyConfigAST[T]>,
	): void {
		this._configState.update((state) => ({
			...state,
			[section]: { ...(state[section] as object), ...data },
		}));
		this.maybeSyncTabBar(section, Object.keys(data) as string[]);
	}

	updateField<
		T extends keyof KittyConfigAST,
		K extends keyof KittyConfigAST[T],
	>(section: T, field: K, value: KittyConfigAST[T][K]): void {
		this._configState.update((state) => ({
			...state,
			[section]: { ...(state[section] as object), [field]: value },
		}));
		this.maybeSyncTabBar(section, [field as string]);
	}

	setSearchQuery(query: string): void {
		this._searchQuery.set(query);
	}
	setActiveCategory(category: string): void {
		this._activeCategory.set(category);
	}
	toggleAdvancedMode(): void {
		this._advancedMode.update((v) => !v);
	}
	toggleSidebar(): void {
		this._sidebarOpen.update((v) => !v);
	}
	setSidebarOpen(open: boolean): void {
		this._sidebarOpen.set(open);
	}
	togglePreview(): void {
		this.previewChosenByUser = true;
		this._previewVisible.update((v) => !v);
	}
	setPreviewVisible(v: boolean): void {
		this.previewChosenByUser = true;
		this._previewVisible.set(v);
	}

	setKittyMod(value: string): void {
		this._configState.update((state) => ({ ...state, kitty_mod: value }));
	}

	loadConfig(config: KittyConfigAST): void {
		// A fresh preset is not a user customisation; re-enable palette auto-sync.
		this._tabBarColorsCustomised.set(false);
		this._configState.set(structuredClone(config));
	}

	resetToDefaults(): void {
		this._tabBarColorsCustomised.set(false);
		this._restoredFromStorage.set(false);
		this._configState.set(structuredClone(DEFAULT_KITTY_CONFIG));
		this.persistence.clear();
	}

	exportToJSON(): string {
		return JSON.stringify(this._configState(), null, 2);
	}

	/** Accepts arbitrary JSON; anything unrecognised falls back to the default. */
	importFromJSON(json: string): boolean {
		let parsed: unknown;
		try {
			parsed = JSON.parse(json);
		} catch {
			return false;
		}
		this._tabBarColorsCustomised.set(false);
		this._configState.set(sanitizeConfig(parsed));
		return true;
	}

	/**
	 * Re-derive tab bar colors from the palette and write them into the tab_bar
	 * section. Mirrors what the preview shows by default so the exported
	 * kitty.conf matches what the user sees.
	 */
	syncTabBarFromPalette(): void {
		const colors = this._configState().colors;
		const derived = derivedFromPalette(colors);
		this._configState.update((state) => ({
			...state,
			tab_bar: {
				...state.tab_bar,
				// 'none' tells the renderer to derive the bar bg from colors.background.
				// It also keeps tab_bar_background out of the exported kitty.conf when
				// the user hasn't pinned a custom value.
				tab_bar_background: "none",
				active_tab_background: derived.activeBg,
				active_tab_foreground: derived.activeFg,
				inactive_tab_background: derived.inactiveBg,
				inactive_tab_foreground: derived.inactiveFg,
			},
		}));
	}

	/** Tab Bar form calls this whenever the user types a color, freezing auto-sync. */
	lockTabBarColors(): void {
		this._tabBarColorsCustomised.set(true);
	}
	unlockTabBarColors(): void {
		this._tabBarColorsCustomised.set(false);
	}

	private maybeSyncTabBar(section: string, keys: readonly string[]): void {
		if (section === "tab_bar" && keys.some((k) => TAB_BAR_COLOR_KEYS.has(k))) {
			this._tabBarColorsCustomised.set(true);
			return;
		}
		if (section !== "colors" || this._tabBarColorsCustomised()) return;
		if (!keys.some((k) => PALETTE_TRIGGER_KEYS.has(k))) return;
		this.syncTabBarFromPalette();
	}
}

const TAB_BAR_COLOR_KEYS = new Set([
	"active_tab_background",
	"active_tab_foreground",
	"inactive_tab_background",
	"inactive_tab_foreground",
	"tab_bar_background",
]);

const PALETTE_TRIGGER_KEYS = new Set([
	"foreground",
	"background",
	"color0",
	"color1",
	"color2",
	"color3",
	"color4",
	"color5",
	"color6",
	"color7",
	"color8",
	"color9",
	"color10",
	"color11",
	"color12",
	"color13",
	"color14",
	"color15",
]);
