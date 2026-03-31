import { Component, EventEmitter, Output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigStoreService } from '../../services/config-store.service';
import { KittyGeneratorService } from '../../services/kitty-generator.service';
import { KittyParserService } from '../../services/kitty-parser.service';
import { ThemeService } from '../../services/theme.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { SearchService } from '../../services/search.service';
import { KittyVersionService } from '../../services/kitty-version.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule, SearchBarComponent],
  template: `
    <header class="h-14 sm:h-16 lg:h-20 bg-kitty-surface border-b border-kitty-border flex items-center justify-between px-3 sm:px-4 lg:px-8 shadow-sm">
      <!-- Left: Logo and mobile menu -->
      <div class="flex items-center gap-2 sm:gap-3 lg:gap-5 flex-shrink-0">
        <!-- Mobile: Sidebar toggle -->
        <button
          (click)="configStore.toggleSidebar()"
          class="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-kitty-surface-light hover:bg-kitty-bg text-kitty-text-dim hover:text-kitty-text transition-all duration-200 active:scale-95"
          title="Toggle sidebar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <img src="assets/confitty.svg" alt="Confitty Logo" class="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0" onerror="this.style.display='none'" />
        <div class="flex flex-col gap-0.5">
          <h1 class="text-base sm:text-lg lg:text-xl font-bold text-kitty-primary flex items-center gap-1.5 lg:gap-2.5">
            <span>Confitty</span>
            <span class="text-xs sm:text-sm font-normal text-kitty-text-dim hidden sm:inline">for Kitty Terminal</span>
          </h1>
          <span class="text-[10px] sm:text-xs text-kitty-text-dim hidden lg:inline leading-none">
            Visual Kitty configuration builder
          </span>
        </div>
      </div>

      <!-- Center: Search (desktop only) -->
      <div class="hidden lg:flex flex-1 justify-center px-4">
        <app-search-bar />
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
        <!-- Mobile: Quick Export -->
        <button
          (click)="handleExport()"
          class="sm:hidden px-3 py-2 bg-kitty-primary hover:bg-kitty-primary-hover text-kitty-dark rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          <span class="text-sm">Export</span>
        </button>

        <!-- Mobile: Actions Menu -->
        <button
          (click)="mobileMenuOpen.set(true)"
          class="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-kitty-surface-light hover:bg-kitty-bg text-kitty-text-dim hover:text-kitty-text transition-all duration-200 active:scale-95"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <circle cx="12" cy="6" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="18" r="1"/>
          </svg>
        </button>

        <!-- Tablet: Search & Preview -->
        <button
          (click)="mobileSearchOpen.set(true)"
          class="hidden sm:flex lg:hidden w-9 h-9 items-center justify-center rounded-lg bg-kitty-surface-light hover:bg-kitty-bg text-kitty-text-dim hover:text-kitty-text transition-all duration-200 active:scale-95"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>

        <button
          (click)="configStore.togglePreview()"
          class="hidden sm:flex lg:hidden w-9 h-9 items-center justify-center rounded-lg transition-all"
          [class.bg-kitty-primary]="configStore.previewVisible()"
          [class.text-kitty-dark]="configStore.previewVisible()"
          [class.bg-kitty-surface-light]="!configStore.previewVisible()"
          [class.text-kitty-text-dim]="!configStore.previewVisible()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </button>

        <!-- Desktop: Full buttons -->

        <button
          (click)="aboutRequested.emit()"
          class="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg bg-kitty-surface-light hover:bg-pink-500/20 text-kitty-text-dim hover:text-pink-500 transition-all duration-200 border border-transparent hover:border-pink-500/30 active:scale-95"
          title="About"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <button
          (click)="themeService.toggle()"
          class="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg bg-kitty-surface-light hover:bg-kitty-bg text-kitty-text-dim hover:text-kitty-text transition-all duration-200 border border-transparent hover:border-kitty-border active:scale-95"
          [title]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          @if (themeService.isDark()) {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          } @else {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          }
        </button>

        <div class="hidden lg:flex items-center gap-2">
          <label class="text-xs text-kitty-text-dim">Kitty</label>
          <select
            [(ngModel)]="selectedVersion"
            (ngModelChange)="onVersionChange($event)"
            class="px-2 py-1.5 bg-kitty-bg border border-kitty-border rounded text-xs text-kitty-text focus:outline-none focus:ring-1 focus:ring-kitty-primary"
            title="Select your Kitty terminal version"
          >
            @for (version of versionService.versions; track version.version) {
              <option [value]="version.version">
                {{ version.label }} {{ version.description ? '(' + version.description + ')' : '' }}
              </option>
            }
          </select>
        </div>

        <div class="h-8 w-px bg-kitty-border hidden lg:block"></div>

        <button
          (click)="configStore.toggleAdvancedMode()"
          class="hidden lg:flex px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          [class.bg-kitty-primary]="configStore.advancedMode()"
          [class.text-kitty-dark]="configStore.advancedMode()"
          [class.bg-kitty-surface-light]="!configStore.advancedMode()"
          [class.text-kitty-text]="!configStore.advancedMode()"
        >
          {{ configStore.advancedMode() ? 'Advanced' : 'Simple' }}
        </button>

        <button
          (click)="handleImport()"
          class="hidden sm:flex px-3 py-2 lg:px-4 lg:py-2.5 bg-kitty-surface-light hover:bg-kitty-bg text-kitty-text rounded-lg text-sm font-medium transition-all duration-200 border border-kitty-border hover:border-kitty-border-light flex items-center gap-2 hover:scale-105 active:scale-95"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span class="hidden xl:inline">Import</span>
        </button>

        <button
          (click)="handleExport()"
          class="hidden sm:flex px-4 py-2 lg:px-5 lg:py-2.5 bg-kitty-primary hover:bg-kitty-primary-hover text-kitty-dark rounded-lg text-sm font-semibold transition-all duration-200 shadow-md shadow-kitty-primary/20 hover:shadow-kitty-primary/30 hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export</span>
        </button>
      </div>
    </header>

    <!-- Mobile Actions Menu Overlay -->
    @if (mobileMenuOpen()) {
      <div class="fixed inset-0 z-50 lg:hidden" (click)="mobileMenuOpen.set(false)">
        <div class="absolute inset-0 bg-black/50 animate-fade-in"></div>
        <div class="absolute right-2 top-14 sm:top-16 w-56 bg-kitty-surface border border-kitty-border rounded-xl shadow-2xl animate-fade-in-up p-2 will-change-transform" (click)="$event.stopPropagation()">
          <div class="px-3 py-2 text-xs font-semibold text-kitty-text-dim uppercase tracking-wider border-b border-kitty-border mb-2">Actions</div>
          <button (click)="mobileSearchOpen.set(true); mobileMenuOpen.set(false)" class="w-full px-3 py-2.5 rounded-lg text-left text-sm text-kitty-text hover:bg-kitty-surface-light transition-all duration-150 flex items-center gap-3 active:scale-[0.98]">
            <svg class="w-4 h-4 text-kitty-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            Search Settings
          </button>
          <button (click)="configStore.togglePreview(); mobileMenuOpen.set(false)" class="w-full px-3 py-2.5 rounded-lg text-left text-sm text-kitty-text hover:bg-kitty-surface-light transition-all duration-150 flex items-center gap-3 active:scale-[0.98]">
            <svg class="w-4 h-4 text-kitty-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            {{ configStore.previewVisible() ? 'Hide Preview' : 'Show Preview' }}
          </button>
          <button (click)="handleImport(); mobileMenuOpen.set(false)" class="w-full px-3 py-2.5 rounded-lg text-left text-sm text-kitty-text hover:bg-kitty-surface-light transition-all duration-150 flex items-center gap-3 active:scale-[0.98]">
            <svg class="w-4 h-4 text-kitty-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Import Config
          </button>
          <div class="h-px bg-kitty-border my-2"></div>
          <button (click)="configStore.toggleAdvancedMode(); mobileMenuOpen.set(false)" class="w-full px-3 py-2.5 rounded-lg text-left text-sm text-kitty-text hover:bg-kitty-surface-light transition-all duration-150 flex items-center gap-3 active:scale-[0.98]">
            <svg class="w-4 h-4 text-kitty-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            {{ configStore.advancedMode() ? 'Simple Mode' : 'Advanced Mode' }}
          </button>
          <button (click)="themeService.toggle(); mobileMenuOpen.set(false)" class="w-full px-3 py-2.5 rounded-lg text-left text-sm text-kitty-text hover:bg-kitty-surface-light transition-all duration-150 flex items-center gap-3 active:scale-[0.98]">
            <svg class="w-4 h-4 text-kitty-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              @if (themeService.isDark()) { <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              } @else { <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/> }
            </svg>
            {{ themeService.isDark() ? 'Light Theme' : 'Dark Theme' }}
          </button>
          <button (click)="aboutRequested.emit(); mobileMenuOpen.set(false)" class="w-full px-3 py-2.5 rounded-lg text-left text-sm text-kitty-text hover:bg-kitty-surface-light transition-all duration-150 flex items-center gap-3 active:scale-[0.98]">
            <svg class="w-4 h-4 text-kitty-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            About Confitty
          </button>
        </div>
      </div>
    }

    <!-- Mobile Search Overlay -->
    @if (mobileSearchOpen()) {
      <div class="fixed inset-0 z-50 bg-kitty-surface p-4 lg:hidden animate-fade-in flex flex-col">
        <div class="flex items-center gap-3 mb-4">
          <app-search-bar class="flex-1" />
          <button (click)="mobileSearchOpen.set(false)" class="w-10 h-10 flex items-center justify-center rounded-lg bg-kitty-surface-light hover:bg-kitty-bg text-kitty-text-dim hover:text-kitty-text transition-all duration-200 active:scale-95 flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <p class="text-xs text-kitty-text-dim text-center">Type to search settings, press Enter to select</p>
      </div>
    }
  `,
  styles: []
})
export class HeaderComponent {
  @Output() aboutRequested = new EventEmitter<void>();
  readonly mobileSearchOpen = signal(false);
  readonly mobileMenuOpen = signal(false);

  readonly versionService = inject(KittyVersionService);
  selectedVersion = this.versionService.currentVersion();

  onVersionChange(version: string): void {
    this.versionService.setVersion(version);
    this.selectedVersion = version;
  }

  constructor(
    public readonly configStore: ConfigStoreService,
    public readonly themeService: ThemeService,
    private readonly generator: KittyGeneratorService,
    private readonly parser: KittyParserService,
    private readonly searchService: SearchService
  ) {
    effect(() => {
      const hasResults = this.searchService.results().length > 0;
      const wasOpen = this.mobileSearchOpen();
      if (wasOpen && !hasResults) {
        this.mobileSearchOpen.set(false);
      }
    });
  }

  handleImport(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.conf';
    input.onchange = (e: Event) => this.onFileSelected(e);
    input.click();
  }

  private async onFileSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      this.configStore.loadConfig(this.parser.parseConfig(content));
    } catch {
      alert('Failed to parse configuration file. Please check the file format.');
    }
  }

  handleExport(): void {
    this.generator.downloadConfig(this.configStore.configState());
  }
}
