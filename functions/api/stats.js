/**
 * Visit counter for the number shown in the footer.
 *
 * It stores two things: a set of one-way hashes so the same person is not
 * counted twice in a day, and a running total. No address, no user agent, no
 * cookie, and nothing about anyone's configuration, which is still built and
 * exported entirely in the browser.
 *
 * The hash is salted with a value that only exists in the deployment
 * environment, so the stored digests cannot be walked back to an address by
 * anyone holding the database, and each one expires after a day regardless.
 */

/**
 * KV allows one write per second per key, so a single counter would start
 * dropping increments the moment the site had a busy minute. Spreading the
 * total over a few keys and adding them up on read costs a handful of reads
 * and removes the ceiling.
 */
const SHARDS = 8;

/** Long enough to keep KV reads down, short enough that the number feels live. */
const CACHE_SECONDS = 60;

const DAY_SECONDS = 86400;

async function digest(value) {
	const bytes = new TextEncoder().encode(value);
	const hash = await crypto.subtle.digest("SHA-256", bytes);
	return [...new Uint8Array(hash)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function readTotal(kv) {
	const shards = await Promise.all(
		Array.from({ length: SHARDS }, (_, i) => kv.get(`total:${i}`)),
	);
	return shards.reduce((sum, value) => sum + (Number(value) || 0), 0);
}

/**
 * Read then write, which can lose a concurrent increment. That is the right
 * trade here: KV has no atomic counter, and a visit count is allowed to be
 * approximate in a way that, say, a billing total is not.
 */
async function increment(kv) {
	const shard = Math.floor(Math.random() * SHARDS);
	const key = `total:${shard}`;
	const current = Number(await kv.get(key)) || 0;
	await kv.put(key, String(current + 1));
}

/**
 * Handles every method rather than only GET, because anything left unhandled
 * falls through to the single-page app's catch-all rewrite and answers a probe
 * of this endpoint with a page of HTML.
 */
export async function onRequest(context) {
	const { request } = context;

	if (request.method === "HEAD") {
		const response = await respond(context, { count: false });
		return new Response(null, {
			status: response.status,
			headers: response.headers,
		});
	}
	if (request.method !== "GET") {
		return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
	}
	return respond(context, { count: true });
}

async function respond(context, { count }) {
	const { request, env } = context;
	const kv = env.CONFITTY_METRICS;

	// The site is fully usable without this, so an unconfigured binding should
	// hide the counter rather than surface an error to the visitor.
	if (!kv) {
		return Response.json(
			{ available: false },
			{ headers: { "cache-control": "public, max-age=300" } },
		);
	}

	const today = new Date().toISOString().slice(0, 10);
	const fingerprint = await digest(
		[
			env.CONFITTY_METRICS_SALT ?? "",
			request.headers.get("cf-connecting-ip") ?? "",
			request.headers.get("user-agent") ?? "",
			today,
		].join("|"),
	);

	const seenKey = `seen:${fingerprint}`;
	if (count && !(await kv.get(seenKey))) {
		await kv.put(seenKey, "1", { expirationTtl: DAY_SECONDS });
		await increment(kv);
	}

	return Response.json(
		{ available: true, visitors: await readTotal(kv) },
		{
			headers: {
				"cache-control": `public, max-age=${CACHE_SECONDS}`,
				"access-control-allow-origin": "https://confitty.app",
			},
		},
	);
}
