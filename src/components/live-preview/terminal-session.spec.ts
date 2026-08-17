import { describe, expect, it } from "vitest";
import { cellWidthFor } from "./preview-metrics";
import {
	COMPACT_SESSION,
	SAMPLE_SESSION,
	sessionColumns,
} from "./terminal-session";

/**
 * 320px is the narrowest viewport worth supporting, and the preview pane loses
 * the surrounding padding, so this is what the session actually has to fit in.
 */
const NARROWEST_PANE_PX = 288;

/** 11pt, Kitty's default, is what the preview renders until the user changes it. */
const DEFAULT_FONT_PX = (11 * 96) / 72;

describe("preview sessions", () => {
	it("fits the compact session on the narrowest supported phone", () => {
		const cell = DEFAULT_FONT_PX * cellWidthFor("JetBrains Mono");
		const needed = sessionColumns(COMPACT_SESSION) * cell;

		expect(needed).toBeLessThanOrEqual(NARROWEST_PANE_PX);
	});

	it("keeps the compact session meaningfully narrower than the wide one", () => {
		// Without a real gap the two variants would swap back and forth across a
		// single pixel of resize, which is worse than either on its own.
		expect(sessionColumns(COMPACT_SESSION)).toBeLessThan(
			sessionColumns(SAMPLE_SESSION) * 0.75,
		);
	});

	it("demonstrates the same features in both sessions", () => {
		const featuresOf = (session: typeof SAMPLE_SESSION) => {
			const spans = session.flatMap((line) => line.spans);
			return {
				selection: spans.some((s) => s.selected),
				url: spans.some((s) => s.url),
				italic: spans.some((s) => s.italic),
				bold: spans.some((s) => s.bold),
				dim: spans.some((s) => s.dim),
				// A theme is judged on its palette, so the preview has to exercise
				// more than the two or three colours a bare prompt would touch.
				colours: new Set(spans.map((s) => s.color).filter(Boolean)).size,
			};
		};

		const wide = featuresOf(SAMPLE_SESSION);
		const compact = featuresOf(COMPACT_SESSION);

		expect(compact.selection).toBe(wide.selection);
		expect(compact.url).toBe(wide.url);
		expect(compact.italic).toBe(wide.italic);
		expect(compact.bold).toBe(wide.bold);
		expect(compact.dim).toBe(wide.dim);
		expect(compact.colours).toBeGreaterThanOrEqual(wide.colours - 1);
	});

	it("counts columns by character rather than UTF-16 unit", () => {
		// The prompt glyph is outside the BMP in some fonts and the box drawing
		// characters are multi-byte, so a naive .length overstates the width.
		expect(sessionColumns([{ spans: [{ text: "❯❯❯" }] }])).toBe(3);
	});
});
