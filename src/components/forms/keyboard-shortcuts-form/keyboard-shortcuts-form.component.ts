import { CommonModule } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { KITTY_ACTIONS } from "../../../models/kitty-actions";
import { ConfigStoreService } from "../../../services/config-store.service";
import { KittyVersionService } from "../../../services/kitty-version.service";
import { FormSectionComponent } from "../../shared/form-section/form-section.component";
import { NumberInputComponent } from "../../shared/number-input/number-input.component";
import { VersionBadgeComponent } from "../../shared/version-badge/version-badge.component";

@Component({
	selector: "app-keyboard-shortcuts-form",
	imports: [
		CommonModule,
		FormsModule,
		NumberInputComponent,
		VersionBadgeComponent,
		FormSectionComponent,
	],
	template: `
    <app-form-section title="Keyboard Shortcuts" description="Configure global modifier key and keyboard mappings" icon="edit">
        <div class="form-group">
          <label class="block text-sm font-medium text-kitty-text mb-2">
            Kitty Mod
            <span class="text-kitty-text-dim text-xs ml-2">Global modifier for all default shortcuts</span>
          </label>
          <input
            type="text"
            [ngModel]="kittyMod()"
            (ngModelChange)="updateKittyMod($event)"
            class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
            placeholder="ctrl+shift"
          />
          <p class="text-kitty-text-dim text-xs mt-1">
            Default: <code class="bg-kitty-bg px-1 rounded font-mono">ctrl+shift</code>.
            Common: <code class="bg-kitty-bg px-1 rounded font-mono">ctrl</code>,
            <code class="bg-kitty-bg px-1 rounded font-mono">alt</code>,
            <code class="bg-kitty-bg px-1 rounded font-mono">super</code>,
            <code class="bg-kitty-bg px-1 rounded font-mono">ctrl+alt</code>
          </p>
        </div>

        <div class="form-group" [class.opacity-60]="!mapTimeoutAvailable()">
          <div class="flex items-center gap-2 mb-2">
            <label class="block text-sm font-medium text-kitty-text">
              Map Timeout
              <span class="text-kitty-text-dim text-xs ml-2">Timeout for multi-key sequences (0 = no timeout)</span>
            </label>
            @if (!mapTimeoutAvailable()) {
              <app-version-badge version="0.32.0" />
            }
          </div>
          <app-number-input
            [(ngModel)]="advanced().map_timeout"
            (ngModelChange)="updateAdvancedField('map_timeout', $event)"
            [min]="0"
            [step]="0.1"
            [disabled]="!mapTimeoutAvailable()"
          />
        </div>

      <div class="border-t border-kitty-border pt-6">
        <h3 class="text-lg font-semibold text-kitty-text mb-1">Keyboard Mappings</h3>
        <p class="text-kitty-text-dim text-sm mb-4">
          Each row becomes a <code class="bg-kitty-bg px-1 rounded font-mono">map</code>
          directive. Write <code class="bg-kitty-bg px-1 rounded font-mono">kitty_mod</code>
          in a chord to mean whatever you set above.
        </p>

        @if (shortcuts().length > 0) {
          <ul class="space-y-2 mb-4">
            @for (shortcut of shortcuts(); track $index) {
              <li class="flex flex-col sm:flex-row gap-2 sm:items-start">
                <div class="sm:w-56 flex-shrink-0">
                  <input
                    type="text"
                    [ngModel]="shortcut.chord"
                    (ngModelChange)="setChord($index, $event)"
                    [attr.aria-label]="'Shortcut ' + ($index + 1) + ' key combination'"
                    [attr.aria-invalid]="!shortcut.chord.trim() || isDuplicate($index)"
                    class="w-full px-3 py-2 bg-kitty-bg border rounded-lg text-kitty-text font-mono text-sm
                           focus:outline-none focus:ring-2 focus:ring-kitty-primary"
                    [class.border-kitty-border]="shortcut.chord.trim() && !isDuplicate($index)"
                    [class.border-kitty-warning]="!shortcut.chord.trim() || isDuplicate($index)"
                    placeholder="kitty_mod+t"
                  />
                </div>

                <div class="flex-1 min-w-0 flex gap-2">
                  <input
                    type="text"
                    list="kitty-actions"
                    [ngModel]="shortcut.action"
                    (ngModelChange)="setAction($index, $event)"
                    [attr.aria-label]="'Shortcut ' + ($index + 1) + ' action'"
                    [attr.aria-invalid]="!shortcut.action.trim()"
                    class="flex-1 min-w-0 px-3 py-2 bg-kitty-bg border rounded-lg text-kitty-text font-mono text-sm
                           focus:outline-none focus:ring-2 focus:ring-kitty-primary"
                    [class.border-kitty-border]="shortcut.action.trim()"
                    [class.border-kitty-warning]="!shortcut.action.trim()"
                    placeholder="new_tab"
                  />
                  <button
                    type="button"
                    (click)="remove($index)"
                    class="w-11 h-[42px] flex-shrink-0 flex items-center justify-center rounded-lg border border-kitty-border
                           text-kitty-text-dim hover:text-kitty-warning hover:border-kitty-warning transition-colors"
                    [attr.aria-label]="'Remove shortcut ' + ($index + 1)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/>
                    </svg>
                  </button>
                </div>
              </li>
            }
          </ul>

          @if (problems(); as issues) {
            <p class="text-kitty-warning text-xs mb-4" role="status">{{ issues }}</p>
          }
        } @else {
          <div class="py-8 px-6 bg-kitty-bg/50 rounded-lg border border-kitty-border border-dashed mb-4">
            <p class="text-kitty-text text-sm font-medium">No custom shortcuts yet</p>
            <p class="text-kitty-text-dim text-xs mt-1">
              Kitty's own defaults still apply. Add a row to override one, or import a
              <code class="bg-kitty-bg px-1 rounded font-mono">kitty.conf</code> that already has
              <code class="bg-kitty-bg px-1 rounded font-mono">map</code> directives.
            </p>
          </div>
        }

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            (click)="add()"
            class="px-4 py-2 rounded-lg text-sm font-medium bg-kitty-primary text-kitty-dark hover:bg-kitty-primary-hover transition-colors"
          >Add shortcut</button>

          <!--
            Deliberately not ngModel: this select is a trigger, not a bound
            value, and a two-way binding fired the handler on both input and
            change, adding every pick twice.
          -->
          <select
            #actionPicker
            (change)="addFromAction(actionPicker.value); actionPicker.value = ''"
            aria-label="Add a shortcut from Kitty's default actions"
            class="px-3 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-sm text-kitty-text
                   focus:outline-none focus:ring-2 focus:ring-kitty-primary max-w-full"
          >
            <option value="">Add from Kitty's defaults…</option>
            @for (item of actions; track item.action) {
              <option [value]="item.action">{{ item.title }} ({{ item.defaultChord }})</option>
            }
          </select>
        </div>

        <!-- Suggestions for the action field; it stays free text for launch and kitten calls. -->
        <datalist id="kitty-actions">
          @for (item of actions; track item.action) {
            <option [value]="item.action">{{ item.title }}</option>
          }
        </datalist>
      </div>
    </app-form-section>
  `,
	styles: [],
})
export class KeyboardShortcutsFormComponent {
	private readonly configStore = inject(ConfigStoreService);
	private readonly versionService = inject(KittyVersionService);

	readonly actions = KITTY_ACTIONS;

	readonly config = computed(() => this.configStore.configState());
	readonly shortcuts = computed(() => this.config().keyboard_shortcuts);
	readonly kittyMod = computed(() => this.config().kitty_mod);
	readonly advanced = computed(() => this.config().advanced);
	readonly mapTimeoutAvailable = computed(() =>
		this.versionService.isOptionAvailable("map_timeout"),
	);

	/**
	 * Kitty applies the last matching map directive, so a repeated chord silently
	 * discards the earlier row. Worth saying out loud rather than exporting a
	 * file that quietly does less than the editor shows.
	 */
	readonly duplicateChords = computed(() => {
		const counts = new Map<string, number>();
		for (const { chord } of this.shortcuts()) {
			const key = chord.trim();
			if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
		}
		return new Set(
			[...counts].filter(([, count]) => count > 1).map(([chord]) => chord),
		);
	});

	readonly problems = computed(() => {
		const shortcuts = this.shortcuts();
		const incomplete = shortcuts.filter(
			(s) => !s.chord.trim() || !s.action.trim(),
		).length;
		const duplicates = this.duplicateChords().size;

		const parts: string[] = [];
		if (incomplete > 0) {
			parts.push(
				`${incomplete} row${incomplete === 1 ? "" : "s"} still missing a key or an action; they are left out of the export.`,
			);
		}
		if (duplicates > 0) {
			parts.push(
				`${duplicates} key combination${duplicates === 1 ? " is" : "s are"} bound more than once; Kitty keeps the last one.`,
			);
		}
		return parts.join(" ");
	});

	isDuplicate(index: number): boolean {
		const chord = this.shortcuts()[index]?.chord.trim();
		return !!chord && this.duplicateChords().has(chord);
	}

	updateKittyMod(value: string): void {
		this.configStore.setKittyMod(value);
	}

	updateAdvancedField(field: string, value: unknown): void {
		this.configStore.updateSection("advanced", { [field]: value });
	}

	setChord(index: number, chord: string): void {
		this.configStore.updateShortcut(index, { chord });
	}

	setAction(index: number, action: string): void {
		this.configStore.updateShortcut(index, { action });
	}

	add(): void {
		this.configStore.addShortcut();
	}

	addFromAction(action: string): void {
		if (!action) return;
		const preset = KITTY_ACTIONS.find((item) => item.action === action);
		this.configStore.addShortcut({
			chord: preset?.defaultChord ?? "",
			action,
		});
	}

	remove(index: number): void {
		this.configStore.removeShortcut(index);
	}
}
