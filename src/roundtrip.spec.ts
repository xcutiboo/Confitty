import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_KITTY_CONFIG } from "./models/kitty-defaults";
import type { KittyConfigAST } from "./models/kitty-types";
import { ColorThemesService } from "./services/color-themes.service";
import { KittyGeneratorService } from "./services/kitty-generator.service";
import { KittyParserService } from "./services/kitty-parser.service";
import { PresetsService } from "./services/presets.service";

/**
 * Exporting then importing must give back what was exported. Anything that
 * survives generate but not parse is a setting somebody loses without being
 * told, which is the worst way for a config tool to be wrong.
 */
describe("export then import round trip", () => {
	let generator: KittyGeneratorService;
	let parser: KittyParserService;

	beforeEach(() => {
		TestBed.resetTestingModule();
		generator = TestBed.inject(KittyGeneratorService);
		parser = TestBed.inject(KittyParserService);
	});

	function roundTrip(config: KittyConfigAST): KittyConfigAST {
		return parser.parseConfig(generator.generateConfig(config));
	}

	/** Compares section by section so a failure names the setting, not the file. */
	function diff(before: KittyConfigAST, after: KittyConfigAST): string[] {
		const problems: string[] = [];
		for (const key of Object.keys(before) as (keyof KittyConfigAST)[]) {
			const a = JSON.stringify(before[key]);
			const b = JSON.stringify(after[key]);
			if (a !== b) problems.push(`${key}\n  exported: ${a}\n  imported: ${b}`);
		}
		return problems;
	}

	it("survives Kitty's defaults", () => {
		expect(diff(DEFAULT_KITTY_CONFIG, roundTrip(DEFAULT_KITTY_CONFIG))).toEqual(
			[],
		);
	});

	it("survives every built-in theme", () => {
		const themes = TestBed.inject(ColorThemesService).themes;
		const broken: string[] = [];

		for (const theme of themes) {
			const config = structuredClone(DEFAULT_KITTY_CONFIG);
			Object.assign(config.colors, theme.colors);
			const problems = diff(config, roundTrip(config));
			if (problems.length) broken.push(`${theme.name}: ${problems.join("; ")}`);
		}

		expect(broken).toEqual([]);
	});

	it("survives every preset", () => {
		// Presets are a flat map of Kitty keys, so route each to its section the
		// same way the preset selector does.
		const sectionOf = new Map<string, string>(
			Object.entries(DEFAULT_KITTY_CONFIG).flatMap(([section, value]) =>
				typeof value === "object" && value !== null && !Array.isArray(value)
					? Object.keys(value).map((key) => [key, section] as [string, string])
					: [],
			),
		);

		const presets = TestBed.inject(PresetsService).getPresets();
		const broken: string[] = [];

		for (const preset of presets) {
			const config = structuredClone(DEFAULT_KITTY_CONFIG);
			for (const [key, value] of Object.entries(preset.config)) {
				const section = sectionOf.get(key);
				if (!section) continue;
				(
					(config as unknown as Record<string, Record<string, unknown>>)[
						section
					] as Record<string, unknown>
				)[key] = value;
			}
			const problems = diff(config, roundTrip(config));
			if (problems.length) broken.push(`${preset.name}: ${problems.join("; ")}`);
		}

		expect(broken).toEqual([]);
	});

	it("is stable when run twice", () => {
		const once = roundTrip(DEFAULT_KITTY_CONFIG);
		const twice = roundTrip(once);
		expect(diff(once, twice)).toEqual([]);
	});

	/**
	 * A font is named by whoever made it, and a shortcut is whatever somebody
	 * typed. Both end up on a line where whitespace separates the key from the
	 * value and a hash starts a comment, so both can say something the format
	 * reads as structure.
	 */
	describe("values that mean something to the file format", () => {
		const AWKWARD: ReadonlyArray<readonly [string, string]> = [
			["a hash, which starts a comment", "Comic Mono #1"],
			["a trailing hash", "Mono #"],
			["leading whitespace", "  Mono"],
			["trailing whitespace", "Mono  "],
			["an equals sign", "Mono=Regular"],
			["a quote", 'Mono "Bold"'],
			["a backslash", "Mono\\Bold"],
			["something that looks like another setting", "Mono\nfont_size 99"],
			["a tab", "Mono\tBold"],
			["emoji", "Fira 🐱 Code"],
			["a colon", "Mono:style=Regular"],
		];

		/**
		 * A directive separates its key from its value with whitespace and cannot
		 * say how much of it was meant, so any run of it collapses to one space
		 * and the ends are trimmed. Kitty reads a file the same way. Everything
		 * else about the value has to survive.
		 */
		const asKittyReadsIt = (value: string) =>
			value.replace(/\s+/g, " ").trim();

		it.each(AWKWARD)("keeps a font family containing %s", (_label, family) => {
			const config = structuredClone(DEFAULT_KITTY_CONFIG);
			config.fonts.font_family = family;

			expect(roundTrip(config).fonts.font_family).toBe(asKittyReadsIt(family));
		});

		it.each(AWKWARD)("never lets %s forge another setting", (_label, family) => {
			const config = structuredClone(DEFAULT_KITTY_CONFIG);
			config.fonts.font_family = family;

			const after = roundTrip(config);

			// The newline case is the one that matters: a value carrying a line
			// break must not arrive as a second directive.
			expect(after.fonts.font_size).toBe(DEFAULT_KITTY_CONFIG.fonts.font_size);
		});

		it("keeps a mouse mapping", () => {
			const config = structuredClone(DEFAULT_KITTY_CONFIG);
			config.mouse_mappings = [
				{
					button: "left",
					event: "click",
					modes: "ungrabbed",
					action: "mouse_handle_click selection link prompt",
				},
			];

			expect(roundTrip(config).mouse_mappings).toEqual(config.mouse_mappings);
		});

		it("keeps environment variables", () => {
			// env is the one section written as several directives sharing a name,
			// which is a different path through both sides.
			const config = structuredClone(DEFAULT_KITTY_CONFIG);
			(config.advanced as unknown as Record<string, unknown>)["env"] = {
				EDITOR: "nvim",
				PATH_EXTRA: "/opt/bin",
			};

			const after = roundTrip(config).advanced as unknown as Record<
				string,
				unknown
			>;
			expect(after["env"]).toEqual({ EDITOR: "nvim", PATH_EXTRA: "/opt/bin" });
		});

		it("writes each setting once, whatever has been changed", () => {
			// Kitty keeps the last of a repeated directive, so a duplicate is a
			// setting that silently does something other than what the editor shows.
			const config = structuredClone(DEFAULT_KITTY_CONFIG) as unknown as Record<
				string,
				Record<string, unknown>
			>;
			for (const [section, values] of Object.entries(
				DEFAULT_KITTY_CONFIG as unknown as Record<string, unknown>,
			)) {
				if (!values || typeof values !== "object" || Array.isArray(values)) {
					continue;
				}
				for (const [key, value] of Object.entries(
					values as Record<string, unknown>,
				)) {
					const slice = config[section];
					if (!slice) continue;
					if (typeof value === "boolean") slice[key] = !value;
					else if (typeof value === "number") slice[key] = value + 1;
				}
			}

			// These are the directives Kitty expects more than one of.
			const REPEATABLE = new Set([
				"map",
				"mouse_map",
				"env",
				"symbol_map",
				"narrow_symbols",
				"font_features",
				"modify_font",
				"watcher",
				"exe_search_path",
				"menu_map",
				"action_alias",
				"remote_control_password",
			]);

			const counts = new Map<string, number>();
			for (const line of generator
				.generateConfig(config as unknown as KittyConfigAST)
				.split("\n")) {
				const trimmed = line.trim();
				if (!trimmed || trimmed.startsWith("#")) continue;
				const key = trimmed.split(/\s+/)[0];
				if (!key || REPEATABLE.has(key)) continue;
				counts.set(key, (counts.get(key) ?? 0) + 1);
			}

			expect([...counts].filter(([, times]) => times > 1)).toEqual([]);
		});

		it("keeps a shortcut whose action carries arguments and quotes", () => {
			const config = structuredClone(DEFAULT_KITTY_CONFIG);
			config.keyboard_shortcuts = [
				{ chord: "ctrl+shift+e", action: 'launch --type=tab --cwd="/tmp/a b"' },
				{ chord: "ctrl+shift+p>n", action: "new_tab" },
			];

			expect(roundTrip(config).keyboard_shortcuts).toEqual(
				config.keyboard_shortcuts,
			);
		});
	});
});
