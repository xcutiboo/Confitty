import { Component, forwardRef, Input, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-number-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="w-full flex items-stretch h-10 rounded-lg border bg-kitty-bg overflow-hidden transition-colors"
      [class.border-kitty-border]="!focused"
      [class.border-kitty-primary]="focused"
      [class.opacity-50]="disabled"
      [class.pointer-events-none]="disabled"
    >
      <button
        type="button"
        (click)="decrement()"
        [disabled]="disabled || (min !== null && value <= min)"
        class="flex-shrink-0 w-9 flex items-center justify-center text-kitty-text-dim hover:text-kitty-text hover:bg-kitty-surface-light active:bg-kitty-surface disabled:opacity-30 transition-colors select-none"
        tabindex="-1"
        aria-label="Decrease"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      <input
        type="text"
        inputmode="numeric"
        class="flex-1 w-0 min-w-0 bg-transparent text-center text-kitty-text text-sm font-mono px-2 focus:outline-none border-x border-kitty-border"
        [value]="displayValue"
        (focus)="onFocus()"
        (blur)="onBlur($event)"
        (keydown)="onKeydown($event)"
        (change)="onInputChange($event)"
      />

      <button
        type="button"
        (click)="increment()"
        [disabled]="disabled || (max !== null && value >= max)"
        class="flex-shrink-0 w-9 flex items-center justify-center text-kitty-text-dim hover:text-kitty-text hover:bg-kitty-surface-light active:bg-kitty-surface disabled:opacity-30 transition-colors select-none"
        tabindex="-1"
        aria-label="Increase"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  `,
  styles: [],
})
export class NumberInputComponent implements ControlValueAccessor {
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() step = 1;

  value = 0;
  focused = false;
  disabled = false;

  private readonly cdr = inject(ChangeDetectorRef);
  private onChange: (val: number) => void = () => {};
  private onTouched: () => void = () => {};

  get displayValue(): string {
    return String(this.value);
  }

  writeValue(val: number): void {
    this.value = val ?? 0;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (val: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this.cdr.markForCheck();
  }

  increment(): void {
    const next = this.clamp(+(this.value + this.step).toFixed(10));
    this.emit(next);
  }

  decrement(): void {
    const next = this.clamp(+(this.value - this.step).toFixed(10));
    this.emit(next);
  }

  onFocus(): void {
    this.focused = true;
  }

  onBlur(event: FocusEvent): void {
    this.focused = false;
    this.onTouched();
    const raw = (event.target as HTMLInputElement).value;
    const parsed = Number.parseFloat(raw);
    if (!Number.isNaN(parsed)) {
      this.emit(this.clamp(parsed));
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.increment();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.decrement();
    }
  }

  onInputChange(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = Number.parseFloat(raw);
    if (!Number.isNaN(parsed)) {
      this.emit(this.clamp(parsed));
    }
  }

  private clamp(val: number): number {
    if (this.min !== null && val < this.min) return this.min;
    if (this.max !== null && val > this.max) return this.max;
    return val;
  }

  private emit(val: number): void {
    this.value = val;
    this.onChange(val);
    this.onTouched();
    this.cdr.markForCheck();
  }
}
