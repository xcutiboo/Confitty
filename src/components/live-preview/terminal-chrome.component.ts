import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigStoreService } from '../../services/config-store.service';
import { ptToPx, rgba, shade } from './color-utils';
import { PREVIEW_TABS } from './terminal-session';
import { CHROME_LIGHTS, FONT_SIZE_PT, TAB_BAR_RATIO } from './preview-metrics';

const ACTIVE_TAB = PREVIEW_TABS.find(t => t.active)?.title ?? 'shell';

@Component({
  selector: 'app-terminal-chrome',
  imports: [CommonModule],
  template: `
    <div class="chrome" [ngStyle]="styles()">
      <div class="lights">
        <span class="light" [style.background]="lights.closeColor"></span>
        <span class="light" [style.background]="lights.minimizeColor"></span>
        <span class="light" [style.background]="lights.maximizeColor"></span>
      </div>
      <span class="title">kitty · {{ title }}</span>
      <span class="spacer"></span>
    </div>
  `,
  styles: [`
    .chrome {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 12px;
      height: var(--chrome-height);
      user-select: none;
      line-height: 1;
    }
    .lights {
      display: flex;
      gap: var(--light-gap);
      flex-shrink: 0;
    }
    .light {
      width: var(--light-size);
      height: var(--light-size);
      border-radius: 50%;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.18);
    }
    .title {
      flex: 1;
      text-align: center;
      font-size: 11px;
      color: var(--chrome-fg);
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .spacer {
      /* Reserve room equal to the traffic-light cluster so the title stays centred. */
      width: calc(var(--light-size) * 3 + var(--light-gap) * 2);
      flex-shrink: 0;
    }
  `]
})
export class TerminalChromeComponent {
  private readonly store = inject(ConfigStoreService);

  readonly title = ACTIVE_TAB;
  readonly lights = CHROME_LIGHTS;

  /** Chrome height matches the tab bar so the top of the window reads as a single band. */
  private readonly fontSize = computed(() => this.store.configState().fonts.font_size);
  private readonly height = computed(() => {
    const pt = Math.max(FONT_SIZE_PT.min, Math.min(FONT_SIZE_PT.max, this.fontSize()));
    return Math.round(ptToPx(pt) * TAB_BAR_RATIO);
  });

  readonly styles = computed(() => {
    const colors = this.store.configState().colors;
    return {
      backgroundColor: shade(colors.background, 6),
      '--chrome-fg':   rgba(colors.foreground, 0.6),
      '--chrome-height': `${this.height()}px`,
      '--light-size':  `${CHROME_LIGHTS.size}px`,
      '--light-gap':   `${CHROME_LIGHTS.gap}px`,
    } as Record<string, string>;
  });
}
