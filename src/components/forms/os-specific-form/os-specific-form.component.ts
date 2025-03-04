import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderInputComponent } from '../../shared/slider-input/slider-input.component';
import { NumberInputComponent } from '../../shared/number-input/number-input.component';
import { FormSectionComponent } from '../../shared/form-section/form-section.component';
import { createFormHelper } from '../../../utils/form-helpers';

@Component({
  selector: 'app-os-specific-form',
  imports: [CommonModule, FormsModule, SliderInputComponent, NumberInputComponent, FormSectionComponent],
  template: `
    <app-form-section title="OS Specific" description="Platform-specific settings for macOS and Linux/Wayland">
      <div class="bg-kitty-warning/10 border border-kitty-warning/30 rounded-lg p-4 mb-6">
        <p class="text-kitty-warning text-sm">
          Settings marked
          <span class="inline-flex items-center gap-1 bg-kitty-warning/20 text-kitty-warning px-2 py-0.5 rounded text-xs font-medium">restart required</span>
          will not take effect until Kitty is fully restarted.
        </p>
      </div>

      <div class="space-y-6 bg-kitty-surface rounded-lg p-6 border border-kitty-border">
        <h3 class="text-lg font-semibold text-kitty-accent mb-4">macOS Settings</h3>

        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Option Key as Alt
                <span class="text-kitty-text-dim text-xs ml-2">Remap Option key for terminal escape sequences</span>
              </label>
              <select
                [(ngModel)]="osSpecific().macos_option_as_alt"
                (ngModelChange)="helper.updateField('macos_option_as_alt', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
              >
                <option value="no">No (standard macOS behavior)</option>
                <option value="yes">Yes (both Option keys)</option>
                <option value="both">Both Option keys</option>
                <option value="left">Left Option only</option>
                <option value="right">Right Option only</option>
              </select>
            </div>

            <div class="form-group">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="osSpecific().macos_quit_when_last_window_closed"
                  (ngModelChange)="helper.updateField('macos_quit_when_last_window_closed', $event)"
                  class="w-5 h-5 rounded flex-shrink-0"
                />
                <div>
                  <span class="text-sm font-medium text-kitty-text">Quit When Last Window Closed</span>
                  <p class="text-kitty-text-dim text-xs mt-0.5">Quit the Kitty application when the last OS window is closed</p>
                </div>
              </label>
            </div>
          </div>

          @if (helper.advancedMode()) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">
                  Titlebar Color
                  <span class="text-kitty-text-dim text-xs ml-2">'system' uses macOS default, 'background' uses terminal bg</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="osSpecific().macos_titlebar_color"
                  (ngModelChange)="helper.updateField('macos_titlebar_color', $event)"
                  class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                  placeholder="system or background or #rrggbb"
                />
              </div>

              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">
                  Show Window Title In
                  <span class="text-kitty-text-dim text-xs ml-2">Where to display the window title</span>
                </label>
                <select
                  [(ngModel)]="osSpecific().macos_show_window_title_in"
                  (ngModelChange)="helper.updateField('macos_show_window_title_in', $event)"
                  class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
                >
                  <option value="all">All (titlebar and menubar)</option>
                  <option value="window">Window titlebar only</option>
                  <option value="menubar">Menu bar only</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">
                  Menu Bar Title Max Length
                  <span class="text-kitty-text-dim text-xs ml-2">0 means no limit</span>
                </label>
                <app-number-input
                  [(ngModel)]="osSpecific().macos_menubar_title_max_length"
                  (ngModelChange)="helper.updateField('macos_menubar_title_max_length', $event)"
                  [min]="0"
                />
              </div>

              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">Color Space</label>
                <select
                  [(ngModel)]="osSpecific().macos_colorspace"
                  (ngModelChange)="helper.updateField('macos_colorspace', $event)"
                  class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
                >
                  <option value="srgb">sRGB (recommended)</option>
                  <option value="default">Default (display P3 if available)</option>
                  <option value="displayp3">Display P3</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label class="block text-sm font-medium text-kitty-text mb-2">
                  Font Thickening
                  <span class="text-kitty-accent font-bold ml-2">{{ osSpecific().macos_thicken_font }}</span>
                  <span class="text-kitty-text-dim text-xs ml-1">Draw extra pixel around glyphs (0 = off)</span>
                </label>
                <app-slider-input
                  [value]="osSpecific().macos_thicken_font"
                  (valueChange)="helper.updateField('macos_thicken_font', $event)"
                  [min]="0" [max]="2" [step]="0.05" />
              </div>

              <div class="form-group">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="osSpecific().macos_traditional_fullscreen"
                    (ngModelChange)="helper.updateField('macos_traditional_fullscreen', $event)"
                    class="w-5 h-5 rounded flex-shrink-0"
                  />
                  <div>
                    <span class="text-sm font-medium text-kitty-text">Use Traditional Fullscreen</span>
                    <p class="text-kitty-text-dim text-xs mt-0.5">Use non-native fullscreen that fills the current screen without spaces</p>
                  </div>
                </label>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="form-group">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="osSpecific().macos_window_resizable"
                    (ngModelChange)="helper.updateField('macos_window_resizable', $event)"
                    class="w-5 h-5 rounded flex-shrink-0"
                  />
                  <div>
                    <span class="text-sm font-medium text-kitty-text">Window Resizable</span>
                    <p class="text-kitty-text-dim text-xs mt-0.5">Allow the OS window to be resized by dragging the edges</p>
                  </div>
                </label>
              </div>

              <div class="form-group">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="osSpecific().macos_hide_from_tasks"
                    (ngModelChange)="helper.updateField('macos_hide_from_tasks', $event)"
                    class="w-5 h-5 rounded flex-shrink-0"
                  />
                  <div>
                    <span class="text-sm font-medium text-kitty-text">Hide From Tasks</span>
                    <p class="text-kitty-text-dim text-xs mt-0.5">Do not show the Kitty window in the macOS Dock or app switcher</p>
                  </div>
                </label>
              </div>

              <div class="form-group">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="osSpecific().macos_dock_badge_on_bell"
                    (ngModelChange)="helper.updateField('macos_dock_badge_on_bell', $event)"
                    class="w-5 h-5 rounded flex-shrink-0"
                  />
                  <div>
                    <span class="text-sm font-medium text-kitty-text">Dock Badge on Bell</span>
                    <p class="text-kitty-text-dim text-xs mt-0.5">Show a badge in the Dock when a bell occurs in an unfocused window</p>
                  </div>
                </label>
              </div>

              <div class="form-group">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="osSpecific().macos_custom_beam_cursor"
                    (ngModelChange)="helper.updateField('macos_custom_beam_cursor', $event)"
                    class="w-5 h-5 rounded flex-shrink-0"
                  />
                  <div>
                    <span class="text-sm font-medium text-kitty-text">Custom Beam Cursor</span>
                    <p class="text-kitty-text-dim text-xs mt-0.5">Use a custom macOS beam cursor easier to see on dark backgrounds</p>
                  </div>
                </label>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="space-y-6 bg-kitty-surface rounded-lg p-6 border border-kitty-border">
        <h3 class="text-lg font-semibold text-kitty-accent mb-4">Linux &amp; Wayland Settings</h3>

        <div class="space-y-6">
          <div class="form-group">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="osSpecific().wayland_enable_ime"
                (ngModelChange)="helper.updateField('wayland_enable_ime', $event)"
                class="w-5 h-5 rounded flex-shrink-0"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-kitty-text">Enable IME on Wayland</span>
                  <span class="inline-flex items-center gap-1 bg-kitty-warning/20 text-kitty-warning px-2 py-0.5 rounded text-xs font-medium">restart required</span>
                </div>
                <p class="text-kitty-text-dim text-xs mt-0.5">Toggles the Input Method Extension (IME) on Wayland. Disable to reduce input latency if you don't use CJK input methods.</p>
              </div>
            </label>
          </div>

          <div class="form-group">
            <label class="block text-sm font-medium text-kitty-text mb-2">
              Linux Display Server
              <span class="text-kitty-text-dim text-xs ml-2">'auto', 'x11', or 'wayland'</span>
            </label>
            <select
              [(ngModel)]="osSpecific().linux_display_server"
              (ngModelChange)="helper.updateField('linux_display_server', $event)"
              class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
            >
              <option value="auto">Auto-detect</option>
              <option value="x11">X11</option>
              <option value="wayland">Wayland</option>
            </select>
          </div>

          @if (helper.advancedMode()) {
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Wayland Titlebar Color
                <span class="text-kitty-text-dim text-xs ml-2">'system' or a hex color</span>
              </label>
              <input
                type="text"
                [(ngModel)]="osSpecific().wayland_titlebar_color"
                (ngModelChange)="helper.updateField('wayland_titlebar_color', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder="system"
              />
            </div>
          }
        </div>
      </div>
    </app-form-section>
  `,
  styles: []
})
export class OsSpecificFormComponent {
  readonly helper = createFormHelper('os_specific');
  readonly osSpecific = this.helper.state.asReadonly();
}
