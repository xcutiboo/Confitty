import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { DEFAULT_KITTY_CONFIG } from "../models/kitty-defaults";
import type { KittyConfigAST } from "../models/kitty-types";
import { type ConfigPreset, PresetsService } from "./presets.service";

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
 * Mirrors how PresetSelectorComponent resolves a flat preset key onto a
 * section. Both derive from the defaults, so a key that resolves here resolves
 * when a preset is applied.
 */
const KEY_TO_SECTION = new Map<string, string>(
	SECTIONS.flatMap((section) =>
		Object.keys(DEFAULT_KITTY_CONFIG[section]).map(
			(key) => [key, section] as const,
		),
	),
);

describe("PresetsService", () => {
	function presets(): ConfigPreset[] {
		return TestBed.inject(PresetsService).getPresets();
	}

	it("ships presets in every advertised category", () => {
		const service = TestBed.inject(PresetsService);
		for (const category of service.getCategories()) {
			expect(service.getPresetsByCategory(category.id).length).toBeGreaterThan(
				0,
			);
		}
	});

	it("sets only options that exist", () => {
		// A key with no section is skipped without a word when the preset is
		// applied, so the preset silently does less than it claims.
		const unresolved = presets().flatMap((preset) =>
			Object.keys(preset.config)
				.filter((key) => !KEY_TO_SECTION.has(key))
				.map((key) => `${preset.id}: ${key}`),
		);

		expect(unresolved).toEqual([]);
	});

	it("gives every preset an id, name and description", () => {
		const incomplete = presets()
			.filter(
				(preset) =>
					!preset.id?.trim() ||
					!preset.name?.trim() ||
					!preset.description?.trim(),
			)
			.map((preset) => preset.id ?? preset.name);

		expect(incomplete).toEqual([]);
	});

	it("has unique preset ids", () => {
		const seen = new Set<string>();
		const duplicates = presets()
			.filter((preset) => seen.size === seen.add(preset.id).size)
			.map((preset) => preset.id);

		expect(duplicates).toEqual([]);
	});

	it("uses well-formed colour values", () => {
		const bad = presets().flatMap((preset) =>
			Object.entries(preset.config)
				.filter(
					([key, value]) =>
						/^(color\d+|foreground|background|.*_(foreground|background|color))$/.test(
							key,
						) &&
						typeof value === "string" &&
						value !== "none" &&
						!/^#[0-9a-fA-F]{6}$/.test(value),
				)
				.map(([key, value]) => `${preset.id}: ${key}=${String(value)}`),
		);

		expect(bad).toEqual([]);
	});
});
