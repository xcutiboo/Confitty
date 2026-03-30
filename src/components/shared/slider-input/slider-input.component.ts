import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Reusable slider input component with optional number input.
 * Reduces repetitive range slider HTML patterns across forms.
 */
@Component({
  selector: 'app-slider-input',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center gap-4">
      <input
        type="range"
        [ngModel]="value()"
        (ngModelChange)="onChange($event)"
        [min]="min()"
        [max]="max()"
        [step]="step()"
        [disabled]="disabled()"
        class="flex-1"
      />
      @if (showNumberInput()) {
        <input
          type="number"
          [ngModel]="value()"
          (ngModelChange)="onChange($event)"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [disabled]="disabled()"
          class="w-20 px-2 py-1 text-sm bg-kitty-bg border border-kitty-border rounded text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono"
        />
      }
    </div>
    @if (labels().length > 0) {
      <div class="flex justify-between text-xs text-kitty-text-dim mt-1">
        @for (label of labels(); track $index) {
          <span>{{ label }}</span>
        }
      </div>
    }
  `
})
export class SliderInputComponent {
  value = input.required<number>();
  valueChange = output<number>();
  
  min = input<number>(0);
  max = input<number>(100);
  step = input<number>(1);
  disabled = input<boolean>(false);
  showNumberInput = input<boolean>(false);
  labels = input<string[]>([]);

  onChange(value: number): void {
    this.valueChange.emit(value);
  }
}
