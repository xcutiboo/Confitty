import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KittyCursorConfig } from '../../../models/kitty-types';
import { KittyVersionService } from '../../../services/kitty-version.service';
import { createFormHelper } from '../../../utils/form-helpers';
import { ColorInputComponent } from '../../shared/color-input/color-input.component';
import { FormSectionComponent } from '../../shared/form-section/form-section.component';
import { NumberInputComponent } from '../../shared/number-input/number-input.component';
import { SliderInputComponent } from '../../shared/slider-input/slider-input.component';
import { VersionBadgeComponent } from '../../shared/version-badge/version-badge.component';

@Component({
  selector: 'app-cursor-form',
  imports: [
    CommonModule,
    FormsModule,
    NumberInputComponent,
    VersionBadgeComponent,
    ColorInputComponent,
    SliderInputComponent,
    FormSectionComponent,
  ],
  template: `
    <app-form-section title="Cursor" description="Customize cursor shape, color, and animation">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-group">
          <label class="block text-sm font-medium text-kitty-text mb-2">
            Cursor Color
            <span class="text-kitty-text-dim text-xs ml-2"
              >Hex value or 'none' for reverse-video effect</span
            >
          </label>
          <app-color-input
            [value]="cursorColorForPicker()"
            (valueChange)="setCursorColor($event)"
            placeholder="#cccccc or none"
          />
        </div>

        @if (helper.advancedMode()) {
          <div class="form-group">
            <label class="block text-sm font-medium text-kitty-text mb-2">
              Cursor Text Color
              <span class="text-kitty-text-dim text-xs ml-2"
                >'background' inherits the cell's background color</span
              >
            </label>
            <app-color-input
              [value]="cursorTextColorForPicker()"
              (valueChange)="setCursorTextColor($event)"
              placeholder="#111111 or background"
            />
          </div>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-group">
          <label class="block text-sm font-medium text-kitty-text mb-3">Shape (Focused)</label>
          <div class="grid grid-cols-3 gap-2">
            @for (shape of ['block', 'beam', 'underline']; track shape) {
              <button
                type="button"
                (click)="setCursorShape(shape)"
                [class.bg-kitty-primary]="cursor().cursor_shape === shape"
                [class.text-kitty-dark]="cursor().cursor_shape === shape"
                [class.bg-kitty-surface-light]="cursor().cursor_shape !== shape"
                [class.text-kitty-text]="cursor().cursor_shape !== shape"
                class="px-3 py-2 rounded-lg text-sm capitalize hover:bg-kitty-primary hover:text-kitty-dark transition-colors border border-kitty-border"
              >
                {{ shape }}
              </button>
            }
          </div>
        </div>

        @if (helper.advancedMode()) {
          <div class="form-group" [class.opacity-60]="!cursorShapeUnfocusedAvailable()">
            <div class="flex items-center gap-2 mb-2">
              <label class="block text-sm font-medium text-kitty-text">
                Shape (Unfocused)
                <span class="text-kitty-text-dim text-xs ml-2"
                  >Cursor appearance when window loses focus</span
                >
              </label>
              @if (!cursorShapeUnfocusedAvailable()) {
                <app-version-badge version="0.35.2" />
              }
            </div>
            <select
              [(ngModel)]="cursor().cursor_shape_unfocused"
              (ngModelChange)="helper.updateField('cursor_shape_unfocused', $event)"
              [disabled]="!cursorShapeUnfocusedAvailable()"
              class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary disabled:opacity-50"
            >
              <option value="block">Block</option>
              <option value="beam">Beam</option>
              <option value="underline">Underline</option>
              <option value="hollow">Hollow</option>
              <option value="unchanged">Unchanged (keep focused shape)</option>
            </select>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-group">
          <label class="block text-sm font-medium text-kitty-text mb-2">
            Blink Interval
            <span class="text-kitty-text-dim text-xs ml-2"
              >Seconds between blinks (0 = solid, -1 = system default)</span
            >
          </label>
          <app-number-input
            [(ngModel)]="cursor().cursor_blink_interval"
            (ngModelChange)="helper.updateField('cursor_blink_interval', $event)"
            [min]="-1"
            [step]="0.1"
          />
        </div>

        @if (helper.advancedMode()) {
          <div class="form-group" [class.opacity-60]="!cursorStopBlinkingAvailable()">
            <div class="flex items-center gap-2 mb-2">
              <label class="block text-sm font-medium text-kitty-text">
                Stop Blinking After
                <span class="text-kitty-text-dim text-xs ml-2"
                  >Seconds of inactivity before cursor stops blinking (0 = never)</span
                >
              </label>
              @if (!cursorStopBlinkingAvailable()) {
                <app-version-badge version="0.43.0" />
              }
            </div>
            <app-number-input
              [(ngModel)]="cursor().cursor_stop_blinking_after"
              (ngModelChange)="helper.updateField('cursor_stop_blinking_after', $event)"
              [min]="0"
              [step]="1"
              [disabled]="!cursorStopBlinkingAvailable()"
            />
          </div>
        }
      </div>

      @if (helper.advancedMode()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label class="block text-sm font-medium text-kitty-text mb-2">
              Beam Thickness
              <span class="text-kitty-accent font-bold ml-2"
                >{{ cursor().cursor_beam_thickness }}pt</span
              >
            </label>
            <app-slider-input
              [value]="cursor().cursor_beam_thickness"
              (valueChange)="helper.updateField('cursor_beam_thickness', $event)"
              [min]="0.5"
              [max]="5"
              [step]="0.1"
            />
          </div>

          <div class="form-group">
            <label class="block text-sm font-medium text-kitty-text mb-2">
              Underline Thickness
              <span class="text-kitty-accent font-bold ml-2"
                >{{ cursor().cursor_underline_thickness }}pt</span
              >
            </label>
            <app-slider-input
              [value]="cursor().cursor_underline_thickness"
              (valueChange)="helper.updateField('cursor_underline_thickness', $event)"
              [min]="0.5"
              [max]="5"
              [step]="0.1"
            />
          </div>
        </div>

        <div
          class="bg-kitty-bg/60 border border-kitty-primary/20 rounded-lg p-4 mt-6"
          [class.opacity-60]="!cursorTrailAvailable()"
        >
          <div class="flex items-center gap-2 mb-3">
            <h3 class="text-sm font-semibold text-kitty-primary">Cursor Trail Animation</h3>
            @if (!cursorTrailAvailable()) {
              <app-version-badge version="0.23.2" />
            }
          </div>
          <p class="text-xs text-kitty-text-dim mb-4">
            Simulates smooth cursor movement by leaving phantom cursors during rapid jumps (requires
            GPU support)
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-group">
              <label class="block text-xs font-medium text-kitty-text mb-2">
                Trail Length
                <span class="text-kitty-text-dim ml-1">(0 = disabled)</span>
              </label>
              <app-number-input
                [(ngModel)]="cursor().cursor_trail"
                (ngModelChange)="helper.updateField('cursor_trail', $event)"
                [min]="0"
                [max]="20"
                [step]="1"
                [disabled]="!cursorTrailAvailable()"
              />
            </div>

            <div class="form-group">
              <label class="block text-xs font-medium text-kitty-text mb-2">
                Start Threshold
                <span class="text-kitty-text-dim ml-1">(min cells to jump)</span>
              </label>
              <app-number-input
                [(ngModel)]="cursor().cursor_trail_start_threshold"
                (ngModelChange)="helper.updateField('cursor_trail_start_threshold', $event)"
                [min]="1"
                [max]="10"
                [step]="1"
                [disabled]="!cursorTrailAvailable()"
              />
            </div>

            <div class="form-group">
              <label class="block text-xs font-medium text-kitty-text mb-2">
                Trail Color
                <span class="text-kitty-text-dim ml-1">("none" for cursor color)</span>
              </label>
              <app-color-input
                size="sm"
                [value]="getTrailColor()"
                (valueChange)="setTrailColor($event)"
                [disabled]="!cursorTrailAvailable()"
                placeholder="none or #rrggbb"
              />
            </div>

            <div class="form-group">
              <label class="block text-xs font-medium text-kitty-text mb-2">
                Decay Values
                <span class="text-kitty-text-dim ml-1">(space-separated floats)</span>
              </label>
              <input
                type="text"
                [ngModel]="cursor().cursor_trail_decay.join(' ')"
                (ngModelChange)="setTrailDecay($event)"
                [disabled]="!cursorTrailAvailable()"
                class="w-full px-3 py-1.5 text-sm bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono disabled:opacity-50"
                placeholder="0.1 0.4"
              />
            </div>
          </div>
        </div>
      }
    </app-form-section>
  `,
  styles: [],
})
export class CursorFormComponent {
  private readonly versionService = inject(KittyVersionService);

  readonly helper = createFormHelper('cursor');
  readonly cursor = this.helper.state.asReadonly();
  readonly cursorTrailAvailable = computed(() =>
    this.versionService.isOptionAvailable('cursor_trail')
  );
  readonly cursorStopBlinkingAvailable = computed(() =>
    this.versionService.isOptionAvailable('cursor_stop_blinking_after')
  );
  readonly cursorShapeUnfocusedAvailable = computed(() =>
    this.versionService.isOptionAvailable('cursor_shape_unfocused')
  );

  cursorColorForPicker(): string {
    return this.cursor().cursor.startsWith('#') ? this.cursor().cursor : '#cccccc';
  }

  cursorTextColorForPicker(): string {
    return this.cursor().cursor_text_color.startsWith('#')
      ? this.cursor().cursor_text_color
      : '#111111';
  }

  setCursorShape(shape: string): void {
    this.helper.updateField('cursor_shape', shape as KittyCursorConfig['cursor_shape']);
  }

  setCursorColor(value: string): void {
    this.helper.updateField('cursor', value);
  }

  setCursorTextColor(value: string): void {
    this.helper.updateField('cursor_text_color', value);
  }

  setTrailDecay(value: string): void {
    const decay = value
      .split(/\s+/)
      .map(Number)
      .filter(n => !Number.isNaN(n));
    this.helper.updateField('cursor_trail_decay', decay.length > 0 ? decay : [0.1, 0.4]);
  }

  getTrailColor(): string {
    return this.cursor().cursor_trail_color?.startsWith('#')
      ? this.cursor().cursor_trail_color
      : '#cccccc';
  }

  setTrailColor(value: string): void {
    this.helper.updateField('cursor_trail_color', value);
  }
}
