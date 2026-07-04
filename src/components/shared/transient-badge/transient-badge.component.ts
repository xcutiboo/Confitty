import { CommonModule } from "@angular/common";
import { Component, input, signal, OnInit, OnDestroy } from "@angular/core";

@Component({
	selector: "app-transient-badge",
	imports: [CommonModule],
	template: `
    @if (isVisible()) {
      <span 
        class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase transition-all duration-500 ease-in-out"
        [ngClass]="[
          colorClass(),
          isFading() ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        ]"
      >
        <ng-content></ng-content>
      </span>
    }
  `,
	styles: [],
})
export class TransientBadgeComponent implements OnInit, OnDestroy {
	readonly duration = input<number>(5000);
	readonly colorClass = input<string>("bg-kitty-primary text-kitty-dark");

	readonly isVisible = signal(true);
	readonly isFading = signal(false);

	private fadeTimeout?: ReturnType<typeof setTimeout>;
	private removeTimeout?: ReturnType<typeof setTimeout>;

	ngOnInit(): void {
		if (this.duration() > 0) {
			this.fadeTimeout = setTimeout(() => {
				this.isFading.set(true);
				this.removeTimeout = setTimeout(() => {
					this.isVisible.set(false);
				}, 500); // 500ms matches the CSS transition duration
			}, this.duration());
		}
	}

	ngOnDestroy(): void {
		if (this.fadeTimeout) clearTimeout(this.fadeTimeout);
		if (this.removeTimeout) clearTimeout(this.removeTimeout);
	}
}
