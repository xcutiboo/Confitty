import { describe, expect, it } from "vitest";
import { sanitizeConfig } from "./config-serialization";
import { DEFAULT_KITTY_CONFIG } from "./kitty-defaults";

describe("sanitizeConfig", () => {
	it("falls back to defaults for values that are not objects", () => {
		for (const junk of [null, undefined, 0, "", "nope", [], true]) {
			expect(sanitizeConfig(junk)).toEqual(DEFAULT_KITTY_CONFIG);
		}
	});

	it("always returns a structurally complete config", () => {
		const result = sanitizeConfig({ fonts: { font_size: 14 } });

		expect(Object.keys(result).sort()).toEqual(
			Object.keys(DEFAULT_KITTY_CONFIG).sort(),
		);
		expect(Object.keys(result.colors).sort()).toEqual(
			Object.keys(DEFAULT_KITTY_CONFIG.colors).sort(),
		);
	});

	it("keeps recognised values", () => {
		const result = sanitizeConfig({
			fonts: { font_size: 15, font_family: "Iosevka" },
			cursor: { cursor_shape: "beam" },
			kitty_mod: "ctrl+alt",
		});

		expect(result.fonts.font_size).toBe(15);
		expect(result.fonts.font_family).toBe("Iosevka");
		expect(result.cursor.cursor_shape).toBe("beam");
		expect(result.kitty_mod).toBe("ctrl+alt");
	});

	it("rejects values of the wrong type", () => {
		const result = sanitizeConfig({
			fonts: { font_size: "enormous", font_family: 42 },
		});

		expect(result.fonts.font_size).toBe(DEFAULT_KITTY_CONFIG.fonts.font_size);
		expect(result.fonts.font_family).toBe(
			DEFAULT_KITTY_CONFIG.fonts.font_family,
		);
	});

	it("drops unknown fields and unknown sections", () => {
		const result = sanitizeConfig({
			fonts: { font_size: 15, not_a_real_option: "x" },
			not_a_real_section: { anything: 1 },
		});

		expect(result.fonts).not.toHaveProperty("not_a_real_option");
		expect(result).not.toHaveProperty("not_a_real_section");
		expect(result.fonts.font_size).toBe(15);
	});

	it("does not let a prototype-polluting payload through", () => {
		const result = sanitizeConfig(
			JSON.parse('{"__proto__": {"polluted": true}, "fonts": {"font_size": 12}}'),
		);

		expect(result.fonts.font_size).toBe(12);
		expect(({} as Record<string, unknown>)["polluted"]).toBeUndefined();
	});

	it("keeps only well-formed keyboard and mouse mappings", () => {
		const result = sanitizeConfig({
			keyboard_shortcuts: [
				{ chord: "f1", action: "new_tab" },
				{ chord: "f2" },
				"nonsense",
				null,
			],
			mouse_mappings: [
				{ button: "left", event: "click", modes: "ungrabbed", action: "x" },
				{ button: "left" },
			],
		});

		expect(result.keyboard_shortcuts).toEqual([
			{ chord: "f1", action: "new_tab" },
		]);
		expect(result.mouse_mappings).toEqual([
			{ button: "left", event: "click", modes: "ungrabbed", action: "x" },
		]);
	});

	it("filters array entries of the wrong type", () => {
		const result = sanitizeConfig({
			fonts: { symbol_map: ["U+E0A0 Powerline", 5, null, "U+F000 Nerd"] },
			unrecognized_directives: ["include a.conf", 7],
		});

		expect(result.fonts.symbol_map).toEqual([
			"U+E0A0 Powerline",
			"U+F000 Nerd",
		]);
		expect(result.unrecognized_directives).toEqual(["include a.conf"]);
	});

	it("accepts an env map of strings and rejects anything else", () => {
		expect(
			sanitizeConfig({ advanced: { env: { EDITOR: "nvim" } } }).advanced.env,
		).toEqual({ EDITOR: "nvim" });
		expect(
			sanitizeConfig({ advanced: { env: { EDITOR: 5 } } }).advanced.env,
		).toEqual(DEFAULT_KITTY_CONFIG.advanced.env);
	});

	it("round-trips a real config through JSON", () => {
		const source = structuredClone(DEFAULT_KITTY_CONFIG);
		source.fonts.font_size = 13;
		source.keyboard_shortcuts = [{ chord: "f5", action: "load_config_file" }];
		source.unrecognized_directives = ["include ./theme.conf"];

		expect(sanitizeConfig(JSON.parse(JSON.stringify(source)))).toEqual(source);
	});
});
