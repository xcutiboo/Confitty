import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigStoreService } from '../../services/config-store.service';
import { ptToPx, rgba } from './color-utils';
import { effectiveTabColors } from './tab-colors';
import { PREVIEW_TABS, type PreviewTab } from './terminal-session';
import { DEFAULT_FADE_STEPS, TAB_BAR_RATIO } from './preview-metrics';

@Component({
  selector: 'app-terminal-tab-bar',
  imports: [CommonModule],
  template: `
    <div class="tab-bar" [ngStyle]="barStyles()">
      <div class="tab-row" [ngStyle]="rowStyles()">
        @switch (style()) {
          @case ('powerline') {
            @for (tab of tabs; track tab.title; let i = $index; let last = $last; let first = $first) {
              <span
                class="tab powerline"
                [class.pl-slanted]="powerlineShape() === 'slanted'"
                [class.pl-round]="powerlineShape() === 'round'"
                [class.is-active]="tab.active"
                [class.is-first]="first"
                [class.is-last]="last"
                [ngStyle]="tabStyles(tab)"
              >{{ tab.title }}</span>
            }
          }
          @case ('slant') {
            @for (tab of tabs; track tab.title) {
              <span class="tab slant" [ngStyle]="slantStyles(tab)">
                <span class="slant-bg" [style.backgroundColor]="tabBg(tab)"></span>
                <span>{{ tab.title }}</span>
              </span>
            }
          }
          @case ('separator') {
            @for (tab of tabs; track tab.title; let last = $last) {
              <span class="tab plain" [ngStyle]="tabStyles(tab)">{{ tab.title }}</span>
              @if (!last) {
                <span class="separator" [style.color]="dimFg()">{{ separator() }}</span>
              }
            }
          }
          @case ('fade') {
            @for (tab of tabs; track tab.title; let i = $index) {
              <span class="tab plain" [ngStyle]="fadeStyles(tab, i)">{{ tab.title }}</span>
            }
          }
          @default {
            @for (tab of tabs; track tab.title) {
              <span class="tab plain" [ngStyle]="tabStyles(tab)">{{ tab.title }}</span>
            }
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .tab-bar {
      display: flex;
      flex-shrink: 0;
      overflow: hidden;
    }
    .tab-row {
      display: flex;
      align-items: stretch;
      min-width: 0;
      flex: 1;
    }
    .tab {
      display: inline-flex;
      align-items: center;
      padding: 0 14px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .tab.plain {
      padding: 0 16px;
    }
    .tab.powerline {
      position: relative;
      padding: 0 26px 0 22px;
      margin-right: -14px;
    }
    .tab.powerline.is-first {
      padding-left: 16px;
    }
    .tab.powerline.is-active {
      z-index: 2;
    }
    /* angled (default): right-pointing chevron */
    .tab.powerline {
      clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%);
    }
    /* slanted: parallelogram leaning right */
    .tab.powerline.pl-slanted {
      clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 100%, 0 100%);
    }
    /* round: half-disc right edge */
    .tab.powerline.pl-round {
      clip-path: none;
      border-top-right-radius: 999px;
      border-bottom-right-radius: 999px;
      padding-right: 22px;
      margin-right: -10px;
    }
    .tab.slant {
      position: relative;
      padding: 0 16px;
      isolation: isolate;
    }
    .slant-bg {
      position: absolute;
      inset: 4px -6px 0 -6px;
      transform: skewX(-18deg);
      z-index: -1;
      border-radius: 2px;
    }
    .separator {
      display: inline-flex;
      align-items: center;
      padding: 0 4px;
      opacity: 0.55;
    }
  `]
})
export class TerminalTabBarComponent {
  private readonly store = inject(ConfigStoreService);

  readonly edge = input<'top' | 'bottom'>('bottom');
  readonly tabs = PREVIEW_TABS;

  readonly style = computed(() => this.store.configState().tab_bar.tab_bar_style);
  readonly separator = computed(() => this.store.configState().tab_bar.tab_separator.trim() || '┇');
  readonly powerlineShape = computed(() => this.store.configState().tab_bar.tab_powerline_style);

  private readonly tabBar = computed(() => this.store.configState().tab_bar);
  private readonly colors = computed(() => this.store.configState().colors);
  private readonly palette = computed(() => effectiveTabColors(this.tabBar(), this.colors()));
  private readonly fontSize = computed(() => this.store.configState().fonts.font_size);

  private readonly cellPx = computed(() => ptToPx(this.fontSize()));
  private readonly height = computed(() => Math.round(this.cellPx() * TAB_BAR_RATIO));

  readonly barStyles = computed(() => {
    const tb = this.tabBar();
    const colors = this.colors();
    const margin = Math.max(0, tb.tab_bar_margin_width);

    return {
      height: `${this.height()}px`,
      backgroundColor: this.palette().barBg,
      fontSize: `${this.cellPx()}px`,
      color: rgba(colors.foreground, 0.7),
      paddingInline: `${margin}px`,
      borderTop: this.edge() === 'bottom' ? `1px solid ${rgba(colors.foreground, 0.08)}` : 'none',
      borderBottom: this.edge() === 'top' ? `1px solid ${rgba(colors.foreground, 0.08)}` : 'none',
      '--tab-height': `${this.height()}px`,
    } as Record<string, string>;
  });

  readonly rowStyles = computed(() => {
    const align = this.tabBar().tab_bar_align;
    const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
    return { justifyContent: justify } as Record<string, string>;
  });

  tabBg(tab: PreviewTab): string {
    const p = this.palette();
    return tab.active ? p.activeBg : p.inactiveBg;
  }

  private tabFg(tab: PreviewTab): string {
    const p = this.palette();
    return tab.active ? p.activeFg : p.inactiveFg;
  }

  tabStyles(tab: PreviewTab): Record<string, string> {
    return {
      backgroundColor: this.tabBg(tab),
      color: this.tabFg(tab),
      fontWeight: tab.active ? '600' : '400',
    };
  }

  slantStyles(tab: PreviewTab): Record<string, string> {
    return {
      color: this.tabFg(tab),
      fontWeight: tab.active ? '600' : '400',
    };
  }

  fadeStyles(tab: PreviewTab, index: number): Record<string, string> {
    const fade = this.tabBar().tab_fade?.length ? this.tabBar().tab_fade : DEFAULT_FADE_STEPS;
    const opacity = tab.active ? 1 : (fade[Math.min(index - 1, fade.length - 1)] ?? 0.5);
    return {
      color: this.tabFg(tab),
      opacity: String(opacity),
      fontWeight: tab.active ? '600' : '400',
    };
  }

  dimFg(): string {
    return rgba(this.colors().foreground, 0.5);
  }
}
