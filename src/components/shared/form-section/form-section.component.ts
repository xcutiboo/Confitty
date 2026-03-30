import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-section',
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-kitty-primary mb-2">{{ title }}</h2>
        <p class="text-kitty-text-dim">{{ description }}</p>
      </div>

      <div class="space-y-6 bg-kitty-surface rounded-lg p-6 border border-kitty-border">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class FormSectionComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
}
