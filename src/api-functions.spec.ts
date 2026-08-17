import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * The two Pages Functions are plain JavaScript and live outside src, so the
 * runner does not find them on its own. They are still the only code here that
 * faces the open internet: one takes a body written entirely by whoever is
 * calling, and both sit in front of a key-value store. Worth testing from here
 * rather than not at all.
 */
async function loadFunction(name: string) {
	const path = join(process.cwd(), "functions", "api", `${name}.js`);
	return import(pathToFileURL(path).href);
}

/** Enough of Workers KV to exercise the handlers, with the writes visible. */
function fakeKv() {
	const store = new Map<string, string>();
	return {
		store,
		get: async (key: string) => store.get(key) ?? null,
		put: async (key: string, value: string) => void store.set(key, value),
	};
}

function post(body: unknown, contentType = "application/csp-report") {
	return new Request("https://confitty.app/api/csp-report", {
		method: "POST",
		headers: { "content-type": contentType },
		body: typeof body === "string" ? body : JSON.stringify(body),
	});
}

const violation = (blocked: string, directive = "connect-src") => ({
	"csp-report": {
		"effective-directive": directive,
		"blocked-uri": blocked,
		"document-uri": "https://confitty.app/",
	},
});

describe("csp-report function", () => {
	let onRequest: (context: unknown) => Promise<Response>;

	beforeAll(async () => {
		({ onRequest } = await loadFunction("csp-report"));
	});

	it("refuses anything but POST, so a probe never falls through to the app", async () => {
		const response = await onRequest({
			request: new Request("https://confitty.app/api/csp-report"),
			env: {},
		});

		expect(response.status).toBe(405);
		expect(response.headers.get("allow")).toBe("POST");
	});

	it("counts a violation by directive and host", async () => {
		const kv = fakeKv();
		await onRequest({
			request: post(violation("https://ep1.adtrafficquality.google/getconfig")),
			env: { CONFITTY_METRICS: kv },
		});

		const [stored] = [...kv.store.values()];
		expect(JSON.parse(stored ?? "{}")).toEqual({
			"connect-src ep1.adtrafficquality.google": 1,
		});
	});

	it("reads the report-to shape as well as the report-uri one", async () => {
		const kv = fakeKv();
		await onRequest({
			request: post([
				{
					type: "csp-violation",
					body: {
						effectiveDirective: "frame-src",
						blockedURL: "https://ep2.adtrafficquality.google/sodar",
					},
				},
			]),
			env: { CONFITTY_METRICS: kv },
		});

		const [stored] = [...kv.store.values()];
		expect(JSON.parse(stored ?? "{}")).toEqual({
			"frame-src ep2.adtrafficquality.google": 1,
		});
	});

	it("keeps the keyword blocked-uri values that have no host", async () => {
		const kv = fakeKv();
		await onRequest({
			request: post(violation("inline", "script-src-elem")),
			env: { CONFITTY_METRICS: kv },
		});

		const [stored] = [...kv.store.values()];
		expect(JSON.parse(stored ?? "{}")).toEqual({ "script-src-elem inline": 1 });
	});

	// The values without a scheme skip URL parsing and reach the charset guard
	// directly, which is the only thing standing between a hand-written POST and
	// the key it would otherwise choose for itself.
	it.each([
		["a directive that is not one", violation("https://a.test", "'; DROP--")],
		["punctuation in a keyword value", violation("inline\nx: 1")],
		["a keyword value longer than the cap", violation("a".repeat(65))],
		["a body that is not a report", { hello: "world" }],
		["a body that is not JSON", "not json at all"],
	])("stores nothing for %s", async (_label, body) => {
		const kv = fakeKv();
		const response = await onRequest({
			request: post(body),
			env: { CONFITTY_METRICS: kv },
		});

		expect(response.status).toBe(204);
		expect(kv.store.size).toBe(0);
	});

	it("stops adding keys once the day is full but still counts the flood", async () => {
		const kv = fakeKv();
		const env = { CONFITTY_METRICS: kv };
		// One more than the cap, each a different host, so the last one overflows.
		for (let i = 0; i < 41; i++) {
			await onRequest({ request: post(violation(`https://h${i}.test`)), env });
		}

		const counts = JSON.parse([...kv.store.values()][0] ?? "{}");
		expect(Object.keys(counts)).toHaveLength(41);
		expect(counts["other"]).toBe(1);
		expect(counts["connect-src h40.test"]).toBeUndefined();
	});

	it("accepts the report and says nothing when no store is bound", async () => {
		const response = await onRequest({
			request: post(violation("https://a.test")),
			env: {},
		});

		expect(response.status).toBe(204);
	});
});

describe("stats function", () => {
	let onRequest: (context: unknown) => Promise<Response>;

	beforeAll(async () => {
		({ onRequest } = await loadFunction("stats"));
	});

	const get = (method = "GET") =>
		new Request("https://confitty.app/api/stats", {
			method,
			headers: { "cf-connecting-ip": "203.0.113.7", "user-agent": "test" },
		});

	it("hides the counter rather than erroring when no store is bound", async () => {
		const response = await onRequest({ request: get(), env: {} });

		expect(await response.json()).toEqual({ available: false });
	});

	it("counts a visitor once a day, however many times they come back", async () => {
		const kv = fakeKv();
		const env = { CONFITTY_METRICS: kv, CONFITTY_METRICS_SALT: "salt" };

		await onRequest({ request: get(), env });
		const second = await onRequest({ request: get(), env });

		expect(await second.json()).toEqual({ available: true, visitors: 1 });
	});

	it("answers HEAD without a body and without counting the probe", async () => {
		const kv = fakeKv();
		const env = { CONFITTY_METRICS: kv, CONFITTY_METRICS_SALT: "salt" };

		const response = await onRequest({ request: get("HEAD"), env });

		expect(response.status).toBe(200);
		expect(response.body).toBeNull();
		expect([...kv.store.keys()]).toHaveLength(0);
	});

	it("rejects methods it does not answer", async () => {
		const response = await onRequest({ request: get("POST"), env: {} });

		expect(response.status).toBe(405);
		expect(response.headers.get("allow")).toBe("GET, HEAD");
	});
});
