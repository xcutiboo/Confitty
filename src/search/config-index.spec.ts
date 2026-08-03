import { describe, expect, it } from "vitest";
import { DEFAULT_KITTY_CONFIG } from "../models/kitty-defaults";
import type { KittyConfigAST } from "../models/kitty-types";
import { CONFIG_SEARCH_INDEX } from "./config-index";

const SECTIONS = [
	"fonts",
	"cursor",
	"scrollback",
	"mouse",
	"performance",
	"bell",
	"window_layout",
	"tab_bar",
	"colors",
	"advanced",
	"os_specific",
] as const satisfies readonly (keyof KittyConfigAST)[];

/** Every option the app models, mapped to the section it lives in. */
const MODELLED = new Map<string, string>(
	SECTIONS.flatMap((section) =>
		Object.keys(DEFAULT_KITTY_CONFIG[section]).map(
			(key) => [key, section] as const,
		),
	),
);

describe("CONFIG_SEARCH_INDEX", () => {
	it("indexes every modelled option", () => {
		const indexed = new Set(CONFIG_SEARCH_INDEX.map((item) => item.key));
		const missing = [...MODELLED.keys()].filter((key) => !indexed.has(key));

		expect(missing).toEqual([]);
	});

	it("has no entry for an option that does not exist", () => {
		const ghosts = CONFIG_SEARCH_INDEX.filter(
			(item) => !MODELLED.has(item.key),
		).map((item) => item.key);

		expect(ghosts).toEqual([]);
	});

	it("files every entry under the section that actually holds it", () => {
		// Selecting a result navigates by category, so a wrong one lands the user
		// in a form that does not contain the setting they searched for.
		const misfiled = CONFIG_SEARCH_INDEX.filter(
			(item) => MODELLED.get(item.key) !== item.category,
		).map((item) => `${item.key}: indexed=${item.category}`);

		expect(misfiled).toEqual([]);
	});

	it("has no duplicate keys", () => {
		const seen = new Set<string>();
		const duplicates = CONFIG_SEARCH_INDEX.filter(
			(item) => seen.size === seen.add(item.key).size,
		).map((item) => item.key);

		expect(duplicates).toEqual([]);
	});

	it("gives every entry a label and a description", () => {
		const incomplete = CONFIG_SEARCH_INDEX.filter(
			(item) => !item.label?.trim() || !item.description?.trim(),
		).map((item) => item.key);

		expect(incomplete).toEqual([]);
	});
});
