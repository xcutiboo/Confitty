import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigStoreService } from '../../services/config-store.service';
import type { KittyColorConfig } from '../../models/kitty-types';
import { SAMPLE_SESSION, type AnsiKey, type Line, type Span } from './terminal-session';
import { TerminalCursorComponent } from './terminal-cursor.component';

const ANSI_KEYS: readonly AnsiKey[] = [
  'color0', 'color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'color7',
  'color8', 'color9', 'color10', 'color11', 'color12', 'color13', 'color14', 'color15',
];

function isAnsiKey(value: string): value is AnsiKey {
  return (ANSI_KEYS as readonly string[]).includes(value);
}

function fg(text: string): Span                       { return { text, color: 'fg' }; }
function ansi(text: string, color: AnsiKey): Span     { return { text, color }; }
function dim(text: string): Span                      { return { text, color: 'fg', dim: true }; }
function promptSpans(path: string): Span[] {
  return [
    { text: 'user',  color: 'color2', bold: true },
    { text: '@',     color: 'color8' },
    { text: 'kitty', color: 'color6', bold: true },
    { text: ' ' },
    { text: path,    color: 'color4', bold: true },
    { text: ' ' },
    { text: '❯',     color: 'color5', bold: true },
    { text: ' ' },
  ];
}

@Component({
  selector: 'app-terminal-screen',
  imports: [CommonModule, TerminalCursorComponent],
  template: `
    <div
      class="screen"
      role="textbox"
      aria-label="Interactive terminal preview, click and type to test the configuration"
      [style.color]="foreground()"
      (click)="focusInput()"
    >
      @for (line of session; track $index) {
        <div class="line">
          @for (span of line.spans; track $index) {
            <span
              [ngStyle]="spanStyles(span)"
              [class.url]="span.url"
              [class.selected]="span.selected"
            >{{ span.text }}</span>
          }
        </div>
      }
      @for (line of history(); track $index) {
        <div class="line">
          @for (span of line.spans; track $index) {
            <span [ngStyle]="spanStyles(span)">{{ span.text }}</span>
          }
        </div>
      }
      <div class="line">
        @for (span of activePrompt; track $index) {
          <span [ngStyle]="spanStyles(span)">{{ span.text }}</span>
        }<span [ngStyle]="fgStyles()">{{ buffer() }}</span><app-terminal-cursor />
      </div>
      <input
        #hiddenInput
        class="ghost-input"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="none"
        spellcheck="false"
        aria-hidden="true"
        tabindex="-1"
        [value]="buffer()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
      />
    </div>
  `,
  styles: [`
    .screen {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      white-space: pre;
      cursor: text;
    }
    .line {
      display: block;
      min-height: 1em;
    }
    .selected {
      padding: 0 0.05em;
    }
    .url {
      text-underline-offset: 2px;
    }
    .ghost-input {
      position: absolute;
      left: -9999px;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    }
  `]
})
export class TerminalScreenComponent {
  private readonly store = inject(ConfigStoreService);
  private readonly hidden = viewChild.required<ElementRef<HTMLInputElement>>('hiddenInput');

  readonly session = SAMPLE_SESSION;
  readonly activePrompt = promptSpans('~/dotfiles');
  readonly buffer = signal('');
  readonly history = signal<Line[]>([]);

  private readonly colors = computed(() => this.store.configState().colors);
  private readonly mouse = computed(() => this.store.configState().mouse);

  readonly foreground = computed(() => this.colors().foreground);

  focusInput(): void {
    this.hidden().nativeElement.focus();
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.buffer.set(value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const cmd = this.buffer().trim();
      this.commitLine(cmd);
      this.buffer.set('');
      this.hidden().nativeElement.value = '';
    }
  }

  spanStyles(span: Span): Record<string, string> {
    const colors = this.colors();
    const style: Record<string, string> = {
      color: this.resolveColor(colors, span.color),
    };

    if (span.bold)   style['fontWeight'] = '700';
    if (span.italic) style['fontStyle']  = 'italic';
    if (span.dim)    style['opacity']    = String(colors.dim_opacity);

    if (span.url) {
      const m = this.mouse();
      style['color'] = m.url_color;
      style['textDecorationLine']  = 'underline';
      style['textDecorationStyle'] = this.urlDecoration(m.url_style);
      style['textDecorationColor'] = m.url_color;
      style['cursor'] = 'pointer';
    }

    if (span.selected) {
      style['color']           = colors.selection_foreground;
      style['backgroundColor'] = colors.selection_background;
    }

    return style;
  }

  fgStyles(): Record<string, string> {
    return { color: this.foreground() };
  }

  private commitLine(cmd: string): void {
    const echo: Line = { spans: [...this.activePrompt, fg(cmd)] };

    if (!cmd) {
      this.history.update(h => [...h, { spans: [...this.activePrompt] }]);
      return;
    }
    if (cmd === 'clear') {
      this.history.set([]);
      return;
    }

    const reply = this.respond(cmd);
    this.history.update(h => reply ? [...h, echo, reply] : [...h, echo]);
  }

  private respond(cmd: string): Line | null {
    const [head, ...rest] = cmd.split(/\s+/);
    switch (head) {
      case 'help':
        return {
          spans: [dim('available: '), ansi('clear', 'color3'), dim(', '), ansi('help', 'color3'), dim(', '), ansi('echo', 'color3'), dim(' <text>')],
        };
      case 'echo':
        return { spans: [fg(rest.join(' '))] };
      case 'pwd':
        return { spans: [fg('/home/you/dotfiles')] };
      case 'date':
        return { spans: [fg(new Date().toString())] };
      case 'whoami':
        return { spans: [ansi('user', 'color2', )] };
      default:
        return {
          spans: [ansi(head ?? '', 'color1'), fg(': command not found')],
        };
    }
  }

  private resolveColor(colors: KittyColorConfig, key: Span['color']): string {
    if (!key || key === 'fg') return colors.foreground;
    if (isAnsiKey(key)) return colors[key];
    return colors.foreground;
  }

  private urlDecoration(style: string): string {
    switch (style) {
      case 'double':   return 'double';
      case 'curly':    return 'wavy';
      case 'dotted':   return 'dotted';
      case 'dashed':   return 'dashed';
      case 'straight': return 'solid';
      case 'none':     return 'solid';
      default:         return 'solid';
    }
  }
}
