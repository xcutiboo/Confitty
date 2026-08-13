import { DEFAULT_KITTY_CONFIG } from "./kitty-defaults";
import type { KittyConfigAST, KittyKeyMap, KittyMouseMap } from "./kitty-types";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
	return (
		isRecord(value) && Object.values(value).every((v) => typeof v === "string")
	);
}

/**
 * Arrays are homogeneous in the model, so the first default entry types the
 * rest. Every numeric array in the model ships a non-empty default, so an empty
 * default can only be a string array.
 */
function sanitizeArray(incoming: unknown, fallback: readonly unknown[]): unknown[] {
	if (!Array.isArray(incoming)) return [...fallback];
	const sample = fallback[0];
	const expected = sample === undefined ? "string" : typeof sample;
	return incoming.filter((v) => typeof v === expected);
}

function sanitizeField(incoming: unknown, fallback: unknown): unknown {
	if (Array.isArray(fallback)) return sanitizeArray(incoming, fallback);
	if (isRecord(fallback)) {
		return isStringRecord(incoming) ? { ...incoming } : { ...fallback };
	}
	return typeof incoming === typeof fallback && incoming !== null
		? incoming
		: fallback;
}

function sanitizeKeyMaps(incoming: unknown): KittyKeyMap[] {
	if (!Array.isArray(incoming)) return [];
	return incoming.filter(
		(entry): entry is KittyKeyMap =>
			isRecord(entry) &&
			typeof entry["chord"] === "string" &&
			typeof entry["action"] === "string",
	);
}

function sanitizeMouseMaps(incoming: unknown): KittyMouseMap[] {
	if (!Array.isArray(incoming)) return [];
	return incoming.filter(
		(entry): entry is KittyMouseMap =>
			isRecord(entry) &&
			typeof entry["button"] === "string" &&
			typeof entry["event"] === "string" &&
			typeof entry["modes"] === "string" &&
			typeof entry["action"] === "string",
	);
}

/**
 * Rebuild a config from untrusted JSON, whether restored session state or a
 * pasted export, by layering recognised values over the defaults.
 *
 * Merging onto a complete default rather than validating and rejecting means
 * the result always has every section and field, so a truncated or hostile
 * payload degrades to defaults instead of crashing templates that read
 * `configState().colors.foreground` and friends.
 *
 * Enum-typed fields are accepted as any string, matching how the kitty.conf
 * importer treats them; the generator only ever writes them back out verbatim.
 */
export function sanitizeConfig(input: unknown): KittyConfigAST {
	const result = structuredClone(DEFAULT_KITTY_CONFIG);
	if (!isRecord(input)) return result;

	for (const sectionName of Object.keys(result) as (keyof KittyConfigAST)[]) {
		const defaults = result[sectionName];
		const incoming = input[sectionName];

		if (sectionName === "keyboard_shortcuts") {
			result.keyboard_shortcuts = sanitizeKeyMaps(incoming);
		} else if (sectionName === "mouse_mappings") {
			result.mouse_mappings = sanitizeMouseMaps(incoming);
		} else if (Array.isArray(defaults)) {
			result.unrecognized_directives = sanitizeArray(
				incoming,
				defaults,
			) as string[];
		} else if (isRecord(defaults)) {
			if (!isRecord(incoming)) continue;
			for (const field of Object.keys(defaults)) {
				defaults[field] = sanitizeField(incoming[field], defaults[field]);
			}
		} else if (typeof incoming === typeof defaults) {
			result[sectionName] = incoming as never;
		}
	}

	return result;
}
