import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KittyLayout } from '../../../models/kitty-types';
import { NumberInputComponent } from '../../shared/number-input/number-input.component';
import { VersionBadgeComponent } from '../../shared/version-badge/version-badge.component';
import { SliderInputComponent } from '../../shared/slider-input/slider-input.component';
import { ColorInputComponent } from '../../shared/color-input/color-input.component';
import { FormSectionComponent } from '../../shared/form-section/form-section.component';
import { createFormHelper } from '../../../utils/form-helpers';
import { KittyVersionService } from '../../../services/kitty-version.service';

@Component({
  selector: 'app-window-layout-form',
  imports: [CommonModule, FormsModule, NumberInputComponent, VersionBadgeComponent, SliderInputComponent, ColorInputComponent, FormSectionComponent],
  template: `
    <app-form-section title="Window Layout" description="Configure window sizing, tiling layouts, borders, and padding">
        <div class="form-group">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              [(ngModel)]="windowLayout().remember_window_size"
              (ngModelChange)="helper.updateField('remember_window_size', $event)"
              class="w-5 h-5 rounded flex-shrink-0"
            />
            <div>
              <span class="text-sm font-medium text-kitty-text">Remember Window Size</span>
              <p class="text-kitty-text-dim text-xs mt-0.5">Restore the last window dimensions on startup. Not available on Wayland.</p>
            </div>
          </label>
        </div>

        <div class="form-group">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              [(ngModel)]="windowLayout().remember_window_position"
              (ngModelChange)="helper.updateField('remember_window_position', $event)"
              class="w-5 h-5 rounded flex-shrink-0"
            />
            <div>
              <span class="text-sm font-medium text-kitty-text">Remember Window Position</span>
              <p class="text-kitty-text-dim text-xs mt-0.5">Restore the last window position on startup. Not available on Wayland.</p>
            </div>
          </label>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label class="block text-sm font-medium text-kitty-text mb-2">
              Initial Width
              <span class="text-kitty-text-dim text-xs ml-2">Used when remember_window_size is off</span>
            </label>
            <app-number-input
              [(ngModel)]="windowLayout().initial_window_width"
              (ngModelChange)="helper.updateField('initial_window_width', $event)"
              [min]="200"
            />
          </div>

          <div class="form-group">
            <label class="block text-sm font-medium text-kitty-text mb-2">Initial Height</label>
            <app-number-input
              [(ngModel)]="windowLayout().initial_window_height"
              (ngModelChange)="helper.updateField('initial_window_height', $event)"
              [min]="200"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="block text-sm font-medium text-kitty-text mb-3">
            Enabled Layouts
            <span class="text-kitty-text-dim text-xs ml-2">Select which tiling layouts are available via <code class="bg-kitty-bg px-1 rounded font-mono">next_layout</code></span>
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              type="button"
              (click)="toggleAllLayouts()"
              [class.bg-kitty-primary]="isAllLayouts()"
              [class.text-kitty-dark]="isAllLayouts()"
              [class.bg-kitty-surface-light]="!isAllLayouts()"
              [class.text-kitty-text]="!isAllLayouts()"
              class="px-3 py-2 rounded-lg text-xs font-medium hover:bg-kitty-primary hover:text-kitty-dark transition-colors border border-kitty-border"
            >
              All (*)
            </button>
            @for (layout of allLayouts; track layout) {
              <button
                type="button"
                (click)="toggleLayout(layout)"
                [class.bg-kitty-accent]="isLayoutEnabled(layout)"
                [class.text-kitty-dark]="isLayoutEnabled(layout)"
                [class.bg-kitty-surface-light]="!isLayoutEnabled(layout)"
                [class.text-kitty-text]="!isLayoutEnabled(layout)"
                class="px-3 py-2 rounded-lg text-xs hover:bg-kitty-accent hover:text-kitty-dark transition-colors border border-kitty-border"
              >
                {{ layout }}
              </button>
            }
          </div>
        </div>

        <div class="form-group">
          <label class="block text-sm font-medium text-kitty-text mb-2">
            Window Padding Width
            <span class="text-kitty-accent font-bold ml-2">{{ windowLayout().window_padding_width }}px</span>
            <span class="text-kitty-text-dim text-xs ml-1">Inside border</span>
          </label>
          <app-slider-input
            [value]="windowLayout().window_padding_width" 
            (valueChange)="helper.updateField('window_padding_width', $event)"
            [min]="0" [max]="50" [step]="1" />
        </div>

      @if (helper.advancedMode()) {
        <div class="bg-kitty-surface rounded-lg p-6 border border-kitty-border">
          <h3 class="text-lg font-semibold text-kitty-text mb-4">Spacing & Borders</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Window Margin Width
                <span class="text-kitty-accent font-bold ml-2">{{ windowLayout().window_margin_width }}px</span>
                <span class="text-kitty-text-dim text-xs ml-1">Outside border</span>
              </label>
              <app-slider-input
                [value]="windowLayout().window_margin_width"
                (valueChange)="helper.updateField('window_margin_width', $event)"
                [min]="0" [max]="50" [step]="1" />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Single Window Margin
                <span class="text-kitty-accent font-bold ml-2">{{ windowLayout().single_window_margin_width }}px</span>
                <span class="text-kitty-text-dim text-xs ml-1">Override for single-pane mode (-1 = use above)</span>
              </label>
              <app-slider-input
                [value]="windowLayout().single_window_margin_width"
                (valueChange)="helper.updateField('single_window_margin_width', $event)"
                [min]="-1" [max]="50" [step]="1" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Single Window Padding
                <span class="text-kitty-accent font-bold ml-2">{{ windowLayout().single_window_padding_width }}px</span>
                <span class="text-kitty-text-dim text-xs ml-1">Override for single-pane mode (-1 = use above)</span>
              </label>
              <app-slider-input
                [value]="windowLayout().single_window_padding_width"
                (valueChange)="helper.updateField('single_window_padding_width', $event)"
                [min]="-1" [max]="50" [step]="1" />
            </div>

            <div class="form-group">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="windowLayout().draw_window_borders_for_single_window"
                  (ngModelChange)="helper.updateField('draw_window_borders_for_single_window', $event)"
                  class="w-5 h-5 rounded flex-shrink-0"
                />
                <div>
                  <span class="text-sm font-medium text-kitty-text">Draw Window Borders for Single Window</span>
                  <p class="text-kitty-text-dim text-xs mt-0.5">Draw borders around single-pane windows</p>
                </div>
              </label>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Window Resize Step (Cells)
                <span class="text-kitty-text-dim text-xs ml-2">Cells per resize step (0 = disable resizing in steps)</span>
              </label>
              <app-number-input
                [(ngModel)]="windowLayout().window_resize_step_cells"
                (ngModelChange)="helper.updateField('window_resize_step_cells', $event)"
                [min]="0"
                [step]="1"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Window Resize Step (Lines)
                <span class="text-kitty-text-dim text-xs ml-2">Lines per resize step (0 = disable resizing in steps)</span>
              </label>
              <app-number-input
                [(ngModel)]="windowLayout().window_resize_step_lines"
                (ngModelChange)="helper.updateField('window_resize_step_lines', $event)"
                [min]="0"
                [step]="1"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Border Width
                <span class="text-kitty-text-dim text-xs ml-2">e.g. '0.5pt' or '1px'</span>
              </label>
              <input
                type="text"
                [(ngModel)]="windowLayout().window_border_width"
                (ngModelChange)="helper.updateField('window_border_width', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono"
                placeholder="0.5pt"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Inactive Text Alpha
                <span class="text-kitty-accent font-bold ml-2">{{ (windowLayout().inactive_text_alpha * 100).toFixed(0) }}%</span>
                <span class="text-kitty-text-dim text-xs ml-1">Opacity of text in unfocused panes</span>
              </label>
              <app-slider-input
                [value]="windowLayout().inactive_text_alpha"
                (valueChange)="helper.updateField('inactive_text_alpha', $event)"
                [min]="0" [max]="1" [step]="0.05" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">Active Border Color</label>
              <app-color-input 
                [value]="windowLayout().active_border_color || '#cccccc'" 
                (valueChange)="helper.updateField('active_border_color', $event)" />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">Inactive Border Color</label>
              <app-color-input 
                [value]="windowLayout().inactive_border_color || '#999999'" 
                (valueChange)="helper.updateField('inactive_border_color', $event)" />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">Bell Border Color</label>
              <app-color-input 
                [value]="windowLayout().bell_border_color || '#ffffff'" 
                (valueChange)="helper.updateField('bell_border_color', $event)" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="form-group">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="windowLayout().draw_minimal_borders"
                  (ngModelChange)="helper.updateField('draw_minimal_borders', $event)"
                  class="w-5 h-5 rounded flex-shrink-0"
                />
                <div>
                  <span class="text-sm font-medium text-kitty-text">Draw Minimal Borders</span>
                  <p class="text-kitty-text-dim text-xs mt-0.5">Only draw borders where adjacent panes touch</p>
                </div>
              </label>
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Hide Window Decorations
                <span class="text-kitty-text-dim text-xs ml-2">Control OS window chrome visibility</span>
              </label>
              <select
                [(ngModel)]="windowLayout().hide_window_decorations"
                (ngModelChange)="helper.updateField('hide_window_decorations', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
              >
                <option [ngValue]="false">No (show decorations)</option>
                <option [ngValue]="true">Yes (hide all)</option>
                <option value="titlebar-only">Titlebar Only</option>
                <option value="titlebar-and-corners">Titlebar and Corners (macOS)</option>
              </select>
              <p class="text-kitty-text-dim text-xs mt-1">"titlebar-only" and "titlebar-and-corners" require Kitty 0.46+</p>
            </div>
          </div>

          <div class="border-t border-kitty-border pt-6 mt-6">
            <h3 class="text-lg font-semibold text-kitty-text mb-4">Window Logo</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">
                  Logo Path
                  <span class="text-kitty-text-dim text-xs ml-2">PNG image to display in window corner</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="windowLayout().window_logo_path"
                  (ngModelChange)="helper.updateField('window_logo_path', $event)"
                  class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                  placeholder="none or /path/to/logo.png"
                />
              </div>

              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">Logo Position</label>
                <select
                  [(ngModel)]="windowLayout().window_logo_position"
                  (ngModelChange)="helper.updateField('window_logo_position', $event)"
                  class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
                >
                  <option value="top-left">top-left</option>
                  <option value="top-right">top-right</option>
                  <option value="bottom-left">bottom-left</option>
                  <option value="bottom-right">bottom-right</option>
                </select>
              </div>
            </div>

            <div class="form-group mt-4" [class.opacity-60]="!windowLogoScaleAvailable()">
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-kitty-text">
                  Logo Scale
                  <span class="text-kitty-text-dim text-xs ml-2">Relative scale of logo (0 = auto size)</span>
                </label>
                @if (!windowLogoScaleAvailable()) {
                  <app-version-badge version="0.35.2" />
                }
              </div>
              <app-number-input
                [(ngModel)]="windowLayout().window_logo_scale"
                (ngModelChange)="helper.updateField('window_logo_scale', $event)"
                [min]="0"
                [max]="1"
                [step]="0.05"
                [disabled]="!windowLogoScaleAvailable()"
              />
            </div>
          </div>

          <div class="border-t border-kitty-border pt-6 mt-6">
            <h3 class="text-lg font-semibold text-kitty-text mb-4">Resize Behavior</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">
                  Resize Debounce Time
                  <span class="text-kitty-text-dim text-xs ml-2">Delay in ms before resizing (0 = instant)</span>
                </label>
                <app-number-input
                  [(ngModel)]="windowLayout().resize_debounce_time"
                  (ngModelChange)="helper.updateField('resize_debounce_time', $event)"
                  [min]="0"
                  [step]="1"
                />
              </div>

              <div class="form-group">
                <label class="flex items-center gap-3 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    [(ngModel)]="windowLayout().resize_in_steps"
                    (ngModelChange)="helper.updateField('resize_in_steps', $event)"
                    class="w-5 h-5 rounded flex-shrink-0"
                  />
                  <div>
                    <span class="text-sm font-medium text-kitty-text">Resize in Steps</span>
                    <p class="text-kitty-text-dim text-xs mt-0.5">Resize by cell increments only</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div class="form-group mt-4">
            <label class="block text-sm font-medium text-kitty-text mb-2">
              Visual Window Select Characters
              <span class="text-kitty-text-dim text-xs ml-2">Characters for visual window selection (e.g., "1234567890")</span>
            </label>
            <input
              type="text"
              [(ngModel)]="windowLayout().visual_window_select_characters"
              (ngModelChange)="helper.updateField('visual_window_select_characters', $event)"
              class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
              placeholder="none or 1234567890"
            />
          </div>

          <div class="form-group mt-4" [class.opacity-60]="!placementStrategyAvailable()">
            <div class="flex items-center gap-2 mb-2">
              <label class="block text-sm font-medium text-kitty-text">
                Placement Strategy
                <span class="text-kitty-text-dim text-xs ml-2">Window placement strategy for tiling WMs</span>
              </label>
              @if (!placementStrategyAvailable()) {
                <app-version-badge version="0.20.0" />
              }
            </div>
            <select
              [(ngModel)]="windowLayout().placement_strategy"
              (ngModelChange)="helper.updateField('placement_strategy', $event)"
              [disabled]="!placementStrategyAvailable()"
              class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary disabled:opacity-50"
            >
              <option value="center">center (default)</option>
              <option value="top">top</option>
              <option value="bottom">bottom</option>
              <option value="left">left</option>
              <option value="right">right</option>
              <option value="top-left">top-left</option>
              <option value="top-right">top-right</option>
              <option value="bottom-left">bottom-left</option>
              <option value="bottom-right">bottom-right</option>
            </select>
            <p class="text-kitty-text-dim text-xs mt-1">Required for Hyprland/Sway compatibility</p>
          </div>

          <div class="form-group mt-4" [class.opacity-60]="!windowDragToleranceAvailable()">
            <div class="flex items-center gap-2 mb-2">
              <label class="block text-sm font-medium text-kitty-text">
                Window Drag Tolerance
                <span class="text-kitty-text-dim text-xs ml-2">Drag region in pts around borders for mouse resize (0 = disable)</span>
              </label>
              @if (!windowDragToleranceAvailable()) {
                <app-version-badge version="0.46.0" />
              }
            </div>
            <app-number-input
              [(ngModel)]="windowLayout().window_drag_tolerance"
              (ngModelChange)="helper.updateField('window_drag_tolerance', $event)"
              [min]="0"
              [step]="1"
              [disabled]="!windowDragToleranceAvailable()"
            />
          </div>

          <div class="form-group mt-4">
            <label class="block text-sm font-medium text-kitty-text mb-2">
              Confirm OS Window Close
              <span class="text-kitty-text-dim text-xs ml-2">Number of windows requiring confirmation (-1 = always, 0 = never)</span>
            </label>
            <app-number-input
              [(ngModel)]="windowLayout().confirm_os_window_close"
              (ngModelChange)="helper.updateField('confirm_os_window_close', $event)"
              [min]="-1"
              [step]="1"
            />
          </div>

          <div class="form-group mt-4">
            <label class="block text-sm font-medium text-kitty-text mb-2">
              Startup Window State
              <span class="text-kitty-text-dim text-xs ml-2">Initial window state when Kitty starts</span>
            </label>
            <select
              [(ngModel)]="windowLayout().startup_window"
              (ngModelChange)="helper.updateField('startup_window', $event)"
              class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
            >
              <option value="normal">Normal (default)</option>
              <option value="maximized">Maximized</option>
              <option value="minimized">Minimized</option>
              <option value="fullscreen">Fullscreen</option>
              <option value="hidden">Hidden (requires remote control)</option>
            </select>
          </div>
        </div>
      }
    </app-form-section>
  `,
  styles: []
})
export class WindowLayoutFormComponent {
  private readonly versionService = inject(KittyVersionService);

  readonly helper = createFormHelper('window_layout');
  readonly windowLayout = this.helper.state.asReadonly();
  readonly placementStrategyAvailable = computed(() => this.versionService.isOptionAvailable('placement_strategy'));
  readonly windowDragToleranceAvailable = computed(() => this.versionService.isOptionAvailable('window_drag_tolerance'));
  readonly windowLogoScaleAvailable = computed(() => this.versionService.isOptionAvailable('window_logo_scale'));
  allLayouts: KittyLayout[] = ['Fat', 'Grid', 'Horizontal', 'Splits', 'Stack', 'Tall', 'Vertical'];

  isAllLayouts(): boolean {
    return this.windowLayout().enabled_layouts.includes('*');
  }

  toggleAllLayouts(): void {
    this.helper.updateField('enabled_layouts', ['*']);
  }

  isLayoutEnabled(layout: KittyLayout): boolean {
    return !this.isAllLayouts() && this.windowLayout().enabled_layouts.includes(layout);
  }

  toggleLayout(layout: KittyLayout): void {
    let layouts: KittyLayout[] = this.windowLayout().enabled_layouts.filter(l => l !== '*');
    if (layouts.includes(layout)) {
      layouts = layouts.filter(l => l !== layout);
    } else {
      layouts = [...layouts, layout];
    }
    this.helper.updateField('enabled_layouts', layouts.length === 0 ? ['*'] : layouts);
  }
}
