#!/usr/bin/env node
/**
 * Writes the AdSense identifiers from the environment into src/config/ads.ts
 * just before a build, so they never live in the repository.
 *
 * Set CONFITTY_ADSENSE_CLIENT and CONFITTY_ADSENSE_SLOT in the Cloudflare build
 * environment. With either unset this is a no-op and the build serves no ads,
 * which is what every local and CI build should do.
 */
import { readFileSync, writeFileSync } from "node:fs";

const TARGET = new URL("../src/config/ads.ts", import.meta.url);

const client = (process.env.CONFITTY_ADSENSE_CLIENT ?? "").trim();
const slot = (process.env.CONFITTY_ADSENSE_SLOT ?? "").trim();

if (!client && !slot) {
	console.log("[ads] no AdSense environment set; building without ads");
	process.exit(0);
}

if (!/^ca-pub-\d{16}$/.test(client)) {
	console.error(
		`[ads] CONFITTY_ADSENSE_CLIENT must look like ca-pub- followed by 16 digits, got "${client}"`,
	);
	process.exit(1);
}

if (!/^\d{6,}$/.test(slot)) {
	console.error(
		`[ads] CONFITTY_ADSENSE_SLOT must be the numeric ad unit ID, got "${slot}"`,
	);
	process.exit(1);
}

const source = readFileSync(TARGET, "utf8");
const patched = source
	.replace(/export const ADSENSE_CLIENT = "[^"]*";/, `export const ADSENSE_CLIENT = "${client}";`)
	.replace(/export const ADSENSE_SLOT = "[^"]*";/, `export const ADSENSE_SLOT = "${slot}";`);

if (patched === source) {
	console.error("[ads] could not find the constants to replace in src/config/ads.ts");
	process.exit(1);
}

writeFileSync(TARGET, patched);
console.log(`[ads] building with AdSense client ${client}, slot ${slot}`);
