import { Injectable, inject, signal, computed } from '@angular/core';
import { KittyConfigAST } from '../models/kitty-types';
import { DEFAULT_KITTY_CONFIG } from '../models/kitty-defaults';
import { KittyGeneratorService } from './kitty-generator.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigStoreService {
  private readonly generator = inject(KittyGeneratorService);

  private readonly _configState = signal<KittyConfigAST>(
    structuredClone(DEFAULT_KITTY_CONFIG)
  );

  private readonly _searchQuery = signal<string>('');
  private readonly _activeCategory = signal<string>('fonts');
  private readonly _advancedMode = signal<boolean>(false);
  private readonly _sidebarOpen = signal<boolean>(false);
  private readonly _previewVisible = signal<boolean>(true);

  readonly configState = this._configState.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly activeCategory = this._activeCategory.asReadonly();
  readonly advancedMode = this._advancedMode.asReadonly();
  readonly sidebarOpen = this._sidebarOpen.asReadonly();
  readonly previewVisible = this._previewVisible.asReadonly();

  readonly rawConfigText = computed(() => {
    return this.generator.generateConfig(this._configState());
  });

  updateSection<T extends keyof KittyConfigAST>(
    section: T,
    data: Partial<KittyConfigAST[T]>
  ): void {
    this._configState.update(state => ({
      ...state,
      [section]: { ...(state[section] as object), ...data }
    }));
  }

  updateField<T extends keyof KittyConfigAST, K extends keyof KittyConfigAST[T]>(
    section: T,
    field: K,
    value: KittyConfigAST[T][K]
  ): void {
    this._configState.update(state => ({
      ...state,
      [section]: {
        ...(state[section] as object),
        [field]: value
      }
    }));
  }

  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  setActiveCategory(category: string): void {
    this._activeCategory.set(category);
  }

  toggleAdvancedMode(): void {
    this._advancedMode.update(mode => !mode);
  }

  toggleSidebar(): void {
    this._sidebarOpen.update(open => !open);
  }

  setSidebarOpen(open: boolean): void {
    this._sidebarOpen.set(open);
  }

  togglePreview(): void {
    this._previewVisible.update(visible => !visible);
  }

  setPreviewVisible(visible: boolean): void {
    this._previewVisible.set(visible);
  }

  loadConfig(config: KittyConfigAST): void {
    this._configState.set(structuredClone(config));
  }

  resetToDefaults(): void {
    this._configState.set(structuredClone(DEFAULT_KITTY_CONFIG));
  }

  exportToJSON(): string {
    return JSON.stringify(this._configState(), null, 2);
  }

  importFromJSON(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      this._configState.set(parsed);
      return true;
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return false;
    }
  }
}
