import { Component, input } from "@angular/core";
import { IconComponent, type IconName } from "../icon.component";

@Component({
	selector: "app-form-section",
	imports: [IconComponent],
	template: `
    <section class="space-y-6">
      <header class="flex gap-4 items-start pb-4 border-b border-kitty-border/50">
        @if (icon()) {
          <div class="mt-1 flex-shrink-0 w-10 h-10 rounded-xl bg-kitty-primary/10 flex items-center justify-center text-kitty-primary shadow-sm border border-kitty-primary/20">
            <app-icon [name]="icon()!" [size]="20" [stroke]="2" />
          </div>
        }
        <div>
          <h2 class="text-xl font-bold text-kitty-text mb-1">{{ title() }}</h2>
          <p class="text-sm text-kitty-text-dim leading-relaxed">{{ description() }}</p>
        </div>
      </header>

      <div class="space-y-6 bg-kitty-surface/50 rounded-xl p-6 border border-kitty-border/80 shadow-sm">
        <ng-content />
      </div>
    </section>
  `,
})
export class FormSectionComponent {
	readonly title = input.required<string>();
	readonly description = input.required<string>();
	readonly icon = input<IconName>();
}
