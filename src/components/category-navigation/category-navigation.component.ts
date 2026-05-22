import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ConfigStoreService } from "../../services/config-store.service";

interface Category {
	id: string;
	label: string;
	description: string;
	svgPath: string;
}

const CATEGORIES: readonly Category[] = [
	{
		id: "fonts",
		label: "Fonts",
		description: "Typography & rendering",
		svgPath: "M4 7V4h16v3M9 20h6M12 4v16",
	},
	{
		id: "cursor",
		label: "Cursor",
		description: "Shape & behavior",
		svgPath: "M5 3l14 9-7 1-3 7L5 3z",
	},
	{
		id: "scrollback",
		label: "Scrollback",
		description: "History & scrolling",
		svgPath: "M3 12h18M3 6h18M3 18h12",
	},
	{
		id: "mouse",
		label: "Mouse",
		description: "Interactions & URLs",
		svgPath:
			"M12 2a6 6 0 0 1 6 6v8a6 6 0 0 1-12 0V8a6 6 0 0 1 6-6zM12 2v6M6 8h12",
	},
	{
		id: "performance",
		label: "Performance",
		description: "Speed & rendering",
		svgPath: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
	},
	{
		id: "bell",
		label: "Bell",
		description: "Audio & visual alerts",
		svgPath:
			"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
	},
	{
		id: "window_layout",
		label: "Window Layout",
		description: "Size & decorations",
		svgPath: "M3 3h18v18H3zM3 9h18M9 21V9",
	},
	{
		id: "tab_bar",
		label: "Tab Bar",
		description: "Tab appearance",
		svgPath: "M3 3h4v4H3zM10 3h4v4h-4zM17 3h4v4h-4zM3 10h18v11H3z",
	},
	{
		id: "colors",
		label: "Colors",
		description: "Color scheme & palette",
		svgPath:
			"M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0 0V2M2 12h20",
	},
	{
		id: "advanced",
		label: "Advanced",
		description: "Shell & remote control",
		svgPath:
			"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
	},
	{
		id: "os_specific",
		label: "OS Specific",
		description: "Platform options",
		svgPath:
			"M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM12 17v4M8 21h8",
	},
	{
		id: "keyboard_shortcuts",
		label: "Shortcuts",
		description: "Key mappings & kitty_mod",
		svgPath: "M4 4h16v16H4zM8 8h8M8 12h8M8 16h5",
	},
];

@Component({
	selector: "app-category-navigation",
	imports: [CommonModule],
	template: `
    <nav class="nav" aria-label="Configuration sections">
      <div class="nav__list">
        <span class="nav__header">Configuration</span>

        @for (category of categories; track category.id) {
          @let active = configStore.activeCategory() === category.id;
          <button
            type="button"
            class="nav__item"
            [attr.data-active]="active || null"
            [attr.aria-current]="active ? 'page' : null"
            (click)="selectCategory(category.id)"
          >
            <span class="nav__rail" aria-hidden="true"></span>
            <svg class="nav__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path [attr.d]="category.svgPath" />
            </svg>
            <span class="nav__text">
              <span class="nav__label">{{ category.label }}</span>
              <span class="nav__description">{{ category.description }}</span>
            </span>
          </button>
        }
      </div>

      <div class="nav__footer">
        <button type="button" class="reset" (click)="configStore.resetToDefaults()">
          <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>Reset to defaults</span>
        </button>
      </div>
    </nav>
  `,
	styles: [
		`
    .nav {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
      background: rgb(var(--kitty-surface));
      border-right: 1px solid rgb(var(--kitty-border));
    }
    .nav__list {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .nav__header {
      display: block;
      padding: 4px 12px 12px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgb(var(--kitty-text-dim));
    }
    .nav__item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 8px 12px;
      border-radius: 8px;
      text-align: left;
      color: rgb(var(--kitty-text-dim));
      transition: background-color 150ms ease, color 150ms ease;
    }
    .nav__item:hover {
      background: rgb(var(--kitty-text) / 0.05);
      color: rgb(var(--kitty-text));
    }
    .nav__item[data-active] {
      background: rgb(var(--kitty-primary) / 0.1);
      color: rgb(var(--kitty-text));
    }
    .nav__rail {
      position: absolute;
      left: 0;
      top: 6px;
      bottom: 6px;
      width: 2px;
      border-radius: 999px;
      background: transparent;
      transition: background-color 150ms ease;
    }
    .nav__item[data-active] .nav__rail {
      background: rgb(var(--kitty-primary));
    }
    .nav__icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: currentColor;
    }
    .nav__item[data-active] .nav__icon {
      color: rgb(var(--kitty-primary));
    }
    .nav__text {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      line-height: 1.25;
    }
    .nav__label {
      font-size: 13px;
      font-weight: 500;
    }
    .nav__description {
      margin-top: 2px;
      font-size: 10px;
      opacity: 0.6;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .nav__footer {
      flex-shrink: 0;
      padding: 0 12px 16px;
    }
    .reset {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      color: rgb(var(--kitty-text-dim));
      background: rgb(var(--kitty-darker));
      border: 1px solid rgb(var(--kitty-border));
      transition: background-color 150ms ease, color 150ms ease;
    }
    .reset:hover {
      color: rgb(var(--kitty-text));
      background: rgb(var(--kitty-surface));
    }
  `,
	],
})
export class CategoryNavigationComponent {
	readonly configStore = inject(ConfigStoreService);

	readonly categories = CATEGORIES;

	selectCategory(categoryId: string): void {
		this.configStore.setActiveCategory(categoryId);
		this.configStore.setSidebarOpen(false);
	}
}
