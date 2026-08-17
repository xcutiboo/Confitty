import { Injectable, signal } from "@angular/core";

interface StatsResponse {
	available?: boolean;
	visitors?: number;
}

/** Below this the number reads as "nobody comes here" and is worth hiding. */
const WORTH_SHOWING = 100;

@Injectable({ providedIn: "root" })
export class SiteStatsService {
	private readonly _visitors = signal<number | null>(null);
	private requested = false;

	/** Null until the count arrives, and stays null when there is nothing to show. */
	readonly visitors = this._visitors.asReadonly();

	/**
	 * Deliberately not called during bootstrap: the count is decoration, and
	 * competing with the editor's own work to render it would be the wrong
	 * trade. Nothing about the configuration is sent, only counted.
	 */
	async load(): Promise<void> {
		if (this.requested) return;
		this.requested = true;

		try {
			const response = await fetch("/api/stats", {
				headers: { accept: "application/json" },
			});
			if (!response.ok) return;

			const stats = (await response.json()) as StatsResponse;
			if (stats.available !== true) return;
			if (typeof stats.visitors !== "number" || !Number.isFinite(stats.visitors))
				return;
			if (stats.visitors < WORTH_SHOWING) return;

			this._visitors.set(stats.visitors);
		} catch {
			// A contributor running the app locally has no endpoint to answer this,
			// and neither does anyone behind a filter that eats the request. The
			// footer simply does not mention it.
		}
	}
}

/** Short forms, because the footer has room for about six characters. */
export function formatCount(value: number): string {
	if (value < 1_000) return String(Math.round(value));

	// Compared after rounding, not before, so 999,999 reads as 1M rather than
	// the 1000k that picking the tier first would produce.
	const millions = (value / 1_000_000).toFixed(1);
	if (Number(millions) >= 1) return `${millions.replace(/\.0$/, "")}M`;

	return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
}
