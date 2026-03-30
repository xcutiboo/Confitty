import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigStoreService } from '../../services/config-store.service';
import { FontPresetsService } from '../../services/font-presets.service';

@Component({
  selector: 'app-terminal-window',
  imports: [CommonModule],
  template: `
    <div class="flex-1 overflow-hidden flex flex-col rounded-lg" [ngStyle]="windowStyles()">
      @if (!hideDecorations()) {
        <div class="flex items-center px-3 py-2 select-none border-b" [style.background]="titleBarBg()" [style.border-color]="borderColor()">
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-full" style="background: #ff5f56;"></div>
            <div class="w-3 h-3 rounded-full" style="background: #ffbd2e;"></div>
            <div class="w-3 h-3 rounded-full" style="background: #27c93f;"></div>
          </div>
          <span class="flex-1 text-center text-xs select-none opacity-50" [style.font-family]="terminalFont()" [style.color]="colors().foreground">bash</span>
        </div>
      }

      @if (tabBarVisible() && tabBarEdge() === 'top') {
        <ng-container *ngTemplateOutlet="tabBar"></ng-container>
      }

      <div class="flex-1 overflow-hidden relative p-3" [ngStyle]="terminalStyles()">
        <div class="absolute inset-0 -z-10" [ngStyle]="bgStyles()"></div>
        <div class="space-y-0.5" [style.line-height]="'1.4'">
          <div class="whitespace-nowrap">
            <span [style.color]="c('color2')">user</span>
            <span [style.color]="c('foreground')" class="opacity-60">@</span>
            <span [style.color]="c('color4')">arch</span>
            <span [style.color]="c('foreground')" class="opacity-60">:~$ </span>
            <span [style.color]="c('foreground')">ls -la</span>
          </div>
          <div class="whitespace-nowrap opacity-50" [style.color]="c('foreground')">total 48</div>
          <div class="whitespace-nowrap">
            <span [style.color]="c('color4')">drwxr-xr-x</span>
            <span [style.color]="c('foreground')" class="opacity-50"> .config/</span>
          </div>
          <div class="whitespace-nowrap">
            <span [style.color]="c('color2')">-rw-r--r--</span>
            <span [style.color]="c('foreground')" class="opacity-50"> README.md</span>
          </div>
          <div class="whitespace-nowrap mt-2">
            <span [style.color]="c('color2')">user</span>
            <span [style.color]="c('foreground')" class="opacity-60">@</span>
            <span [style.color]="c('color4')">arch</span>
            <span [style.color]="c('foreground')" class="opacity-60">:~$ </span>
            <span [style.color]="c('foreground')">cat </span>
            <span class="url-text" [style.color]="urlColor()">https://sw.kovidgoyal.net/kitty/</span>
          </div>
          <div class="whitespace-nowrap mt-2">
            <span [style.color]="c('color2')">user</span>
            <span [style.color]="c('foreground')" class="opacity-60">@</span>
            <span [style.color]="c('color4')">arch</span>
            <span [style.color]="c('foreground')" class="opacity-60">:~$ </span>
            @if (cursorShape() === 'block') {
              <span class="inline-block w-2 h-4 align-text-bottom" [class.animate-blink]="cursorBlinking()" [style.background]="cursorColor()">&nbsp;</span>
            } @else if (cursorShape() === 'beam') {
              <span class="inline-block w-0.5 h-4 align-text-bottom border-l-2" [class.animate-blink]="cursorBlinking()" [style.border-color]="cursorColor()"></span>
            } @else {
              <span class="inline-block w-2 h-4 align-text-bottom border-b-2" [class.animate-blink]="cursorBlinking()" [style.border-color]="cursorColor()">&nbsp;</span>
            }
          </div>
        </div>
      </div>

      @if (tabBarVisible() && tabBarEdge() === 'bottom') {
        <ng-container *ngTemplateOutlet="tabBar"></ng-container>
      }
    </div>

    <ng-template #tabBar>
      <div class="flex items-end h-6 overflow-hidden select-none" [style.background]="tabBarBg()">
        @switch (tabBarStyle()) {
          @case ('powerline') {
            @for (tab of tabs; track tab.name; let i = $index; let last = $last) {
              <div class="relative flex items-center h-6 cursor-pointer"
                   [style.z-index]="tabs.length - i"
                   [style.background-color]="i === 0 ? activeTabBg() : inactiveTabBg()"
                   [style.color]="i === 0 ? activeTabFg() : inactiveTabFg()"
                   [class.pl-6]="i > 0"
                   [class.pl-3]="i === 0"
                   [class.pr-3]="!last"
                   [class.pr-4]="last">
                <span class="truncate relative z-10 text-xs">{{ tab.name }}</span>
                @if (!last) {
                  <div class="absolute top-0 -right-3 w-0 h-0 z-20
                              border-y-[12px] border-y-transparent border-l-[12px]"
                       [style.border-left-color]="i === 0 ? activeTabBg() : inactiveTabBg()">
                  </div>
                }
              </div>
            }
          }
          @case ('slant') {
            <div class="flex h-6 ml-1">
              @for (tab of tabs; track tab.name; let i = $index) {
                <div class="relative flex items-center h-6 cursor-pointer px-5 isolate"
                     [style.color]="i === 0 ? activeTabFg() : inactiveTabFg()"
                     [style.z-index]="tabs.length - i">
                  <div class="absolute inset-y-0 -inset-x-2 -skew-x-12 -z-10 rounded-sm"
                       [style.background-color]="i === 0 ? activeTabBg() : inactiveTabBg()"
                       [class.rounded-tl-sm]="i === 0">
                  </div>
                  <span class="truncate text-xs">{{ tab.name }}</span>
                </div>
              }
            </div>
          }
          @case ('fade') {
            @for (tab of tabs; track tab.name; let i = $index; let last = $last) {
              <div class="flex items-center h-6 px-4 cursor-pointer border-r border-black/20"
                   [style.background-color]="tabBarBg()"
                   [style.color]="i === 0 ? activeTabFg() : inactiveTabFg()"
                   [style.opacity]="i === 0 ? '1' : fadeOpacity(i)">
                <span class="truncate text-xs">{{ tab.name }}</span>
              </div>
            }
          }
          @case ('separator') {
            @for (tab of tabs; track tab.name; let i = $index; let last = $last) {
              <div class="flex items-center h-6 cursor-pointer"
                   [style.background-color]="tabBarBg()"
                   [style.color]="i === 0 ? activeTabFg() : inactiveTabFg()">
                <span class="truncate px-4 text-xs">{{ tab.name }}</span>
                @if (!last) {
                  <span class="text-xs opacity-50" [style.color]="inactiveTabFg()">
                    {{ tabSeparator() }}
                  </span>
                }
              </div>
            }
          }
          @default {
            @for (tab of tabs; track tab.name; let i = $index) {
              <div class="flex items-center h-6 px-4 cursor-pointer"
                   [style.background-color]="i === 0 ? activeTabBg() : inactiveTabBg()"
                   [style.color]="i === 0 ? activeTabFg() : inactiveTabFg()">
                <span class="truncate text-xs">{{ tab.name }}</span>
              </div>
            }
          }
        }
      </div>
    </ng-template>
  `,
  styles: [`
    .url-text { text-decoration: underline; cursor: pointer; }
    @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
    .animate-blink { animation: blink 1s step-end infinite; }
    .isolate { isolation: isolate; }
  `]
})
export class TerminalWindowComponent {
  private readonly store = inject(ConfigStoreService);
  private readonly fontPresets = inject(FontPresetsService);

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

  c(key: string): string { return (this.colors() as unknown as Record<string, string>)[key] || '#888888'; }
  terminalFont = computed(() => { const f = this.fonts().font_family; return `"${f}", "JetBrains Mono", monospace`; });

  windowStyles = computed(() => {
    const cfg = this.windowCfg();
    const borderWidth = this.parseBorderWidth(cfg.window_border_width);
    return { background: this.colors().background, border: borderWidth === '0px' ? '1px solid ' + this.borderColor() : `${borderWidth} solid ${cfg.active_border_color}` };
  });

  titleBarBg = computed(() => this.darken(this.colors().background, 10));
  borderColor = computed(() => this.darken(this.colors().background, 20));
  tabBarBg = computed(() => { const cfg = this.tabBarCfg(); return (cfg.tab_bar_background && cfg.tab_bar_background !== 'none') ? cfg.tab_bar_background : this.darken(this.colors().background, 8); });
  hideDecorations = computed(() => this.windowCfg().hide_window_decorations);

  activeTabBg = computed(() => this.tabBarCfg().active_tab_background);
  activeTabFg = computed(() => this.tabBarCfg().active_tab_foreground);
  inactiveTabBg = computed(() => this.tabBarCfg().inactive_tab_background);
  inactiveTabFg = computed(() => this.tabBarCfg().inactive_tab_foreground);

  terminalStyles = computed(() => {
    const cfg = this.windowCfg();
    const padding = Math.min(Math.max(cfg.window_padding_width || 0, 0), 32);
    const fontSize = Math.max(6, Math.min(this.fonts().font_size, 24));
    return { fontFamily: this.terminalFont(), fontSize: `${fontSize}px`, color: this.colors().foreground, padding: `${padding}px` };
  });

  bgStyles = computed(() => { const bg = this.colors().background; const opacity = this.colors().background_opacity; const clamped = typeof opacity === 'number' ? Math.max(0.05, Math.min(1, opacity)) : 1; return { background: bg, opacity: String(clamped) }; });

  tabBarVisible = computed(() => { const cfg = this.tabBarCfg(); const minTabs = cfg.tab_bar_min_tabs ?? 2; return cfg.tab_bar_style !== 'hidden' && 3 >= minTabs; });
  tabBarEdge = computed(() => this.tabBarCfg().tab_bar_edge);
  tabBarStyle = computed(() => this.tabBarCfg().tab_bar_style);
  tabSeparator = computed(() => this.tabBarCfg().tab_separator || ' ┇');

  fadeOpacity(index: number): string {
    const fade = this.tabBarCfg().tab_fade || [0.25, 0.5, 0.75, 1];
    return String(fade[Math.min(index - 1, fade.length - 1)] ?? 0.5);
  }

  cursorShape = computed(() => this.cursorCfg().cursor_shape);
  cursorColor = computed(() => { const c = this.cursorCfg().cursor; return c === 'none' || !c?.startsWith('#') ? this.colors().foreground : c; });
  cursorBlinking = computed(() => this.cursorCfg().cursor_blink_interval !== 0);
  urlColor = computed(() => this.mouseCfg().url_color || this.colors().color4 || '#0087bd');

  private parseBorderWidth(val: string): string {
    if (!val || val === '0' || val === '0pt' || val === '0px') return '0px';
    if (val.endsWith('pt')) {
      const n = Number.parseFloat(val);
      return `${Math.max(0, Math.round(n * 1.333))}px`;
    }
    return val.endsWith('px') ? val : '1px';
  }
  private darken(hex: string, amount: number): string {
    if (!hex?.startsWith('#')) return '#333';
    const c = hex.slice(1);
    if (c.length !== 6) return hex;
    const r = Math.max(0, Math.min(255, Number.parseInt(c.slice(0, 2), 16) - amount));
    const g = Math.max(0, Math.min(255, Number.parseInt(c.slice(2, 4), 16) - amount));
    const b = Math.max(0, Math.min(255, Number.parseInt(c.slice(4, 6), 16) - amount));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }
}
