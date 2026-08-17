import { Injectable, signal } from "@angular/core";

const STORAGE_KEY = "confitty-theme";

/**
 * The inline script in index.html sets the class before first paint, so the page
 * never flashes the wrong theme. This service reads the same key so the toggle
 * starts in the state that script chose.
 *
 * Every browser API here is optional: the page is prerendered at build time in
 * Node, where none of them exist, and localStorage throws outright in Safari's
 * private mode. Failing to read a preference should never stop the app booting.
 */
@Injectable({ providedIn: "root" })
export class ThemeService {
	readonly isDark = signal(prefersDark());

	constructor() {
		this.applyTheme(this.isDark());
	}

	toggle(): void {
		const next = !this.isDark();
		this.isDark.set(next);
		try {
			localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
		} catch {
			// Storage denied. The choice still applies for this session.
		}
		this.applyTheme(next);
	}

	private applyTheme(dark: boolean): void {
		if (typeof document === "undefined") return;
		const root = document.documentElement;
		root.classList.toggle("dark", dark);
		root.classList.toggle("light", !dark);
	}
}

function prefersDark(): boolean {
	let saved: string | null = null;
	try {
		saved = localStorage.getItem(STORAGE_KEY);
	} catch {
		// Storage denied; fall through to the system preference.
	}
	if (saved) return saved === "dark";

	return typeof globalThis.matchMedia === "function"
		? globalThis.matchMedia("(prefers-color-scheme: dark)").matches
		: false;
}
