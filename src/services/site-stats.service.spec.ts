import { describe, expect, it } from "vitest";
import { formatCount } from "./site-stats.service";

describe("formatCount", () => {
	it("leaves small numbers alone", () => {
		expect(formatCount(0)).toBe("0");
		expect(formatCount(999)).toBe("999");
	});

	it("drops a trailing zero rather than showing 1.0k", () => {
		expect(formatCount(1000)).toBe("1k");
		expect(formatCount(1_000_000)).toBe("1M");
	});

	it("keeps one decimal where it carries information", () => {
		expect(formatCount(1500)).toBe("1.5k");
		expect(formatCount(2_400_000)).toBe("2.4M");
	});

	it("promotes to the next unit rather than showing 1000k", () => {
		expect(formatCount(999_999)).toBe("1M");
		expect(formatCount(1_000_001)).toBe("1M");
	});
});
