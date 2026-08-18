import { CommonModule } from "@angular/common";
import { Component, computed, inject, input } from "@angular/core";
import { ConfigStoreService } from "../../services/config-store.service";
import { measureCell } from "./cell-metrics";
import { mix, ptToPx, rgba } from "./color-utils";
import {
	DEFAULT_FADE_STEPS,
	POWERLINE_GLYPHS,
	POWERLINE_SOFT,
} from "./preview-metrics";
import { effectiveTabColors } from "./tab-colors";
import { PREVIEW_TABS, type PreviewTab } from "./terminal-session";

type Style = "fade" | "slant" | "separator" | "powerline" | "hidden";

@Component({
	selector: "app-terminal-tab-bar",
	imports: [CommonModule],
	template: `
    <div class="tab-bar-wrap" [ngStyle]="wrapStyles()">
      <div class="tab-bar-margin" [style.height.px]="firstMargin()" [style.backgroundColor]="marginColor()"></div>
      <div class="tab-bar" [ngStyle]="barStyles()">
        <div class="tab-row" [ngStyle]="rowStyles()">
        @switch (style()) {
          @case ('powerline') {
            @for (tab of tabs; track tab.title; let i = $index; let first = $first; let last = $last) {
              <span class="tab" [ngStyle]="powerlineTabStyles(tab, first)">{{ tab.title }}</span>
              <svg
                class="sep"
                viewBox="0 0 1 1"
                preserveAspectRatio="none"
                shape-rendering="geometricPrecision"
              >
                @if (isSoftSeparator(tab, i, last)) {
                  <rect x="0" y="0" width="1" height="1" [attr.fill]="tabBg(tab)" />
                  <path
                    [attr.d]="powerlineSoftPath()"
                    fill="none"
                    [attr.stroke]="tabFg(tab)"
                    stroke-width="0.08"
                    stroke-linecap="round"
                  />
                } @else {
                  <rect x="0" y="0" width="1" height="1" [attr.fill]="nextBgFor(i, last)" />
                  <path [attr.d]="powerlinePath()" [attr.fill]="tabBg(tab)" />
                }
              </svg>
              <span class="cell-pad" [style.backgroundColor]="nextBgFor(i, last)">&nbsp;</span>
            }
          }
          @case ('slant') {
            @for (tab of tabs; track tab.title) {
              <svg class="sep" viewBox="0 0 1 1" preserveAspectRatio="none">
                <rect x="0" y="0" width="1" height="1" [attr.fill]="tabBg(tab)" />
                <path [attr.d]="slantLeftPath()" [attr.fill]="barBg()" />
              </svg>
              <span class="tab" [ngStyle]="slantTabStyles(tab)">{{ tab.title }}</span>
              <svg class="sep" viewBox="0 0 1 1" preserveAspectRatio="none">
                <rect x="0" y="0" width="1" height="1" [attr.fill]="tabBg(tab)" />
                <path [attr.d]="slantRightPath()" [attr.fill]="barBg()" />
              </svg>
            }
          }
          @case ('separator') {
            @for (tab of tabs; track tab.title; let i = $index; let last = $last) {
              @for (_ of leadingSpaces(); track $index) {
                <span class="cell-pad">&nbsp;</span>
              }
              <span class="tab plain" [ngStyle]="plainTabStyles(tab)">{{ tab.title }}</span>
              @for (_ of trailingSpaces(); track $index) {
                <span class="cell-pad">&nbsp;</span>
              }
              @if (!last) {
                <span class="separator" [ngStyle]="separatorStyles()">{{ sepChar() }}</span>
              }
            }
          }
          @case ('fade') {
            @for (tab of tabs; track tab.title) {
              @for (alpha of fadeSteps(); track $index) {
                <span class="fade-cell" [ngStyle]="fadeCellStyles(tab, alpha)">&nbsp;</span>
              }
              <span class="tab fade-title" [ngStyle]="fadeTitleStyles(tab)">{{ tab.title }}</span>
              @for (alpha of reversedFadeSteps(); track $index) {
                <span class="fade-cell" [ngStyle]="fadeCellStyles(tab, alpha)">&nbsp;</span>
              }
              <span class="fade-cell" [style.backgroundColor]="barBg()">&nbsp;</span>
            }
          }
        }
        </div>
      </div>
      <div class="tab-bar-margin" [style.height.px]="lastMargin()" [style.backgroundColor]="marginColor()"></div>
    </div>
  `,
	styles: [
		`
    :host { display: contents; }

    .tab-bar-wrap {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .tab-bar-margin {
      flex-shrink: 0;
    }
    .tab-bar {
      display: flex;
      flex-shrink: 0;
      overflow: hidden;
      align-items: stretch;
    }
    .tab-row {
      display: flex;
      align-items: stretch;
      min-width: 0;
      flex: 1;
    }
    .tab {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .fade-cell, .cell-pad {
      display: inline-block;
      width: var(--cell-w);
      flex-shrink: 0;
    }
    .fade-title {
      padding: 0;
    }
    .separator {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      padding: 0;
    }
    .tab.plain {
      padding: 0;
    }
    .sep {
      display: inline-block;
      width: var(--cell-w);
      align-self: stretch;
      flex-shrink: 0;
    }
  `,
	],
})
export class TerminalTabBarComponent {
	private readonly store = inject(ConfigStoreService);

	readonly edge = input<"top" | "bottom">("bottom");
	readonly tabs = PREVIEW_TABS;

	readonly style = computed<Style>(
		() => this.store.configState().tab_bar.tab_bar_style as Style,
	);

	private readonly parsedSeparator = computed(() => {
		const raw = this.store.configState().tab_bar.tab_separator || " ┇";
		let sep = raw;
		let trailing = 0;
		while (sep.startsWith(" ")) {
			sep = sep.slice(1);
			trailing++;
		}
		let leading = 0;
		while (sep.endsWith(" ")) {
			sep = sep.slice(0, -1);
			leading++;
		}
		return { sep, leading, trailing };
	});

	readonly sepChar = computed(() => this.parsedSeparator().sep);
	readonly sepLeading = computed(() => this.parsedSeparator().leading);
	readonly sepTrailing = computed(() => this.parsedSeparator().trailing);
	readonly powerlineShape = computed(
		() => this.store.configState().tab_bar.tab_powerline_style,
	);

	/**
	 * The slant style carves the bar's own background out of each end of a tab,
	 * so a tab reads as a trapezium. Kitty flips which corner is cut when the bar
	 * sits along the bottom, otherwise the tabs would lean into the terminal
	 * rather than away from it: E0BC/E0BE along the top, E0B8/E0BA below.
	 */
	readonly slantLeftPath = computed(() =>
		this.edge() === "top" ? POWERLINE_GLYPHS.e0bc : POWERLINE_GLYPHS.e0b8,
	);
	readonly slantRightPath = computed(() =>
		this.edge() === "top" ? POWERLINE_GLYPHS.e0be : POWERLINE_GLYPHS.e0ba,
	);

	private readonly tabBar = computed(() => this.store.configState().tab_bar);
	private readonly colors = computed(() => this.store.configState().colors);
	private readonly fontFamily = computed(
		() => this.store.configState().fonts.font_family,
	);
	private readonly palette = computed(() =>
		effectiveTabColors(this.tabBar(), this.colors()),
	);
	private readonly fontSize = computed(
		() => this.store.configState().fonts.font_size,
	);
	private readonly fontPx = computed(() => ptToPx(this.fontSize()));
	private readonly metrics = computed(() =>
		measureCell(this.fontFamily(), this.fontPx()),
	);
	private readonly cellHeightPx = computed(() =>
		Math.round(this.metrics().height),
	);
	private readonly cellWidthPx = computed(() => this.metrics().width);

	readonly barStyles = computed(() => {
		const tb = this.tabBar();
		const colors = this.colors();
		const margin = Math.max(0, tb.tab_bar_margin_width);

		return {
			height: `${this.cellHeightPx()}px`,
			backgroundColor: this.palette().barBg,
			fontSize: `${this.fontPx()}px`,
			lineHeight: `${this.cellHeightPx()}px`,
			color: rgba(colors.foreground, 0.85),
			paddingInline: `${margin}px`,
			"--cell-w": `${this.cellWidthPx()}px`,
		} as Record<string, string>;
	});

	readonly rowStyles = computed(() => {
		const align = this.tabBar().tab_bar_align;
		const justify =
			align === "center"
				? "center"
				: align === "right"
					? "flex-end"
					: "flex-start";
		return { justifyContent: justify } as Record<string, string>;
	});

	readonly wrapStyles = computed(
		() =>
			({ backgroundColor: this.colors().background }) as Record<string, string>,
	);

	readonly marginColor = computed(() => {
		const c = this.tabBar().tab_bar_margin_color;
		return c && c !== "none" ? c : this.colors().background;
	});

	private readonly margins = computed(() => {
		const m = this.tabBar().tab_bar_margin_height ?? [];
		const outer = Math.max(0, m[0] ?? 0);
		const inner = Math.max(0, m[1] ?? 0);
		return { outer, inner };
	});

	readonly firstMargin = computed(() => {
		const { outer, inner } = this.margins();
		return this.edge() === "top" ? outer : inner;
	});

	readonly lastMargin = computed(() => {
		const { outer, inner } = this.margins();
		return this.edge() === "top" ? inner : outer;
	});

	/**
	 * The glyph Kitty draws between two powerline tabs, from the table in
	 * tab_bar.py. Its filled part takes the tab's own background and the rest
	 * shows the next tab's, so picking the complementary triangle puts the tab's
	 * colour on the far side of the slant and leaves a wedge of it stranded
	 * against the following tab.
	 */
	powerlinePath(): string {
		switch (this.powerlineShape()) {
			case "round":
				return POWERLINE_GLYPHS.e0b4;
			case "slanted":
				return POWERLINE_GLYPHS.e0bc;
			default:
				return POWERLINE_GLYPHS.e0b0;
		}
	}

	powerlineSoftPath(): string {
		switch (this.powerlineShape()) {
			case "round":
				return POWERLINE_SOFT.round;
			case "slanted":
				return POWERLINE_SOFT.slanted;
			default:
				return POWERLINE_SOFT.angled;
		}
	}

	nextBgFor(i: number, last: boolean): string {
		if (last) return this.barBg();
		return this.tabBg(this.tabs[i + 1]!);
	}

	prevBgFor(i: number, first: boolean): string {
		if (first) return this.barBg();
		return this.tabBg(this.tabs[i - 1]!);
	}

	isSoftSeparator(tab: PreviewTab, i: number, last: boolean): boolean {
		return !last && this.tabBg(tab) === this.tabBg(this.tabs[i + 1]!);
	}

	tabBg(tab: PreviewTab): string {
		const p = this.palette();
		return tab.active ? p.activeBg : p.inactiveBg;
	}

	barBg(): string {
		return this.palette().barBg;
	}

	powerlineTabStyles(tab: PreviewTab, first: boolean): Record<string, string> {
		return {
			backgroundColor: this.tabBg(tab),
			color: this.tabFg(tab),
			paddingLeft: first ? "var(--cell-w)" : "0",
			paddingRight: "var(--cell-w)",
			...this.tabFontStyle(tab),
		};
	}

	private tabFontStyle(tab: PreviewTab): Record<string, string> {
		const tb = this.tabBar();
		const raw =
			(tab.active ? tb.active_tab_font_style : tb.inactive_tab_font_style) ??
			"normal";
		const tokens = raw
			.toLowerCase()
			.split(/[\s\-_]+/)
			.filter(Boolean);
		const isBold = tokens.includes("bold");
		const isItalic = tokens.includes("italic");
		return {
			fontWeight: isBold ? "700" : "400",
			fontStyle: isItalic ? "italic" : "normal",
		};
	}

	tabFg(tab: PreviewTab): string {
		const p = this.palette();
		return tab.active ? p.activeFg : p.inactiveFg;
	}

	slantTabStyles(tab: PreviewTab): Record<string, string> {
		return {
			backgroundColor: this.tabBg(tab),
			color: this.tabFg(tab),
			padding: "0 var(--cell-w)",
			...this.tabFontStyle(tab),
		};
	}

	plainTabStyles(tab: PreviewTab): Record<string, string> {
		return {
			color: this.tabFg(tab),
			...this.tabFontStyle(tab),
		};
	}

	fadeTitleStyles(tab: PreviewTab): Record<string, string> {
		return {
			backgroundColor: this.tabBg(tab),
			color: this.tabFg(tab),
			...this.tabFontStyle(tab),
		};
	}

	fadeSteps(): readonly number[] {
		const fade = this.tabBar().tab_fade;
		return fade?.length ? fade : DEFAULT_FADE_STEPS;
	}

	reversedFadeSteps(): readonly number[] {
		return [...this.fadeSteps()].reverse();
	}

	fadeCellStyles(tab: PreviewTab, alpha: number): Record<string, string> {
		return {
			backgroundColor: mix(this.barBg(), this.tabBg(tab), alpha),
		};
	}

	dimFg(): string {
		return rgba(this.colors().foreground, 0.55);
	}

	leadingSpaces(): readonly null[] {
		return Array.from({ length: this.sepLeading() }).fill(null) as null[];
	}

	trailingSpaces(): readonly null[] {
		return Array.from({ length: this.sepTrailing() }).fill(null) as null[];
	}

	separatorStyles(): Record<string, string> {
		return {
			color: this.colors().foreground,
			backgroundColor: this.palette().inactiveBg,
			fontWeight: "400",
			fontStyle: "normal",
			display: "inline-block",
			width: "var(--cell-w)",
			textAlign: "center",
		};
	}
}
