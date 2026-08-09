import { describe, expect, it } from "vitest";
import { contrastRatio, isDark, luminance, mix, rgba } from "./color-utils";

describe("color-utils", () => {
	describe("contrastRatio", () => {
		it("returns the extremes for black and white", () => {
			expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
			expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
		});

		it("does not depend on argument order", () => {
			expect(contrastRatio("#282a36", "#f8f8f2")).toBeCloseTo(
				contrastRatio("#f8f8f2", "#282a36") as number,
				10,
			);
		});

		it("matches the WCAG formula on known pairs", () => {
			// Values computed independently from the WCAG 2.2 relative-luminance
			// definition, not read back out of this implementation.
			expect(contrastRatio("#f8f8f2", "#282a36")).toBeCloseTo(13.3591, 3);
			expect(contrastRatio("#657b83", "#fdf6e3")).toBeCloseTo(4.1296, 3);
		});

		it("accepts shorthand hex", () => {
			expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 5);
		});

		it("returns null rather than a number it cannot justify", () => {
			expect(contrastRatio("not-a-colour", "#ffffff")).toBeNull();
			expect(contrastRatio("#ffffff", "")).toBeNull();
			expect(contrastRatio("#12345", "#ffffff")).toBeNull();
		});
	});

	describe("luminance", () => {
		it("bounds black and white", () => {
			expect(luminance("#000000")).toBeCloseTo(0, 5);
			expect(luminance("#ffffff")).toBeCloseTo(1, 5);
		});
	});

	describe("isDark", () => {
		it("classifies typical terminal backgrounds", () => {
			expect(isDark("#282a36")).toBe(true);
			expect(isDark("#fdf6e3")).toBe(false);
		});
	});

	describe("rgba", () => {
		it("expands hex to an rgba string", () => {
			expect(rgba("#ff0000", 0.5)).toBe("rgba(255, 0, 0, 0.5)");
		});

		it("passes non-hex values through untouched", () => {
			expect(rgba("none", 0.5)).toBe("none");
		});
	});

	describe("mix", () => {
		it("interpolates between two colours", () => {
			expect(mix("#000000", "#ffffff", 0.5)).toBe("#808080");
			expect(mix("#000000", "#ffffff", 0)).toBe("#000000");
			expect(mix("#000000", "#ffffff", 1)).toBe("#ffffff");
		});

		it("clamps out-of-range positions", () => {
			expect(mix("#000000", "#ffffff", -1)).toBe("#000000");
			expect(mix("#000000", "#ffffff", 2)).toBe("#ffffff");
		});
	});
});
