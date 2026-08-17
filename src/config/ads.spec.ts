import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ADSENSE_CLIENT, ADSENSE_SLOT, adsEnabled } from "./ads";

const ROOT = process.cwd();

function read(...segments: string[]): string {
	return readFileSync(join(ROOT, ...segments), "utf8");
}

/**
 * The build rewrites these files in place from environment variables. That is
 * convenient and it is also exactly how a publisher ID or an analytics token
 * ends up in a commit by accident, so the checked-in copies are asserted empty
 * whatever a local build has left in the working tree.
 */
describe("deployment configuration", () => {
	it("keeps AdSense identifiers out of the repository", () => {
		const source = read("src", "config", "ads.ts");

		expect(source).toContain('export const ADSENSE_CLIENT = "";');
		expect(source).toContain('export const ADSENSE_SLOT = "";');

		const assigned = [...source.matchAll(/=\s*"([^"]+)"/g)].map((m) => m[1]);
		expect(assigned).toEqual([]);
	});

	it("keeps deployment tags out of index.html", () => {
		const html = read("src", "index.html");
		const block = /<!-- deployment-tags:start -->([\s\S]*?)<!-- deployment-tags:end -->/.exec(
			html,
		);

		expect(block, "the deployment-tags markers must exist").not.toBeNull();
		expect(block?.[1]?.trim()).toBe("");
	});

	it("is off unless both identifiers are supplied", () => {
		expect(ADSENSE_CLIENT).toBe("");
		expect(ADSENSE_SLOT).toBe("");
		expect(adsEnabled()).toBe(false);
	});
});
