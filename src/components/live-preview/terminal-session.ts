export interface PreviewTab {
	title: string;
	active: boolean;
}

export const PREVIEW_TABS: readonly PreviewTab[] = [
	{ title: "bash", active: true },
	{ title: "nvim", active: false },
	{ title: "git", active: false },
];

export type AnsiKey =
	| "color0"
	| "color1"
	| "color2"
	| "color3"
	| "color4"
	| "color5"
	| "color6"
	| "color7"
	| "color8"
	| "color9"
	| "color10"
	| "color11"
	| "color12"
	| "color13"
	| "color14"
	| "color15";

export interface Span {
	text: string;
	color?: AnsiKey | "fg";
	bold?: boolean;
	italic?: boolean;
	dim?: boolean;
	url?: boolean;
	selected?: boolean;
}

export interface Line {
	spans: Span[];
}

const fg = (text: string, opts: Partial<Span> = {}): Span => ({
	text,
	color: "fg",
	...opts,
});
const ansi = (
	text: string,
	color: AnsiKey,
	opts: Partial<Span> = {},
): Span => ({ text, color, ...opts });
const dim = (text: string, opts: Partial<Span> = {}): Span => ({
	text,
	color: "fg",
	dim: true,
	...opts,
});

const prompt = (path: string): Span[] => [
	ansi("user", "color2", { bold: true }),
	ansi("@", "color8"),
	ansi("kitty", "color6", { bold: true }),
	fg(" "),
	ansi(path, "color4", { bold: true }),
	fg(" "),
	ansi("❯", "color5", { bold: true }),
	fg(" "),
];

export const SAMPLE_SESSION: Line[] = [
	{
		spans: [
			...prompt("~/dotfiles"),
			ansi("ls", "color2", { bold: true }),
			fg(" -la"),
		],
	},
	{ spans: [dim("total 48")] },
	{
		spans: [
			ansi("drwxr-xr-x", "color4"),
			dim("   8 user  staff    256  Jul 14 09:23 "),
			ansi(".", "color4", { bold: true }),
		],
	},
	{
		spans: [
			ansi("drwxr-xr-x", "color4"),
			dim("  42 user  staff   1344  Jul 12 18:04 "),
			ansi("..", "color4", { bold: true }),
		],
	},
	{
		spans: [
			fg("-rw-r--r--"),
			dim("   1 user  staff    126  Jul 14 09:20 "),
			dim(".gitignore"),
		],
	},
	{
		spans: [
			fg("-rw-r--r--"),
			dim("   1 user  staff   2840  Jul 14 09:21 "),
			fg("README.md"),
		],
	},
	{
		spans: [
			ansi("drwxr-xr-x", "color4"),
			dim("   5 user  staff    160  Jul 14 09:22 "),
			ansi("kitty", "color4", { bold: true }),
		],
	},
	{
		spans: [
			ansi("-rwxr-xr-x", "color2"),
			dim("   1 user  staff    814  Jul 14 09:22 "),
			ansi("install.sh", "color2", { bold: true }),
		],
	},

	{
		spans: [
			...prompt("~/dotfiles"),
			ansi("git", "color2", { bold: true }),
			fg(" status -sb"),
		],
	},
	{
		spans: [
			ansi("## ", "color8"),
			ansi("main", "color5", { bold: true }),
			dim("..."),
			ansi("origin/main", "color5"),
			fg(" "),
			ansi("[ahead 1]", "color3"),
		],
	},
	{
		spans: [
			ansi(" M ", "color3", { bold: true }),
			fg("kitty/"),
			fg("kitty.conf", { selected: true }),
		],
	},
	{ spans: [ansi("?? ", "color1", { bold: true }), fg("kitty/themes/")] },

	{
		spans: [
			...prompt("~/dotfiles"),
			ansi("curl", "color2", { bold: true }),
			fg(" -sI "),
			fg("https://sw.kovidgoyal.net/kitty/", { url: true }),
			fg(" | head -1"),
		],
	},
	{ spans: [ansi("HTTP/2 200", "color2", { italic: true })] },

	{ spans: [ansi("┌─────────────┬───────────┐", "color8")] },
	{
		spans: [
			ansi("│ ", "color8"),
			ansi("font", "color6", { bold: true }),
			dim("        "),
			ansi("│ ", "color8"),
			ansi("JetBrains", "color3"),
			fg(" "),
			ansi("│", "color8"),
		],
	},
	{
		spans: [
			ansi("│ ", "color8"),
			ansi("ligatures", "color6", { bold: true }),
			fg("   "),
			ansi("│ ", "color8"),
			ansi("on", "color2"),
			dim("        "),
			ansi("│", "color8"),
		],
	},
	{ spans: [ansi("└─────────────┴───────────┘", "color8")] },
];
