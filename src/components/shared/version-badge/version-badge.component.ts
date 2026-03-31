import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-version-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-kitty-accent/20 text-kitty-accent border border-kitty-accent/30">
      {{ version }}+
    </span>
  `,
  styles: []
})
export class VersionBadgeComponent {
  @Input() version!: string;
}
