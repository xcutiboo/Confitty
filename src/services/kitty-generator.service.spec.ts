import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { DEFAULT_KITTY_CONFIG } from "../models/kitty-defaults";
import type { KittyConfigAST } from "../models/kitty-types";
import { KittyGeneratorService } from "./kitty-generator.service";

function configWith(patch: (config: KittyConfigAST) => void): KittyConfigAST {
	const config = structuredClone(DEFAULT_KITTY_CONFIG);
	patch(config);
	return config;
}

function directives(output: string): string[] {
	return output
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0 && !line.startsWith("#"));
}

describe("KittyGeneratorService", () => {
	function generator(): KittyGeneratorService {
		return TestBed.inject(KittyGeneratorService);
	}

	it("emits no directives for an unmodified config", () => {
		const output = generator().generateConfig(
			structuredClone(DEFAULT_KITTY_CONFIG),
		);

		expect(directives(output)).toEqual([]);
	});

	it("is deterministic across repeated calls", () => {
		const config = configWith((c) => {
			c.fonts.font_size = 13;
		});

		expect(generator().generateConfig(config)).toBe(
			generator().generateConfig(config),
		);
	});

	it("emits only values that differ from Kitty defaults", () => {
		const output = generator().generateConfig(
			configWith((c) => {
				c.fonts.font_size = 13;
				c.cursor.cursor_shape = "beam";
			}),
		);

		expect(directives(output)).toEqual(["font_size 13", "cursor_shape beam"]);
	});

	it("renders booleans as yes/no", () => {
		const output = generator().generateConfig(
			configWith((c) => {
				c.mouse.detect_urls = !DEFAULT_KITTY_CONFIG.mouse.detect_urls;
			}),
		);

		expect(directives(output)).toContain(
			`detect_urls ${DEFAULT_KITTY_CONFIG.mouse.detect_urls ? "no" : "yes"}`,
		);
	});

	it("repeats multi-value keys on their own lines", () => {
		const output = generator().generateConfig(
			configWith((c) => {
				c.fonts.symbol_map = [
					"U+E0A0-U+E0A3 PowerlineSymbols",
					"U+F000-U+F00F NerdFont",
				];
			}),
		);

		expect(directives(output)).toEqual([
			"symbol_map U+E0A0-U+E0A3 PowerlineSymbols",
			"symbol_map U+F000-U+F00F NerdFont",
		]);
	});

	it("joins comma-separated keys on one line", () => {
		const output = generator().generateConfig(
			configWith((c) => {
				c.window_layout.enabled_layouts = ["Tall", "Grid"];
			}),
		);

		expect(directives(output)).toContain("enabled_layouts Tall,Grid");
	});

	it("quotes values whose leading or trailing space is significant", () => {
		const output = generator().generateConfig(
			configWith((c) => {
				c.tab_bar.tab_separator = " | ";
			}),
		);

		expect(directives(output)).toContain('tab_separator " | "');
	});

	it("folds confirm_os_window_close_count_background into a single directive", () => {
		const output = generator().generateConfig(
			configWith((c) => {
				c.window_layout.confirm_os_window_close = 2;
				c.window_layout.confirm_os_window_close_count_background = true;
			}),
		);

		expect(directives(output)).toEqual([
			"confirm_os_window_close 2 count-background",
		]);
	});

	it("emits env entries one directive per variable", () => {
		const output = generator().generateConfig(
			configWith((c) => {
				c.advanced.env = { EDITOR: "nvim", PAGER: "less" };
			}),
		);

		expect(directives(output)).toEqual(["env EDITOR=nvim", "env PAGER=less"]);
	});

	it("preserves unrecognised directives verbatim", () => {
		const output = generator().generateConfig(
			configWith((c) => {
				c.unrecognized_directives = [
					"include ./themes/current.conf",
					"map f1 launch --type=tab",
				];
			}),
		);

		expect(directives(output)).toEqual([
			"include ./themes/current.conf",
			"map f1 launch --type=tab",
		]);
	});

	it("emits keyboard shortcuts and kitty_mod", () => {
		const output = generator().generateConfig(
			configWith((c) => {
				c.kitty_mod = "ctrl+alt";
				c.keyboard_shortcuts = [{ chord: "f1", action: "new_tab" }];
			}),
		);

		expect(directives(output)).toEqual(["kitty_mod ctrl+alt", "map f1 new_tab"]);
	});

	// Every key below was verified against kitty/options/definition.py upstream.
	describe("kitty.conf validity", () => {
		it("never emits confirm_os_window_close_count_background as its own directive", () => {
			const output = generator().generateConfig(
				configWith((c) => {
					c.window_layout.confirm_os_window_close_count_background = true;
				}),
			);

			expect(output).not.toContain("confirm_os_window_close_count_background");
		});

		it("comma-joins box_drawing_scale", () => {
			const output = generator().generateConfig(
				configWith((c) => {
					c.fonts.box_drawing_scale = [0.002, 1, 1.5, 2];
				}),
			);

			expect(directives(output)).toContain("box_drawing_scale 0.002,1,1.5,2");
		});

		it("comma-joins clone_source_strategies", () => {
			const output = generator().generateConfig(
				configWith((c) => {
					c.advanced.clone_source_strategies = ["venv", "path"];
				}),
			);

			expect(directives(output)).toContain("clone_source_strategies venv,path");
		});

		it("emits transparent_background_colors as one space-joined directive", () => {
			const output = generator().generateConfig(
				configWith((c) => {
					c.colors.transparent_background_colors = ["#ff0000@0.5", "#00ff00@0.3"];
				}),
			);

			// Kitty is not a multi-value option here: repeating it would keep only the last.
			expect(directives(output)).toEqual([
				"transparent_background_colors #ff0000@0.5 #00ff00@0.3",
			]);
		});

		it("space-joins clipboard_control", () => {
			const output = generator().generateConfig(
				configWith((c) => {
					c.advanced.clipboard_control = ["write-clipboard", "read-clipboard"];
				}),
			);

			expect(directives(output)).toContain(
				"clipboard_control write-clipboard read-clipboard",
			);
		});

		it("emits momentum_scroll as a unit float, not a boolean", () => {
			const output = generator().generateConfig(
				configWith((c) => {
					c.scrollback.momentum_scroll = 0.5;
				}),
			);

			expect(directives(output)).toContain("momentum_scroll 0.5");
		});

		it("emits show_hyperlink_targets as a modifier keyword, not a boolean", () => {
			const output = generator().generateConfig(
				configWith((c) => {
					c.mouse.show_hyperlink_targets = "ctrl";
				}),
			);

			expect(directives(output)).toContain("show_hyperlink_targets ctrl");
		});

		it("emits drag_threshold under its real Kitty name", () => {
			const output = generator().generateConfig(
				configWith((c) => {
					c.mouse.drag_threshold = 12;
				}),
			);

			expect(directives(output)).toEqual(["drag_threshold 12"]);
		});
	});

	it("omits empty arrays entirely", () => {
		const output = generator().generateConfig(
			configWith((c) => {
				c.fonts.font_features = [];
			}),
		);

		expect(directives(output)).toEqual([]);
	});
});
