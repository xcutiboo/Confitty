import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontPresetsService, FontPreset } from '../../../services/font-presets.service';
import { NumberInputComponent } from '../../shared/number-input/number-input.component';
import { VersionBadgeComponent } from '../../shared/version-badge/version-badge.component';
import { SliderInputComponent } from '../../shared/slider-input/slider-input.component';
import { FormSectionComponent } from '../../shared/form-section/form-section.component';
import { createFormHelper } from '../../../utils/form-helpers';
import { KittyVersionService } from '../../../services/kitty-version.service';

@Component({
  selector: 'app-fonts-form',
  imports: [CommonModule, FormsModule, NumberInputComponent, VersionBadgeComponent, SliderInputComponent, FormSectionComponent],
  template: `
    <app-form-section title="Fonts" description="Configure typography, rendering, and glyph settings">
        <div class="form-group">
          <label class="block text-sm font-medium text-kitty-text mb-3">
            Font Family
            <span class="text-kitty-text-dim text-xs ml-2">Primary monospace font</span>
          </label>

          <div class="mb-3">
            <div class="text-xs font-medium text-kitty-accent mb-2">Popular Fonts</div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              @for (font of fontPresetsService.getPopularFonts(); track font.family) {
                <button
                  type="button"
                  (click)="selectFont(font.family)"
                  (mouseenter)="fontPresetsService.loadWebFont(font.family)"
                  [class.bg-kitty-primary]="fonts().font_family === font.family"
                  [class.text-kitty-dark]="fonts().font_family === font.family"
                  [class.bg-kitty-surface-light]="fonts().font_family !== font.family"
                  [class.text-kitty-text]="fonts().font_family !== font.family"
                  class="px-3 py-2 rounded-lg text-xs hover:bg-kitty-primary hover:text-kitty-dark transition-colors border border-kitty-border"
                  [style.font-family]="getFontFamily(font)"
                  [title]="font.description"
                >{{ font.name }}</button>
              }
            </div>
          </div>

          <details class="mb-3">
            <summary class="text-xs font-medium text-kitty-accent cursor-pointer hover:text-kitty-secondary">
              All fonts ({{ fontPresetsService.getAllFonts().length }} available)
            </summary>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
              @for (font of fontPresetsService.getAllFonts(); track font.family) {
                <button
                  type="button"
                  (click)="selectFont(font.family)"
                  (mouseenter)="fontPresetsService.loadWebFont(font.family)"
                  [class.bg-kitty-primary]="fonts().font_family === font.family"
                  [class.text-kitty-dark]="fonts().font_family === font.family"
                  [class.bg-kitty-surface-light]="fonts().font_family !== font.family"
                  [class.text-kitty-text]="fonts().font_family !== font.family"
                  class="px-2 py-1.5 rounded text-xs hover:bg-kitty-primary hover:text-kitty-dark transition-colors border border-kitty-border"
                  [style.font-family]="getFontFamily(font)"
                  [title]="font.description"
                >{{ font.name }}</button>
              }
            </div>
          </details>

          <div class="text-xs text-kitty-text-dim mb-2">Or enter a custom font name:</div>
          <input
            type="text"
            [(ngModel)]="fonts().font_family"
            (ngModelChange)="helper.updateField('font_family', $event)"
            class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono"
            placeholder="monospace"
          />
        </div>

        <div class="form-group">
          <label class="block text-sm font-medium text-kitty-text mb-2">
            Font Size
            <span class="text-kitty-accent font-bold ml-2">{{ fonts().font_size }}pt</span>
          </label>
          <div class="flex items-center gap-4">
            <app-slider-input
              class="flex-1"
              [value]="fonts().font_size"
              (valueChange)="helper.updateField('font_size', $event)"
              [min]="6" [max]="32" [step]="0.5" />
            <app-number-input
              class="w-32 flex-shrink-0"
              [(ngModel)]="fonts().font_size"
              (ngModelChange)="helper.updateField('font_size', $event)"
              [min]="6"
              [max]="72"
              [step]="0.5"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="block text-sm font-medium text-kitty-text mb-2">
            Ligatures
            <span class="text-kitty-text-dim text-xs ml-2">Multi-character programming ligatures (==, ->, =>, etc.)</span>
          </label>
          <select
            [(ngModel)]="fonts().disable_ligatures"
            (ngModelChange)="helper.updateField('disable_ligatures', $event)"
            class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
          >
            <option value="never">Always show ligatures</option>
            <option value="always">Never show ligatures</option>
            <option value="cursor">Disable only when cursor is on them</option>
          </select>
        </div>

        @if (helper.advancedMode()) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Bold Font
                <span class="text-kitty-text-dim text-xs ml-1">'auto' lets Kitty detect</span>
              </label>
              <input
                type="text"
                [(ngModel)]="fonts().bold_font"
                (ngModelChange)="helper.updateField('bold_font', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
                placeholder="auto"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">Italic Font</label>
              <input
                type="text"
                [(ngModel)]="fonts().italic_font"
                (ngModelChange)="helper.updateField('italic_font', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
                placeholder="auto"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">Bold Italic Font</label>
              <input
                type="text"
                [(ngModel)]="fonts().bold_italic_font"
                (ngModelChange)="helper.updateField('bold_italic_font', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
                placeholder="auto"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="fonts().force_ltr"
                (ngModelChange)="helper.updateField('force_ltr', $event)"
                class="w-5 h-5 rounded flex-shrink-0"
              />
              <div>
                <span class="text-sm font-medium text-kitty-text">Force Left-to-Right Rendering</span>
                <p class="text-kitty-text-dim text-xs mt-0.5">Enable when using external BIDI programs like GNU FriBidi.</p>
              </div>
            </label>
          </div>

          <div class="form-group" [class.opacity-60]="!textCompositionStrategyAvailable()">
            <div class="flex items-center gap-2 mb-2">
              <label class="block text-sm font-medium text-kitty-text">
                Text Composition Strategy
                <span class="text-kitty-text-dim text-xs ml-2">How glyphs are composited onto the background</span>
              </label>
              @if (!textCompositionStrategyAvailable()) {
                <app-version-badge version="0.22.0" />
              }
            </div>
            <select
              [(ngModel)]="fonts().text_composition_strategy"
              (ngModelChange)="helper.updateField('text_composition_strategy', $event)"
              [disabled]="!textCompositionStrategyAvailable()"
              class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary disabled:opacity-50"
            >
              <option value="platform">Platform (use native OS compositing)</option>
              <option value="legacy">Legacy (may alter text weight based on contrast)</option>
            </select>
          </div>
        }

      @if (helper.advancedMode()) {
        <div class="bg-kitty-surface rounded-lg p-6 border border-kitty-border">
          <h3 class="text-lg font-semibold text-kitty-text mb-1">Undercurl & Rendering</h3>
          <p class="text-kitty-text-dim text-sm mb-4">Visual style for undercurls used in error indicators, spell checking, and LSP diagnostics</p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">Undercurl Style</label>
              <select
                [(ngModel)]="fonts().undercurl_style"
                (ngModelChange)="helper.updateField('undercurl_style', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
              >
                <option value="thin-sparse">Thin, Sparse waves</option>
                <option value="thin-dense">Thin, Dense waves</option>
                <option value="thick-sparse">Thick, Sparse waves</option>
                <option value="thick-dense">Thick, Dense waves</option>
              </select>
            </div>

            <div class="form-group" [class.opacity-60]="!underlineExclusionAvailable()">
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-kitty-text">
                  Underline Exclusion
                  <span class="text-kitty-text-dim text-xs ml-2">Gap padding when underlines intersect descenders (0 = no gaps)</span>
                </label>
                @if (!underlineExclusionAvailable()) {
                  <app-version-badge version="0.40.0" />
                }
              </div>
              <app-number-input
                [(ngModel)]="fonts().underline_exclusion"
                (ngModelChange)="helper.updateField('underline_exclusion', $event)"
                [min]="0"
                [max]="10"
                [step]="1"
                [disabled]="!underlineExclusionAvailable()"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Foreground Override Threshold
                <span class="text-kitty-text-dim text-xs ml-2">Minimum contrast ratio (0 = disabled)</span>
              </label>
              <app-number-input
                [(ngModel)]="fonts().text_fg_override_threshold"
                (ngModelChange)="helper.updateField('text_fg_override_threshold', $event)"
                [min]="0"
                [max]="100"
                [step]="1"
              />
            </div>
          </div>
        </div>

        <div class="bg-kitty-surface rounded-lg p-6 border border-kitty-border" [class.opacity-60]="!fontFeaturesAvailable()">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-lg font-semibold text-kitty-text">OpenType Features & Symbol Mapping</h3>
            @if (!fontFeaturesAvailable()) {
              <app-version-badge version="0.19.0" />
            }
          </div>
          <p class="text-kitty-text-dim text-sm mb-4">Advanced per-face OpenType feature flags and custom Unicode range-to-font mappings. Requires Kitty 0.19+</p>

          <div class="space-y-4">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Font Features
                <span class="text-kitty-text-dim text-xs ml-2">One per line - e.g. <code class="bg-kitty-bg px-1 rounded font-mono">FiraCode-Regular +zero</code></span>
              </label>
              <textarea
                [ngModel]="fonts().font_features.join('\n')"
                (ngModelChange)="setFontFeatures($event)"
                rows="3"
                [disabled]="!fontFeaturesAvailable()"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm resize-y disabled:opacity-50"
                placeholder="FiraCode-Regular +zero&#10;FiraCode-Regular +ss01"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Symbol Map
                <span class="text-kitty-text-dim text-xs ml-2">Map Unicode ranges to specific fonts (for Powerline/Nerd Fonts)</span>
              </label>
              <textarea
                [ngModel]="fonts().symbol_map.join('\n')"
                (ngModelChange)="setSymbolMap($event)"
                rows="4"
                [disabled]="!fontFeaturesAvailable()"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm resize-y disabled:opacity-50"
                placeholder="U+E0A0-U+E0A3,U+E0C0-U+E0C7 Symbols Nerd Font&#10;U+23FB-U+23FE,U+2665,U+26A1 Symbols Nerd Font"
              ></textarea>
              <p class="text-xs text-kitty-text-dim mt-2">
                <strong class="text-kitty-text">Powerline symbols:</strong> U+E0A0-U+E0A3,U+E0C0-U+E0C7 • 
                <strong class="text-kitty-text">Nerd Fonts:</strong> Use <code class="bg-kitty-bg px-1 rounded">Symbols Nerd Font</code> or <code class="bg-kitty-bg px-1 rounded">Symbols Nerd Font Mono</code>
              </p>
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Narrow Symbols
                <span class="text-kitty-text-dim text-xs ml-2">Unicode ranges to render at narrower widths (e.g. emoji)</span>
              </label>
              <textarea
                [ngModel]="fonts().narrow_symbols.join('\n')"
                (ngModelChange)="setNarrowSymbols($event)"
                rows="2"
                [disabled]="!fontFeaturesAvailable()"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm resize-y disabled:opacity-50"
                placeholder="U+1F600-U+1F64F 1&#10;U+2600-U+26FF 1"
              ></textarea>
            </div>

            <div class="form-group" [class.opacity-60]="!fontFeaturesAvailable()">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Modify Font
                <span class="text-kitty-text-dim text-xs ml-2">Fine-tune font metrics (one per line: cell_width 110%, baseline +2px)</span>
              </label>
              <textarea
                [ngModel]="fonts().modify_font.join('\n')"
                (ngModelChange)="setModifyFont($event)"
                rows="3"
                [disabled]="!fontFeaturesAvailable()"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm resize-y disabled:opacity-50"
                placeholder="cell_height 110%&#10;baseline +2px&#10;underline_thickness 1px"
              ></textarea>
              <p class="text-xs text-kitty-text-dim mt-2">
                <strong class="text-kitty-text">Valid metrics:</strong> cell_width, cell_height, baseline, underline_position, underline_thickness, strikethrough_position, strikethrough_thickness
              </p>
            </div>
          </div>
        </div>
      }
    </app-form-section>
  `,
  styles: []
})
export class FontsFormComponent {
  private readonly versionService = inject(KittyVersionService);
  readonly fontPresetsService = inject(FontPresetsService);

  readonly helper = createFormHelper('fonts');
  readonly fonts = this.helper.state.asReadonly();
  readonly textCompositionStrategyAvailable = computed(() => this.versionService.isOptionAvailable('text_composition_strategy'));
  readonly fontFeaturesAvailable = computed(() => this.versionService.isOptionAvailable('font_features'));
  readonly underlineExclusionAvailable = computed(() => this.versionService.isOptionAvailable('underline_exclusion'));

  selectFont(family: string): void {
    this.helper.updateField('font_family', family);
  }

  getFontFamily(font: FontPreset): string {
    return `"${font.family}", monospace`;
  }

  setFontFeatures(value: string): void {
    const features = value.split('\n').filter(l => l.trim());
    this.helper.updateField('font_features', features);
  }

  setSymbolMap(value: string): void {
    const map = value.split('\n').filter(l => l.trim());
    this.helper.updateField('symbol_map', map);
  }

  setNarrowSymbols(value: string): void {
    const symbols = value.split('\n').filter(l => l.trim());
    this.helper.updateField('narrow_symbols', symbols);
  }

  setBoxDrawingScale(value: string): void {
    const scale = value.split(',').map(s => Number.parseFloat(s.trim())).filter(n => !Number.isNaN(n));
    this.helper.updateField('box_drawing_scale', scale);
  }

  setModifyFont(value: string): void {
    const modifications = value.split('\n').filter(l => l.trim());
    this.helper.updateField('modify_font', modifications);
  }
}
