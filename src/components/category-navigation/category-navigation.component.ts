import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigStoreService } from '../../services/config-store.service';

interface Category {
  id: string;
  label: string;
  description: string;
  svgPath: string;
}

@Component({
  selector: 'app-category-navigation',
  imports: [CommonModule],
  template: `
    <nav class="h-full bg-kitty-surface border-r border-kitty-border overflow-y-auto flex flex-col">
      <div class="flex-1 py-4 px-3 space-y-0.5">
        <div class="px-3 pb-3 pt-1">
          <span class="text-[10px] font-bold text-kitty-text-dim uppercase tracking-widest">Configuration</span>
        </div>

        @for (category of categories; track category.id) {
          <button
            (click)="selectCategory(category.id)"
            class="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 flex items-center gap-3 group relative"
            [class.active-nav-item]="configStore.activeCategory() === category.id"
            [class.inactive-nav-item]="configStore.activeCategory() !== category.id"
          >
            @if (configStore.activeCategory() === category.id) {
              <div class="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-kitty-primary"></div>
            }
            <svg
              class="w-4 h-4 flex-shrink-0 transition-colors duration-150"
              [class.text-kitty-primary]="configStore.activeCategory() === category.id"
              [class.text-kitty-text-dim]="configStore.activeCategory() !== category.id"
              [class.group-hover:text-kitty-text]="configStore.activeCategory() !== category.id"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path [attr.d]="category.svgPath" />
            </svg>
            <div class="flex-1 min-w-0">
              <div
                class="text-sm font-medium leading-tight transition-colors duration-150"
                [class.text-kitty-text]="configStore.activeCategory() === category.id"
                [class.text-kitty-text-dim]="configStore.activeCategory() !== category.id"
                [class.group-hover:text-kitty-text]="configStore.activeCategory() !== category.id"
              >{{ category.label }}</div>
              <div class="text-[10px] leading-tight mt-0.5 opacity-60 truncate"
                   [class.text-kitty-text]="configStore.activeCategory() === category.id"
                   [class.text-kitty-text-dim]="configStore.activeCategory() !== category.id"
              >{{ category.description }}</div>
            </div>
          </button>
        }
      </div>

      <div class="px-3 pb-4 flex-shrink-0">
        <div class="p-3 bg-kitty-darker rounded-lg border border-kitty-border">
          <button
            (click)="configStore.resetToDefaults()"
            class="w-full px-3 py-2 text-xs font-medium text-kitty-text-dim hover:text-kitty-text bg-transparent hover:bg-kitty-surface rounded-md text-left transition-all duration-150 flex items-center gap-2"
          >
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Reset to Defaults</span>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .active-nav-item {
      background-color: rgb(var(--kitty-primary) / 0.08);
    }
    .inactive-nav-item:hover {
      background-color: rgb(var(--kitty-text) / 0.05);
    }
  `]
})
export class CategoryNavigationComponent {
  categories: Category[] = [
    {
      id: 'fonts',
      label: 'Fonts',
      description: 'Typography & rendering',
      svgPath: 'M4 7V4h16v3M9 20h6M12 4v16'
    },
    {
      id: 'cursor',
      label: 'Cursor',
      description: 'Shape & behavior',
      svgPath: 'M5 3l14 9-7 1-3 7L5 3z'
    },
    {
      id: 'scrollback',
      label: 'Scrollback',
      description: 'History & scrolling',
      svgPath: 'M3 12h18M3 6h18M3 18h12'
    },
    {
      id: 'mouse',
      label: 'Mouse',
      description: 'Interactions & URLs',
      svgPath: 'M12 2a6 6 0 0 1 6 6v8a6 6 0 0 1-12 0V8a6 6 0 0 1 6-6zM12 2v6M6 8h12'
    },
    {
      id: 'performance',
      label: 'Performance',
      description: 'Speed & rendering',
      svgPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z'
    },
    {
      id: 'bell',
      label: 'Bell',
      description: 'Audio & visual alerts',
      svgPath: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0'
    },
    {
      id: 'window_layout',
      label: 'Window Layout',
      description: 'Size & decorations',
      svgPath: 'M3 3h18v18H3zM3 9h18M9 21V9'
    },
    {
      id: 'tab_bar',
      label: 'Tab Bar',
      description: 'Tab appearance',
      svgPath: 'M3 3h4v4H3zM10 3h4v4h-4zM17 3h4v4h-4zM3 10h18v11H3z'
    },
    {
      id: 'colors',
      label: 'Colors',
      description: 'Color scheme & palette',
      svgPath: 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0 0V2M2 12h20'
    },
    {
      id: 'advanced',
      label: 'Advanced',
      description: 'Shell & remote control',
      svgPath: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'
    },
    {
      id: 'os_specific',
      label: 'OS Specific',
      description: 'Platform options',
      svgPath: 'M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM12 17v4M8 21h8'
    },
    {
      id: 'keyboard_shortcuts',
      label: 'Shortcuts',
      description: 'Key mappings & kitty_mod',
      svgPath: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5'
    }
  ];

  constructor(public readonly configStore: ConfigStoreService) {}

  selectCategory(categoryId: string): void {
    this.configStore.setActiveCategory(categoryId);
    this.configStore.setSidebarOpen(false);
  }
}
