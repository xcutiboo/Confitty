import { afterNextRender, Component, signal } from "@angular/core";
import { ADSENSE_CLIENT, ADSENSE_SLOT, adsEnabled } from "../../../config/ads";

const LOADER_ID = "adsense-loader";

/** Reserved height, so the slot does not shove the page when an ad arrives. */
const RESERVED_HEIGHT_PX = 100;

declare global {
	interface Window {
		adsbygoogle?: unknown[];
	}
}

/**
 * A single AdSense unit, rendered only when the deployment supplies a publisher
 * ID and ad unit. Everything about it is conditional: with no configuration the
 * component renders nothing and the third-party script is never requested, so
 * local builds and forks stay free of it entirely.
 *
 * Confitty is free and has no backend to sell; this covers the domain and keeps
 * it that way. It sits below the settings rather than beside them, is labelled,
 * and reserves its height so an arriving ad cannot push the form around.
 */
@Component({
	selector: "app-ad-slot",
	template: `
    @if (visible()) {
      <aside class="wrapper" aria-label="Advertisement">
        <p class="label">Advertisement</p>
        <ins
          class="adsbygoogle"
          style="display:block"
          [attr.data-ad-client]="client"
          [attr.data-ad-slot]="slot"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
        <p class="note">
          Confitty is free and open source. Ads cover the domain and hosting.
        </p>
      </aside>
    }
  `,
	styles: [
		`
    .wrapper {
      margin-top: 1.5rem;
      padding: 0.75rem;
      border: 1px dashed rgb(var(--kitty-border));
      border-radius: 0.75rem;
      background: rgb(var(--kitty-surface));
      min-height: ${RESERVED_HEIGHT_PX}px;
    }

    /*
     * Ads must not read as part of the product. Kept visually quiet but plainly
     * marked, above and below, rather than dressed up as a settings card.
     */
    .label, .note {
      font-size: 0.6875rem;
      line-height: 1.45;
      color: rgb(var(--kitty-text-dim));
    }
    .label {
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .note {
      margin-top: 0.5rem;
    }
  `,
	],
})
export class AdSlotComponent {
	readonly client = ADSENSE_CLIENT;
	readonly slot = ADSENSE_SLOT;
	readonly visible = signal(adsEnabled());

	constructor() {
		afterNextRender(() => {
			if (!this.visible()) return;
			loadAdSense();
			// Pushing an empty object is how AdSense is told to fill the unit that
			// was just added to the DOM.
			(window.adsbygoogle ??= []).push({});
		});
	}
}

/** Appends the loader once per document, however many slots ask for it. */
function loadAdSense(): void {
	if (document.getElementById(LOADER_ID)) return;

	const script = document.createElement("script");
	script.id = LOADER_ID;
	script.async = true;
	script.crossOrigin = "anonymous";
	script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`;
	document.head.appendChild(script);
}
