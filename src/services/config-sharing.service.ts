import { Injectable } from "@angular/core";
import { sanitizeConfig } from "../models/config-serialization";
import { DEFAULT_KITTY_CONFIG } from "../models/kitty-defaults";
import type { KittyConfigAST } from "../models/kitty-types";

/**
 * Puts a config in a link.
 *
 * It lives in the fragment rather than the query string, which means it is
 * never sent to the server: Cloudflare sees a request for "/" and nothing else,
 * and the config stays as private as it is in the editor. There is no store
 * behind this and no id to look up, so a link keeps working whatever happens
 * here.
 *
 * Only what differs from Kitty's defaults goes in, which is the same thing the
 * exported file contains and keeps the common link short.
 */

/** Marks how the payload was packed, so an old link still opens later. */
const RAW = "0";
const DEFLATE = "1";

/**
 * Roughly what a browser and a chat client will carry without truncating.
 * A config of every colour plus a page of settings comes to a fifth of this
 * compressed, so hitting it means something has gone wrong rather than
 * somebody being thorough.
 */
const MAX_ENCODED = 24_000;

@Injectable({ providedIn: "root" })
export class ConfigSharingService {
	/** Returns a full URL, or null when the config somehow will not fit one. */
	async toLink(config: KittyConfigAST, base: string): Promise<string | null> {
		const json = JSON.stringify(changedFrom(DEFAULT_KITTY_CONFIG, config));
		const bytes = new TextEncoder().encode(json);
		const packed = await deflate(bytes);

		const encoded = packed
			? DEFLATE + base64url(packed)
			: RAW + base64url(bytes);
		if (encoded.length > MAX_ENCODED) return null;

		const url = new URL(base);
		url.hash = `c=${encoded}`;
		return url.toString();
	}

	/**
	 * Reads a config out of a fragment. Everything it returns has been through
	 * the same sanitiser as an imported file, because a link is something
	 * somebody else wrote.
	 */
	async fromHash(hash: string): Promise<KittyConfigAST | null> {
		const encoded = /(?:^|[#&])c=([^&]+)/.exec(hash)?.[1];
		if (!encoded || encoded.length > MAX_ENCODED) return null;

		const [marker, ...rest] = encoded;
		const body = rest.join("");
		if (marker !== RAW && marker !== DEFLATE) return null;

		try {
			const bytes = unbase64url(body);
			const json =
				marker === DEFLATE ? await inflate(bytes) : new TextDecoder().decode(bytes);
			if (json === null) return null;

			const payload: unknown = JSON.parse(json);
			// The sanitiser answers a config for anything, including a list or a
			// number, by falling back to every default. Coming from a link that
			// would quietly replace the work already open with an empty config, so
			// anything not shaped like a config is treated as no link at all.
			if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
				return null;
			}
			return sanitizeConfig(payload);
		} catch {
			// A truncated or hand-edited link is not worth an error; the editor
			// simply opens on whatever was already there.
			return null;
		}
	}
}

/**
 * The fields that differ from the defaults, section by section. Lists are kept
 * whole or not at all: half a set of shortcuts is not a smaller set of them.
 */
function changedFrom(
	defaults: KittyConfigAST,
	config: KittyConfigAST,
): Record<string, unknown> {
	const base = defaults as unknown as Record<string, unknown>;
	const current = config as unknown as Record<string, unknown>;
	const changed: Record<string, unknown> = {};

	for (const [section, fallback] of Object.entries(base)) {
		const value = current[section];

		if (fallback && typeof fallback === "object" && !Array.isArray(fallback)) {
			const fields: Record<string, unknown> = {};
			for (const [key, original] of Object.entries(
				fallback as Record<string, unknown>,
			)) {
				const now = (value as Record<string, unknown> | undefined)?.[key];
				if (JSON.stringify(now) !== JSON.stringify(original)) fields[key] = now;
			}
			if (Object.keys(fields).length) changed[section] = fields;
			continue;
		}

		if (JSON.stringify(value) !== JSON.stringify(fallback)) {
			changed[section] = value;
		}
	}

	return changed;
}

/** Null when the browser has no CompressionStream; the caller stores it raw. */
async function deflate(bytes: Uint8Array): Promise<Uint8Array | null> {
	if (typeof globalThis.CompressionStream !== "function") return null;
	try {
		const stream = new Blob([bytes as BlobPart])
			.stream()
			.pipeThrough(new CompressionStream("deflate-raw"));
		return new Uint8Array(await new Response(stream).arrayBuffer());
	} catch {
		return null;
	}
}

async function inflate(bytes: Uint8Array): Promise<string | null> {
	if (typeof globalThis.DecompressionStream !== "function") return null;
	const stream = new Blob([bytes as BlobPart])
		.stream()
		.pipeThrough(new DecompressionStream("deflate-raw"));
	return new Response(stream).text();
}

/** Base64 that survives a URL: no padding, and none of + or /. */
function base64url(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unbase64url(value: string): Uint8Array {
	const padded = value.replace(/-/g, "+").replace(/_/g, "/");
	const binary = atob(padded);
	return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
