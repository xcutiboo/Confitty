import { describe, expect, it } from "vitest";
import { POWERLINE_GLYPHS, POWERLINE_SOFT } from "./preview-metrics";

/**
 * The preview draws Powerline separators as SVG rather than as glyphs, because
 * it cannot count on a patched font being installed. That means the shapes are
 * ours to get right, and getting one wrong is not obvious: the slanted
 * separator was drawing the complement of the triangle Kitty uses, which put
 * the tab's own colour on the far side of the slant and stranded a wedge of it
 * against the following tab.
 *
 * Kitty picks its separators in kitty/tab_bar.py:
 *
 *   powerline_symbols = {'slanted': ('', '╱'), 'round': ('', '')}
 *   ...                  default    ('', '')
 *
 * and for the slant tab bar style:
 *
 *   left_sep, right_sep = ('', '') if tab_bar_edge in ('top', 'left')
 *                    else ('', '')
 *
 * These pin the geometry to those codepoints. A triangle is named by the corner
 * region it fills, in a box whose origin is the top left.
 */
describe("powerline separator geometry", () => {
	/** The three corners of a filled triangle path, in order. */
	function corners(path: string): string {
		const numbers = path.match(/-?\d*\.?\d+/g) ?? [];
		const points: string[] = [];
		for (let i = 0; i + 1 < numbers.length; i += 2) {
			points.push(`${numbers[i]},${numbers[i + 1]}`);
		}
		return points.join(" ");
	}

	it.each([
		["e0b0", "right-pointing triangle", "0,0 1,0.5 0,1"],
		["e0b2", "left-pointing triangle", "1,0 0,0.5 1,1"],
		["e0b8", "lower left", "1,0 0,1 1,1"],
		["e0ba", "lower right", "0,0 0,1 1,1"],
		["e0bc", "upper left", "0,0 1,0 0,1"],
		["e0be", "upper right", "0,0 1,0 1,1"],
	])("draws %s as the %s shape", (name, _description, expected) => {
		expect(corners(POWERLINE_GLYPHS[name as keyof typeof POWERLINE_GLYPHS])).toBe(
			expected,
		);
	});

	it("gives the slanted soft separator the full height of its cell", () => {
		// U+2571 is a box-drawing diagonal, which runs corner to corner. The
		// chevron and arc it sits beside imitate Powerline glyphs, which do not.
		expect(POWERLINE_SOFT.slanted).toBe("M1 0 L0 1");
		expect(POWERLINE_SOFT.angled).toContain("0.15");
		expect(POWERLINE_SOFT.round).toContain("0.3");
	});

	it("has no separator shape nothing draws", () => {
		// A spare copy of the slant sat here unused for long enough to be
		// mistaken for the one in service.
		expect(Object.keys(POWERLINE_SOFT).sort()).toEqual([
			"angled",
			"round",
			"slanted",
		]);
	});
});
