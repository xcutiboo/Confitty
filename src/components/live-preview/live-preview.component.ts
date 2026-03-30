import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigStoreService } from '../../services/config-store.service';
import { TerminalWindowComponent } from './terminal-window.component';

@Component({
  selector: 'app-live-preview',
  imports: [CommonModule, TerminalWindowComponent],
  template: `
    <div class="h-full flex flex-col bg-kitty-darker">

      <div class="bg-kitty-surface border-b border-kitty-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-3">
          <span class="text-[10px] font-bold text-kitty-text-dim uppercase tracking-widest">Preview</span>
          <div class="flex gap-0.5 bg-kitty-darker rounded-md p-0.5">
            <button
              (click)="previewMode.set('terminal')"
              class="px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-150"
              [class.bg-kitty-surface-light]="previewMode() === 'terminal'"
              [class.text-kitty-primary]="previewMode() === 'terminal'"
              [class.text-kitty-text-dim]="previewMode() !== 'terminal'"
            >Terminal</button>
            <button
              (click)="previewMode.set('config')"
              class="px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-150"
              [class.bg-kitty-surface-light]="previewMode() === 'config'"
              [class.text-kitty-primary]="previewMode() === 'config'"
              [class.text-kitty-text-dim]="previewMode() !== 'config'"
            >Config</button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          @if (previewMode() === 'config') {
            <button
              (click)="copyConfig()"
              class="hidden sm:flex px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-200 flex items-center gap-1.5"
              [class.bg-kitty-primary]="copied()"
              [class.text-kitty-dark]="copied()"
              [class.bg-kitty-surface-light]="!copied()"
              [class.text-kitty-text]="!copied()"
            >
              @if (copied()) {
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                Copied!
              } @else {
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              }
            </button>
          }

          <!-- Mobile close button -->
          <button
            (click)="configStore.setPreviewVisible(false)"
            class="lg:hidden w-7 h-7 flex items-center justify-center rounded-md bg-kitty-surface-light hover:bg-kitty-bg text-kitty-text-dim hover:text-kitty-text transition-all duration-200 active:scale-95"
            title="Close preview"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      @if (previewMode() === 'config') {
        <div class="flex-1 overflow-y-auto p-4">
          <pre class="text-[11px] leading-relaxed font-mono whitespace-pre-wrap break-words text-kitty-text-dim">{{ configText() }}</pre>
        </div>
      } @else {
        <div class="flex-1 overflow-hidden flex flex-col p-3">
          <app-terminal-window class="flex-1 overflow-hidden flex flex-col" />
        </div>
      }

      <div class="bg-kitty-surface border-t border-kitty-border flex-shrink-0">
        <div class="px-4 py-2.5 flex items-center gap-4">
          <div class="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <span class="w-2 h-2 rounded-full block"
                    [style.background]="configStore.configState().colors.background"></span>
              <span class="w-2 h-2 rounded-full block"
                    [style.background]="configStore.configState().colors.foreground"></span>
            </div>
            <span class="text-[10px] text-kitty-text-dim font-mono flex-shrink-0">
              {{ configStore.configState().fonts.font_size }}pt
            </span>
            <span class="text-kitty-border text-[10px] flex-shrink-0">·</span>
            <span class="text-[10px] text-kitty-text-dim font-mono flex-shrink-0 capitalize">
              {{ cursorLabel() }}
            </span>
            <span class="text-kitty-border text-[10px] flex-shrink-0">·</span>
            <span class="text-[10px] text-kitty-text-dim font-mono flex-shrink-0">
              {{ opacityLabel() }}
            </span>
          </div>
          <button
            (click)="download()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-kitty-primary hover:bg-kitty-primary-hover text-kitty-dark rounded-md text-[11px] font-semibold transition-colors flex-shrink-0"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export
          </button>
        </div>
        <div class="px-4 pb-3">
          <p class="text-[9px] text-kitty-text-dim font-mono">
            <span class="text-kitty-accent">~/.config/kitty/kitty.conf</span>
            <span class="mx-1.5 text-kitty-border">·</span>
            Reload: <span class="text-kitty-accent">Ctrl+Shift+F5</span>
            <span class="mx-1.5 text-kitty-border">·</span>
            <span>{{ configLineCount() }} lines</span>
          </p>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class LivePreviewComponent {
  previewMode = signal<'terminal' | 'config'>('terminal');
  copied = signal(false);

  configStore = inject(ConfigStoreService);

  configText = computed(() => this.configStore.rawConfigText());
  configLineCount = computed(() => this.configText().split('\n').length);

  cursorLabel = computed(() => {
    const c = this.configStore.configState().cursor;
    const blink = c.cursor_blink_interval > 0 ? ' blink' : '';
    return `${c.cursor_shape}${blink}`;
  });

  opacityLabel = computed(() => {
    const o = this.configStore.configState().colors.background_opacity;
    if (typeof o !== 'number' || o >= 1) return 'opaque';
    return `${Math.round(o * 100)}% opacity`;
  });

  copyConfig(): void {
    navigator.clipboard.writeText(this.configText()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  download(): void {
    const blob = new Blob([this.configText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kitty.conf';
    a.click();
    URL.revokeObjectURL(url);
  }
}
