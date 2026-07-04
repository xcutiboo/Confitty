import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { ConfigStoreService } from "../../services/config-store.service";
import { TerminalPaletteComponent } from "./terminal-palette.component";
import { TerminalWindowComponent } from "./terminal-window.component";

type PreviewMode = "terminal" | "config";

@Component({
	selector: "app-live-preview",
	imports: [CommonModule, TerminalWindowComponent, TerminalPaletteComponent],
	template: `
    <div class="h-full flex flex-col bg-kitty-darker">
      <header class="flex items-center justify-between gap-3 px-4 py-3 border-b border-kitty-border bg-kitty-surface flex-shrink-0">
        <div class="flex items-center gap-3 min-w-0">
          <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-kitty-text-dim">Preview</span>
          <div class="flex gap-0.5 rounded-md bg-kitty-darker p-0.5">
            <button
              type="button"
              (click)="previewMode.set('terminal')"
              class="preview-toggle"
              [class.active]="previewMode() === 'terminal'"
            >Terminal</button>
            <button
              type="button"
              (click)="previewMode.set('config')"
              class="preview-toggle"
              [class.active]="previewMode() === 'config'"
            >Config</button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          @if (previewMode() === 'config') {
            <button
              type="button"
              (click)="copyConfig()"
              class="action-btn"
              [class.success]="copied()"
            >
              @if (copied()) {
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                <span>Copied</span>
              } @else {
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <span>Copy</span>
              }
            </button>
          }

          <button
            type="button"
            (click)="configStore.setPreviewVisible(false)"
            class="action-btn lg:hidden"
            title="Close preview"
            aria-label="Close preview"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </header>

      @if (previewMode() === 'config') {
        <div class="flex-1 min-h-0 overflow-y-auto px-4 py-4 bg-kitty-darker">
          <pre class="text-[11.5px] leading-[1.65] font-mono whitespace-pre-wrap break-words text-kitty-text">{{ configText() }}</pre>
        </div>
      } @else {
        <div class="flex-1 min-h-0 flex flex-col gap-3 p-4">
          <app-terminal-window class="flex-1 min-h-0" />
          <app-terminal-palette class="rounded-lg border border-kitty-border bg-kitty-surface flex-shrink-0" />
        </div>
      }

      <footer class="flex flex-col gap-2 border-t border-kitty-border bg-kitty-surface px-4 py-3 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 min-w-0 flex-1 text-[11px] text-kitty-text-dim font-mono flex-wrap">
            <span class="dot" [style.background]="colors().background" [title]="'background ' + colors().background"></span>
            <span class="dot" [style.background]="colors().foreground" [title]="'foreground ' + colors().foreground"></span>
            <span class="truncate max-w-[160px]" [title]="fonts().font_family">{{ fonts().font_family }} · {{ fonts().font_size }}pt</span>
            <span class="sep">·</span>
            <span>{{ cursorLabel() }}</span>
            <span class="sep">·</span>
            <span>{{ opacityLabel() }}</span>
          </div>
          <button
            type="button"
            (click)="download()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors bg-kitty-primary text-kitty-dark hover:bg-kitty-primary-hover flex-shrink-0"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            <span>Export</span>
          </button>
        </div>
        <div class="flex items-center justify-between gap-4">
          <p class="text-[10px] text-kitty-text-dim font-mono leading-snug truncate">
            <span class="text-kitty-accent">~/.config/kitty/kitty.conf</span>
            <span class="mx-1.5 opacity-50">·</span>
            Reload: <span class="text-kitty-accent">Ctrl+Shift+F5</span>
            <span class="mx-1.5 opacity-50">·</span>
            {{ configLineCount() }} lines
          </p>
          <p class="text-[9px] text-kitty-text-dim/60 font-sans tracking-wide">
            Preview rendering may vary from actual terminal
          </p>
        </div>
      </footer>
    </div>
  `,
	styles: [
		`
    .preview-toggle {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      color: rgb(var(--kitty-text-dim));
      transition: background-color 150ms ease, color 150ms ease;
    }
    .preview-toggle.active {
      background: rgb(var(--kitty-surface-light));
      color: rgb(var(--kitty-primary));
    }
    .preview-toggle:not(.active):hover {
      color: rgb(var(--kitty-text));
    }
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      color: rgb(var(--kitty-text));
      background: rgb(var(--kitty-surface-light));
      transition: background-color 150ms ease, color 150ms ease;
    }
    .action-btn:hover {
      background: rgb(var(--kitty-bg));
    }
    .action-btn.success {
      background: rgb(var(--kitty-primary));
      color: rgb(var(--kitty-dark));
    }
    .dot {
      display: inline-block;
      width: 9px;
      height: 9px;
      border-radius: 999px;
      box-shadow: inset 0 0 0 1px rgb(var(--kitty-border-light));
      flex-shrink: 0;
    }
    .sep {
      color: rgb(var(--kitty-border-light));
    }
  `,
	],
})
export class LivePreviewComponent {
	readonly previewMode = signal<PreviewMode>("terminal");
	readonly copied = signal(false);

	readonly configStore = inject(ConfigStoreService);

	readonly configText = computed(() => this.configStore.rawConfigText());
	readonly configLineCount = computed(
		() => this.configText().split("\n").length,
	);

	readonly colors = computed(() => this.configStore.configState().colors);
	readonly fonts = computed(() => this.configStore.configState().fonts);

	readonly cursorLabel = computed(() => {
		const c = this.configStore.configState().cursor;
		const blink = c.cursor_blink_interval !== 0 ? " blink" : "";
		return `${c.cursor_shape}${blink}`;
	});

	readonly opacityLabel = computed(() => {
		const o = this.colors().background_opacity;
		return typeof o === "number" && o < 1
			? `${Math.round(o * 100)}% opacity`
			: "opaque";
	});

	copyConfig(): void {
		void navigator.clipboard.writeText(this.configText()).then(() => {
			this.copied.set(true);
			setTimeout(() => this.copied.set(false), 1800);
		});
	}

	download(): void {
		const blob = new Blob([this.configText()], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "kitty.conf";
		a.click();
		URL.revokeObjectURL(url);
	}
}
