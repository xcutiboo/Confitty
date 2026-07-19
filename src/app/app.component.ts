import { CommonModule } from "@angular/common";
import { Component, HostListener, inject, signal } from "@angular/core";
import { AboutModalComponent } from "../components/about-modal/about-modal.component";
import { CategoryNavigationComponent } from "../components/category-navigation/category-navigation.component";
import { ConfigEditorComponent } from "../components/config-editor/config-editor.component";
import { HeaderComponent } from "../components/header/header.component";
import { LivePreviewComponent } from "../components/live-preview/live-preview.component";
import { ConfigStoreService } from "../services/config-store.service";

@Component({
	selector: "app-root",
	imports: [
		CommonModule,
		CategoryNavigationComponent,
		ConfigEditorComponent,
		LivePreviewComponent,
		HeaderComponent,
		AboutModalComponent,
	],
	template: `
    <div class="h-screen bg-kitty-darker text-kitty-text flex flex-col overflow-hidden">
      <app-header (aboutRequested)="showAbout.set(true)" />

      @if (showAbout()) {
        <app-about-modal (closeRequested)="showAbout.set(false)" />
      }

      <div class="flex flex-1 overflow-hidden relative">
        <!-- Mobile overlay backdrop -->
        @if (configStore.sidebarOpen()) {
          <div
            class="fixed inset-0 bg-kitty-darker/60 backdrop-blur-sm z-30 lg:hidden animate-fade-in will-change-opacity"
            (click)="configStore.setSidebarOpen(false)"
          ></div>
        }

        <!-- A single instance either way: a permanent pane above lg, an overlay below. -->
        @if (configStore.wideViewport()) {
          <app-category-navigation class="w-72 flex-shrink-0" />
        } @else {
          <app-category-navigation
            class="fixed z-40 h-full w-72 flex-shrink-0 transform transition-transform duration-300 ease-out shadow-2xl will-change-transform"
            [class.-translate-x-full]="!configStore.sidebarOpen()"
          />
        }

        <main class="flex-1 overflow-hidden flex flex-col lg:flex-row min-w-0">
          <app-config-editor class="flex-1 overflow-y-auto min-w-0" />

          @if (configStore.previewVisible()) {
            @if (configStore.wideViewport()) {
              <app-live-preview
                class="w-2/5 flex-shrink-0 border-l border-kitty-border bg-kitty-darker"
              />
            } @else {
              <app-live-preview
                class="fixed inset-0 z-50 bg-kitty-darker animate-slide-in-right will-change-transform"
              />
            }
          }
        </main>
      </div>

      <footer class="bg-kitty-surface border-t border-kitty-border px-4 lg:px-8 py-3 lg:py-4 flex-shrink-0">
        <div class="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-6">
          <p class="text-[11px] lg:text-xs text-kitty-text-dim text-center lg:text-left leading-relaxed">
            Not affiliated with the
            <a href="https://sw.kovidgoyal.net/kitty/" target="_blank" rel="noopener"
               class="text-kitty-primary hover:text-kitty-primary-hover underline decoration-dotted underline-offset-2 transition-colors">official Kitty Terminal</a>.
            Open source under MIT.
          </p>
          <button
            type="button"
            (click)="openKofi()"
            class="inline-flex items-center gap-2 px-3.5 lg:px-4 py-2 rounded-lg text-[11px] lg:text-xs font-semibold bg-kitty-primary text-kitty-dark hover:bg-kitty-primary-hover transition-colors flex-shrink-0"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
            </svg>
            <span>Support on Ko-fi</span>
          </button>
        </div>
      </footer>
    </div>
  `,
	styles: [
		`
    :host { display: block; }
  `,
	],
})
export class AppComponent {
	readonly configStore = inject(ConfigStoreService);
	readonly showAbout = signal(false);

	/**
	 * Dismiss one layer at a time, topmost first. The about dialog is not listed:
	 * it is a native <dialog>, which handles Escape itself.
	 */
	@HostListener("window:keydown.escape")
	onEscape(): void {
		if (this.configStore.sidebarOpen()) {
			this.configStore.setSidebarOpen(false);
			return;
		}
		// Only an overlay on narrow viewports; on desktop it is a permanent pane.
		if (this.configStore.previewVisible() && !this.configStore.wideViewport()) {
			this.configStore.setPreviewVisible(false);
		}
	}

	openKofi(): void {
		globalThis.open(
			"https://ko-fi.com/xcutiboo",
			"_blank",
			"noopener,noreferrer",
		);
	}
}
