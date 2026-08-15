import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./components/live-preview/color-utils";

/** WCAG 2.2 minimum contrast for body-sized text. */
const AA_BODY_TEXT = 4.5;

type Palette = Record<string, string>;

/**
 * Reads the design tokens straight out of the stylesheet, so this measures what
 * ships rather than a copy that can drift from it.
 */
function palettes(): { light: Palette; dark: Palette } {
	const css = readFileSync(
		join(process.cwd(), "src", "global_styles.css"),
		"utf8",
	);

	const read = (selector: string): Palette => {
		const block = new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(css);
		if (!block) throw new Error(`no ${selector} block in global_styles.css`);

		const tokens: Palette = {};
		for (const match of block[1]!.matchAll(
			/--kitty-([a-z-]+):\s*(\d+)\s+(\d+)\s+(\d+);/g,
		)) {
			const [, name, r, g, b] = match;
			tokens[name as string] = `#${[r, g, b]
				.map((value) => Number(value).toString(16).padStart(2, "0"))
				.join("")}`;
		}
		return tokens;
	};

	return { light: read(":root"), dark: read("\\.dark") };
}

/**
 * Pairs the UI actually renders. Keep this list honest: a token combination
 * used in a template but missing here is simply unchecked.
 */
const PAIRS: readonly [string, string][] = [
	["text", "surface"],
	["text", "bg"],
	["text", "darker"],
	["text-dim", "surface"],
	["text-dim", "bg"],
	["text-dim", "surface-light"],
	["primary", "surface"],
	["primary", "bg"],
	["accent", "surface"],
	["warning", "surface"],
	// The label on a filled primary button, which is the Export action.
	["dark", "primary"],
	["dark", "primary-hover"],
];

describe("design tokens", () => {
	const { light, dark } = palettes();

	it("defines the same tokens in both themes", () => {
		const missing = Object.keys(light).filter((name) => !(name in dark));
		expect(missing).toEqual([]);
	});

	for (const [themeName, theme] of [
		["light", light],
		["dark", dark],
	] as const) {
		it(`meets WCAG AA for body text in the ${themeName} theme`, () => {
			const failures = PAIRS.filter(([fg, bg]) => {
				const ratio = contrastRatio(theme[fg] as string, theme[bg] as string);
				return ratio === null || ratio < AA_BODY_TEXT;
			}).map(([fg, bg]) => {
				const ratio = contrastRatio(theme[fg] as string, theme[bg] as string);
				return `${fg} on ${bg}: ${ratio?.toFixed(2) ?? "unreadable"}`;
			});

			expect(failures).toEqual([]);
		});
	}
});
