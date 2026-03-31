import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KittyMouseConfig } from '../../../models/kitty-types';
import { NumberInputComponent } from '../../shared/number-input/number-input.component';
import { ColorInputComponent } from '../../shared/color-input/color-input.component';
import { VersionBadgeComponent } from '../../shared/version-badge/version-badge.component';
import { FormSectionComponent } from '../../shared/form-section/form-section.component';
import { createFormHelper } from '../../../utils/form-helpers';
import { KittyVersionService } from '../../../services/kitty-version.service';

@Component({
  selector: 'app-mouse-form',
  imports: [CommonModule, FormsModule, NumberInputComponent, ColorInputComponent, VersionBadgeComponent, FormSectionComponent],
  template: `
    <app-form-section title="Mouse" description="Configure mouse interactions, URL detection, and clipboard behavior">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label class="block text-sm font-medium text-kitty-text mb-2">
              Mouse Hide Wait
              <span class="text-kitty-text-dim text-xs ml-2">Seconds idle before cursor hides (0 = never, -1 = hide on keypress)</span>
            </label>
            <app-number-input
              [(ngModel)]="mouse().mouse_hide_wait"
              (ngModelChange)="helper.updateField('mouse_hide_wait', $event)"
              [min]="-1"
              [step]="0.5"
            />
          </div>

          <div class="form-group">
            <label class="block text-sm font-medium text-kitty-text mb-2">
              Copy on Select
              <span class="text-kitty-text-dim text-xs ml-2">Auto-copy selected text to clipboard</span>
            </label>
            <select
              [(ngModel)]="mouse().copy_on_select"
              (ngModelChange)="helper.updateField('copy_on_select', $event)"
              class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
            >
              <option value="no">Disabled</option>
              <option value="yes">Yes (primary selection)</option>
              <option value="clipboard">Clipboard (recommended for macOS)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="mouse().detect_urls"
                (ngModelChange)="helper.updateField('detect_urls', $event)"
                class="w-5 h-5 rounded flex-shrink-0"
              />
              <div>
                <span class="text-sm font-medium text-kitty-text">Detect URLs</span>
                <p class="text-kitty-text-dim text-xs mt-0.5">Detect and underline URLs, allowing Ctrl+click to open them</p>
              </div>
            </label>
          </div>

          <div class="form-group">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="mouse().focus_follows_mouse"
                (ngModelChange)="helper.updateField('focus_follows_mouse', $event)"
                class="w-5 h-5 rounded flex-shrink-0"
              />
              <div>
                <span class="text-sm font-medium text-kitty-text">Focus Follows Mouse</span>
                <p class="text-kitty-text-dim text-xs mt-0.5">Focus the window or pane the mouse cursor is hovering over</p>
              </div>
            </label>
          </div>
        </div>

      @if (helper.advancedMode()) {
        <div class="bg-kitty-surface rounded-lg p-6 border border-kitty-border">
          <h3 class="text-lg font-semibold text-kitty-text mb-1">URL Styling</h3>
          <p class="text-kitty-text-dim text-sm mb-4">Appearance of detected URLs in the terminal</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">URL Color</label>
              <app-color-input 
                [value]="mouse().url_color || '#0087bd'" 
                (valueChange)="updateColorMouse('url_color', $event)" />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">URL Style</label>
              <select
                [(ngModel)]="mouse().url_style"
                (ngModelChange)="helper.updateField('url_style', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
              >
                <option value="none">None</option>
                <option value="straight">Straight underline</option>
                <option value="double">Double underline</option>
                <option value="curly">Curly underline</option>
                <option value="dotted">Dotted underline</option>
                <option value="dashed">Dashed underline</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Open URL With
                <span class="text-kitty-text-dim text-xs ml-2">'default' uses your OS default browser</span>
              </label>
              <input
                type="text"
                [(ngModel)]="mouse().open_url_with"
                (ngModelChange)="helper.updateField('open_url_with', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder="default"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                URL Prefixes
                <span class="text-kitty-text-dim text-xs ml-2">Comma-separated list of URL schemes to detect</span>
              </label>
              <input
                type="text"
                [ngModel]="mouse().url_prefixes.join(',')"
                (ngModelChange)="setUrlPrefixes($event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder="http,https,file,ftp"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="form-group">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="mouse().show_hyperlink_targets"
                  (ngModelChange)="helper.updateField('show_hyperlink_targets', $event)"
                  class="w-5 h-5 rounded flex-shrink-0"
                />
                <div>
                  <span class="text-sm font-medium text-kitty-text">Show Hyperlink Targets</span>
                  <p class="text-kitty-text-dim text-xs mt-0.5">Show the target of OSC 8 hyperlinks in the status bar</p>
                </div>
              </label>
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Underline Hyperlinks
                <span class="text-kitty-text-dim text-xs ml-2">When to underline OSC 8 hyperlinks</span>
              </label>
              <select
                [(ngModel)]="mouse().underline_hyperlinks"
                (ngModelChange)="helper.updateField('underline_hyperlinks', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
              >
                <option value="always">Always</option>
                <option value="hover">On hover</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        </div>

        <div class="bg-kitty-surface rounded-lg p-6 border border-kitty-border">
          <h3 class="text-lg font-semibold text-kitty-text mb-1">Mouse Behavior</h3>
          <p class="text-kitty-text-dim text-sm mb-4">Advanced mouse and pointer settings</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Paste Actions
                <span class="text-kitty-text-dim text-xs ml-2">Actions on paste, comma-separated</span>
              </label>
              <input
                type="text"
                [ngModel]="mouse().paste_actions.join(',')"
                (ngModelChange)="setPasteActions($event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder="quote-urls-at-prompt,confirm"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Click Interval
                <span class="text-kitty-text-dim text-xs ml-2">Max time between clicks for double/triple click (seconds)</span>
              </label>
              <app-number-input
                [(ngModel)]="mouse().click_interval"
                (ngModelChange)="helper.updateField('click_interval', $event)"
                [min]="0.1"
                [max]="1"
                [step]="0.05"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Select by Word Characters (Forward)
                <span class="text-kitty-text-dim text-xs ml-2">Additional characters for word selection when moving forward</span>
              </label>
              <input
                type="text"
                [(ngModel)]="mouse().select_by_word_characters_forward"
                (ngModelChange)="helper.updateField('select_by_word_characters_forward', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder=""
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">Pointer Shape When Grabbed</label>
              <select
                [(ngModel)]="mouse().pointer_shape_when_grabbed"
                (ngModelChange)="helper.updateField('pointer_shape_when_grabbed', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
              >
                <option value="arrow">arrow</option>
                <option value="beam">beam</option>
                <option value="hand">hand</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">Default Pointer Shape</label>
              <select
                [(ngModel)]="mouse().default_pointer_shape"
                (ngModelChange)="helper.updateField('default_pointer_shape', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
              >
                <option value="arrow">arrow</option>
                <option value="beam">beam</option>
                <option value="hand">hand</option>
              </select>
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">Pointer Shape When Dragging</label>
              <select
                [(ngModel)]="mouse().pointer_shape_when_dragging"
                (ngModelChange)="helper.updateField('pointer_shape_when_dragging', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
              >
                <option value="arrow">arrow</option>
                <option value="beam">beam</option>
                <option value="hand">hand</option>
              </select>
            </div>
          </div>
        </div>

        <div class="bg-kitty-surface rounded-lg p-6 border border-kitty-border">
          <h3 class="text-lg font-semibold text-kitty-text mb-1">Selection Behavior</h3>
          <p class="text-kitty-text-dim text-sm mb-4">How text selection and word boundaries work</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Strip Trailing Spaces
                <span class="text-kitty-text-dim text-xs ml-2">Remove trailing whitespace when copying</span>
              </label>
              <select
                  [(ngModel)]="mouse().strip_trailing_spaces"
                  (ngModelChange)="helper.updateField('strip_trailing_spaces', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
              >
                <option value="never">Never</option>
                <option value="smart">Smart (only when whitespace-only lines)</option>
                <option value="always">Always</option>
              </select>
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Select by Word Characters
                <span class="text-kitty-text-dim text-xs ml-2">Characters treated as part of a word on double-click</span>
              </label>
              <input
                type="text"
                [(ngModel)]="mouse().select_by_word_characters"
                (ngModelChange)="helper.updateField('select_by_word_characters', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder="@-./_~?&=%+#"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                URL Excluded Characters
                <span class="text-kitty-text-dim text-xs ml-2">Characters to exclude from URL detection</span>
              </label>
              <input
                type="text"
                [(ngModel)]="mouse().url_excluded_characters"
                (ngModelChange)="helper.updateField('url_excluded_characters', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder=""
              />
            </div>

            <div class="form-group" [class.opacity-60]="!clearSelectionOnClipboardLossAvailable()">
              <div class="flex items-center gap-2 mb-2">
                <label class="flex items-center gap-3 cursor-pointer h-full">
                  <input
                    type="checkbox"
                    [(ngModel)]="mouse().clear_selection_on_clipboard_loss"
                    (ngModelChange)="helper.updateField('clear_selection_on_clipboard_loss', $event)"
                    [disabled]="!clearSelectionOnClipboardLossAvailable()"
                    class="w-5 h-5 rounded flex-shrink-0 disabled:opacity-50"
                  />
                  <div>
                    <span class="text-sm font-medium text-kitty-text">Clear Selection on Clipboard Loss</span>
                    <p class="text-kitty-text-dim text-xs mt-0.5">Clear visual selection when clipboard changes (Linux primary selection)</p>
                  </div>
                </label>
                @if (!clearSelectionOnClipboardLossAvailable()) {
                  <app-version-badge version="0.40.1" />
                }
              </div>
            </div>
          </div>
        </div>
      }
    </app-form-section>
  `,
  styles: []
})
export class MouseFormComponent {
  private readonly versionService = inject(KittyVersionService);
  readonly helper = createFormHelper('mouse');
  readonly mouse = this.helper.state.asReadonly();
  readonly clearSelectionOnClipboardLossAvailable = computed(() => this.versionService.isOptionAvailable('clear_selection_on_clipboard_loss'));

  setUrlPrefixes(value: string): void {
    const prefixes = value.split(',').map(s => s.trim()).filter(Boolean);
    this.helper.updateField('url_prefixes', prefixes);
  }

  setPasteActions(value: string): void {
    const actions = value.split(',').map(s => s.trim()).filter(Boolean);
    this.helper.updateField('paste_actions', actions);
  }

  updateColorMouse(key: keyof KittyMouseConfig, value: string): void {
    this.helper.updateField(key, value);
  }
}
