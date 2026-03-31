import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColorThemesService } from '../../../services/color-themes.service';
import { KittyColorConfig } from '../../../models/kitty-types';
import { VersionBadgeComponent } from '../../shared/version-badge/version-badge.component';
import { ColorInputComponent } from '../../shared/color-input/color-input.component';
import { SliderInputComponent } from '../../shared/slider-input/slider-input.component';
import { FormSectionComponent } from '../../shared/form-section/form-section.component';
import { createFormHelper } from '../../../utils/form-helpers';
import { KittyVersionService } from '../../../services/kitty-version.service';

@Component({
  selector: 'app-colors-form',
  imports: [CommonModule, FormsModule, VersionBadgeComponent, ColorInputComponent, SliderInputComponent, FormSectionComponent],
  template: `
    <app-form-section title="Colors" description="Customize your terminal color scheme and palette">
        <div class="form-group">
          <label class="block text-sm font-medium text-kitty-text mb-3">
            Color Themes
            <span class="text-kitty-text-dim text-xs ml-2">Quick-apply popular terminal themes</span>
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (theme of colorThemesService.getAllThemes(); track theme.name) {
              <button
                type="button"
                (click)="applyTheme(theme.name)"
                class="px-4 py-3 bg-kitty-surface-light hover:bg-kitty-bg border border-kitty-border rounded-lg text-left transition-all hover:border-kitty-primary group"
              >
                <div class="font-medium text-kitty-text group-hover:text-kitty-primary text-sm">{{ theme.name }}</div>
                <div class="text-xs text-kitty-text-dim mt-0.5">{{ theme.description }}</div>
                <div class="flex gap-1 mt-2">
                  @for (i of [0,1,2,3,4,5,6,7]; track i) {
                    <div class="w-4 h-4 rounded-sm flex-shrink-0" [style.background-color]="getThemeColor(theme.colors, i)"></div>
                  }
                </div>
              </button>
            }
          </div>
        </div>

        <div class="border-t border-kitty-border pt-6">
          <h3 class="text-lg font-semibold text-kitty-text mb-4">Base Colors</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">Foreground</label>
              <app-color-input [value]="colors().foreground || '#000000'" (valueChange)="helper.updateField('foreground', $event)" />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">Background</label>
              <app-color-input [value]="colors().background || '#ffffff'" (valueChange)="helper.updateField('background', $event)" />
            </div>
          </div>

          <div class="mt-6 form-group">
            <label class="block text-sm font-medium text-kitty-text mb-2">
              Background Opacity
              <span class="text-kitty-accent font-bold ml-2">{{ (colors().background_opacity * 100).toFixed(0) }}%</span>
              <span class="text-kitty-text-dim text-xs ml-2">Requires compositor support (e.g. picom, KWin)</span>
            </label>
            <app-slider-input 
              [value]="colors().background_opacity" 
              (valueChange)="helper.updateField('background_opacity', $event)"
              [min]="0" [max]="1" [step]="0.05" />
          </div>

          @if (helper.advancedMode()) {
            <div class="mt-4 form-group" [class.opacity-60]="!dynamicBackgroundOpacityAvailable()">
              <div class="flex items-center gap-2">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="colors().dynamic_background_opacity"
                    (ngModelChange)="helper.updateField('dynamic_background_opacity', $event)"
                    [disabled]="!dynamicBackgroundOpacityAvailable()"
                    class="w-5 h-5 rounded flex-shrink-0 disabled:opacity-50"
                  />
                  <div>
                    <span class="text-sm font-medium text-kitty-text">Dynamic Background Opacity</span>
                    <p class="text-kitty-text-dim text-xs mt-0.5">Allow changing opacity at runtime with Ctrl+Shift+A → L/M</p>
                  </div>
                </label>
                @if (!dynamicBackgroundOpacityAvailable()) {
                  <app-version-badge version="0.46.0" />
                }
              </div>
            </div>

          <div class="border-t border-kitty-border pt-6 mt-6">
            <h3 class="text-lg font-semibold text-kitty-text mb-4">Background Image</h3>
            @if (colors().background_image !== 'none' && colors().background_image && colors().background_opacity < 1) {
              <div class="mb-4 p-3 bg-kitty-accent/10 border border-kitty-accent/30 rounded-lg">
                <p class="text-sm text-kitty-accent">
                  <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  Kitty 0.43.0+: background_opacity no longer applies to background_image. Bake alpha into the image file for transparency.
                </p>
              </div>
            }
            <div class="space-y-4">
              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">
                  Background Image Path
                  <span class="text-kitty-text-dim text-xs ml-2">PNG image to display behind terminal content</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="colors().background_image"
                  (ngModelChange)="helper.updateField('background_image', $event)"
                  class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                  placeholder="none or /path/to/image.png"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-group">
                  <label class="block text-sm font-medium text-kitty-text mb-2">Image Layout</label>
                  <select
                    [(ngModel)]="colors().background_image_layout"
                    (ngModelChange)="helper.updateField('background_image_layout', $event)"
                    class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
                  >
                    <option value="tiled">tiled</option>
                    <option value="mirror-tiled">mirror-tiled</option>
                    <option value="scaled">scaled</option>
                    <option value="clamped">clamped</option>
                    <option value="centered">centered</option>
                    <option value="cscaled">cscaled</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="flex items-center gap-3 cursor-pointer mt-6">
                    <input
                      type="checkbox"
                      [(ngModel)]="colors().background_image_linear"
                      (ngModelChange)="helper.updateField('background_image_linear', $event)"
                      class="w-5 h-5 rounded flex-shrink-0"
                    />
                    <div>
                      <span class="text-sm font-medium text-kitty-text">Linear Interpolation</span>
                      <p class="text-kitty-text-dim text-xs mt-0.5">Use linear interpolation when scaling</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-kitty-border pt-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">
                  Background Blur
                  <span class="text-kitty-accent ml-2">{{ colors().background_blur }}px</span>
                </label>
                <app-slider-input 
                  [value]="colors().background_blur" 
                  (valueChange)="helper.updateField('background_blur', $event)"
                  [min]="0" [max]="64" [step]="1" />
              </div>

              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">
                  Background Tint
                  <span class="text-kitty-accent ml-2">{{ (colors().background_tint * 100).toFixed(0) }}%</span>
                </label>
                <app-slider-input 
                  [value]="colors().background_tint" 
                  (valueChange)="helper.updateField('background_tint', $event)"
                  [min]="0" [max]="1" [step]="0.05" />
              </div>

              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">
                  Background Tint Gaps
                  <span class="text-kitty-accent ml-2">{{ (colors().background_tint_gaps * 100).toFixed(0) }}%</span>
                  <span class="text-kitty-text-dim text-xs ml-1">(padding color tinting)</span>
                </label>
                <app-slider-input 
                  [value]="colors().background_tint_gaps" 
                  (valueChange)="helper.updateField('background_tint_gaps', $event)"
                  [min]="0" [max]="1" [step]="0.05" />
              </div>

              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">
                  Dim Opacity
                  <span class="text-kitty-accent ml-2">{{ (colors().dim_opacity * 100).toFixed(0) }}%</span>
                  <span class="text-kitty-text-dim text-xs ml-1">(inactive panes)</span>
                </label>
                <app-slider-input 
                  [value]="colors().dim_opacity" 
                  (valueChange)="helper.updateField('dim_opacity', $event)"
                  [min]="0" [max]="1" [step]="0.05" />
              </div>
            </div>
          </div>

          <div class="border-t border-kitty-border pt-6">
            <h3 class="text-lg font-semibold text-kitty-text mb-4">Selection Colors</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">Selection Foreground</label>
                <app-color-input [value]="colors().selection_foreground || '#000000'" (valueChange)="helper.updateField('selection_foreground', $event)" />
              </div>

              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">Selection Background</label>
                <app-color-input [value]="colors().selection_background || '#ffffff'" (valueChange)="helper.updateField('selection_background', $event)" />
              </div>
            </div>
          </div>

          <div class="border-t border-kitty-border pt-6" [class.opacity-60]="!transparentBackgroundColorsAvailable()">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-lg font-semibold text-kitty-text">Transparent Background Colors</h3>
              @if (!transparentBackgroundColorsAvailable()) {
                <app-version-badge version="0.36.3" />
              }
            </div>
            <p class="text-kitty-text-dim text-sm mb-4">Set per-color transparency. Format: color@opacity (e.g., red@0.5, #ff0000@0.3)</p>
            <div class="form-group">
              <textarea
                [ngModel]="colors().transparent_background_colors.join('\n')"
                (ngModelChange)="setTransparentColors($event)"
                [disabled]="!transparentBackgroundColorsAvailable()"
                rows="3"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm resize-y disabled:opacity-50"
                placeholder="#ff0000@0.5&#10;red@0.3&#10;background@0.8"
              ></textarea>
            </div>
          </div>

          <div class="border-t border-kitty-border pt-6">
            <h3 class="text-lg font-semibold text-kitty-text mb-1">Extended 256-Color Palette</h3>
            <p class="text-kitty-text-dim text-sm mb-4">Colors 16-255 for terminal applications that support the full 256-color palette.</p>
            <details class="group">
              <summary class="flex items-center gap-2 cursor-pointer text-sm font-medium text-kitty-accent hover:text-kitty-secondary transition-colors">
                <span>Show colors 16-255</span>
                <svg class="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div class="grid grid-cols-4 md:grid-cols-8 gap-2 mt-4">
                @for (i of extendedColorIndices; track i) {
                  <div class="form-group">
                    <label class="block text-[10px] font-medium text-kitty-text-dim mb-1">
                      {{ i }}
                    </label>
                    <app-color-input 
                      size="sm"
                      [value]="getColorValue(i)" 
                      (valueChange)="setColorValue(i, $event)" />
                  </div>
                }
              </div>
            </details>
          </div>

          <div class="border-t border-kitty-border pt-6">
            <h3 class="text-lg font-semibold text-kitty-text mb-1">ANSI 16-Color Palette</h3>
            <p class="text-kitty-text-dim text-sm mb-4">Colors 0–7 are standard, 8–15 are bright variants.</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              @for (i of colorIndices; track i) {
                <div class="form-group">
                  <label class="block text-xs font-medium text-kitty-text-dim mb-1.5">
                    color{{ i }}
                    <span class="text-kitty-text-dim ml-1">{{ colorNames[i] }}</span>
                  </label>
                  <app-color-input 
                    size="sm"
                    [value]="getColorValue(i)" 
                    (valueChange)="setColorValue(i, $event)" />
                </div>
              }
            </div>
          </div>

          <div class="border-t border-kitty-border pt-6">
            <h3 class="text-lg font-semibold text-kitty-text mb-1">Regex Mark Colors</h3>
            <p class="text-kitty-text-dim text-sm mb-4">Colors used when highlighting text with the <code class="bg-kitty-bg px-1 rounded font-mono text-xs">create_marker</code> action.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              @for (group of [1, 2, 3]; track group) {
                <div class="bg-kitty-bg rounded-lg p-4 border border-kitty-border">
                  <div class="text-sm font-medium text-kitty-text mb-3">Mark Group {{ group }}</div>
                  <div class="space-y-2">
                    <div>
                      <label class="text-xs text-kitty-text-dim mb-1 block">Foreground</label>
                      <app-color-input 
                        size="sm"
                        [value]="getMarkColor(group, 'foreground')" 
                        (valueChange)="setMarkColor(group, 'foreground', $event)" />
                    </div>
                    <div>
                      <label class="text-xs text-kitty-text-dim mb-1 block">Background</label>
                      <app-color-input 
                        size="sm"
                        [value]="getMarkColor(group, 'background')" 
                        (valueChange)="setMarkColor(group, 'background', $event)" />
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }
        </div>
    </app-form-section>
  `,
  styles: []
})
export class ColorsFormComponent {
  private readonly versionService = inject(KittyVersionService);
  readonly colorThemesService = inject(ColorThemesService);

  readonly helper = createFormHelper('colors');
  readonly colors = this.helper.state.asReadonly();
  readonly transparentBackgroundColorsAvailable = computed(() => this.versionService.isOptionAvailable('transparent_background_colors'));
  readonly dynamicBackgroundOpacityAvailable = computed(() => this.versionService.isOptionAvailable('dynamic_background_opacity'));
  readonly colorIndices = Array.from({ length: 16 }, (_, i) => i);
  readonly extendedColorIndices = Array.from({ length: 240 }, (_, i) => i + 16);
  readonly colorNames = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
                'br.black', 'br.red', 'br.green', 'br.yellow', 'br.blue', 'br.magenta', 'br.cyan', 'br.white'];

  applyTheme(themeName: string): void {
    const theme = this.colorThemesService.getTheme(themeName);
    if (theme) {
      const updatedColors = { ...this.colors(), ...theme.colors };
      this.helper.state.set(updatedColors);
      this.helper.update();
    }
  }

  getThemeColor(themeColors: Partial<KittyColorConfig>, index: number): string {
    const color = themeColors[`color${index}` as keyof KittyColorConfig];
    return typeof color === 'string' ? color : '#000';
  }

  getColorValue(index: number): string {
    return (this.colors() as unknown as Record<string, unknown>)[`color${index}`] as string || '#000000';
  }

  setColorValue(index: number, value: string): void {
    const key = `color${index}` as keyof KittyColorConfig;
    this.helper.updateField(key, value);
  }

  getMarkColor(group: number, type: 'foreground' | 'background'): string {
    const key = `mark${group}_${type}` as keyof KittyColorConfig;
    const val = this.colors()[key] as string;
    return val || (type === 'foreground' ? '#000000' : '#ffffff');
  }

  setMarkColor(group: number, type: 'foreground' | 'background', value: string): void {
    const key = `mark${group}_${type}` as keyof KittyColorConfig;
    this.helper.updateField(key, value);
  }

  setTransparentColors(value: string): void {
    const colors = value.split('\n').filter(l => l.trim());
    // Kitty enforces max 7 items for transparent_background_colors
    if (colors.length > 7) {
      colors.splice(7);
    }
    this.helper.updateField('transparent_background_colors', colors);
  }
}
