import { Component, input } from "@angular/core";

const ICONS = {
	// Header actions
	menu: "M4 6h16M4 12h16M4 18h16",
	search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
	download: "M12 4v12m0 0l-4-4m4 4l4-4M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1",
	upload: "M12 16V4m0 0L8 8m4-4l4 4M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1",
	close: "M6 18L18 6M6 6l12 12",
	dots: "M6 12h.01M12 12h.01M18 12h.01",
	info: "M12 17v-5m0-3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
	preview:
		"M2 5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z M8 21h8m-4-4v4",
	sun: "M12 17a5 5 0 100-10 5 5 0 000 10z M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
	moon: "M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z",
	// Mode / status
	sliders:
		"M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
	sparkles:
		"M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z",
	palette:
		"M12 2a10 10 0 100 20c1.7 0 3-1.4 3-3 0-.9-.3-1.6-.9-2.1-.4-.4-.6-1-.6-1.7 0-1.2 1-2.2 2.2-2.2H17a5 5 0 005-5 10 10 0 00-10-10z M7 13a1 1 0 100-2 1 1 0 000 2z M10 8a1 1 0 100-2 1 1 0 000 2z M15 8a1 1 0 100-2 1 1 0 000 2z M18 13a1 1 0 100-2 1 1 0 000 2z",
	// Misc
	check: "M5 13l4 4L19 7",
	plus: "M12 5v14M5 12h14",
	chevron_down: "M19 9l-7 7-7-7",
	chevron_right: "M9 5l7 7-7 7",
	trash:
		"M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2",
	edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.1 2.1 0 113 3L12 15l-4 1 1-4 9.5-9.5z",
	heart:
		"M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1.1 1.1L12 21l7.8-7.8 1.1-1.1a5.5 5.5 0 000-7.8z",
	star: "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8L2 9.3l6.9-1L12 2z",
	refresh:
		"M3 12a9 9 0 0115.5-6.3L21 8 M21 4v4h-4 M21 12a9 9 0 01-15.5 6.3L3 16 M3 20v-4h4",
	copy: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z",
	external:
		"M14 3h7v7 M10 14L21 3 M21 14v6a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h6",
	cat: "M3 5l3 3v9a4 4 0 004 4h4a4 4 0 004-4V8l3-3v9a7 7 0 01-7 7h-4a7 7 0 01-7-7V5z M9 13a1 1 0 100-2 1 1 0 000 2z M15 13a1 1 0 100-2 1 1 0 000 2z M12 16l1.5 1.5h-3L12 16z",
} as const;

export type IconName = keyof typeof ICONS;

@Component({
	selector: "app-icon",
	template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.stroke-width]="stroke()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
	styles: [
		`
    :host { display: inline-flex; line-height: 0; }
  `,
	],
})
export class IconComponent {
	readonly name = input.required<IconName>();
	readonly size = input<number>(18);
	readonly stroke = input<number>(2);
	readonly label = input<string>("");

	path(): string {
		return ICONS[this.name()] ?? "";
	}
}
