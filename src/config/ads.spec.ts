import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ADSENSE_CLIENT, ADSENSE_SLOT, adsEnabled } from "./ads";

describe("ad configuration", () => {
	it("carries no account details in the repository", () => {
		// The prebuild script writes these from the environment. If a real ID ever
		// reaches a commit, this is what catches it: the checked-in file must be
		// the empty one, whatever the working copy currently holds after a build.
		const source = readFileSync(
			join(process.cwd(), "src", "config", "ads.ts"),
			"utf8",
		);

		expect(source).toContain('export const ADSENSE_CLIENT = "";');
		expect(source).toContain('export const ADSENSE_SLOT = "";');

		// Any assignment holding something is a real identifier that escaped.
		const assignments = [...source.matchAll(/=\s*"([^"]+)"/g)].map((m) => m[1]);
		expect(assignments).toEqual([]);
	});

	it("is off unless both identifiers are supplied", () => {
		expect(ADSENSE_CLIENT).toBe("");
		expect(ADSENSE_SLOT).toBe("");
		expect(adsEnabled()).toBe(false);
	});
});
