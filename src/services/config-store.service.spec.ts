import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_KITTY_CONFIG } from "../models/kitty-defaults";
import { CONFIG_CATEGORIES, ConfigStoreService } from "./config-store.service";

describe("ConfigStoreService", () => {
	beforeEach(() => {
		localStorage.clear();
		TestBed.resetTestingModule();
	});

	function store(): ConfigStoreService {
		return TestBed.inject(ConfigStoreService);
	}

	it("starts from Kitty's defaults with nothing stored", () => {
		expect(store().configState()).toEqual(DEFAULT_KITTY_CONFIG);
		expect(store().restoredFromStorage()).toBe(false);
	});

	it("updates a single field without disturbing its neighbours", () => {
		const service = store();
		service.updateField("fonts", "font_size", 15);

		expect(service.configState().fonts.font_size).toBe(15);
		expect(service.configState().fonts.font_family).toBe(
			DEFAULT_KITTY_CONFIG.fonts.font_family,
		);
	});

	it("ignores a category the editor cannot render", () => {
		// The editor switches on this with no fallback branch, so an unknown value
		// would leave the pane empty with nothing to explain why.
		const service = store();
		service.setActiveCategory("colors");
		expect(service.activeCategory()).toBe("colors");

		service.setActiveCategory("a_category_that_never_existed");
		expect(service.activeCategory()).toBe("fonts");
	});

	it("accepts every category it advertises", () => {
		const service = store();
		for (const category of CONFIG_CATEGORIES) {
			service.setActiveCategory(category);
			expect(service.activeCategory()).toBe(category);
		}
	});

	it("rebuilds imported JSON rather than trusting it", () => {
		const service = store();

		expect(service.importFromJSON("{ not json")).toBe(false);
		expect(service.configState()).toEqual(DEFAULT_KITTY_CONFIG);

		expect(
			service.importFromJSON('{"fonts":{"font_size":18},"junk":{"x":1}}'),
		).toBe(true);
		expect(service.configState().fonts.font_size).toBe(18);
		expect(service.configState()).not.toHaveProperty("junk");
		expect(service.configState().colors.background).toBe(
			DEFAULT_KITTY_CONFIG.colors.background,
		);
	});

	it("restores the palette sync flag when a preset is loaded", () => {
		const service = store();
		service.lockTabBarColors();
		expect(service.tabBarLocked()).toBe(true);

		service.loadConfig(structuredClone(DEFAULT_KITTY_CONFIG));
		expect(service.tabBarLocked()).toBe(false);
	});

	describe("keyboard shortcuts", () => {
		it("adds, edits and removes by position", () => {
			const service = store();

			service.addShortcut({ chord: "f1", action: "new_tab" });
			service.addShortcut({ chord: "f2", action: "new_window" });
			expect(service.configState().keyboard_shortcuts).toEqual([
				{ chord: "f1", action: "new_tab" },
				{ chord: "f2", action: "new_window" },
			]);

			service.updateShortcut(1, { chord: "f9" });
			expect(service.configState().keyboard_shortcuts[1]).toEqual({
				chord: "f9",
				action: "new_window",
			});

			service.removeShortcut(0);
			expect(service.configState().keyboard_shortcuts).toEqual([
				{ chord: "f9", action: "new_window" },
			]);
		});

		it("adds an empty row by default, for filling in by hand", () => {
			const service = store();
			service.addShortcut();

			expect(service.configState().keyboard_shortcuts).toEqual([
				{ chord: "", action: "" },
			]);
		});

		it("ignores edits and removals aimed at a row that is not there", () => {
			const service = store();
			service.addShortcut({ chord: "f1", action: "new_tab" });

			service.updateShortcut(7, { chord: "f2" });
			service.removeShortcut(7);

			expect(service.configState().keyboard_shortcuts).toEqual([
				{ chord: "f1", action: "new_tab" },
			]);
		});
	});

	it("clears stored work on reset", () => {
		const service = store();
		service.updateField("fonts", "font_size", 20);
		service.resetToDefaults();

		expect(service.configState()).toEqual(DEFAULT_KITTY_CONFIG);
		expect(localStorage.getItem("confitty-config")).toBeNull();
	});

	describe("history", () => {
		beforeEach(() => vi.useFakeTimers());
		afterEach(() => vi.useRealTimers());

		/** Past the coalescing window, so the next edit is a step of its own. */
		function pause(): void {
			vi.advanceTimersByTime(1000);
		}

		it("has nothing to undo before anything has been edited", () => {
			const service = store();
			expect(service.canUndo()).toBe(false);
			expect(service.canRedo()).toBe(false);

			service.undo();
			expect(service.configState()).toEqual(DEFAULT_KITTY_CONFIG);
		});

		it("walks an edit back and forward again", () => {
			const service = store();
			service.updateField("fonts", "font_size", 20);

			service.undo();
			expect(service.configState().fonts.font_size).toBe(
				DEFAULT_KITTY_CONFIG.fonts.font_size,
			);
			expect(service.canRedo()).toBe(true);

			service.redo();
			expect(service.configState().fonts.font_size).toBe(20);
		});

		it("collapses a slider drag into one step", () => {
			const service = store();
			for (const size of [12, 13, 14, 15, 16]) {
				service.updateField("fonts", "font_size", size);
				vi.advanceTimersByTime(50);
			}

			service.undo();

			// All the way back to the default, not to 15.
			expect(service.configState().fonts.font_size).toBe(
				DEFAULT_KITTY_CONFIG.fonts.font_size,
			);
			expect(service.canUndo()).toBe(false);
		});

		it("keeps a pause between edits to one field as separate steps", () => {
			const service = store();
			service.updateField("fonts", "font_size", 12);
			pause();
			service.updateField("fonts", "font_size", 18);

			service.undo();
			expect(service.configState().fonts.font_size).toBe(12);
		});

		it("keeps edits to different fields apart", () => {
			const service = store();
			service.updateField("fonts", "font_size", 20);
			service.updateField("cursor", "cursor_blink_interval", 2);

			service.undo();
			expect(service.configState().cursor.cursor_blink_interval).toBe(
				DEFAULT_KITTY_CONFIG.cursor.cursor_blink_interval,
			);
			expect(service.configState().fonts.font_size).toBe(20);
		});

		it("treats applying a preset as a single step", () => {
			const service = store();
			service.updateField("fonts", "font_size", 20);
			pause();

			// What the preset selector does: load, then derive the tab bar from the
			// palette that arrived with it.
			const preset = structuredClone(DEFAULT_KITTY_CONFIG);
			preset.colors.background = "#123456";
			service.loadConfig(preset);
			service.syncTabBarFromPalette();

			service.undo();
			expect(service.configState().colors.background).toBe(
				DEFAULT_KITTY_CONFIG.colors.background,
			);
			expect(service.configState().fonts.font_size).toBe(20);
		});

		it("restores the tab bar lock along with the config", () => {
			const service = store();
			// Picking a tab bar colour by hand freezes palette auto-sync.
			service.updateField("tab_bar", "active_tab_background", "#ff0000");
			expect(service.tabBarLocked()).toBe(true);
			pause();

			service.loadConfig(structuredClone(DEFAULT_KITTY_CONFIG));
			expect(service.tabBarLocked()).toBe(false);

			service.undo();
			expect(service.configState().tab_bar.active_tab_background).toBe("#ff0000");
			// Without this the next palette edit would overwrite the colour above.
			expect(service.tabBarLocked()).toBe(true);
		});

		it("drops the redone future once something new is edited", () => {
			const service = store();
			service.updateField("fonts", "font_size", 20);
			service.undo();
			expect(service.canRedo()).toBe(true);

			service.updateField("fonts", "font_size", 9);
			expect(service.canRedo()).toBe(false);
		});

		it("forgets the oldest steps rather than growing without limit", () => {
			const service = store();
			for (let i = 0; i < 70; i++) {
				service.updateField("scrollback", "scrollback_lines", 1000 + i);
				pause();
			}

			let steps = 0;
			while (service.canUndo() && steps < 200) {
				service.undo();
				steps++;
			}
			expect(steps).toBe(50);
		});

		it("leaves no step behind when an import is rejected", () => {
			const service = store();
			expect(service.importFromJSON("{ not json")).toBe(false);
			expect(service.canUndo()).toBe(false);
		});
	});
});
