import { Component, input } from "@angular/core";

@Component({
	selector: "app-version-badge",
	template: `
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-kitty-accent/20 text-kitty-accent border border-kitty-accent/30">
      {{ version() }}+
    </span>
  `,
})
export class VersionBadgeComponent {
	readonly version = input.required<string>();
}
