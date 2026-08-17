import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// cwd is the workspace root under the Angular test builder; import.meta.url
// arrives with Vite's /@fs prefix and is not a real path.
const ROOT = process.cwd();

/** Directories that are checked out with the project, rather than generated. */
const SCANNED = ["src", "docs", ".github"];
const ROOT_FILES = [
	"README.md",
	"CONTRIBUTING.md",
	"SECURITY.md",
	"CODE_OF_CONDUCT.md",
];
const EXTENSIONS = [".ts", ".md", ".html", ".yml"];

function walk(dir: string): string[] {
	let found: string[] = [];
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) {
			found = found.concat(walk(path));
		} else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) {
			found.push(path);
		}
	}
	return found;
}

function sourceFiles(): string[] {
	const fromDirs = SCANNED.flatMap((dir) => {
		const path = join(ROOT, dir);
		try {
			return walk(path);
		} catch {
			return [];
		}
	});
	const fromRoot = ROOT_FILES.map((name) => join(ROOT, name)).filter((path) => {
		try {
			return statSync(path).isFile();
		} catch {
			return false;
		}
	});
	return [...fromDirs, ...fromRoot].filter(
		(path) => !path.endsWith("prose.spec.ts"),
	);
}

function offenders(pattern: RegExp): string[] {
	return sourceFiles().flatMap((path) => {
		const lines = readFileSync(path, "utf8").split("\n");
		const hits: string[] = [];
		lines.forEach((line: string, index: number) => {
			if (pattern.test(line)) {
				hits.push(
					`${path.slice(ROOT.length + 1)}:${index + 1}: ${line.trim().slice(0, 80)}`,
				);
			}
		});
		return hits;
	});
}

describe("prose", () => {
	it("finds files to check", () => {
		expect(sourceFiles().length).toBeGreaterThan(20);
	});

	it("uses no em dashes", () => {
		// House style: a comma, semicolon, colon, brackets or a new sentence.
		expect(offenders(/—/)).toEqual([]);
	});

	it("has no placeholder comments left in", () => {
		// A TODO with no owner and no issue is a note to nobody.
		expect(offenders(/\b(?:TODO|FIXME|XXX|HACK)\b(?!\w)/)).toEqual([]);
	});
});
