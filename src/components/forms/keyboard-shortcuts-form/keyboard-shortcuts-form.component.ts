import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigStoreService } from '../../../services/config-store.service';
import { KittyVersionService } from '../../../services/kitty-version.service';
import { NumberInputComponent } from '../../shared/number-input/number-input.component';
import { VersionBadgeComponent } from '../../shared/version-badge/version-badge.component';
import { FormSectionComponent } from '../../shared/form-section/form-section.component';

@Component({
  selector: 'app-keyboard-shortcuts-form',
  imports: [CommonModule, FormsModule, NumberInputComponent, VersionBadgeComponent, FormSectionComponent],
  template: `
    <app-form-section title="Keyboard Shortcuts" description="Configure global modifier key and keyboard mappings">
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

        <div class="border-t border-kitty-border pt-6">
          <h3 class="text-lg font-semibold text-kitty-text mb-4">Keyboard Mappings</h3>
          <p class="text-kitty-text-dim text-sm mb-4">
            Keyboard shortcuts are parsed from imported kitty.conf files.
            Direct support for editing shortcuts is planned for a future release.
          </p>

          @if (keyboardShortcuts().length > 0) {
            <div class="space-y-2">
              @for (shortcut of keyboardShortcuts(); track shortcut.chord + shortcut.action) {
                <div class="flex items-center justify-between bg-kitty-bg rounded px-4 py-2 border border-kitty-border">
                  <code class="font-mono text-sm text-kitty-accent">{{ shortcut.chord }}</code>
                  <span class="text-sm text-kitty-text">{{ shortcut.action }}</span>
                </div>
              }
            </div>
          } @else {
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
        <h3 class="text-lg font-semibold text-kitty-text mb-4">Keyboard Mappings</h3>
        <p class="text-kitty-text-dim text-sm mb-4">
          Keyboard shortcuts are parsed from imported kitty.conf files.
          Direct support for editing shortcuts is planned for a future release.
        </p>

        @if (keyboardShortcuts().length > 0) {
          <div class="space-y-2">
            @for (shortcut of keyboardShortcuts(); track shortcut.chord + shortcut.action) {
              <div class="flex items-center justify-between bg-kitty-bg rounded px-4 py-2 border border-kitty-border">
                <code class="font-mono text-sm text-kitty-accent">{{ shortcut.chord }}</code>
                <span class="text-sm text-kitty-text">{{ shortcut.action }}</span>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-8 bg-kitty-bg/50 rounded-lg border border-kitty-border border-dashed">
            <p class="text-kitty-text-dim text-sm">No custom keyboard shortcuts configured</p>
            <p class="text-kitty-text-dim text-xs mt-1">Import a kitty.conf with <code class="bg-kitty-bg px-1 rounded font-mono">map</code> directives to see them here</p>
          </div>
        }
      </div>
    </app-form-section>
  `,
  styles: []
})
export class KeyboardShortcutsFormComponent {
  private readonly configStore = inject(ConfigStoreService);
  private readonly versionService = inject(KittyVersionService);

  readonly config = computed(() => this.configStore.configState());
  readonly keyboardShortcuts = computed(() => this.config().keyboard_shortcuts);
  readonly kittyMod = computed(() => this.config().kitty_mod);
  readonly advanced = computed(() => this.config().advanced);
  readonly mapTimeoutAvailable = computed(() => this.versionService.isOptionAvailable('map_timeout'));

  updateKittyMod(value: string): void {
    this.configStore.updateSection('keyboard_shortcuts', { kitty_mod: value } as any);
  }

  updateAdvancedField(field: string, value: unknown): void {
    this.configStore.updateSection('advanced', { [field]: value });
  }
}
