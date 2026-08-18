import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_KITTY_CONFIG } from "./models/kitty-defaults";
import type { KittyConfigAST } from "./models/kitty-types";
import { KittyGeneratorService } from "./services/kitty-generator.service";
import { KittyVersionService } from "./services/kitty-version.service";

/**
 * Picking an older Kitty is a promise that the exported file will load in it.
 * An option that release does not have has to arrive commented, carrying the
 * version that introduced it, rather than as a directive that release will
 * reject.
 */
describe("version gating", () => {
	let generator: KittyGeneratorService;
	let versions: KittyVersionService;

	beforeEach(() => {
		TestBed.resetTestingModule();
		generator = TestBed.inject(KittyGeneratorService);
		versions = TestBed.inject(KittyVersionService);
	});

	/** Every option in a section, paired with the section holding it. */
	const OPTIONS = Object.entries(
		DEFAULT_KITTY_CONFIG as unknown as Record<string, unknown>,
	).flatMap(([section, values]) =>
		values && typeof values === "object" && !Array.isArray(values)
			? Object.keys(values as Record<string, unknown>).map(
					(key) => [section, key] as const,
				)
			: [],
	);

	/** A different value of the same shape, so the option is written at all. */
	function moved(value: unknown): unknown {
		if (typeof value === "boolean") return !value;
		if (typeof value === "number") return value + 1;
		if (typeof value === "string") return value === "yes" ? "no" : `${value}x`;
		if (Array.isArray(value)) return [...value, "extra"];
		return value;
	}

	function everythingChanged(): KittyConfigAST {
		const config = structuredClone(DEFAULT_KITTY_CONFIG) as unknown as Record<
			string,
			Record<string, unknown>
		>;
		for (const [section, key] of OPTIONS) {
			const slice = config[section];
			if (slice) slice[key] = moved(slice[key]);
		}
		return config as unknown as KittyConfigAST;
	}

	/** Directives only: a commented line is the thing being checked for. */
	function liveDirectives(text: string): Set<string> {
		const keys = new Set<string>();
		for (const line of text.split("\n")) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const key = trimmed.split(/\s+/)[0];
			if (key) keys.add(key);
		}
		return keys;
	}

	it("has something to gate on, or the rest of this proves nothing", () => {
		const gated = OPTIONS.filter(([, key]) =>
			versions.getVersionRequirement(key),
		);
		expect(gated.length).toBeGreaterThan(5);
	});

	it.each(TestBed.inject(KittyVersionService).versions.map((v) => v.version))(
		"writes nothing Kitty %s would reject",
		(version) => {
			versions.setVersion(version);
			const text = generator.generateConfig(everythingChanged());
			const live = liveDirectives(text);

			const tooNew = OPTIONS.filter(([, key]) => {
				const requirement = versions.getVersionRequirement(key);
				return requirement && !versions.isOptionAvailable(key) && live.has(key);
			}).map(([, key]) => key);

			expect(tooNew).toEqual([]);
		},
	);

	/**
	 * Modelled so the editor can offer a control, but written as part of another
	 * directive rather than one of their own: `env read_from_shell` and
	 * `confirm_os_window_close N count-background`.
	 */
	const FOLDED_INTO_ANOTHER_LINE = new Set([
		"env_read_from_shell",
		"confirm_os_window_close_count_background",
	]);

	it("still writes the options that release does have", () => {
		versions.setVersion("0.48.0");
		const live = liveDirectives(generator.generateConfig(everythingChanged()));

		const missing = OPTIONS.filter(([, key]) => {
			if (FOLDED_INTO_ANOTHER_LINE.has(key)) return false;
			const requirement = versions.getVersionRequirement(key);
			return requirement && versions.isOptionAvailable(key) && !live.has(key);
		}).map(([, key]) => key);

		expect(missing).toEqual([]);
	});

	it("says which Kitty an option it held back needs", () => {
		versions.setVersion("0.15.0");
		const text = generator.generateConfig(everythingChanged());

		const gatedLines = text
			.split("\n")
			.filter((line) => line.includes("Requires Kitty >="));

		expect(gatedLines.length).toBeGreaterThan(0);
		for (const line of gatedLines) {
			expect(line.trim().startsWith("#")).toBe(true);
			expect(line).toMatch(/Requires Kitty >= \d+\.\d+/);
		}
	});
});
