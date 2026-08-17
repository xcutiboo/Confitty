/**
 * Collector for Content-Security-Policy violation reports.
 *
 * This exists because of a specific failure rather than as a matter of form.
 * Google's ad code calls ep1.adtrafficquality.google on every filled
 * impression; the policy did not allow it, the browser dropped the call, and
 * nothing anywhere said so. Ad fill quietly suffered and the only way to find
 * out was to open a console on a page that happened to be showing an ad.
 *
 * Google adds and moves those domains without announcing it, so this will
 * happen again. A count per directive and host turns the next one into a number
 * somebody can look at.
 *
 * Reports arrive from browsers with no credentials and no CORS, so the body is
 * entirely attacker-controlled. Nothing here trusts it: the shape is bounded
 * before anything is stored, and the whole day lives in one key so no amount of
 * invented hostnames can grow the store.
 */

/** Long enough to notice a slow regression, short enough to stay small. */
const RETENTION_SECONDS = 30 * 86400;

/** Past this many distinct violations in a day, the rest are counted as "other". */
const MAX_ENTRIES = 40;

/** Reports are small; anything larger is not one. */
const MAX_BODY_BYTES = 16 * 1024;

const DIRECTIVE = /^[a-z-]{1,32}$/;
const HOST = /^[a-z0-9.-]{1,64}$/;

export async function onRequest(context) {
	const { request } = context;

	// Anything unhandled falls through to the single-page app's catch-all and
	// answers a probe of this endpoint with a page of HTML.
	if (request.method !== "POST") {
		return new Response(null, { status: 405, headers: { allow: "POST" } });
	}

	// Always 204, whatever happened. A browser gets nothing useful from the
	// outcome, and an error here must never become a visible failure.
	try {
		await record(context);
	} catch {
		// Deliberately silent: see above.
	}
	return new Response(null, { status: 204 });
}

async function record(context) {
	const { request, env } = context;
	const kv = env.CONFITTY_METRICS;
	if (!kv) return;

	const text = await request.text();
	if (text.length > MAX_BODY_BYTES) return;

	const violation = parse(JSON.parse(text));
	if (!violation) return;

	const day = new Date().toISOString().slice(0, 10);
	const key = `csp:${day}`;
	const counts = JSON.parse((await kv.get(key)) || "{}");

	// Once the day is full, further violations still register as a total so a
	// flood is visible, but they stop adding keys.
	const field =
		counts[violation] === undefined && Object.keys(counts).length >= MAX_ENTRIES
			? "other"
			: violation;
	counts[field] = (counts[field] || 0) + 1;

	await kv.put(key, JSON.stringify(counts), {
		expirationTtl: RETENTION_SECONDS,
	});
}

/**
 * Returns "directive host", or null for anything that does not look like a
 * report. Both shapes are handled: report-uri posts a single object under
 * `csp-report`, report-to posts an array of typed reports.
 */
function parse(payload) {
	const report = Array.isArray(payload)
		? payload.find((entry) => entry?.type === "csp-violation")?.body
		: payload?.["csp-report"];
	if (!report) return null;

	const directive = String(
		report["effective-directive"] ?? report.effectiveDirective ?? "",
	).split(" ")[0];
	if (!DIRECTIVE.test(directive)) return null;

	const blocked = String(report["blocked-uri"] ?? report.blockedURL ?? "");
	// Chrome reports "inline", "eval" and "data" without a scheme for the cases
	// that have no URL to report, and those are worth keeping as they are.
	const host = blocked.includes("://") ? hostOf(blocked) : blocked;
	if (!host || !HOST.test(host)) return null;

	return `${directive} ${host}`;
}

function hostOf(value) {
	try {
		return new URL(value).hostname;
	} catch {
		return null;
	}
}
