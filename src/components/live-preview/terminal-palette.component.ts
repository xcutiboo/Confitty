import { CommonModule } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { ConfigStoreService } from "../../services/config-store.service";
import { readableOn } from "./color-utils";

const SWATCHES: { key: keyof IndexedColors; label: string }[] = [
	{ key: "color0", label: "0" },
	{ key: "color1", label: "1" },
	{ key: "color2", label: "2" },
	{ key: "color3", label: "3" },
	{ key: "color4", label: "4" },
	{ key: "color5", label: "5" },
	{ key: "color6", label: "6" },
	{ key: "color7", label: "7" },
	{ key: "color8", label: "8" },
	{ key: "color9", label: "9" },
	{ key: "color10", label: "10" },
	{ key: "color11", label: "11" },
	{ key: "color12", label: "12" },
	{ key: "color13", label: "13" },
	{ key: "color14", label: "14" },
	{ key: "color15", label: "15" },
];

type IndexedColors = Record<`color${number}`, string>;

@Component({
	selector: "app-terminal-palette",
	imports: [CommonModule],
	template: `
    <div class="palette">
      <div class="row">
        <span class="label">ANSI</span>
        <div class="grid">
          @for (s of swatches; track s.key) {
            <button
              type="button"
              class="swatch"
              [style.background]="value(s.key)"
              [style.color]="textOn(s.key)"
              [title]="s.key + ': ' + value(s.key)"
            >{{ s.label }}</button>
          }
        </div>
      </div>
    </div>
  `,
	styles: [
		`
    .palette {
      padding: 10px 14px;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .label {
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgb(var(--kitty-text-dim));
      font-weight: 600;
      flex-shrink: 0;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(16, minmax(0, 1fr));
      gap: 4px;
      flex: 1;
    }
    .swatch {
      aspect-ratio: 1;
      border-radius: 4px;
      border: 1px solid rgb(var(--kitty-border));
      font-size: 9px;
      font-weight: 600;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: -0.02em;
      transition: transform 120ms ease;
    }
    .swatch:hover {
      transform: scale(1.05);
    }
  `,
	],
})
export class TerminalPaletteComponent {
	private readonly store = inject(ConfigStoreService);

	readonly swatches = SWATCHES;

	private readonly colors = computed(
		() => this.store.configState().colors as unknown as IndexedColors,
	);

	value(key: keyof IndexedColors): string {
		return this.colors()[key] ?? "#000000";
	}

	textOn(key: keyof IndexedColors): string {
		return readableOn(this.value(key));
	}
}
