import { Component, computed, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresetsService, ConfigPreset } from '../../services/presets.service';
import { ConfigStoreService } from '../../services/config-store.service';

@Component({
  selector: 'app-preset-selector',
  imports: [CommonModule],
  template: `
    <div class="px-7 pt-5 pb-6">
      <div class="mb-5">
        <p class="text-xs text-kitty-text-dim mb-4 leading-relaxed">
          Start with a professionally crafted preset, then customize every detail to your taste.
        </p>
        <div class="flex gap-1.5 flex-wrap">
          @for (cat of categories; track cat.id) {
            <button
              (click)="selectedCategory.set(cat.id)"
              class="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150"
              [class.bg-kitty-primary]="selectedCategory() === cat.id"
              [class.text-kitty-dark]="selectedCategory() === cat.id"
              [class.bg-kitty-bg]="selectedCategory() !== cat.id"
              [class.text-kitty-text-dim]="selectedCategory() !== cat.id"
              [class.hover:text-kitty-text]="selectedCategory() !== cat.id"
              [title]="cat.description"
            >{{ cat.label }}</button>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-1">
        @for (preset of filteredPresets(); track preset.id) {
          <button
            (click)="applyPreset(preset)"
            class="w-full text-left p-3.5 rounded-lg bg-kitty-bg hover:bg-kitty-surface border border-kitty-border hover:border-kitty-primary/60 transition-all duration-150 group"
          >
            <div class="flex items-start gap-3">
              @if (preset.category === 'theme' && preset.config['background']) {
                <div class="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden border border-kitty-border group-hover:border-kitty-primary/40 transition-colors"
                     [style.background]="preset.config['background']">
                  <div class="w-full h-full p-1 flex flex-col justify-between">
                    <div class="flex gap-0.5">
                      <div class="w-1.5 h-1.5 rounded-full opacity-80" [style.background]="preset.config['color1'] || '#ff5f56'"></div>
                      <div class="w-1.5 h-1.5 rounded-full opacity-80" [style.background]="preset.config['color2'] || '#27c93f'"></div>
                      <div class="w-1.5 h-1.5 rounded-full opacity-80" [style.background]="preset.config['color4'] || '#4a9eff'"></div>
                    </div>
                    <div class="space-y-0.5">
                      <div class="h-0.5 rounded-full opacity-60" [style.background]="preset.config['foreground']"></div>
                      <div class="h-0.5 rounded-full opacity-40 w-3/4" [style.background]="preset.config['foreground']"></div>
                    </div>
                  </div>
                </div>
              } @else {
                <div class="flex-shrink-0 w-10 h-10 rounded-md bg-kitty-surface flex items-center justify-center border border-kitty-border group-hover:border-kitty-primary/40 transition-colors">
                  <svg class="w-4 h-4 text-kitty-text-dim group-hover:text-kitty-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    @if (preset.category === 'performance' || preset.category === 'gaming') {
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    } @else if (preset.category === 'minimal') {
                      <path d="M3 12h18M3 6h18M3 18h12" />
                    } @else {
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0 0V2M2 12h20" />
                    }
                  </svg>
                </div>
              }

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span class="text-sm font-semibold text-kitty-text group-hover:text-kitty-primary transition-colors leading-tight">
                    {{ preset.name }}
                  </span>
                  @if (preset.tags && preset.tags.length > 0) {
                    @for (tag of preset.tags.slice(0, 2); track tag) {
                      <span class="px-1.5 py-0.5 text-[9px] font-semibold bg-kitty-surface text-kitty-accent rounded uppercase tracking-wide">
                        {{ tag }}
                      </span>
                    }
                  }
                </div>
                <p class="text-[11px] leading-relaxed text-kitty-text-dim line-clamp-2">{{ preset.description }}</p>
                @if (preset.author) {
                  <p class="text-[10px] text-kitty-accent mt-1 font-medium">by {{ preset.author }}</p>
                }
              </div>

              <svg class="w-4 h-4 text-kitty-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            @if (preset.category === 'theme' && preset.config['background']) {
              <div class="flex gap-1 mt-2.5 pt-2.5 border-t border-kitty-border/40">
                @for (colorKey of themeColorKeys; track colorKey) {
                  @if (preset.config[colorKey]) {
                    <div
                      class="flex-1 h-2 rounded-sm"
                      [style.background]="preset.config[colorKey]"
                      [title]="colorKey + ': ' + preset.config[colorKey]"
                    ></div>
                  }
                }
              </div>
            }
          </button>
        }
      </div>
    </div>
  `,
  styles: []
})
export class PresetSelectorComponent {
  @Output() presetApplied = new EventEmitter<void>();

  readonly categories: Array<{id: ConfigPreset['category'], label: string, description: string}> = [];
  readonly selectedCategory = signal<ConfigPreset['category']>('theme');

  readonly filteredPresets = computed(() =>
    this.presetsService.getPresetsByCategory(this.selectedCategory())
  );

  readonly themeColorKeys = ['background', 'foreground', 'color1', 'color2', 'color3', 'color4', 'color5', 'color6'];

  constructor(
    private readonly presetsService: PresetsService,
    private readonly configStore: ConfigStoreService
  ) {
    this.categories = this.presetsService.getCategories();
  }

  applyPreset(preset: ConfigPreset): void {
    const currentConfig = this.configStore.configState();
    const presetConfig = preset.config;

    const mergedConfig = structuredClone(currentConfig);

    Object.keys(presetConfig).forEach(key => {
      const value = presetConfig[key];

      if (key.startsWith('color') || ['foreground', 'background', 'cursor', 'cursor_text_color', 'selection_foreground', 'selection_background', 'url_color', 'background_opacity', 'background_blur', 'background_image', 'dim_opacity'].includes(key)) {
        (mergedConfig.colors as any)[key] = value;
      } else if (['cursor_shape', 'cursor_blink_interval', 'cursor_stop_blinking_after', 'cursor_beam_thickness', 'cursor_underline_thickness'].includes(key)) {
        (mergedConfig.cursor as any)[key] = value;
      } else if (['font_size', 'font_family', 'bold_font', 'italic_font', 'bold_italic_font', 'disable_ligatures', 'force_ltr', 'box_drawing_scale'].includes(key)) {
        (mergedConfig.fonts as any)[key] = value;
      } else if (['scrollback_lines', 'scrollback_pager', 'scrollback_pager_history_size', 'scrollback_fill_enlarged_window', 'wheel_scroll_multiplier', 'wheel_scroll_min_lines', 'touch_scroll_multiplier'].includes(key)) {
        (mergedConfig.scrollback as any)[key] = value;
      } else if (['mouse_hide_wait', 'url_style', 'open_url_with', 'url_prefixes', 'detect_urls', 'copy_on_select', 'strip_trailing_spaces', 'show_hyperlink_targets', 'underline_hyperlinks', 'focus_follows_mouse'].includes(key)) {
        (mergedConfig.mouse as any)[key] = value;
      } else if (['repaint_delay', 'input_delay', 'sync_to_monitor'].includes(key)) {
        (mergedConfig.performance as any)[key] = value;
      } else if (['enable_audio_bell', 'visual_bell_duration', 'visual_bell_color', 'window_alert_on_bell', 'bell_on_tab', 'command_on_bell'].includes(key)) {
        (mergedConfig.bell as any)[key] = value;
      } else if (['remember_window_size', 'initial_window_width', 'initial_window_height', 'window_padding_width', 'window_margin_width', 'single_window_margin_width', 'window_border_width', 'hide_window_decorations', 'confirm_os_window_close', 'draw_minimal_borders', 'inactive_text_alpha', 'window_resize_step_cells', 'window_resize_step_lines', 'active_border_color', 'inactive_border_color', 'bell_border_color'].includes(key)) {
        (mergedConfig.window_layout as any)[key] = value;
      } else if (['tab_bar_style', 'tab_bar_edge', 'tab_bar_min_tabs', 'tab_title_template', 'tab_powerline_style', 'tab_separator', 'tab_bar_background', 'active_tab_foreground', 'active_tab_background', 'inactive_tab_foreground', 'inactive_tab_background'].includes(key)) {
        (mergedConfig.tab_bar as any)[key] = value;
      } else if (['shell', 'editor', 'close_on_child_death', 'allow_remote_control', 'update_check_interval', 'shell_integration'].includes(key)) {
        (mergedConfig.advanced as any)[key] = value;
      }
    });

    this.configStore.loadConfig(mergedConfig);
    this.presetApplied.emit();
  }
}
