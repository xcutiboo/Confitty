import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigStoreService } from '../../services/config-store.service';
import { FontPresetsService } from '../../services/font-presets.service';
import { ThemeTokensService } from '../../services/theme-tokens.service';

@Component({
  selector: 'app-terminal-window',
  imports: [CommonModule],
  template: `
    <div class="flex-1 overflow-hidden flex flex-col rounded-lg relative" [ngStyle]="containerStyles()">
      @if (hasWindowBorder()) {
        <div class="absolute inset-0 pointer-events-none rounded-lg" [ngStyle]="windowBorderStyles()"></div>
      }
      @if (!hideDecorations()) {
        <div class="flex items-center select-none border-b shrink-0" [ngStyle]="titleBarContainerStyles()">
          <div class="flex items-center" [ngStyle]="trafficLightContainerStyles()">
            <div class="rounded-full transition-transform hover:scale-110 traffic-alive" [ngStyle]="trafficLightStyles('close')"></div>
            <div class="rounded-full transition-transform hover:scale-110 traffic-alive" [ngStyle]="trafficLightStyles('minimize')"></div>
            <div class="rounded-full transition-transform hover:scale-110 traffic-alive" [ngStyle]="trafficLightStyles('maximize')"></div>
          </div>
          <span class="flex-1 text-center select-none" [ngStyle]="titleTextStyles()">bash</span>
        </div>
      }
      @if (tabBarVisible() && tabBarEdge() === 'top') {
        <ng-container *ngTemplateOutlet="tabBar"></ng-container>
      }
      <div class="flex-1 overflow-hidden relative" [ngStyle]="terminalAreaStyles()">
        <div class="absolute inset-0 -z-20" [ngStyle]="bgLayerStyles()"></div>
        <div class="h-full overflow-hidden flex flex-col" [ngStyle]="terminalContentStyles()">
          <!-- Terminal Session - Primary Content -->
          <div class="flex-1 p-4" [class.idle-alive]="aliveEffectsModel().idleAnimation.enabled">
            <!-- ls command showing file listings with colors -->
            <div [ngStyle]="terminalLineStyles()">
              <span [ngStyle]="promptStyles()">~</span>
              <span [ngStyle]="fgColor()"> ls -la</span>
            </div>
            <div [ngStyle]="terminalLineStyles()">
              <span [ngStyle]="dimText()">total 128</span>
            </div>
            <div [ngStyle]="terminalLineStyles()">
              <span [ngStyle]="ansiColor('color4')">drwxr-xr-x</span>
              <span [ngStyle]="dimText()">  12 </span>
              <span [ngStyle]="ansiColor('color6')">user</span>
              <span [ngStyle]="dimText()">  staff   384 Jan 14 09:23 </span>
              <span [ngStyle]="ansiColor('color4')">.</span>
            </div>
            <div [ngStyle]="terminalLineStyles()">
              <span [ngStyle]="ansiColor('color4')">drwxr-xr-x</span>
              <span [ngStyle]="dimText()">   6 </span>
              <span [ngStyle]="ansiColor('color6')">root</span>
              <span [ngStyle]="dimText()">  wheel   192 Jan 12 14:15 </span>
              <span [ngStyle]="ansiColor('color4')">..</span>
            </div>
            <div [ngStyle]="terminalLineStyles()">
              <span [ngStyle]="ansiColor('color2')">-rw-r--r--</span>
              <span [ngStyle]="dimText()">   1 </span>
              <ng-container>
                <span [ngStyle]="ansiColor('color6')">user</span>
                <span [ngStyle]="dimText()">  staff  4096 Jan 15 11:42 </span>
                <span [ngStyle]="ansiColor('color3')">kitty.conf</span>
                <span [ngStyle]="dimText()">*</span>
              </ng-container>
            </div>
            <div [ngStyle]="terminalLineStyles()">
              <span [ngStyle]="ansiColor('color2')">-rw-r--r--</span>
              <span [ngStyle]="dimText()">   1 </span>
              <span [ngStyle]="ansiColor('color6')">user</span>
              <span [ngStyle]="dimText()">  staff  2847 Jan 14 16:30 </span>
              <span [ngStyle]="ansiColor('color5')">.zshrc</span>
            </div>
            <div [ngStyle]="terminalLineStyles()">
              <span [ngStyle]="ansiColor('color4')">drwxr-xr-x</span>
              <span [ngStyle]="dimText()">  24 </span>
              <span [ngStyle]="ansiColor('color6')">user</span>
              <span [ngStyle]="dimText()">  staff   768 Jan 15 08:15 </span>
              <span [ngStyle]="ansiColor('color4')">.config/</span>
            </div>

            <!-- Selected text in realistic context -->
            <div [ngStyle]="terminalLineStyles(true)">
              <span [ngStyle]="selectionStyles()">kitty.conf</span>
              <span [ngStyle]="fgColor()"> selected - 1 of 6</span>
            </div>

            <!-- Second command - npm install -->
            <div [ngStyle]="terminalLineStyles(true)">
              <span [ngStyle]="promptStyles()">~/projects</span>
              <span [ngStyle]="fgColor()"> npm install</span>
            </div>
            <div [ngStyle]="terminalLineStyles()">
              <span [ngStyle]="ansiColor('color2')">added</span>
              <span [ngStyle]="fgColor()"> 42 packages in 2.3s</span>
            </div>
            <div [ngStyle]="terminalLineStyles()">
              <span [ngStyle]="ansiColor('color3')">15</span>
              <span [ngStyle]="dimText()"> packages looking for funding</span>
            </div>

            <!-- Third command - git status -->
            <div [ngStyle]="terminalLineStyles(true)">
              <span [ngStyle]="promptStyles()">~/projects/app</span>
              <span [ngStyle]="fgColor()"> git status</span>
            </div>
            <div [ngStyle]="terminalLineStyles()">
              <span [ngStyle]="ansiColor('color2')">On branch</span>
              <span [ngStyle]="fgColor()"> main</span>
            </div>
            <div [ngStyle]="terminalLineStyles()">
              <span [ngStyle]="ansiColor('color1')">modified:</span>
              <span [ngStyle]="ansiColor('color3')"> src/main.ts</span>
            </div>

            <!-- Final prompt with cursor -->
            <div [ngStyle]="terminalLineStyles(true)">
              <span [ngStyle]="promptStyles()">~</span>
              <span [ngStyle]="fgColor()"> </span>
              @switch (cursorShape()) {
                @case ('block') {
                  <span [ngStyle]="cursorBlockStyles()" [class.animate-cursor]="cursorBlinking()">&nbsp;</span>
                }
                @case ('beam') {
                  <span [ngStyle]="cursorBeamStyles()" [class.animate-cursor]="cursorBlinking()"></span>
                }
                @default {
                  <span [ngStyle]="cursorUnderlineStyles()" [class.animate-cursor]="cursorBlinking()">&nbsp;</span>
                }
              }
            </div>

            <!-- ANSI Palette - Positioned below cursor -->
            <div [ngStyle]="ansiPaletteContainerStyles()">
              <div [ngStyle]="ansiPaletteRowStyles()">
                <span [ngStyle]="ansiColorBlock('color0')" title="black"></span>
                <span [ngStyle]="ansiColorBlock('color1')" title="red"></span>
                <span [ngStyle]="ansiColorBlock('color2')" title="green"></span>
                <span [ngStyle]="ansiColorBlock('color3')" title="yellow"></span>
                <span [ngStyle]="ansiColorBlock('color4')" title="blue"></span>
                <span [ngStyle]="ansiColorBlock('color5')" title="magenta"></span>
                <span [ngStyle]="ansiColorBlock('color6')" title="cyan"></span>
                <span [ngStyle]="ansiColorBlock('color7')" title="white"></span>
              </div>
              <div [ngStyle]="ansiPaletteRowStyles()">
                <span [ngStyle]="ansiColorBlock('color8')" title="bright black"></span>
                <span [ngStyle]="ansiColorBlock('color9')" title="bright red"></span>
                <span [ngStyle]="ansiColorBlock('color10')" title="bright green"></span>
                <span [ngStyle]="ansiColorBlock('color11')" title="bright yellow"></span>
                <span [ngStyle]="ansiColorBlock('color12')" title="bright blue"></span>
                <span [ngStyle]="ansiColorBlock('color13')" title="bright magenta"></span>
                <span [ngStyle]="ansiColorBlock('color14')" title="bright cyan"></span>
                <span [ngStyle]="ansiColorBlock('color15')" title="bright white"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      @if (tabBarVisible() && tabBarEdge() === 'bottom') {
        <ng-container *ngTemplateOutlet="tabBar"></ng-container>
      }
    </div>
    <ng-template #tabBar>
      <div class="flex items-end overflow-hidden select-none shrink-0" [ngStyle]="tabBarContainerStyles()" [style.--arrow-size.px]="tabBarModel().arrowSize">
        @switch (tabBarStyle()) {
          @case ('powerline') {
            @for (tab of tabs; track tab.name; let i = $index; let last = $last) {
              <div class="relative flex items-center cursor-pointer h-full"
                   [style.z-index]="tabs.length - i"
                   [style.background-color]="i === 0 ? activeTabBg() : inactiveTabBg()"
                   [style.color]="i === 0 ? activeTabFg() : inactiveTabFg()"
                   [style.padding-left.px]="i === 0 ? tabBarModel().padding.x : tabBarModel().padding.x + 8"
                   [style.padding-right.px]="last ? tabBarModel().padding.x + 8 : tabBarModel().padding.x">
                <span class="truncate relative z-10" [ngStyle]="{fontSize: fontSizePx() + 'px', fontFamily: terminalFont()}">{{ tab.name }}</span>
                @if (!last) {
                  <div class="absolute top-0 w-0 h-0 z-20 powerline-arrow"
                       [style.right.px]="-tabBarModel().arrowSize"
                       [style.border-left-color]="i === 0 ? activeTabBg() : inactiveTabBg()">
                  </div>
                }
              </div>
            }
          }
          @case ('slant') {
            <div class="flex h-full" [style.margin-left.px]="tabBarModel().padding.x / 2">
              @for (tab of tabs; track tab.name; let i = $index) {
                <div class="relative flex items-center cursor-pointer isolate h-full"
                     [style.color]="i === 0 ? activeTabFg() : inactiveTabFg()"
                     [style.z-index]="tabs.length - i"
                     [style.padding-left.px]="tabBarModel().padding.x"
                     [style.padding-right.px]="tabBarModel().padding.x">
                  <div class="absolute inset-y-0 -inset-x-2 -skew-x-12 -z-10 rounded-sm"
                       [style.background-color]="i === 0 ? activeTabBg() : inactiveTabBg()"
                       [class.rounded-tl-sm]="i === 0">
                  </div>
                  <span class="truncate" [ngStyle]="{fontSize: fontSizePx() + 'px', fontFamily: terminalFont()}">{{ tab.name }}</span>
                </div>
              }
            </div>
          }
          @case ('fade') {
            @for (tab of tabs; track tab.name; let i = $index; let last = $last) {
              <div class="flex items-center h-full cursor-pointer border-r"
                   [ngStyle]="fadeTabBorderStyles()"
                   [style.background-color]="tabBarBg()">
                <span class="truncate"
                      [style.opacity]="i === 0 ? '1' : fadeOpacity(i)"
                      [ngStyle]="{fontSize: fontSizePx() + 'px', fontFamily: terminalFont(), color: i === 0 ? activeTabFg() : inactiveTabFg(), paddingLeft: tabBarModel().padding.x + 'px', paddingRight: tabBarModel().padding.x + 'px'}">
                  {{ tab.name }}
                </span>
              </div>
            }
          }
          @case ('separator') {
            @for (tab of tabs; track tab.name; let i = $index; let last = $last) {
              <div class="flex items-center h-full cursor-pointer"
                   [style.background-color]="tabBarBg()"
                   [style.color]="i === 0 ? activeTabFg() : inactiveTabFg()">
                <span class="truncate" [ngStyle]="{fontSize: fontSizePx() + 'px', fontFamily: terminalFont(), paddingLeft: tabBarModel().padding.x + 'px', paddingRight: tabBarModel().padding.x + 'px'}">{{ tab.name }}</span>
                @if (!last) {
                  <span [ngStyle]="{fontSize: fontSizePx() + 'px', opacity: tabBarCfg().tab_separator_opacity, color: inactiveTabFg(), paddingRight: tabBarModel().padding.x + 'px'}">
                    {{ tabSeparator() }}
                  </span>
                }
              </div>
            }
          }
          @default {
            @for (tab of tabs; track tab.name; let i = $index) {
              <div class="flex items-center h-full cursor-pointer"
                   [style.background-color]="i === 0 ? activeTabBg() : inactiveTabBg()"
                   [style.color]="i === 0 ? activeTabFg() : inactiveTabFg()"
                   [style.padding-left.px]="tabBarModel().padding.x"
                   [style.padding-right.px]="tabBarModel().padding.x">
                <span class="truncate" [ngStyle]="{fontSize: fontSizePx() + 'px', fontFamily: terminalFont()}">{{ tab.name }}</span>
              </div>
            }
          }
        }
      </div>
    </ng-template>
  `,
  styles: [`
    .powerline-arrow {
      border-top: var(--arrow-size, 12px) solid transparent;
      border-bottom: var(--arrow-size, 12px) solid transparent;
      border-left: var(--arrow-size, 12px) solid;
    }
    @keyframes cursor-blink {
      0%, 50% { opacity: var(--cursor-blink-opacity, 1); }
      51%, 100% { opacity: var(--cursor-blink-min-opacity, 0); }
    }
    .animate-cursor {
      animation: cursor-blink var(--cursor-blink-duration, 1s) step-end infinite;
    }
    .isolate { isolation: isolate; }
  `]
})
export class TerminalWindowComponent {
  private readonly store = inject(ConfigStoreService);
  private readonly fontPresets = inject(FontPresetsService);
  private readonly themeTokens = inject(ThemeTokensService);

  // Rendering Constants - derived from config only, not magic numbers
  readonly TAB_PADDING_RATIO = 0.5;
  readonly CURSOR_WIDTH_RATIO = 0.6;
  readonly TAB_HEIGHT_PADDING_RATIO = 0.4;
  readonly ANSI_ROW_HEIGHT_RATIO = 1.2;
  readonly MIN_FONT_SIZE = 6;
  readonly MAX_FONT_SIZE = 72;
  readonly LINE_HEIGHT_MULTIPLIER = 1.25;
  // Color adjustment amounts - perceptually uniform darkening/lightening
  readonly TITLE_BAR_DARKEN_AMOUNT = 8;
  readonly TITLE_BAR_BORDER_DARKEN_AMOUNT = 15;
  readonly TAB_BAR_BG_DARKEN_AMOUNT = 5;
  readonly PALETTE_BORDER_DARKEN_AMOUNT = 15;
  readonly TRAFFIC_LIGHT_DARKEN_AMOUNT = 10;
  readonly TRAFFIC_LIGHT_LIGHTEN_AMOUNT = 10;
  readonly ACTIVE_LINE_PULSE_LIGHTEN_AMOUNT = 5;
  // Layout spacing - proportional ratios based on visual hierarchy
  readonly TRAFFIC_LIGHT_GAP_RATIO = 1 / 3;
  readonly PALETTE_MARGIN_RATIO = 0.5;
  readonly ARROW_SIZE_RATIO = 0.5;
  // Minimum gap for color palette (absolute minimum, not derived)
  readonly PALETTE_MIN_GAP = 4;
  readonly PALETTE_GAP_RATIO = 0.3;
  readonly PALETTE_PADDING_X_RATIO = 0.75;
  readonly PALETTE_PADDING_Y_RATIO = 0.6;
  // Selection styling ratios
  readonly SELECTION_PADDING_Y_RATIO = 0.1;
  readonly SELECTION_PADDING_X_RATIO = 0.3;
  readonly SELECTION_BORDER_RADIUS_RATIO = 0.2;
  // Cursor beam styling
  readonly BEAM_BORDER_RADIUS_RATIO = 0.5;
  // Unit conversion
  readonly PT_TO_PX_RATIO = 1.333;
  // Luminance calculation coefficients (BT.601 standard)
  readonly LUMINANCE_RED_COEFF = 0.299;
  readonly LUMINANCE_GREEN_COEFF = 0.587;
  readonly LUMINANCE_BLUE_COEFF = 0.114;
  // Animation defaults - these are defaults when not specified in config
  readonly TRAFFIC_LIGHT_ANIMATION_DURATION_DEFAULT = 0.3;
  readonly TRAFFIC_LIGHT_ANIMATION_SCALE_DEFAULT = 1.05;

  readonly tabs = [{ name: 'bash' }, { name: 'nvim' }, { name: 'git' }];

  constructor() {
    effect(() => {
      const family = this.store.configState().fonts.font_family;
      this.fontPresets.loadWebFont(family);
    });
  }

  colors = computed(() => this.store.configState().colors);
  fonts = computed(() => this.store.configState().fonts);
  cursorCfg = computed(() => this.store.configState().cursor);
  tabBarCfg = computed(() => this.store.configState().tab_bar);
  windowCfg = computed(() => this.store.configState().window_layout);
  mouseCfg = computed(() => this.store.configState().mouse);

  terminalFont = computed(() => {
    const f = this.fonts().font_family;
    return `"${f}", monospace`;
  });

  fontSizePx = computed(() => {
    const size = this.fonts().font_size;
    return Math.max(this.MIN_FONT_SIZE, Math.min(size, this.MAX_FONT_SIZE));
  });

  lineHeightPx = computed(() => {
    const modifyFont = this.fonts().modify_font;
    let cellHeight = this.fontSizePx() * this.LINE_HEIGHT_MULTIPLIER;

    // modify_font is string[], search for cell_height in any element
    if (Array.isArray(modifyFont)) {
      for (const rule of modifyFont) {
        if (typeof rule === 'string' && rule.includes('cell_height')) {
          const match = rule.match(/cell_height\s*(\d+(?:\.\d+)?)%?/);
          if (match && match[1]) {
            cellHeight = this.fontSizePx() * (Number.parseFloat(match[1]) / 100);
            break;
          }
        }
      }
    }

    return Math.round(cellHeight);
  });

  c(key: string): string {
    return (this.colors() as unknown as Record<string, string>)[key]!;
  }

  fgColor(opacity = 1): Record<string, string> {
    return {
      color: this.colors().foreground,
      ...(opacity < 1 && { opacity: String(opacity) })
    };
  }

  dimText(): Record<string, string> {
    const dimOpacity = this.colors().dim_opacity;
    return { color: this.colors().foreground, opacity: String(dimOpacity) };
  }

  ansiColor(index: string): Record<string, string> {
    return { color: this.c(index) };
  }

  cursorShape = computed(() => this.cursorCfg().cursor_shape);
  cursorColor = computed(() => {
    const cfg = this.cursorCfg();
    if (cfg.cursor === 'none') return 'transparent';
    return cfg.cursor!;
  });

  cursorBlinking = computed(() => this.cursorCfg().cursor_blink_interval !== 0);
  cursorBlinkDuration = computed(() => {
    const interval = this.cursorCfg().cursor_blink_interval;
    if (interval === 0 || interval === -1) return '0s';
    return `${interval * 2}s`;
  });

  cursorBeamThickness = computed(() => this.cursorCfg().cursor_beam_thickness!);

  cursorBlockStyles(): Record<string, string> {
    const fontSize = this.fontSizePx();
    
    return {
      display: 'inline-block',
      width: `${fontSize * this.CURSOR_WIDTH_RATIO}px`,
      height: `${this.lineHeightPx()}px`,
      backgroundColor: this.cursorColor(),
      verticalAlign: 'text-bottom',
      animationDuration: this.cursorBlinkDuration()
    };
  }

  cursorBeamStyles(): Record<string, string> {
    const thickness = this.cursorBeamThickness();
    
    return {
      display: 'inline-block',
      width: `${thickness}px`,
      height: `${this.lineHeightPx()}px`,
      backgroundColor: this.cursorColor(),
      verticalAlign: 'text-bottom',
      animationDuration: this.cursorBlinkDuration(),
      borderRadius: `${Math.max(1, thickness * this.BEAM_BORDER_RADIUS_RATIO)}px`
    };
  }

  cursorUnderlineStyles(): Record<string, string> {
    const thickness = this.cursorCfg().cursor_underline_thickness!;
    const fontSize = this.fontSizePx();
    
    return {
      display: 'inline-block',
      width: `${fontSize * this.CURSOR_WIDTH_RATIO}px`,
      height: `${this.lineHeightPx()}px`,
      borderBottom: `${thickness}px solid ${this.cursorColor()}`,
      verticalAlign: 'text-bottom',
      animationDuration: this.cursorBlinkDuration()
    };
  }

  containerStyles = computed(() => {
    const cfg = this.windowCfg();
    const margin = cfg.window_margin_width;
    return { backgroundColor: this.colors().background, margin: `${margin}px` };
  });

  hasWindowBorder = computed(() => {
    const borderWidth = this.windowCfg().window_border_width;
    return borderWidth && borderWidth !== '0' && borderWidth !== '0pt' && borderWidth !== '0px';
  });

  windowBorderStyles = computed(() => {
    const cfg = this.windowCfg();
    const borderWidth = this.parseBorderWidth(cfg.window_border_width);
    const color = cfg.active_border_color!;
    return { border: `${borderWidth} solid ${color}`, borderRadius: cfg.window_border_radius };
  });

  hideDecorations = computed(() => this.windowCfg().hide_window_decorations);

  titleBarContainerStyles = computed(() => {
    const cfg = this.windowCfg();
    const model = this.terminalLayoutModel();
    const bg = this.darken(this.colors().background, this.TITLE_BAR_DARKEN_AMOUNT);
    const borderColor = this.darken(this.colors().background, this.TITLE_BAR_BORDER_DARKEN_AMOUNT);
    return {
      backgroundColor: bg,
      borderColor: borderColor,
      borderBottomWidth: model.border.width,
      borderBottomStyle: 'solid',
      padding: `${cfg.title_bar_padding_y}px ${cfg.title_bar_padding_x}px`
    };
  });

  trafficLightContainerStyles = computed(() => {
    const cfg = this.windowCfg();
    // Gap proportional to traffic light size for visual balance
    const gap = Math.round(cfg.traffic_light_size * this.TRAFFIC_LIGHT_GAP_RATIO);
    return {
      display: 'flex',
      gap: `${gap}px`
    };
  });

  titleTextStyles = computed(() => ({
    fontFamily: this.terminalFont(),
    fontSize: `${this.fontSizePx()}px`,
    color: this.colors().foreground,
    opacity: String(this.colors().dim_opacity)
  }));

  terminalAreaStyles = computed(() => {
    const cfg = this.windowCfg();
    const padding = cfg.window_padding_width;
    const singlePadding = cfg.single_window_padding_width;
    const effectivePadding = singlePadding >= 0 ? singlePadding : padding;
    return { padding: `${effectivePadding}px` };
  });

  bgLayerStyles = computed(() => {
    const bg = this.colors().background;
    const opacity = this.colors().background_opacity;
    return { backgroundColor: bg, opacity: String(opacity) };
  });

  terminalContentStyles = computed(() => {
    const aliveModel = this.aliveEffectsModel();
    const cursorModel = aliveModel.cursorBreathing;
    return {
      fontFamily: this.terminalFont(),
      fontSize: `${this.fontSizePx()}px`,
      lineHeight: `${this.lineHeightPx()}px`,
      color: this.colors().foreground,
      // CSS variables for alive effects
      '--idle-animation-speed': `${aliveModel.idleAnimation.speed}s`,
      '--active-line-bg': aliveModel.activeLinePulse.backgroundColor,
      '--active-line-bg-pulse': this.lighten(aliveModel.activeLinePulse.backgroundColor, this.ACTIVE_LINE_PULSE_LIGHTEN_AMOUNT),
      // Cursor breathing CSS variables
      '--cursor-breathing-speed': `${cursorModel.speed}s`,
      '--cursor-breathing-min-opacity': String(cursorModel.minOpacity),
      '--cursor-breathing-max-opacity': String(cursorModel.maxOpacity),
      // Typing simulation CSS variables
      '--typing-simulation-speed': `${aliveModel.typingSimulation.speed}s`,
      '--typing-cursor-min-opacity': String(cursorModel.minOpacity),
      // Traffic light pulse CSS variables - use config value or reasonable default
      '--traffic-pulse-duration': `${this.windowCfg().traffic_light_animation_duration ?? this.TRAFFIC_LIGHT_ANIMATION_DURATION_DEFAULT}s`,
      '--traffic-pulse-scale': String(this.windowCfg().traffic_light_animation_scale ?? this.TRAFFIC_LIGHT_ANIMATION_SCALE_DEFAULT)
    } as Record<string, string>;
  });

  textLineStyles(spaced = false): Record<string, string> {
    return { whiteSpace: 'nowrap', ...(spaced && { marginTop: `${this.lineHeightPx()}px` }) };
  }

  // New: Terminal line styles for redesigned template
  terminalLineStyles(spaced = false): Record<string, string> {
    return {
      whiteSpace: 'nowrap',
      ...(spaced && { marginTop: `${this.lineHeightPx()}px` })
    };
  }

  // New: Prompt styles for realistic terminal
  promptStyles(): Record<string, string> {
    return {
      color: this.colors().color2!,
      fontWeight: 'bold'
    };
  }

  // ANSI Palette Styling - Pure data render via colorPaletteModel
  ansiPaletteStyles(): Record<string, string> {
    const model = this.colorPaletteModel();
    return {
      display: 'flex',
      flexDirection: 'column',
      gap: `${model.gap}px`,
      marginBottom: `${Math.round(model.rowHeight * this.PALETTE_MARGIN_RATIO)}px`
    };
  }

  ansiPaletteContainerStyles(): Record<string, string> {
    const model = this.colorPaletteModel();
    return {
      padding: `${model.containerPadding.y}px ${model.containerPadding.x}px`,
      borderTop: `1px solid ${model.borderColor}`,
      marginTop: 'auto'
    };
  }

  ansiPaletteRowStyles(): Record<string, string> {
    const model = this.colorPaletteModel();
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${model.colorsPerRow}, 1fr)`,
      gap: `${model.gap}px`,
      height: `${model.rowHeight}px`,
      minHeight: `${model.rowHeight}px`
    };
  }

  ansiColorBlock(colorKey: string): Record<string, string> {
    const color = this.c(colorKey);
    const layoutModel = this.terminalLayoutModel();
    return {
      width: '100%',
      height: '100%',
      backgroundColor: color,
      borderRadius: layoutModel.border.radius
    };
  }

  urlColor = computed(() => this.mouseCfg().url_color!);
  urlStyle = computed(() => this.mouseCfg().url_style!);

  urlStyles(): Record<string, string> {
    const style = this.urlStyle();
    const color = this.urlColor();
    let decoration = 'underline';
    if (style === 'dotted') decoration = 'underline dotted';
    if (style === 'dashed') decoration = 'underline dashed';
    if (style === 'double') decoration = 'underline double';
    if (style === 'curly') decoration = 'underline wavy';
    return { color: color, textDecoration: decoration, cursor: 'pointer' };
  }

  selectionStyles(): Record<string, string> {
    const colors = this.colors();
    const fontSize = this.fontSizePx();
    return {
      color: colors.selection_foreground,
      backgroundColor: colors.selection_background,
      padding: `${Math.round(fontSize * this.SELECTION_PADDING_Y_RATIO)}px ${Math.round(fontSize * this.SELECTION_PADDING_X_RATIO)}px`,
      borderRadius: `${Math.round(fontSize * this.SELECTION_BORDER_RADIUS_RATIO)}px`,
      margin: `0 -${Math.round(fontSize * this.SELECTION_PADDING_X_RATIO)}px`
    };
  }

  tabBarVisible = computed(() => {
    const cfg = this.tabBarCfg();
    const minTabs = cfg.tab_bar_min_tabs!;
    return cfg.tab_bar_style !== 'hidden' && this.tabs.length >= minTabs;
  });

  tabBarEdge = computed(() => this.tabBarCfg().tab_bar_edge);
  tabBarStyle = computed(() => this.tabBarCfg().tab_bar_style);
  tabSeparator = computed(() => this.tabBarCfg().tab_separator!);

  tabBarHeight = computed(() => {
    const lineHeight = this.lineHeightPx();
    const padding = Math.round(lineHeight * this.TAB_HEIGHT_PADDING_RATIO);
    return lineHeight + padding;
  });

  tabBarContainerStyles = computed(() => {
    const cfg = this.tabBarCfg();
    const marginHeight = cfg.tab_bar_margin_height;
    let marginTop = 0, marginBottom = 0;
    if (Array.isArray(marginHeight)) {
      marginTop = marginHeight[0] ?? 0;
      marginBottom = marginHeight[1] ?? 0;
    } else if (typeof marginHeight === 'number') {
      marginTop = marginBottom = marginHeight;
    }
    const bg = cfg.tab_bar_background !== 'none'
      ? cfg.tab_bar_background
      : this.darken(this.colors().background, this.TAB_BAR_BG_DARKEN_AMOUNT);
    return {
      height: `${this.tabBarHeight()}px`,
      backgroundColor: bg,
      marginTop: `${marginTop}px`,
      marginBottom: `${marginBottom}px`
    };
  });

  tabBarBg = computed(() => {
    const cfg = this.tabBarCfg();
    return cfg.tab_bar_background !== 'none'
      ? cfg.tab_bar_background
      : this.darken(this.colors().background, this.TAB_BAR_BG_DARKEN_AMOUNT);
  });

  // Tab Bar Colors - Direct from config only
  // All values MUST be provided by config - no fallbacks in rendering logic
  activeTabBg = computed(() => this.tabBarCfg().active_tab_background);
  activeTabFg = computed(() => this.tabBarCfg().active_tab_foreground);
  inactiveTabBg = computed(() => this.tabBarCfg().inactive_tab_background);
  inactiveTabFg = computed(() => this.tabBarCfg().inactive_tab_foreground);

  // DERIVED RENDERING MODELS - Phase 3
  // These models consolidate all rendering calculations into config-derived structures
  // NO UI hacks, NO arbitrary values, NO hardcoded pixel values

  tabBarModel = computed(() => {
    const cfg = this.tabBarCfg();
    const lineHeight = this.lineHeightPx();
    const fontSize = this.fontSizePx();

    // Tab bar height: line-height + vertical padding (derived, not guessed)
    const paddingVertical = Math.round(lineHeight * this.TAB_HEIGHT_PADDING_RATIO);
    const height = lineHeight + paddingVertical;

    // Padding from config (not hardcoded px-4, px-5, etc.)
    const paddingHorizontal = cfg.tab_padding_horizontal;
    const tabPaddingVertical = cfg.tab_padding_vertical;

    // Powerline arrow size derived from tab bar height
    const arrowSize = Math.round(height * this.ARROW_SIZE_RATIO);

    return {
      height,
      padding: { x: paddingHorizontal, y: tabPaddingVertical },
      arrowSize,
      visible: cfg.tab_bar_style !== 'hidden' && this.tabs.length >= cfg.tab_bar_min_tabs!,
      edge: cfg.tab_bar_edge,
      style: cfg.tab_bar_style,
      separator: cfg.tab_separator,
      colors: {
        bg: cfg.tab_bar_background !== 'none'
          ? cfg.tab_bar_background
          : this.darken(this.colors().background, this.TAB_BAR_BG_DARKEN_AMOUNT),
        activeBg: cfg.active_tab_background,
        activeFg: cfg.active_tab_foreground,
        inactiveBg: cfg.inactive_tab_background,
        inactiveFg: cfg.inactive_tab_foreground
      }
    };
  });

  colorPaletteModel = computed(() => {
    const fontSize = this.fontSizePx();
    const cfg = this.colors();

    // Deterministic grid sizing - grid handles distribution, no percentage hacks needed
    // Row height scales with font for proportional appearance
    const rowHeight = Math.round(fontSize * this.ANSI_ROW_HEIGHT_RATIO);

    // Standard ANSI palette: 8 colors per row (0-7 normal, 8-15 bright)
    const colorsPerRow = 8;

    // Gap derived from font size (consistent spacing)
    const gap = Math.max(this.PALETTE_MIN_GAP, Math.round(fontSize * this.PALETTE_GAP_RATIO));

    return {
      colorsPerRow,
      rowHeight,
      gap,
      containerPadding: { x: Math.round(fontSize * this.PALETTE_PADDING_X_RATIO), y: Math.round(fontSize * this.PALETTE_PADDING_Y_RATIO) },
      borderColor: this.darken(cfg.background, this.PALETTE_BORDER_DARKEN_AMOUNT)
    };
  });

  terminalLayoutModel = computed(() => {
    const cfg = this.windowCfg();
    const colors = this.colors();

    // Terminal padding from config
    const padding = cfg.single_window_padding_width >= 0
      ? cfg.single_window_padding_width
      : cfg.window_padding_width;

    return {
      padding,
      margin: cfg.window_margin_width,
      border: {
        width: this.parseBorderWidth(cfg.window_border_width),
        color: cfg.active_border_color!,
        radius: cfg.window_border_radius
      },
      background: {
        color: colors.background,
        opacity: colors.background_opacity
      }
    };
  });

  // ALIVE EFFECTS MODEL - Makes terminal feel dynamic and alive
  // All values derived from config - no hardcoded visual values
  aliveEffectsModel = computed(() => {
    const cfg = this.cursorCfg();
    const cursorColor = this.cursorColor();
    const colors = this.colors();
    
    // Resolve glow color - 'auto' means use cursor color
    const glowColor = cfg.cursor_glow_color === 'auto' 
      ? cursorColor 
      : cfg.cursor_glow_color;
    
    // Calculate active line pulse color based on background
    const activeLineBg = cfg.active_line_pulse_enabled
      ? this.lighten(colors.background, cfg.active_line_pulse_intensity * 100)
      : colors.background;
    
    return {
      cursorGlow: {
        enabled: cfg.cursor_glow_enabled,
        color: glowColor,
        intensity: cfg.cursor_glow_intensity,
        radius: cfg.cursor_glow_radius
      },
      cursorBreathing: {
        enabled: cfg.cursor_breathing_enabled,
        speed: cfg.cursor_breathing_speed,
        minOpacity: cfg.cursor_breathing_min_opacity,
        maxOpacity: cfg.cursor_breathing_max_opacity
      },
      typingSimulation: {
        enabled: cfg.typing_simulation_enabled,
        speed: cfg.typing_simulation_speed
      },
      activeLinePulse: {
        enabled: cfg.active_line_pulse_enabled,
        intensity: cfg.active_line_pulse_intensity,
        backgroundColor: activeLineBg
      },
      idleAnimation: {
        enabled: cfg.idle_animation_enabled,
        speed: cfg.idle_animation_speed
      }
    };
  });

  fadeOpacity(index: number): string {
    const fade = this.tabBarCfg().tab_fade!;
    return String(fade[Math.min(index - 1, fade.length - 1)]);
  }

  trafficLightStyles(type: 'close' | 'minimize' | 'maximize'): Record<string, string> {
    const cfg = this.windowCfg();
    const colors = this.colors();
    const size = cfg.traffic_light_size;

    // Derive traffic light colors from terminal theme colors
    const themeColors = {
      close: this.darken(colors.color1, this.TRAFFIC_LIGHT_DARKEN_AMOUNT),
      minimize: this.lighten(colors.color3, this.TRAFFIC_LIGHT_LIGHTEN_AMOUNT),
      maximize: colors.color2
    };

    const baseStyles = {
      width: `${size}px`,
      height: `${size}px`,
      background: themeColors[type]
    };

    // Apply traffic light opacity from config
    return { ...baseStyles, opacity: cfg.traffic_light_opacity.toString() };
  }

  fadeTabBorderStyles(): Record<string, string> {
    const model = this.terminalLayoutModel();
    const fg = this.colors().foreground;
    const borderOpacity = this.tabBarCfg().tab_bar_border_opacity;
    return {
      borderRightWidth: model.border.width,
      borderRightStyle: 'solid',
      borderRightColor: this.setOpacity(fg, borderOpacity)
    };
  }

  private isDarkColor(hex: string): boolean {
    const normalized = this.normalizeHex(hex);
    if (!normalized.startsWith('#')) return true;
    const c = normalized.slice(1);
    if (c.length !== 6) return true;
    const r = Number.parseInt(c.slice(0, 2), 16);
    const g = Number.parseInt(c.slice(2, 4), 16);
    const b = Number.parseInt(c.slice(4, 6), 16);
    // Calculate relative luminance
    const luminance = (this.LUMINANCE_RED_COEFF * r + this.LUMINANCE_GREEN_COEFF * g + this.LUMINANCE_BLUE_COEFF * b) / 255;
    return luminance < 0.5;
  }

  private setOpacity(hex: string, opacity: number): string {
    const normalized = this.normalizeHex(hex);
    if (!normalized.startsWith('#')) return hex;
    const c = normalized.slice(1);
    if (c.length !== 6) return hex;
    return this.applyOpacity(normalized, opacity);
  }

  private applyOpacity(hex: string, opacity: number): string {
    const c = hex.slice(1);
    const r = Number.parseInt(c.slice(0, 2), 16);
    const g = Number.parseInt(c.slice(2, 4), 16);
    const b = Number.parseInt(c.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Hex color normalization - expands 3-digit to 6-digit hex
  private normalizeHex(hex: string): string {
    if (!hex?.startsWith('#')) return hex;
    const c = hex.slice(1);
    // Expand 3-digit hex to 6-digit (e.g., #eee -> #eeeeee)
    if (c.length === 3) {
      const r = c[0]!;
      const g = c[1]!;
      const b = c[2]!;
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return hex;
  }

  private parseBorderWidth(val: string): string {
    if (!val || val === '0' || val === '0pt' || val === '0px') return '0px';
    if (val.endsWith('pt')) {
      const n = Number.parseFloat(val);
      return `${Math.max(0, Math.round(n * this.PT_TO_PX_RATIO))}px`;
    }
    return val.endsWith('px') ? val : this.windowCfg().window_border_width;
  }

  private darken(hex: string, amount: number): string {
    const normalized = this.normalizeHex(hex);
    if (!normalized.startsWith('#')) return hex;
    const c = normalized.slice(1);
    if (c.length !== 6) return hex;
    const r = Math.max(0, Math.min(255, Number.parseInt(c.slice(0, 2), 16) - amount));
    const g = Math.max(0, Math.min(255, Number.parseInt(c.slice(2, 4), 16) - amount));
    const b = Math.max(0, Math.min(255, Number.parseInt(c.slice(4, 6), 16) - amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private lighten(hex: string, amount: number): string {
    const normalized = this.normalizeHex(hex);
    if (!normalized.startsWith('#')) return hex;
    const c = normalized.slice(1);
    if (c.length !== 6) return hex;
    const r = Math.max(0, Math.min(255, Number.parseInt(c.slice(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, Number.parseInt(c.slice(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, Number.parseInt(c.slice(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
