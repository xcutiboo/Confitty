import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { DEFAULT_KITTY_CONFIG } from "../models/kitty-defaults";
import { KittyGeneratorService } from "./kitty-generator.service";
import { KittyParserService } from "./kitty-parser.service";

describe("KittyParserService", () => {
	function parser(): KittyParserService {
		return TestBed.inject(KittyParserService);
	}

	it("returns the default config for an empty file", () => {
		expect(parser().parseConfig("")).toEqual(DEFAULT_KITTY_CONFIG);
	});

	it("ignores comments and blank lines", () => {
		const config = parser().parseConfig(
			"# a comment\n\n   \n# another\nfont_size 14\n",
		);

		expect(config.fonts.font_size).toBe(14);
	});

	it("parses scalar values into the right section", () => {
		const config = parser().parseConfig(
			["font_size 13.5", "cursor_shape beam", "scrollback_lines 5000"].join(
				"\n",
			),
		);

		expect(config.fonts.font_size).toBe(13.5);
		expect(config.cursor.cursor_shape).toBe("beam");
		expect(config.scrollback.scrollback_lines).toBe(5000);
	});

	it("parses yes/no as booleans", () => {
		const config = parser().parseConfig("detect_urls no\nsync_to_monitor yes");

		expect(config.mouse.detect_urls).toBe(false);
		expect(config.performance.sync_to_monitor).toBe(true);
	});

	it("joins backslash line continuations", () => {
		const config = parser().parseConfig("font_fam\\\nily JetBrains Mono");

		expect(config.fonts.font_family).toBe("JetBrains Mono");
	});

	it("collects repeated multi-value directives", () => {
		const config = parser().parseConfig(
			["symbol_map U+E0A0 Powerline", "symbol_map U+F000 NerdFont"].join("\n"),
		);

		expect(config.fonts.symbol_map).toEqual([
			"U+E0A0 Powerline",
			"U+F000 NerdFont",
		]);
	});

	it("parses keyboard and mouse maps", () => {
		const config = parser().parseConfig(
			["map ctrl+shift+t new_tab", "mouse_map left click ungrabbed mouse_click_url"].join(
				"\n",
			),
		);

		expect(config.keyboard_shortcuts).toEqual([
			{ chord: "ctrl+shift+t", action: "new_tab" },
		]);
		expect(config.mouse_mappings).toEqual([
			{
				button: "left",
				event: "click",
				modes: "ungrabbed",
				action: "mouse_click_url",
			},
		]);
	});

	it("preserves include directives verbatim", () => {
		const config = parser().parseConfig("include ./theme.conf\nfont_size 12");

		expect(config.unrecognized_directives).toContain("include ./theme.conf");
	});

	it("preserves directives it does not model", () => {
		const config = parser().parseConfig("some_future_option abc");

		expect(config.unrecognized_directives).toContain("some_future_option abc");
	});

	it("parses confirm_os_window_close with its count-background suffix", () => {
		const config = parser().parseConfig(
			"confirm_os_window_close 3 count-background",
		);

		expect(config.window_layout.confirm_os_window_close).toBe(3);
		expect(
			config.window_layout.confirm_os_window_close_count_background,
		).toBe(true);
	});

	it("parses momentum_scroll as a unit float and clamps out-of-range input", () => {
		expect(parser().parseConfig("momentum_scroll 0.4").scrollback.momentum_scroll).toBe(
			0.4,
		);
		expect(parser().parseConfig("momentum_scroll 5").scrollback.momentum_scroll).toBe(
			1,
		);
		expect(
			parser().parseConfig("momentum_scroll nonsense").scrollback.momentum_scroll,
		).toBe(DEFAULT_KITTY_CONFIG.scrollback.momentum_scroll);
	});

	it("parses drag_threshold into the mouse section", () => {
		expect(parser().parseConfig("drag_threshold 8").mouse.drag_threshold).toBe(8);
	});

	describe("round trip", () => {
		function roundTrip(source: string) {
			const first = parser().parseConfig(source);
			const emitted = TestBed.inject(KittyGeneratorService).generateConfig(first);
			return { first, second: parser().parseConfig(emitted) };
		}

		it("survives a generate/parse cycle unchanged", () => {
			const { first, second } = roundTrip(
				[
					"font_family JetBrains Mono",
					"font_size 13",
					"cursor_shape beam",
					"background #1e1e2e",
					"foreground #cdd6f4",
					"enabled_layouts Tall,Grid",
					"symbol_map U+E0A0 Powerline",
					"confirm_os_window_close 2 count-background",
					"map ctrl+shift+t new_tab",
					"include ./theme.conf",
				].join("\n"),
			);

			expect(second).toEqual(first);
		});

		it("keeps unmodelled directives across the cycle", () => {
			const { second } = roundTrip("kitten_alias hints hints --hints-offset=0");

			expect(second.unrecognized_directives).toContain(
				"kitten_alias hints hints --hints-offset=0",
			);
		});

		it("keeps options in prefix-routed namespaces that it does not model", () => {
			// Section routing matches on prefixes, so these would previously reach a
			// section parser, match no case, and be dropped without trace.
			const source = [
				"tab_something_new yes",
				"color200 #ff00ff",
				"macos_future_option 3",
				"font_unknown_thing abc",
			].join("\n");
			const { second } = roundTrip(source);

			for (const line of source.split("\n")) {
				expect(second.unrecognized_directives).toContain(line);
			}
		});

		it("does not resurrect option names Kitty never had", () => {
			// Older Confitty builds exported these; re-importing must not silently
			// reintroduce them as directives.
			const { second } = roundTrip(
				["startup_window maximized", "tab_bar_hide_path /private/"].join("\n"),
			);
			const emitted = TestBed.inject(KittyGeneratorService).generateConfig(second);

			expect(emitted).toContain("startup_window maximized");
			expect(emitted).toContain("tab_bar_hide_path /private/");
		});
	});
});
