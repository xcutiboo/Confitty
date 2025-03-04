import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-section',
  template: `
    <section class="space-y-6">
      <header>
        <h2 class="text-2xl font-bold text-kitty-primary mb-2">{{ title() }}</h2>
        <p class="text-kitty-text-dim">{{ description() }}</p>
      </header>

      <div class="space-y-6 bg-kitty-surface rounded-lg p-6 border border-kitty-border">
        <ng-content />
      </div>
    </section>
  `,
})
export class FormSectionComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
