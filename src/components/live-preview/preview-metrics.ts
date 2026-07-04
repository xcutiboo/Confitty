/**
 * Shared constants for the live terminal preview.
 *
 * Numbers here trace back to Kitty's source: font metrics from fonts.c,
 * powerline geometry from screen.c + tab_bar.py, decoration thickness from
 * decorations.c. Tune one ratio here, every preview surface updates.
 */

export const FONT_SIZE_PT = { min: 6, max: 36 } as const;

/**
 * Per-font cell-height ratio. Kitty derives this from FreeType's
 * metrics.height (ascender minus descender plus line gap) of the active
 * font. We approximate by family because we can't query glyph metrics at
 * runtime without rendering a sprite atlas.
 *
 * Default fallback 1.25 sits between the tightest (Iosevka) and loosest
 * (JetBrains Mono) common monospace fonts.
 */
const LINE_HEIGHT_BY_FAMILY: Record<string, number> = {
	"JetBrains Mono": 1.3,
	"Cascadia Code": 1.24,
	"Cascadia Mono": 1.24,
	"Fira Code": 1.2,
	"Fira Mono": 1.2,
	"IBM Plex Mono": 1.3,
	Hack: 1.25,
	"Source Code Pro": 1.25,
	Iosevka: 1.2,
	"Iosevka Term": 1.2,
	Inconsolata: 1.22,
	Menlo: 1.21,
	Monaco: 1.3,
	Consolas: 1.2,
	"SF Mono": 1.21,
	"Ubuntu Mono": 1.15,
	"DejaVu Sans Mono": 1.2,
	"Liberation Mono": 1.2,
	"Roboto Mono": 1.32,
	"Anonymous Pro": 1.2,
	"Space Mono": 1.4,
	"PT Mono": 1.2,
	"Victor Mono": 1.3,
	"MonaspiceNe Nerd Font": 1.3,
	CommitMono: 1.2,
	"Geist Mono": 1.2,
	"Berkeley Mono": 1.2,
};

export const DEFAULT_LINE_HEIGHT = 1.25;

export function lineHeightFor(family: string): number {
	const trimmed = (family || "").trim();
	if (LINE_HEIGHT_BY_FAMILY[trimmed]) return LINE_HEIGHT_BY_FAMILY[trimmed];
	// Tolerate quoted/family-cascade strings: "JetBrains Mono", monospace
	const first = trimmed.replace(/^["']/, "").split(/[,"']/)[0]?.trim();
	if (first && LINE_HEIGHT_BY_FAMILY[first])
		return LINE_HEIGHT_BY_FAMILY[first];
	return DEFAULT_LINE_HEIGHT;
}

/**
 * Cell-width to em ratio (advance width / font-size). Same logic as
 * LINE_HEIGHT_BY_FAMILY: we approximate per-family because browsers don't
 * give us the glyph advance for free.
 */
const CELL_WIDTH_BY_FAMILY: Record<string, number> = {
	"JetBrains Mono": 0.6,
	"Cascadia Code": 0.55,
	"Cascadia Mono": 0.55,
	"Fira Code": 0.6,
	"Fira Mono": 0.6,
	"IBM Plex Mono": 0.6,
	Hack: 0.6,
	"Source Code Pro": 0.55,
	Iosevka: 0.5,
	"Iosevka Term": 0.5,
	Inconsolata: 0.51,
	Menlo: 0.6,
	Monaco: 0.6,
	Consolas: 0.55,
	"SF Mono": 0.6,
	"Ubuntu Mono": 0.5,
	"DejaVu Sans Mono": 0.61,
	"Liberation Mono": 0.6,
	"Roboto Mono": 0.6,
	"Anonymous Pro": 0.55,
	"Space Mono": 0.55,
	"PT Mono": 0.55,
	"Victor Mono": 0.55,
	CommitMono: 0.55,
	"Geist Mono": 0.6,
	"Berkeley Mono": 0.6,
};

export const DEFAULT_CELL_WIDTH = 0.6;

export function cellWidthFor(family: string): number {
	const trimmed = (family || "").trim();
	if (CELL_WIDTH_BY_FAMILY[trimmed]) return CELL_WIDTH_BY_FAMILY[trimmed];
	const first = trimmed.replace(/^["']/, "").split(/[,"']/)[0]?.trim();
	if (first && CELL_WIDTH_BY_FAMILY[first]) return CELL_WIDTH_BY_FAMILY[first];
	return DEFAULT_CELL_WIDTH;
}

/**
 * Powerline filled separator glyph SVG paths in a 1 x 1 viewBox.
 * Names refer to the Powerline codepoint they imitate.
 *
 *  - E0B0/E0B2: full pointed triangles
 *  - E0B4/E0B6: half-disc
 *  - E0B8 (lower-right) and E0BA (lower-left): diagonal slants for the
 *    bottom edge of a tab bar
 *  - E0BC (upper-left) and E0BE (upper-right): diagonal slants for the
 *    top edge of a tab bar
 */
export const POWERLINE_GLYPHS = {
	e0b0: "M0 0 L1 0.5 L0 1 Z",
	e0b2: "M1 0 L0 0.5 L1 1 Z",
	e0b4: "M0 0 Q1 0 1 0.5 Q1 1 0 1 Z",
	e0b6: "M1 0 Q0 0 0 0.5 Q0 1 1 1 Z",
	e0b8: "M1 0 L0 1 L1 1 Z",
	e0ba: "M0 0 L0 1 L1 1 Z",
	e0bc: "M0 0 L1 0 L0 1 Z",
	e0be: "M0 0 L1 0 L1 1 Z",
} as const;

/**
 * Thin separator stroke definitions. Used when two adjacent tabs share a
 * background color, so the filled glyph would render invisibly. These
 * stand in for the Powerline soft-separator codepoints (U+E0B1, U+E0B3,
 * U+E0B5, U+E0B9, U+E0BD).
 */
export const POWERLINE_SOFT = {
	angled: "M0.15 0 L0.85 0.5 L0.15 1",
	slanted: "M0.85 0 L0.15 1",
	round: "M0.3 0 Q0.85 0 0.85 0.5 Q0.85 1 0.3 1",
	slantTop: "M0.85 0 L0.15 1",
} as const;

/** macOS-style traffic light cluster. */
export const CHROME_LIGHTS = {
	size: 11,
	gap: 6,
	closeColor: "#ff5f57",
	minimizeColor: "#febc2e",
	maximizeColor: "#28c840",
} as const;

/** Checkerboard shown only when background_opacity < 1, signalling transparency. */
export const WALLPAPER = {
	base: "#1a1a1f",
	check: "#25252b",
	cellPx: 16,
} as const;

/** Kitty default tab_fade. */
export const DEFAULT_FADE_STEPS: readonly number[] = [0.25, 0.5, 0.75, 1];

/** Animation timings, in milliseconds. */
export const TIMINGS = {
	themeSwap: 200,
	blink: 500,
} as const;
