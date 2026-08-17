#!/usr/bin/env node
/**
 * Injects deployment-only configuration before a production build, so none of
 * it lives in the repository.
 *
 *   CONFITTY_ADSENSE_CLIENT   publisher ID, ca-pub- followed by 16 digits
 *   CONFITTY_ADSENSE_SLOT     numeric ad unit ID
 *   CONFITTY_ADBLOCK_RECOVERY set to "1" to emit the Funding Choices tag
 *   CONFITTY_CF_ANALYTICS_TOKEN  Cloudflare Web Analytics beacon token
 *
 * Everything is optional and independent. With nothing set this is a no-op and
 * the build produces the same site a contributor gets: no ads, no analytics, no
 * third-party requests beyond the Ko-fi widget.
 *
 * Each write is idempotent, driven by markers, so running it twice or building
 * after a failed run cannot corrupt the source.
 */
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const ADS_TS = new URL("src/config/ads.ts", root);
const INDEX = new URL("src/index.html", root);
const ADS_TXT = new URL("src/ads.txt", root);

const HEAD_START = "<!-- deployment-tags:start -->";
const HEAD_END = "<!-- deployment-tags:end -->";

/**
 * Retries until there is a body to append to, because this runs in <head> and
 * on a cold load there is not one yet.
 */
const RECOVERY_PRESENCE_TAG =
	"<script>(function(){function s(){if(window.frames['googlefcPresent'])return;" +
	"if(!document.body){setTimeout(s,0);return;}" +
	"var f=document.createElement('iframe');f.name='googlefcPresent';" +
	"f.style.cssText='display:none;width:0;height:0;border:none;position:absolute;left:-1000px;top:-1000px;z-index:-1000';" +
	"document.body.appendChild(f);}s();})();</script>";

const client = (process.env["CONFITTY_ADSENSE_CLIENT"] ?? "").trim();
const slot = (process.env["CONFITTY_ADSENSE_SLOT"] ?? "").trim();
const recovery = (process.env["CONFITTY_ADBLOCK_RECOVERY"] ?? "").trim() === "1";
const beacon = (process.env["CONFITTY_CF_ANALYTICS_TOKEN"] ?? "").trim();

function fail(message) {
	console.error(`[site-config] ${message}`);
	process.exit(1);
}

if (client && !/^ca-pub-\d{16}$/.test(client)) {
	fail(`CONFITTY_ADSENSE_CLIENT must be ca-pub- plus 16 digits, got "${client}"`);
}
if (slot && !/^\d{6,}$/.test(slot)) {
	fail(`CONFITTY_ADSENSE_SLOT must be the numeric ad unit ID, got "${slot}"`);
}
if (Boolean(client) !== Boolean(slot)) {
	fail("set both CONFITTY_ADSENSE_CLIENT and CONFITTY_ADSENSE_SLOT, or neither");
}
if (recovery && !client) {
	fail("CONFITTY_ADBLOCK_RECOVERY needs CONFITTY_ADSENSE_CLIENT to identify the publisher");
}
if (beacon && !/^[a-f0-9]{16,}$/i.test(beacon)) {
	fail(`CONFITTY_CF_ANALYTICS_TOKEN must be the hex beacon token, got "${beacon}"`);
}

writeAdsConfig();
writeAdsTxt();
writeHeadTags();

const enabled = [
	client && `AdSense ${client} slot ${slot}`,
	recovery && "ad blocking recovery",
	beacon && "Cloudflare Web Analytics",
].filter(Boolean);

console.log(
	enabled.length
		? `[site-config] enabled: ${enabled.join(", ")}`
		: "[site-config] nothing configured; building a clean site",
);

function writeAdsConfig() {
	const source = readFileSync(ADS_TS, "utf8");
	const patched = source
		.replace(/export const ADSENSE_CLIENT = "[^"]*";/, `export const ADSENSE_CLIENT = "${client}";`)
		.replace(/export const ADSENSE_SLOT = "[^"]*";/, `export const ADSENSE_SLOT = "${slot}";`);

	if (patched === source && client) {
		fail("could not find the constants to replace in src/config/ads.ts");
	}
	writeFileSync(ADS_TS, patched);
}

/**
 * Authorized Digital Sellers. Google will not treat the inventory as authorised
 * without it, which costs advertiser spend, so it is written whenever a
 * publisher ID is present and removed when one is not.
 */
function writeAdsTxt() {
	if (!client) {
		// Always written, so the build always has the asset to copy, and always
		// present on the site, so a stale file from a previous configured build
		// cannot keep claiming an authorised seller that is no longer there.
		writeFileSync(ADS_TXT, "# No ad network configured for this build.\n");
		return;
	}
	const publisher = client.replace(/^ca-/, "");
	// f08c47fec0942fa0 is Google's certification authority ID, identical for
	// every publisher.
	writeFileSync(ADS_TXT, `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`);
}

function writeHeadTags() {
	const tags = [];

	if (recovery) {
		// Google's own ad blocking recovery, the only sanctioned way to ask a
		// visitor to allow ads. The message itself is authored in the AdSense
		// dashboard; this tag is what lets it appear, and reports blocker rates
		// even while the message is still a draft.
		tags.push(
			`<script async src="https://fundingchoicesmessages.google.com/i/${client.replace(/^ca-/, "")}?ers=1"></script>`,
		);
		// The loader above sits on every blocker's filter list, so in the one case
		// this feature exists for it never runs. This frame is the fallback signal:
		// inline, first-party, and therefore still executed, it publishes a named
		// window that Google's surviving code paths look for to tell "publisher is
		// tagged, message was suppressed" apart from "publisher never tagged". It
		// detects rather than disguises, which is what keeps it inside policy.
		tags.push(RECOVERY_PRESENCE_TAG);
	}

	if (beacon) {
		tags.push(
			`<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${beacon}"}'></script>`,
		);
	}

	const html = readFileSync(INDEX, "utf8");
	const block = tags.length
		? `${HEAD_START}\n    ${tags.join("\n    ")}\n    ${HEAD_END}`
		: `${HEAD_START}${HEAD_END}`;

	const pattern = new RegExp(
		`${escapeRegExp(HEAD_START)}[\\s\\S]*?${escapeRegExp(HEAD_END)}`,
	);
	if (!pattern.test(html)) {
		fail("could not find the deployment-tags markers in src/index.html");
	}
	writeFileSync(INDEX, html.replace(pattern, block));
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
