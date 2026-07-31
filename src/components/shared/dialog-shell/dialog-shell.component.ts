import {
	afterNextRender,
	Component,
	ElementRef,
	input,
	output,
	viewChild,
} from "@angular/core";

/**
 * Modal wrapper built on the native <dialog> element.
 *
 * showModal() gives focus trapping, inertness for the rest of the page, Escape
 * handling, focus restore on close and top-layer stacking. Hand-rolling those
 * on a div is a well-known source of half-finished modals, and there is nothing
 * here the platform does not already do correctly.
 */
@Component({
	selector: "app-dialog-shell",
	template: `
    <dialog
      #dialog
      class="shell"
      [attr.aria-label]="label()"
      (close)="closed.emit()"
      (click)="onBackdropClick($event)"
    >
      <div class="shell__panel" [class]="panelClass()">
        <ng-content />
      </div>
    </dialog>
  `,
	styles: [
		`
    :host { display: contents; }

    .shell {
      padding: 0;
      border: 0;
      background: transparent;
      max-width: 100vw;
      max-height: 100dvh;
      width: 100%;
      height: 100%;
      overflow: visible;
      color: inherit;
    }

    .shell::backdrop {
      background: rgb(0 0 0 / 0.55);
      backdrop-filter: blur(4px);
    }

    /*
     * Alignment deliberately lives in panelClass rather than here: component
     * styles carry an encapsulation attribute, so they outrank any utility
     * class a host passes in and silently win.
     */
    .shell__panel {
      display: flex;
      width: 100%;
      height: 100%;
    }

    .shell[open] {
      animation: shell-in 160ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .shell[open]::backdrop {
      animation: shell-backdrop-in 160ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes shell-in {
      from { opacity: 0; transform: scale(0.98); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes shell-backdrop-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
      .shell[open], .shell[open]::backdrop { animation: none; }
    }
  `,
	],
})
export class DialogShellComponent {
	readonly label = input.required<string>();
	/** Layout for the wrapper that positions the panel inside the viewport. */
	readonly panelClass = input<string>("items-center justify-center p-4");
	readonly closed = output<void>();

	private readonly dialog =
		viewChild.required<ElementRef<HTMLDialogElement>>("dialog");

	constructor() {
		afterNextRender(() => this.dialog().nativeElement.showModal());
	}

	close(): void {
		this.dialog().nativeElement.close();
	}

	/**
	 * A click landing on the dialog itself rather than the panel is a click on
	 * the backdrop; the panel fills the dialog, so anything inside stops here.
	 */
	onBackdropClick(event: MouseEvent): void {
		if (event.target === this.dialog().nativeElement) this.close();
	}
}
