import { computed, Injectable, inject, signal } from "@angular/core";
import { search } from "../search/search.engine";
import type { SearchableItem, SearchResult } from "../search/search.types";
import { ConfigStoreService } from "./config-store.service";

export type {
	SearchableItem,
	SearchMatch,
	SearchResult,
} from "../search/search.types";

const DEBOUNCE_MS = 150;

@Injectable({ providedIn: "root" })
export class SearchService {
	private readonly configStore = inject(ConfigStoreService);

	private readonly _query = signal("");
	private readonly _results = signal<SearchResult[]>([]);
	private debounceTimer: ReturnType<typeof setTimeout> | null = null;

	/**
	 * The index describes all 231 settings and is the largest module in the app.
	 * Most visits never search, so it is fetched on the first keystroke instead
	 * of riding along in the initial bundle. The promise is cached, so a burst of
	 * typing triggers one request.
	 */
	private index: Promise<readonly SearchableItem[]> | null = null;

	readonly query = this._query.asReadonly();
	readonly results = this._results.asReadonly();
	readonly isActive = computed(() => this._query().trim().length >= 2);

	search(query: string): void {
		this._query.set(query);

		if (this.debounceTimer) clearTimeout(this.debounceTimer);
		this.debounceTimer = setTimeout(() => {
			void this.run(query);
		}, DEBOUNCE_MS);
	}

	select(result: SearchResult): void {
		this.configStore.setActiveCategory(result.item.category);
		this.clear();
	}

	clear(): void {
		if (this.debounceTimer) clearTimeout(this.debounceTimer);
		this._query.set("");
		this._results.set([]);
	}

	private async run(query: string): Promise<void> {
		const index = await this.loadIndex();

		// A slow fetch can land after the box has been cleared or retyped; only
		// the query still on screen should produce results.
		if (this._query() !== query) return;
		this._results.set(search(index, query));
	}

	private loadIndex(): Promise<readonly SearchableItem[]> {
		this.index ??= import("../search/config-index").then(
			(module) => module.CONFIG_SEARCH_INDEX,
		);
		return this.index;
	}
}
