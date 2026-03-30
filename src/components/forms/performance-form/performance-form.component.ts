import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderInputComponent } from '../../shared/slider-input/slider-input.component';
import { FormSectionComponent } from '../../shared/form-section/form-section.component';
import { createFormHelper } from '../../../utils/form-helpers';

@Component({
  selector: 'app-performance-form',
  imports: [CommonModule, FormsModule, SliderInputComponent, FormSectionComponent],
  template: `
    <app-form-section title="Performance" description="Tune Kitty's OpenGL rendering pipeline and input event batching">
      <div class="form-group">
        <label class="block text-sm font-medium text-kitty-text mb-2">
          Repaint Delay
          <span class="text-kitty-accent font-bold ml-2">{{ performance().repaint_delay }}ms</span>
        </label>
        <p class="text-kitty-text-dim text-xs mb-3">
          Delay between screen repaints. Lower = higher FPS at the cost of more CPU.
          Default 10ms (~100 FPS). Values under 3ms push toward maximum refresh rate.
        </p>
        <app-slider-input
          [value]="performance().repaint_delay"
          (valueChange)="helper.updateField('repaint_delay', $event)"
          [min]="1" [max]="100" [step]="1"
          [labels]="['1ms (max FPS, high CPU)', '100ms (smooth, low CPU)']" />
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-kitty-text mb-2">
          Input Delay
          <span class="text-kitty-accent font-bold ml-2">{{ performance().input_delay }}ms</span>
        </label>
        <p class="text-kitty-text-dim text-xs mb-3">
          Milliseconds to wait before processing input. Allows Kitty to batch rapid key events efficiently.
          Reduce to 0 for minimum latency in games or fast-typing workflows.
        </p>
        <app-slider-input
          [value]="performance().input_delay"
          (valueChange)="helper.updateField('input_delay', $event)"
          [min]="0" [max]="50" [step]="1" />
      </div>

      @if (helper.advancedMode()) {
        <div class="form-group mt-6 pt-6 border-t border-kitty-border">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              [ngModel]="performance().sync_to_monitor"
              (ngModelChange)="helper.updateField('sync_to_monitor', $event)"
              class="w-5 h-5 rounded flex-shrink-0"
            />
            <div>
              <span class="text-sm font-medium text-kitty-text">Sync to Monitor (VSync)</span>
              <p class="text-kitty-text-dim text-xs mt-0.5">
                Synchronize rendering to the monitor's refresh rate to prevent screen tearing during fast scrollback.
                Disabling may reduce latency at the cost of visual artifacts.
              </p>
            </div>
          </label>
        </div>
      }
    </app-form-section>

    <div class="mt-6 bg-kitty-bg rounded-lg p-4 border border-kitty-border">
      <p class="text-xs text-kitty-text-dim">
        <span class="text-kitty-accent font-medium">Tip:</span> For a responsive gaming setup, try repaint_delay 1, input_delay 0, sync_to_monitor no.
        For a battery-efficient laptop setup, try repaint_delay 20, input_delay 3, sync_to_monitor yes.
      </p>
    </div>
  `,
  styles: []
})
export class PerformanceFormComponent {
  readonly helper = createFormHelper('performance');
  readonly performance = this.helper.state.asReadonly();
}
