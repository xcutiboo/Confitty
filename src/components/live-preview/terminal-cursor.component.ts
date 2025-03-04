import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigStoreService } from '../../services/config-store.service';
import { ptToPx } from './color-utils';

const SYSTEM_BLINK_INTERVAL = 0.5;

@Component({
  selector: 'app-terminal-cursor',
  imports: [CommonModule],
  template: `
    <span class="terminal-cursor" [class.blinking]="blinking()" [ngStyle]="styles()"></span>
  `,
  styles: [`
    .terminal-cursor {
      display: inline-block;
      vertical-align: baseline;
      box-sizing: border-box;
    }
    .terminal-cursor.blinking {
      animation: cursor-blink var(--blink-duration) steps(2, jump-none) infinite;
    }
    @keyframes cursor-blink {
      50% { opacity: 0; }
    }
  `]
})
export class TerminalCursorComponent {
  private readonly store = inject(ConfigStoreService);

  private readonly cursor = computed(() => this.store.configState().cursor);
  private readonly fontSize = computed(() => this.store.configState().fonts.font_size);

  readonly blinking = computed(() => {
    const interval = this.cursor().cursor_blink_interval;
    return interval !== 0;
  });

  readonly styles = computed(() => {
    const cfg = this.cursor();
    const cellWidth = ptToPx(this.fontSize()) * 0.6;
    const cellHeight = ptToPx(this.fontSize()) * 1.25;
    const color = cfg.cursor === 'none' ? 'transparent' : cfg.cursor;
    const blinkInterval = cfg.cursor_blink_interval === -1
      ? SYSTEM_BLINK_INTERVAL
      : Math.max(0.1, cfg.cursor_blink_interval);

    const base: Record<string, string> = {
      width: `${cellWidth}px`,
      height: `${cellHeight}px`,
      '--blink-duration': `${blinkInterval * 2}s`,
    };

    switch (cfg.cursor_shape) {
      case 'beam':
        return {
          ...base,
          width: `${Math.max(1, cfg.cursor_beam_thickness)}px`,
          backgroundColor: color,
        };
      case 'underline':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderBottom: `${Math.max(1, cfg.cursor_underline_thickness)}px solid ${color}`,
        };
      default:
        return {
          ...base,
          backgroundColor: color,
        };
    }
  });
}
