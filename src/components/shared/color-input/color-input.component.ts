import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Reusable color input component combining color picker and text input.
 * Reduces repetitive HTML patterns in forms.
 */
@Component({
  selector: 'app-color-input',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex gap-2">
      <input
        type="color"
        [ngModel]="value()"
        (ngModelChange)="onChange($event)"
        [class]="colorPickerClass()"
        [disabled]="disabled()"
      />
      <input
        type="text"
        [ngModel]="value()"
        (ngModelChange)="onChange($event)"
        [class]="textInputClass()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
      />
    </div>
  `
})
export class ColorInputComponent {
  value = input.required<string>();
  valueChange = output<string>();
  disabled = input<boolean>(false);
  placeholder = input<string>('#000000');
  
  size = input<'sm' | 'md' | 'lg'>('md');
  
  readonly sizeClasses = {
    sm: {
      picker: 'w-10 h-8 rounded cursor-pointer bg-kitty-surface border border-kitty-border flex-shrink-0',
      text: 'flex-1 px-2 py-1 text-xs bg-kitty-surface border border-kitty-border rounded text-kitty-text focus:outline-none focus:ring-1 focus:ring-kitty-primary font-mono'
    },
    md: {
      picker: 'w-14 h-10 rounded-lg cursor-pointer bg-kitty-bg border border-kitty-border flex-shrink-0',
      text: 'flex-1 px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm'
    },
    lg: {
      picker: 'w-16 h-12 rounded-lg cursor-pointer bg-kitty-bg border border-kitty-border flex-shrink-0',
      text: 'flex-1 px-4 py-3 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono'
    }
  } as const;

  colorPickerClass(): string {
    return this.sizeClasses[this.size()].picker;
  }

  textInputClass(): string {
    return this.sizeClasses[this.size()].text;
  }

  onChange(value: string): void {
    this.valueChange.emit(value);
  }
}
