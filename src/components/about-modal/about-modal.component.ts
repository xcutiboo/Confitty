import { CommonModule } from "@angular/common";
import { Component, output } from "@angular/core";

@Component({
	selector: "app-about-modal",
	imports: [CommonModule],
	template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      (click)="onBackdropClick($event)"
    >
      <div class="absolute inset-0 bg-kitty-darker/60 backdrop-blur-sm animate-fade-in"></div>

      <div class="relative w-full max-w-lg max-h-[90vh] flex flex-col glass-panel rounded-2xl overflow-hidden animate-scale-in">

        <div class="relative flex items-center gap-5 px-7 py-7 border-b border-kitty-border bg-kitty-surface-light/50">
          <img
            src="assets/confitty.svg"
            alt="Confitty mascot"
            class="w-16 h-16 flex-shrink-0"
            onerror="this.style.display='none'"
          />
          <div class="min-w-0">
            <h2 class="text-2xl font-bold text-kitty-text tracking-tight leading-none">Confitty</h2>
            <p class="text-kitty-primary text-sm font-medium mt-1.5">Visual config builder for Kitty Terminal</p>
          </div>
          <button
            (click)="closeRequested.emit()"
            class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-transparent hover:bg-kitty-surface-light text-kitty-text-dim hover:text-kitty-text transition-colors"
            aria-label="Close"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-5 overflow-y-auto">

          <div>
            <h3 class="text-sm font-semibold text-kitty-primary uppercase tracking-wider mb-2">About Confitty</h3>
            <p class="text-kitty-text text-sm leading-relaxed">
              Confitty is a visual configuration builder that saves you from reading Kitty Terminal's 400+ config options. It provides a real-time, side-by-side preview environment so you can tweak layout, font metrics, and colors before generating a clean, diff-only <code class="text-kitty-primary bg-kitty-bg px-1.5 py-0.5 rounded text-xs font-mono">kitty.conf</code> output.
            </p>
          </div>

          <div class="border-t border-kitty-border pt-5">
            <h3 class="text-sm font-semibold text-kitty-primary uppercase tracking-wider mb-3">The Mascot</h3>
            <p class="text-kitty-text text-sm leading-relaxed">
              Our mascot is a fun take on Kitty's ghost cat. We gave her a high-contrast palette and geometric confetti to make customizing your terminal more colorful and a lot less annoying.
            </p>
            <p class="text-kitty-text-dim text-xs mt-3">
              This application is an independent, community-driven project and is completely unaffiliated with the official Kitty Terminal maintainers.
            </p>
          </div>

          <div class="border-t border-kitty-border pt-5">
            <h3 class="text-sm font-semibold text-kitty-primary uppercase tracking-wider mb-3">Resources & Links</h3>
            <div class="flex flex-col gap-3">

              <div class="flex flex-col sm:flex-row gap-3">
                <button
                  (click)="openKofi()"
                  class="flex-1 flex items-center justify-center gap-3 px-4 py-3 bg-kitty-primary hover:bg-kitty-primary-hover text-kitty-dark rounded-lg text-sm font-semibold transition-colors"
                >
                  <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
                  </svg>
                  <div class="text-left">
                    <div class="font-bold text-sm">Buy me a coffee</div>
                    <div class="text-xs opacity-80 font-normal">if this saved you some suffering</div>
                  </div>
                </button>

                <a
                  href="https://github.com/xcutiboo/Confitty"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 flex items-center justify-center gap-3 px-4 py-3 bg-kitty-surface-light hover:bg-kitty-bg border border-kitty-border text-kitty-text rounded-lg text-sm font-semibold transition-colors"
                >
                  <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <div class="text-left">
                    <div class="font-bold text-sm">View on GitHub</div>
                    <div class="text-xs text-kitty-text-dim font-normal">star if you're feeling generous</div>
                  </div>
                </a>
              </div>

              <a
                href="https://discord.gg/kxG674AadQ"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-3 px-4 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <div class="text-left">
                  <div class="font-bold text-sm">Join Discord Server</div>
                  <div class="text-xs text-white/80 font-normal">chat, get help, share configs</div>
                </div>
              </a>

            </div>
          </div>

          <div class="border-t border-kitty-border pt-4 flex items-center justify-between">
            <p class="text-xs text-kitty-text-dim">not affiliated with Kitty Terminal or kovidgoyal</p>
            <a
              href="https://sw.kovidgoyal.net/kitty/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-kitty-primary hover:text-kitty-primary-hover transition-colors"
            >
              kitty docs →
            </a>
          </div>

        </div>
      </div>
    </div>
  `,
	styles: [],
})
export class AboutModalComponent {
	readonly closeRequested = output<void>();

	onBackdropClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) {
			this.closeRequested.emit();
		}
	}

	openKofi(): void {
		globalThis.open(
			"https://ko-fi.com/xcutiboo",
			"_blank",
			"noopener,noreferrer",
		);
	}
}
