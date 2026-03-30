import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigStoreService } from '../services/config-store.service';
import { CategoryNavigationComponent } from '../components/category-navigation/category-navigation.component';
import { ConfigEditorComponent } from '../components/config-editor/config-editor.component';
import { LivePreviewComponent } from '../components/live-preview/live-preview.component';
import { HeaderComponent } from '../components/header/header.component';
import { AboutModalComponent } from '../components/about-modal/about-modal.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    CategoryNavigationComponent,
    ConfigEditorComponent,
    LivePreviewComponent,
    HeaderComponent,
    AboutModalComponent
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
            class="fixed inset-0 bg-black/50 z-30 lg:hidden animate-fade-in will-change-opacity"
            (click)="configStore.setSidebarOpen(false)"
          ></div>
        }

        <!-- Sidebar: Desktop always visible, mobile overlay -->
        <app-category-navigation
          class="w-72 flex-shrink-0 desktop-sidebar"
        />
        <app-category-navigation
          class="mobile-sidebar fixed z-40 h-full w-72 flex-shrink-0 transform transition-transform duration-300 ease-out shadow-2xl will-change-transform"
          [class.-translate-x-full]="!configStore.sidebarOpen()"
        />

        <!-- Main content area -->
        <main class="flex-1 overflow-hidden flex flex-col lg:flex-row min-w-0">
          <!-- Config editor -->
          <app-config-editor class="flex-1 overflow-y-auto min-w-0" />

          <!-- Preview panel: Static on desktop, overlay on mobile -->
          @if (configStore.previewVisible()) {
            <app-live-preview
              class="desktop-preview w-2/5 flex-shrink-0 border-l border-kitty-border bg-kitty-darker"
            />
            <app-live-preview
              class="mobile-preview fixed inset-0 z-50 bg-kitty-darker animate-slide-in-right will-change-transform"
            />
          }
        </main>
      </div>

      <footer class="bg-kitty-surface border-t border-kitty-border px-4 lg:px-8 py-4 lg:py-5 flex-shrink-0">
        <div class="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-4">
          <div class="text-xs lg:text-sm text-kitty-text-dim text-center lg:text-left leading-relaxed">
            <svg class="w-3.5 h-3.5 text-kitty-accent inline-block mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Not affiliated with the official Kitty Terminal.
            Visit <a href="https://sw.kovidgoyal.net/kitty/" target="_blank" rel="noopener" class="text-kitty-primary hover:text-kitty-primary-hover underline decoration-kitty-primary/30 hover:decoration-kitty-primary transition-colors duration-200">sw.kovidgoyal.net/kitty</a>
            for documentation.
          </div>
          <button
            (click)="openKofi()"
            class="px-4 lg:px-5 py-2 lg:py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-lg text-xs lg:text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 lg:gap-2.5 flex-shrink-0"
          >
            <svg class="w-3.5 h-3.5 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
            </svg>
            <span>Support on Ko-fi</span>
          </button>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slide-in-right {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.25s ease-out;
    }
    /* Desktop sidebar always visible */
    @media (min-width: 1024px) {
      .desktop-sidebar {
        display: block !important;
      }
      .mobile-sidebar {
        display: none !important;
      }
      .desktop-preview {
        display: block !important;
      }
      .mobile-preview {
        display: none !important;
      }
    }
    @media (max-width: 1023px) {
      .desktop-sidebar {
        display: none !important;
      }
      .mobile-sidebar {
        display: block !important;
      }
      .desktop-preview {
        display: none !important;
      }
      .mobile-preview {
        display: block !important;
      }
    }
  `]
})
export class AppComponent {
  readonly showAbout = signal(false);

  constructor(public configStore: ConfigStoreService) {}

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.configStore.sidebarOpen()) {
      this.configStore.setSidebarOpen(false);
    }
    if (this.configStore.previewVisible()) {
      this.configStore.setPreviewVisible(false);
    }
    if (this.showAbout()) {
      this.showAbout.set(false);
    }
  }

  openKofi(): void {
    globalThis.open('https://ko-fi.com/xcutiboo', '_blank', 'noopener,noreferrer');
  }
}
