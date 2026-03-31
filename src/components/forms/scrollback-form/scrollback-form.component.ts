import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NumberInputComponent } from '../../shared/number-input/number-input.component';
import { VersionBadgeComponent } from '../../shared/version-badge/version-badge.component';
import { SliderInputComponent } from '../../shared/slider-input/slider-input.component';
import { FormSectionComponent } from '../../shared/form-section/form-section.component';
import { createFormHelper } from '../../../utils/form-helpers';
import { KittyVersionService } from '../../../services/kitty-version.service';

@Component({
  selector: 'app-scrollback-form',
  imports: [CommonModule, FormsModule, NumberInputComponent, VersionBadgeComponent, SliderInputComponent, FormSectionComponent],
  template: `
    <app-form-section title="Scrollback" description="Configure terminal history and scrolling behavior">
      <div class="form-group">
        <label class="block text-sm font-medium text-kitty-text mb-2">
          Scrollback Lines
          <span class="text-kitty-accent font-bold ml-2">{{ scrollback().scrollback_lines.toLocaleString() }}</span>
          <span class="text-kitty-text-dim text-xs ml-1">(0 = infinite)</span>
        </label>
        <app-number-input
          [(ngModel)]="scrollback().scrollback_lines"
          (ngModelChange)="helper.updateField('scrollback_lines', $event)"
          [min]="0"
          [step]="1000"
        />
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-kitty-text mb-2">
          Wheel Scroll Multiplier
          <span class="text-kitty-accent font-bold ml-2">{{ scrollback().wheel_scroll_multiplier }}x</span>
        </label>
        <app-slider-input
          [value]="scrollback().wheel_scroll_multiplier"
          (valueChange)="helper.updateField('wheel_scroll_multiplier', $event)"
          [min]="0.5" [max]="20" [step]="0.5" />
      </div>

      @if (helper.advancedMode()) {
        <div class="mt-6 pt-6 border-t border-kitty-border space-y-6">
          <div class="form-group" [class.opacity-60]="!scrollbarAvailable()">
            <div class="flex items-center gap-2 mb-2">
              <label class="block text-sm font-medium text-kitty-text">
                Scrollbar
                <span class="text-kitty-text-dim text-xs ml-2">Show scrollbar in scrollback buffer (replaces scrollback_indicator_opacity)</span>
              </label>
              @if (!scrollbarAvailable()) {
                <app-version-badge version="0.43.0" />
              }
            </div>
            <select
              [(ngModel)]="scrollback().scrollbar"
              (ngModelChange)="helper.updateField('scrollbar', $event)"
              [disabled]="!scrollbarAvailable()"
              class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary disabled:opacity-50"
            >
              <option value="">Auto (show on scroll)</option>
              <option value="never">Never</option>
              <option value="always">Always</option>
              <option value="hovered">Hovered</option>
              <option value="scrolled-and-hovered">Scrolled and Hovered</option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Scrollback Pager History Size
                <span class="text-kitty-text-dim text-xs ml-2">MB of history passed to pager (0 = unlimited)</span>
              </label>
              <app-number-input
                [(ngModel)]="scrollback().scrollback_pager_history_size"
                (ngModelChange)="helper.updateField('scrollback_pager_history_size', $event)"
                [min]="0"
                [step]="1"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Wheel Scroll Min Lines
                <span class="text-kitty-text-dim text-xs ml-2">Minimum lines per scroll event</span>
              </label>
              <app-number-input
                [(ngModel)]="scrollback().wheel_scroll_min_lines"
                (ngModelChange)="helper.updateField('wheel_scroll_min_lines', $event)"
                [min]="1"
                [step]="1"
              />
            </div>
          </div>

          <div class="form-group" [class.opacity-60]="!scrollbackPagerAvailable()">
            <div class="flex items-center gap-2 mb-2">
              <label class="block text-sm font-medium text-kitty-text">
                Scrollback Pager
                <span class="text-kitty-text-dim text-xs ml-2">Command to open scrollback in a pager</span>
              </label>
              @if (!scrollbackPagerAvailable()) {
                <app-version-badge version="0.25.0" />
              }
            </div>
            <input
              type="text"
              [(ngModel)]="scrollback().scrollback_pager"
              (ngModelChange)="helper.updateField('scrollback_pager', $event)"
              [disabled]="!scrollbackPagerAvailable()"
              class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm disabled:opacity-50"
              placeholder="less --chop-long-lines --RAW-CONTROL-CHARS +INPUT_LINE_NUMBER"
            />
          </div>

          <div class="form-group">
            <label class="block text-sm font-medium text-kitty-text mb-2">
              Touch Scroll Multiplier
              <span class="text-kitty-accent font-bold ml-2">{{ scrollback().touch_scroll_multiplier }}x</span>
            </label>
            <app-slider-input
              [value]="scrollback().touch_scroll_multiplier"
              (valueChange)="helper.updateField('touch_scroll_multiplier', $event)"
              [min]="0.5" [max]="10" [step]="0.5" />
          </div>

          <div class="form-group" [class.opacity-60]="!pixelScrollAvailable()">
            <div class="flex items-center gap-2 mb-2">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="scrollback().pixel_scroll"
                  (ngModelChange)="helper.updateField('pixel_scroll', $event)"
                  [disabled]="!pixelScrollAvailable()"
                  class="w-5 h-5 rounded flex-shrink-0 disabled:opacity-50"
                />
                <div>
                  <span class="text-sm font-medium text-kitty-text">Pixel Scroll</span>
                  <p class="text-kitty-text-dim text-xs mt-0.5">Smooth pixel-by-pixel scrolling with high precision mice</p>
                </div>
              </label>
              @if (!pixelScrollAvailable()) {
                <app-version-badge version="0.46.0" />
              }
            </div>
          </div>

          <div class="form-group" [class.opacity-60]="!momentumScrollAvailable()">
            <div class="flex items-center gap-2 mb-2">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="scrollback().momentum_scroll"
                  (ngModelChange)="helper.updateField('momentum_scroll', $event)"
                  [disabled]="!momentumScrollAvailable()"
                  class="w-5 h-5 rounded flex-shrink-0 disabled:opacity-50"
                />
                <div>
                  <span class="text-sm font-medium text-kitty-text">Momentum Scroll</span>
                  <p class="text-kitty-text-dim text-xs mt-0.5">Inertial scrolling on touchpads (like macOS)</p>
                </div>
              </label>
              @if (!momentumScrollAvailable()) {
                <app-version-badge version="0.46.0" />
              }
            </div>
          </div>

          <div class="form-group">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="scrollback().scrollback_fill_enlarged_window"
                (ngModelChange)="helper.updateField('scrollback_fill_enlarged_window', $event)"
                class="w-5 h-5 rounded flex-shrink-0"
              />
              <div>
                <span class="text-sm font-medium text-kitty-text">Fill Enlarged Window with Scrollback</span>
                <p class="text-kitty-text-dim text-xs mt-0.5">When the window is resized to be larger, fill empty space with scrollback history</p>
              </div>
            </label>
          </div>
        </div>
      }
    </app-form-section>
  `,
  styles: []
})
export class ScrollbackFormComponent {
  private readonly versionService = inject(KittyVersionService);

  readonly helper = createFormHelper('scrollback');
  readonly scrollback = this.helper.state.asReadonly();
  readonly scrollbackPagerAvailable = computed(() => this.versionService.isOptionAvailable('scrollback_pager'));
  readonly scrollbarAvailable = computed(() => this.versionService.isOptionAvailable('scrollbar'));
  readonly pixelScrollAvailable = computed(() => this.versionService.isOptionAvailable('pixel_scroll'));
  readonly momentumScrollAvailable = computed(() => this.versionService.isOptionAvailable('momentum_scroll'));
}
