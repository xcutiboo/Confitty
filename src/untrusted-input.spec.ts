import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { sanitizeConfig } from "./models/config-serialization";
import { DEFAULT_KITTY_CONFIG } from "./models/kitty-defaults";
import { ConfigStoreService } from "./services/config-store.service";

/**
 * Two doors take a config nobody here wrote: the JSON import, and whatever is
 * sitting in localStorage from a previous visit or another script on the
 * origin. Both are read straight into the object the whole app renders from.
 *
 * The sanitiser walks the keys of the defaults rather than the keys of the
 * input, so an unknown key has nothing to be copied into. These pin that down,
 * because the obvious refactor is to iterate the input instead and it would
 * look like a tidy-up.
 */
describe("configs from outside", () => {
	beforeEach(() => {
		localStorage.clear();
		TestBed.resetTestingModule();
	});
	afterEach(() => {
		localStorage.clear();
		// Proves a leak rather than carrying it into the next test.
		delete (Object.prototype as Record<string, unknown>)["polluted"];
	});

	const POLLUTING = [
		'{"__proto__":{"polluted":"yes"}}',
		'{"constructor":{"prototype":{"polluted":"yes"}}}',
		'{"fonts":{"__proto__":{"polluted":"yes"}}}',
		'{"fonts":{"constructor":{"prototype":{"polluted":"yes"}}}}',
		'{"__proto__":{"font_size":99}}',
	];

	it.each(POLLUTING)("does not let %s reach Object.prototype", (json) => {
		const store = TestBed.inject(ConfigStoreService);

		store.importFromJSON(json);

		expect(({} as Record<string, unknown>)["polluted"]).toBeUndefined();
		expect(({} as Record<string, unknown>)["font_size"]).toBeUndefined();
		expect(store.configState().fonts.font_size).toBe(
			DEFAULT_KITTY_CONFIG.fonts.font_size,
		);
	});

	it("keeps nothing the config does not already have a place for", () => {
		const sanitized = sanitizeConfig({
			fonts: { font_size: 14, not_a_real_option: "kept?" },
			also_not_a_section: { anything: 1 },
		}) as unknown as Record<string, Record<string, unknown>>;

		expect(sanitized["fonts"]?.["font_size"]).toBe(14);
		expect(sanitized["fonts"]?.["not_a_real_option"]).toBeUndefined();
		expect(sanitized["also_not_a_section"]).toBeUndefined();
	});

	it.each([
		["a string where a section goes", '{"fonts":"nope"}'],
		["a list where a section goes", '{"fonts":[1,2,3]}'],
		["null everywhere", '{"fonts":null,"colors":null}'],
		["a section of the wrong shape", '{"colors":{"color0":{"nested":true}}}'],
		["shortcuts that are not shortcuts", '{"keyboard_shortcuts":[1,"two",null]}'],
		["a number where a string goes", '{"fonts":{"font_family":42}}'],
		["a string where a number goes", '{"fonts":{"font_size":"big"}}'],
		["a config that is a list", "[1,2,3]"],
		["a config that is a string", '"hello"'],
		["a config that is null", "null"],
	])("survives %s with the shape intact", (_label, json) => {
		const store = TestBed.inject(ConfigStoreService);

		expect(() => store.importFromJSON(json)).not.toThrow();

		const config = store.configState() as unknown as Record<string, unknown>;
		const defaults = DEFAULT_KITTY_CONFIG as unknown as Record<string, unknown>;
		const wrong: string[] = [];
		for (const [section, expected] of Object.entries(defaults)) {
			const actual = config[section];
			if (Array.isArray(expected)) {
				if (!Array.isArray(actual)) wrong.push(section);
			} else if (typeof expected === "object" && expected !== null) {
				if (typeof actual !== "object" || actual === null || Array.isArray(actual)) {
					wrong.push(section);
				}
			} else if (typeof actual !== typeof expected) {
				wrong.push(section);
			}
		}

		expect(wrong).toEqual([]);
	});

	it("refuses a file that is not JSON without touching what is loaded", () => {
		const store = TestBed.inject(ConfigStoreService);
		store.updateField("fonts", "font_size", 17);

		expect(store.importFromJSON("this is not json")).toBe(false);
		expect(store.configState().fonts.font_size).toBe(17);
	});

	it("starts clean when localStorage holds something hostile", () => {
		// Any script on the origin can write here, and so can a person with the
		// console open.
		localStorage.setItem(
			"confitty-config",
			JSON.stringify({
				version: 1,
				config: { __proto__: { polluted: "yes" }, fonts: { font_size: 13 } },
			}),
		);

		const store = TestBed.inject(ConfigStoreService);

		expect(({} as Record<string, unknown>)["polluted"]).toBeUndefined();
		expect(typeof store.configState().fonts.font_size).toBe("number");
	});

	it("starts clean when localStorage holds nonsense", () => {
		localStorage.setItem("confitty-config", "{{{ not json");

		expect(() => TestBed.inject(ConfigStoreService)).not.toThrow();
		expect(TestBed.inject(ConfigStoreService).configState().fonts).toEqual(
			DEFAULT_KITTY_CONFIG.fonts,
		);
	});
});
