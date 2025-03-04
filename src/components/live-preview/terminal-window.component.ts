import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigStoreService } from '../../services/config-store.service';
import { FontPresetsService } from '../../services/font-presets.service';
import { ptToPx, rgba } from './color-utils';
import { TerminalChromeComponent } from './terminal-chrome.component';
import { TerminalTabBarComponent } from './terminal-tab-bar.component';
import { TerminalScreenComponent } from './terminal-screen.component';
import { PREVIEW_TABS } from './terminal-session';
import { FONT_SIZE_PT, LINE_HEIGHT_RATIO, TIMINGS, WALLPAPER } from './preview-metrics';

const TAB_COUNT = PREVIEW_TABS.length;

@Component({
  selector: 'app-terminal-window',
  imports: [
    CommonModule,
    TerminalChromeComponent,
    TerminalTabBarComponent,
    TerminalScreenComponent,
  ],
  template: `
    <div class="surface" [ngStyle]="surfaceVars()">
      <div class="wallpaper" [style.opacity]="wallpaperOpacity()"></div>

      <div class="window" [ngStyle]="windowStyles()">
        @if (showChrome()) {
          <app-terminal-chrome />
        }

        @if (showTabBar() && tabBarEdge() === 'top') {
          <app-terminal-tab-bar edge="top" />
        }

        <div class="canvas" [ngStyle]="canvasStyles()">
          <app-terminal-screen />
        </div>

        @if (showTabBar() && tabBarEdge() === 'bottom') {
          <app-terminal-tab-bar edge="bottom" />
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex: 1;
      min-height: 0;
    }
    .surface {
      position: relative;
      flex: 1;
      min-height: 0;
      display: flex;
      isolation: isolate;
      border-radius: 10px;
      overflow: hidden;
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.04) inset,
        0 16px 48px -24px rgba(0, 0, 0, 0.55),
        0 0 0 1px rgba(0, 0, 0, 0.18);
    }
    .wallpaper {
      position: absolute;
      inset: 0;
      z-index: 0;
      background-color: var(--wallpaper-base);
      background-image:
        linear-gradient(45deg,  var(--wallpaper-check) 25%, transparent 25%),
        linear-gradient(-45deg, var(--wallpaper-check) 25%, transparent 25%),
        linear-gradient(45deg,  transparent 75%, var(--wallpaper-check) 75%),
        linear-gradient(-45deg, transparent 75%, var(--wallpaper-check) 75%);
      background-size: var(--wallpaper-cell) var(--wallpaper-cell);
      background-position: 0 0, 0 calc(var(--wallpaper-cell) / 2),
                           calc(var(--wallpaper-cell) / 2) calc(var(--wallpaper-cell) / -2),
                           calc(var(--wallpaper-cell) / -2) 0;
      transition: opacity 180ms ease;
      pointer-events: none;
    }
    .window {
      position: relative;
      z-index: 1;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: background-color var(--theme-swap-ms) ease, color var(--theme-swap-ms) ease;
    }
    .canvas {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: background-color var(--theme-swap-ms) ease;
    }
    @media (prefers-reduced-motion: reduce) {
      .window, .canvas { transition: none; }
    }
  `]
})
export class TerminalWindowComponent {
  private readonly store = inject(ConfigStoreService);
  private readonly fontPresets = inject(FontPresetsService);

  private readonly fonts = computed(() => this.store.configState().fonts);
  private readonly colors = computed(() => this.store.configState().colors);
  private readonly tabBar = computed(() => this.store.configState().tab_bar);
  private readonly windowCfg = computed(() => this.store.configState().window_layout);

  constructor() {
    effect(() => {
      const family = this.fonts().font_family;
      this.fontPresets.loadWebFont(family);
    });
  }

  readonly showChrome = computed(() => {
    const decor = this.windowCfg().hide_window_decorations;
    return decor === false || decor === 'no';
  });

  readonly showTabBar = computed(() => {
    const tb = this.tabBar();
    return tb.tab_bar_style !== 'hidden' && TAB_COUNT >= (tb.tab_bar_min_tabs ?? 2);
  });
  readonly tabBarEdge = computed(() => this.tabBar().tab_bar_edge);

  readonly wallpaperOpacity = computed(() => {
    const opacity = this.colors().background_opacity ?? 1;
    return Math.max(0, Math.min(1, 1 - opacity));
  });

  readonly windowStyles = computed(() => {
    const colors = this.colors();
    const fonts = this.fonts();
    const w = this.windowCfg();
    const pt = Math.max(FONT_SIZE_PT.min, Math.min(FONT_SIZE_PT.max, fonts.font_size));
    const px = ptToPx(pt);
    const opacity = colors.background_opacity ?? 1;
    const blur = colors.background_blur ?? 0;
    const borderWidth = this.parseBorderWidth(w.window_border_width);
    const ligatures = fonts.disable_ligatures === 'always' ? 'none' : 'contextual';

    return {
      backgroundColor: rgba(colors.background, opacity),
      color: colors.foreground,
      fontFamily: `"${fonts.font_family}", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`,
      fontSize: `${px}px`,
      lineHeight: String(LINE_HEIGHT_RATIO),
      fontVariantLigatures: ligatures,
      fontKerning: 'none',
      textRendering: 'geometricPrecision',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      borderRadius: '10px',
      outline: borderWidth ? `${borderWidth}px solid ${w.active_border_color}` : 'none',
      outlineOffset: borderWidth ? `-${borderWidth}px` : '0',
      backdropFilter: blur > 0 && opacity < 1 ? `blur(${blur}px)` : 'none',
      WebkitBackdropFilter: blur > 0 && opacity < 1 ? `blur(${blur}px)` : 'none',
    } as Record<string, string>;
  });

  readonly surfaceVars = computed(() => ({
    '--wallpaper-base':  WALLPAPER.base,
    '--wallpaper-check': WALLPAPER.check,
    '--wallpaper-cell':  `${WALLPAPER.cellPx}px`,
    '--theme-swap-ms':   `${TIMINGS.themeSwap}ms`,
  }) as Record<string, string>);

  readonly canvasStyles = computed(() => {
    const w = this.windowCfg();
    const padding = w.single_window_padding_width >= 0
      ? w.single_window_padding_width
      : w.window_padding_width;
    const tint = this.colors().background_tint;
    const tintColor = tint > 0
      ? `rgba(0, 0, 0, ${Math.min(0.8, tint)})`
      : 'transparent';
    return {
      padding: `${Math.max(10, padding + 14)}px ${Math.max(14, padding + 18)}px`,
      backgroundColor: tintColor,
    } as Record<string, string>;
  });

  private parseBorderWidth(value: string | undefined): number {
    if (!value) return 0;
    const trimmed = value.trim();
    if (!trimmed || trimmed === '0' || trimmed.startsWith('0pt') || trimmed === '0px') return 0;
    if (trimmed.endsWith('pt')) return Math.round(ptToPx(Number.parseFloat(trimmed)));
    if (trimmed.endsWith('px')) return Math.round(Number.parseFloat(trimmed));
    const n = Number.parseFloat(trimmed);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }
}
