import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_KITTY_CONFIG } from "../models/kitty-defaults";
import type { KittyConfigAST } from "../models/kitty-types";
import { ConfigSharingService } from "./config-sharing.service";

const BASE = "https://confitty.app/";

describe("ConfigSharingService", () => {
	let sharing: ConfigSharingService;

	beforeEach(() => {
		TestBed.resetTestingModule();
		sharing = TestBed.inject(ConfigSharingService);
	});

	function edited(change: (config: KittyConfigAST) => void): KittyConfigAST {
		const config = structuredClone(DEFAULT_KITTY_CONFIG);
		change(config);
		return config;
	}

	async function roundTrip(config: KittyConfigAST): Promise<KittyConfigAST> {
		const link = await sharing.toLink(config, BASE);
		expect(link).not.toBeNull();
		const restored = await sharing.fromHash(new URL(link ?? "").hash);
		expect(restored).not.toBeNull();
		return restored as KittyConfigAST;
	}

	it("brings a config back out of its own link", async () => {
		const config = edited((c) => {
			c.fonts.font_family = "JetBrains Mono";
			c.fonts.font_size = 15;
			c.colors.background = "#101010";
			c.keyboard_shortcuts = [{ chord: "ctrl+shift+t", action: "new_tab" }];
		});

		expect(await roundTrip(config)).toEqual(config);
	});

	it("keeps the whole palette a theme wrote", async () => {
		const config = edited((c) => {
			for (let i = 0; i < 16; i++) {
				(c.colors as unknown as Record<string, string>)[`color${i}`] =
					`#${i.toString(16).repeat(6)}`;
			}
		});

		expect((await roundTrip(config)).colors).toEqual(config.colors);
	});

	it("puts the config in the fragment, where a server never sees it", async () => {
		const link =
			(await sharing.toLink(
				edited((c) => {
					c.fonts.font_size = 20;
				}),
				BASE,
			)) ?? "";

		const url = new URL(link);
		expect(url.search).toBe("");
		expect(url.pathname).toBe("/");
		expect(url.hash.startsWith("#c=")).toBe(true);
	});

	it("keeps a link short enough to paste", async () => {
		// Everything a theme touches plus a page of settings, which is the
		// heaviest thing anybody shares in practice.
		const config = edited((c) => {
			for (let i = 0; i < 16; i++) {
				(c.colors as unknown as Record<string, string>)[`color${i}`] =
					`#a${i.toString(16)}b1c2`;
			}
			c.colors.background = "#101010";
			c.colors.foreground = "#e0e0e0";
			c.fonts.font_family = "JetBrains Mono";
			c.fonts.font_size = 13;
			c.scrollback.scrollback_lines = 20000;
			c.keyboard_shortcuts = Array.from({ length: 10 }, (_, i) => ({
				chord: `ctrl+shift+f${i}`,
				action: `goto_tab ${i}`,
			}));
		});

		const link = (await sharing.toLink(config, BASE)) ?? "";
		expect(link.length).toBeLessThan(2000);
	});

	it("carries only what was changed", async () => {
		const untouched = (await sharing.toLink(DEFAULT_KITTY_CONFIG, BASE)) ?? "";
		const oneField =
			(await sharing.toLink(
				edited((c) => {
					c.fonts.font_size = 20;
				}),
				BASE,
			)) ?? "";

		expect(untouched.length).toBeLessThan(oneField.length);
		expect(await sharing.fromHash(new URL(untouched).hash)).toEqual(
			DEFAULT_KITTY_CONFIG,
		);
	});

	it.each([
		["no fragment at all", ""],
		["a fragment about something else", "#section=fonts"],
		["an empty payload", "#c="],
		["a payload that is not base64", "#c=1!!!!not base64!!!!"],
		["a payload cut in half", "#c=1eJyrVkrLz1eyUkq"],
		["a marker nobody wrote", "#c=9abcdef"],
		["base64 that is not a config", `#c=0${btoa("hello there")}`],
		["base64 of JSON that is not one", `#c=0${btoa('["a","b"]')}`],
	])("returns nothing for %s", async (_label, hash) => {
		expect(await sharing.fromHash(hash)).toBeNull();
	});

	it("sanitises a link the way it sanitises an imported file", async () => {
		// A link is written by somebody else, so it gets no more trust than a file.
		const hostile = btoa(
			JSON.stringify({
				__proto__: { polluted: "yes" },
				fonts: { font_size: "enormous", not_an_option: 1 },
			}),
		);

		const restored = (await sharing.fromHash(`#c=0${hostile}`)) as unknown as {
			fonts: Record<string, unknown>;
		};

		expect(({} as Record<string, unknown>)["polluted"]).toBeUndefined();
		expect(typeof restored.fonts["font_size"]).toBe("number");
		expect(restored.fonts["not_an_option"]).toBeUndefined();
	});

	it("refuses a fragment far larger than any config", async () => {
		expect(await sharing.fromHash(`#c=0${"A".repeat(30_000)}`)).toBeNull();
	});
});
