import { CommonModule } from "@angular/common";
import { Component, computed, inject, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DEFAULT_KITTY_CONFIG, SEARCHABLE_OPTION_COUNT } from "../../models/kitty-defaults";
import { ConfigStoreService } from "../../services/config-store.service";
import { KittyGeneratorService } from "../../services/kitty-generator.service";
import { KittyParserService } from "../../services/kitty-parser.service";
import { KittyVersionService } from "../../services/kitty-version.service";
import { ThemeService } from "../../services/theme.service";
import type { KittyConfigAST } from "../../models/kitty-types";
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { DialogShellComponent } from "../shared/dialog-shell/dialog-shell.component";

interface ImportStatus {
	tone: "success" | "error";
	message: string;
}

/**
 * How many settings a parsed file actually carried. Counted structurally rather
 * than from the generated output, so options gated behind a newer Kitty version
 * still count as recognised.
 */
function countDirectives(config: KittyConfigAST): number {
	let count =
		config.keyboard_shortcuts.length +
		config.mouse_mappings.length +
		config.unrecognized_directives.length;

	if (config.kitty_mod !== DEFAULT_KITTY_CONFIG.kitty_mod) count += 1;

	for (const [name, section] of Object.entries(config)) {
		if (
			typeof section !== "object" ||
			section === null ||
			Array.isArray(section)
		) {
			continue;
		}
		const defaults = DEFAULT_KITTY_CONFIG[
			name as keyof KittyConfigAST
		] as unknown as Record<string, unknown>;
		for (const [field, value] of Object.entries(section)) {
			if (JSON.stringify(value) !== JSON.stringify(defaults[field])) count += 1;
		}
	}

	return count;
}

@Component({
	selector: "app-header",
	imports: [
		CommonModule,
		FormsModule,
		SearchBarComponent,
		DialogShellComponent,
	],
	template: `
    <header class="h-14 sm:h-16 lg:h-20 bg-kitty-surface border-b border-kitty-border flex items-center justify-between px-3 sm:px-4 lg:px-6 shadow-sm">
      <!-- Left: Logo and mobile menu -->
      <div class="flex items-center gap-2 sm:gap-3 lg:gap-5 flex-shrink-0">
        <!-- Mobile: Sidebar toggle -->
        <button
          type="button"
          (click)="configStore.toggleSidebar()"
          class="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-kitty-surface-light hover:bg-kitty-bg text-kitty-text-dim hover:text-kitty-text transition-all duration-200 active:scale-95"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <img src="assets/confitty.svg" alt="" class="w-9 h-9 lg:w-10 lg:h-10 flex-shrink-0" onerror="this.style.display='none'" />
        <div class="flex flex-col leading-tight">
          <div class="flex items-center gap-2.5">
            <h1 class="text-base sm:text-lg lg:text-xl font-bold text-kitty-primary tracking-tight">Confitty</h1>
          </div>
          <span class="hidden xl:inline text-2xs lg:text-xs text-kitty-text-dim">
            Visual configuration builder for Kitty
          </span>
        </div>
      </div>

      <!-- Center: Search (desktop only) -->
      <div class="hidden lg:flex flex-1 justify-center px-4">
        <app-search-bar />
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
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
          type="button"
          (click)="mobileMenuOpen.set(true)"
          class="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-kitty-surface-light hover:bg-kitty-bg text-kitty-text-dim hover:text-kitty-text transition-all duration-200 active:scale-95"
          aria-label="More actions"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <circle cx="12" cy="6" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="18" r="1"/>
          </svg>
        </button>

        <!-- Tablet: Search & Preview -->
        <button
          type="button"
          (click)="mobileSearchOpen.set(true)"
          class="hidden sm:flex lg:hidden w-9 h-9 items-center justify-center rounded-lg bg-kitty-surface-light hover:bg-kitty-bg text-kitty-text-dim hover:text-kitty-text transition-all duration-200 active:scale-95"
          aria-label="Open search"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>

        <button
          type="button"
          (click)="configStore.togglePreview()"
          class="hidden sm:flex lg:hidden w-9 h-9 items-center justify-center rounded-lg transition-all"
          [class.bg-kitty-primary]="configStore.previewVisible()"
          [class.text-kitty-dark]="configStore.previewVisible()"
          [class.bg-kitty-surface-light]="!configStore.previewVisible()"
          [class.text-kitty-text-dim]="!configStore.previewVisible()"
          [attr.aria-pressed]="configStore.previewVisible()"
          aria-label="Toggle live preview"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </button>

        <!-- Desktop: Full buttons -->

        <button
          type="button"
          (click)="aboutRequested.emit()"
          class="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg bg-kitty-surface-light hover:bg-kitty-primary/15 text-kitty-text-dim hover:text-kitty-primary border border-transparent hover:border-kitty-primary/30 transition-colors"
          aria-label="About Confitty"
          title="About"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <button
          type="button"
          (click)="themeService.toggle()"
          class="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg bg-kitty-surface-light hover:bg-kitty-bg text-kitty-text-dim hover:text-kitty-text transition-all duration-200 border border-transparent hover:border-kitty-border active:scale-95"
          [title]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
          [attr.aria-label]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
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

        <div class="hidden xl:flex items-center gap-2">
          <label class="text-xs text-kitty-text-dim">Kitty</label>
          <select
            [(ngModel)]="selectedVersion"
            (ngModelChange)="onVersionChange($event)"
            class="px-2 py-1.5 bg-kitty-bg border border-kitty-border rounded text-xs text-kitty-text focus:outline-none focus:ring-1 focus:ring-kitty-primary max-w-[180px]"
            title="Select your Kitty terminal version"
          >
            @for (version of versionService.versions; track version.version) {
              <option [value]="version.version" [title]="version.description ?? ''">{{ version.label }}</option>
            }
          </select>
        </div>

        <div class="h-8 w-px bg-kitty-border hidden xl:block"></div>

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
          class="hidden sm:flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 bg-kitty-surface-light hover:bg-kitty-bg text-kitty-text rounded-lg text-sm font-medium transition-colors border border-kitty-border"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span class="hidden xl:inline">Import</span>
        </button>

        <button
          (click)="handleExport()"
          class="hidden sm:flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-2.5 bg-kitty-primary hover:bg-kitty-primary-hover text-kitty-dark rounded-lg text-sm font-semibold transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export</span>
        </button>
      </div>
    </header>

    @if (showRestoredNotice()) {
      <div
        class="px-3 sm:px-4 lg:px-6 py-2 border-b border-kitty-border bg-kitty-surface-light/60 flex items-center gap-3 text-sm text-kitty-text-dim"
        role="status"
      >
        <span class="flex-1 min-w-0">
          Picked up where you left off. Nothing was uploaded; this came from
          this browser.
        </span>
        <button
          type="button"
          (click)="startFresh()"
          class="flex-shrink-0 underline underline-offset-2 hover:text-kitty-text transition-colors"
        >Start fresh</button>
        <button
          type="button"
          (click)="restoredNoticeDismissed.set(true)"
          class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss message"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    }

    @if (importStatus(); as status) {
      <div
        class="px-3 sm:px-4 lg:px-6 py-2 border-b flex items-start gap-2 text-sm"
        [class]="status.tone === 'error'
          ? 'bg-red-500/10 border-red-500/30 text-red-200'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'"
        role="status"
        aria-live="polite"
      >
        <span class="flex-1 min-w-0">{{ status.message }}</span>
        <button
          type="button"
          (click)="dismissImportStatus()"
          class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss message"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    }

    <!-- Mobile Actions Menu -->
    @if (mobileMenuOpen()) {
      <app-dialog-shell label="Actions" panelClass="items-start justify-end p-2" (closed)="mobileMenuOpen.set(false)">
        <div class="mt-12 sm:mt-14 w-56 bg-kitty-surface border border-kitty-border rounded-xl shadow-2xl p-2">
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
      </app-dialog-shell>
    }

    <!-- Search, presented as a full-height sheet on narrow viewports -->
    @if (mobileSearchOpen()) {
      <app-dialog-shell label="Search settings" panelClass="items-stretch" (closed)="mobileSearchOpen.set(false)">
        <div class="w-full h-full bg-kitty-surface flex flex-col p-4 gap-4">
          <div class="flex items-center gap-3">
            <app-search-bar class="flex-1" (resultSelected)="mobileSearchOpen.set(false)" />
            <button
              type="button"
              (click)="mobileSearchOpen.set(false)"
              class="w-11 h-11 flex items-center justify-center rounded-lg bg-kitty-surface-light hover:bg-kitty-bg text-kitty-text-dim hover:text-kitty-text transition-colors flex-shrink-0"
              aria-label="Close search"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!--
            Jumping straight to a category is faster than typing for most of
            these, and it keeps the sheet from opening onto an empty screen.
          -->
          <div>
            <h2 class="text-xs font-semibold uppercase tracking-wider text-kitty-text-dim mb-2">Jump to a section</h2>
            <div class="flex flex-wrap gap-2">
              @for (category of quickCategories; track category.id) {
                <button
                  type="button"
                  (click)="jumpToCategory(category.id)"
                  class="px-3 py-2 rounded-lg text-sm bg-kitty-surface-light hover:bg-kitty-bg text-kitty-text border border-kitty-border transition-colors"
                >{{ category.label }}</button>
              }
            </div>
          </div>

          <p class="text-xs text-kitty-text-dim mt-auto">
            Type at least two characters to search {{ searchableCount }} settings by name or description.
          </p>
        </div>
      </app-dialog-shell>
    }
  `,
	styles: [],
})
export class HeaderComponent {
	readonly aboutRequested = output<void>();
	readonly mobileSearchOpen = signal(false);
	readonly mobileMenuOpen = signal(false);
	readonly importStatus = signal<ImportStatus | null>(null);
	/**
	 * Every modelled option is indexed, a spec enforces it, so this counts the
	 * model rather than importing the index just to read its length. The index is
	 * loaded on the first keystroke and is the largest module in the app.
	 */
	readonly searchableCount = SEARCHABLE_OPTION_COUNT;

	/**
	 * Returning to a config you do not remember leaving is disconcerting, and
	 * "did this get uploaded somewhere?" is a fair first thought. Say where it
	 * came from once, and offer the way back to defaults.
	 */
	readonly restoredNoticeDismissed = signal(false);
	readonly showRestoredNotice = computed(
		() => this.configStore.restoredFromStorage() && !this.restoredNoticeDismissed(),
	);

	startFresh(): void {
		this.configStore.resetToDefaults();
		this.restoredNoticeDismissed.set(true);
	}

	readonly quickCategories = [
		{ id: "fonts", label: "Fonts" },
		{ id: "colors", label: "Colours" },
		{ id: "cursor", label: "Cursor" },
		{ id: "tab_bar", label: "Tab bar" },
		{ id: "window_layout", label: "Window" },
		{ id: "keyboard_shortcuts", label: "Shortcuts" },
	];

	jumpToCategory(id: string): void {
		this.configStore.setActiveCategory(id);
		this.mobileSearchOpen.set(false);
	}

	dismissImportStatus(): void {
		this.importStatus.set(null);
	}

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
	) {}

	handleImport(): void {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".conf,text/plain";
		input.onchange = (e: Event) => void this.onFileSelected(e);
		input.click();
	}

	private async onFileSelected(event: Event): Promise<void> {
		const file = (event.target as HTMLInputElement)?.files?.[0];
		if (!file) return;

		let content: string;
		try {
			content = await file.text();
		} catch {
			this.importStatus.set({
				tone: "error",
				message: `Could not read ${file.name}.`,
			});
			return;
		}

		// The parser is deliberately lenient, so a file that happens not to be a
		// kitty.conf parses "successfully" into nothing. Replacing the user's work
		// on that basis would be silent data loss, so check before committing.
		const parsed = this.parser.parseConfig(content);
		const recognised = countDirectives(parsed);
		if (recognised === 0) {
			this.importStatus.set({
				tone: "error",
				message: `No kitty settings found in ${file.name}. Nothing was changed.`,
			});
			return;
		}

		this.configStore.loadConfig(parsed);
		this.importStatus.set({
			tone: "success",
			message: `Imported ${recognised} setting${recognised === 1 ? "" : "s"} from ${file.name}.`,
		});
	}

	handleExport(): void {
		this.generator.downloadConfig(this.configStore.configState());
	}
}
