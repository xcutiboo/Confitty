import { CommonModule } from "@angular/common";
import {
	Component,
	computed,
	effect,
	inject,
	type OnDestroy,
	signal,
} from "@angular/core";
import { ConfigStoreService } from "../../services/config-store.service";
import { measureCell } from "./cell-metrics";
import { ptToPx } from "./color-utils";

const SYSTEM_BLINK_INTERVAL = 0.5;

@Component({
	selector: "app-terminal-cursor",
	imports: [CommonModule],
	template: `
    <span class="terminal-cursor" [class.blinking]="active()" [ngStyle]="styles()"></span>
  `,
	styles: [
		`
    .terminal-cursor {
      display: inline-block;
      vertical-align: text-top;
      box-sizing: border-box;
      position: relative;
    }
    .terminal-cursor.blinking {
      animation: cursor-blink var(--blink-duration) steps(2, jump-none) infinite;
    }
    @keyframes cursor-blink {
      50% { opacity: 0; }
    }
  `,
	],
})
export class TerminalCursorComponent implements OnDestroy {
	private readonly store = inject(ConfigStoreService);
	private readonly stoppedBlink = signal(false);
	private stopTimer: ReturnType<typeof setTimeout> | null = null;

	private readonly cursor = computed(() => this.store.configState().cursor);
	private readonly fontFamily = computed(
		() => this.store.configState().fonts.font_family,
	);
	private readonly fontSize = computed(
		() => this.store.configState().fonts.font_size,
	);
	private readonly fontPx = computed(() => ptToPx(this.fontSize()));

	constructor() {
		effect(() => {
			const seconds = this.cursor().cursor_stop_blinking_after;
			if (this.stopTimer) clearTimeout(this.stopTimer);
			this.stoppedBlink.set(false);
			if (seconds > 0) {
				this.stopTimer = setTimeout(
					() => this.stoppedBlink.set(true),
					seconds * 1000,
				);
			}
		});
	}

	readonly active = computed(() => {
		const cfg = this.cursor();
		if (cfg.cursor_blink_interval === 0) return false;
		return !this.stoppedBlink();
	});

	readonly styles = computed(() => {
		const cfg = this.cursor();
		const family = this.fontFamily();
		const fontPx = this.fontPx();
		const metrics = measureCell(family, fontPx);
		const cellWidth = metrics.width;
		const cellHeight = metrics.height;
		const color = cfg.cursor === "none" ? "transparent" : cfg.cursor;
		const blinkInterval =
			cfg.cursor_blink_interval === -1
				? SYSTEM_BLINK_INTERVAL
				: Math.max(0.1, cfg.cursor_blink_interval);

		const base: Record<string, string> = {
			width: `${cellWidth}px`,
			height: `${cellHeight}px`,
			"--blink-duration": `${blinkInterval * 2}s`,
		};

		switch (cfg.cursor_shape) {
			case "beam": {
				const thickness = Math.max(1, ptToPx(cfg.cursor_beam_thickness));
				return {
					...base,
					width: `${thickness}px`,
					backgroundColor: color,
				};
			}
			case "underline": {
				const thickness = Math.max(1, ptToPx(cfg.cursor_underline_thickness));
				return {
					...base,
					backgroundColor: "transparent",
					borderBottom: `${thickness}px solid ${color}`,
				};
			}
			default:
				return {
					...base,
					backgroundColor: color,
				};
		}
	});

	ngOnDestroy(): void {
		if (this.stopTimer) clearTimeout(this.stopTimer);
	}
}
