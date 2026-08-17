import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { DEFAULT_KITTY_CONFIG } from "../models/kitty-defaults";
import { KITTY_OPTION_NAMES } from "../models/kitty-option-names";
import type { KittyConfigAST } from "../models/kitty-types";
import { KittyGeneratorService } from "./kitty-generator.service";
import { KittyVersionService } from "./kitty-version.service";

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

/**
 * A value that differs from the default, so the diffing generator is forced to
 * write the option out. Types follow the model, not guesswork.
 */
function nudge(value: unknown): unknown {
	if (typeof value === "boolean") return !value;
	if (typeof value === "number") return value + 1;
	if (typeof value === "string") return value === "zzz" ? "yyy" : "zzz";
	if (Array.isArray(value)) {
		return value.length > 0 && typeof value[0] === "number" ? [1, 2] : ["zzz"];
	}
	if (value && typeof value === "object") return { CONFITTY_PROBE: "1" };
	return value;
}

/** Every option set away from its default, so nothing is skipped as unchanged. */
function everythingChanged(): KittyConfigAST {
	const config = structuredClone(DEFAULT_KITTY_CONFIG);
	for (const section of SECTIONS) {
		const values = config[section] as unknown as Record<string, unknown>;
		for (const key of Object.keys(values)) {
			values[key] = nudge(values[key]);
		}
	}
	return config;
}

/** The option name a generated line declares, ignoring comments and blanks. */
function directiveNames(output: string): string[] {
	return output
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0 && !line.startsWith("#"))
		.map((line) => line.split(/\s+/)[0] as string);
}

describe("generated kitty.conf conformance", () => {
	it("writes only option names Kitty accepts", () => {
		// Target the newest release so nothing is filtered out by the version gate.
		TestBed.inject(KittyVersionService).setVersion("0.48.0");
		const output = TestBed.inject(KittyGeneratorService).generateConfig(
			everythingChanged(),
		);

		const emitted = directiveNames(output);
		expect(emitted.length).toBeGreaterThan(150);

		const unknown = [...new Set(emitted)].filter(
			(name) => !KITTY_OPTION_NAMES.has(name),
		);
		expect(unknown).toEqual([]);
	});

	it("models no option Kitty does not have", () => {
		const invented = SECTIONS.flatMap((section) =>
			Object.keys(DEFAULT_KITTY_CONFIG[section]).filter(
				(key) =>
					!KITTY_OPTION_NAMES.has(key) &&
					// Modelled for the UI, written as a suffix on another directive.
					key !== "confirm_os_window_close_count_background" &&
					// Written as `env read_from_shell`, not as its own option.
					key !== "env_read_from_shell",
			),
		);

		expect(invented).toEqual([]);
	});

	it("emits nothing at all for an untouched config", () => {
		const output = TestBed.inject(KittyGeneratorService).generateConfig(
			structuredClone(DEFAULT_KITTY_CONFIG),
		);

		expect(directiveNames(output)).toEqual([]);
	});
});
