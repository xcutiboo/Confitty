import { Injectable, signal, computed } from '@angular/core';
import { ConfigStoreService } from './config-store.service';
import { search } from '../search/search.engine';
import { CONFIG_SEARCH_INDEX } from '../search/config-index';
import { SearchResult } from '../search/search.types';

export type { SearchableItem, SearchResult, SearchMatch } from '../search/search.types';

const DEBOUNCE_MS = 150;

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly _query = signal('');
  private readonly _results = signal<SearchResult[]>([]);
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly query = this._query.asReadonly();
  readonly results = this._results.asReadonly();
  readonly isActive = computed(() => this._query().trim().length >= 2);

  constructor(private readonly configStore: ConfigStoreService) {}

  search(query: string): void {
    this._query.set(query);

    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this._results.set(search(CONFIG_SEARCH_INDEX, query));
    }, DEBOUNCE_MS);
  }

  select(result: SearchResult): void {
    this.configStore.setActiveCategory(result.item.category);
    this.clear();
  }

  clear(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this._query.set('');
    this._results.set([]);
  }
}
