import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEARCHABLE_OPTION_COUNT } from "./models/kitty-defaults";
import { ColorThemesService } from "./services/color-themes.service";
import { PresetsService } from "./services/presets.service";

/**
 * The counts in the page metadata, the manifest and the README are marketing
 * copy that happens to be a factual claim about the code. They had already
 * drifted: two places said 231 settings, one said 230, and the truth was 230.
 * Anyone adding an option should be told to update the copy, by a failing test
 * rather than by a reader noticing.
 */
function read(...parts: string[]): string {
	return readFileSync(join(process.cwd(), ...parts), "utf8");
}

const SOURCES = [
	["page metadata", () => read("src", "index.html")],
	["web app manifest", () => read("src", "manifest.json")],
	["readme", () => read("README.md")],
] as const;

/**
 * What each claim looks like in prose. The qualifier is optional because the
 * copy varies: "230 settings", "47 built-in colour themes", "18 presets".
 */
const OPTIONS = /settings|kitty\.conf options|settings are indexed/;
const THEMES = /colou?r themes|themes/;
const PRESETS = /presets/;

/** Any run of digits being used as a count of the given thing. */
function claimedCounts(text: string, noun: RegExp): number[] {
	const qualifier = "(?:built-in |bundled |included )?";
	const pattern = new RegExp(
		`(\\d+)(?:\\+)?\\s+${qualifier}(?:${noun.source})`,
		"gi",
	);
	return [...text.matchAll(pattern)].map((m) => Number(m[1]));
}

describe("public claims match the code", () => {
	const themeCount = new ColorThemesService().themes.length;
	const presetCount = new PresetsService().getPresets().length;

	for (const [label, load] of SOURCES) {
		it(`states the real option count in the ${label}`, () => {
			for (const claim of claimedCounts(load(), OPTIONS)) {
				expect(claim, `"${claim} settings" in the ${label}`).toBe(
					SEARCHABLE_OPTION_COUNT,
				);
			}
		});

		it(`states the real theme count in the ${label}`, () => {
			for (const claim of claimedCounts(load(), THEMES)) {
				expect(claim, `"${claim} themes" in the ${label}`).toBe(themeCount);
			}
		});
	}

	it("states the real preset count in the readme", () => {
		for (const claim of claimedCounts(read("README.md"), PRESETS)) {
			expect(claim, `"${claim} presets" in the readme`).toBe(presetCount);
		}
	});

	it("finds the claims it is supposed to be checking", () => {
		// Without this the suite passes by matching nothing at all, which is how a
		// guard like this quietly stops guarding. It uses the same patterns as the
		// assertions above so the two cannot drift apart.
		expect(claimedCounts(read("src", "index.html"), OPTIONS).length).toBe(2);
		expect(claimedCounts(read("README.md"), THEMES).length).toBeGreaterThan(0);
		expect(claimedCounts(read("README.md"), PRESETS).length).toBeGreaterThan(0);
	});
});
