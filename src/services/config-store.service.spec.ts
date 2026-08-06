import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";
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

	it("clears stored work on reset", () => {
		const service = store();
		service.updateField("fonts", "font_size", 20);
		service.resetToDefaults();

		expect(service.configState()).toEqual(DEFAULT_KITTY_CONFIG);
		expect(localStorage.getItem("confitty-config")).toBeNull();
	});
});
