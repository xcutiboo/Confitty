import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NumberInputComponent } from '../../shared/number-input/number-input.component';
import { ColorInputComponent } from '../../shared/color-input/color-input.component';
import { VersionBadgeComponent } from '../../shared/version-badge/version-badge.component';
import { FormSectionComponent } from '../../shared/form-section/form-section.component';
import { createFormHelper } from '../../../utils/form-helpers';
import { KittyVersionService } from '../../../services/kitty-version.service';

@Component({
  selector: 'app-bell-form',
  imports: [CommonModule, FormsModule, NumberInputComponent, ColorInputComponent, VersionBadgeComponent, FormSectionComponent],
  template: `
    <app-form-section title="Bell" description="Configure audio alerts, visual flash, and system bell behavior">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-group">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              [(ngModel)]="bell().enable_audio_bell"
              (ngModelChange)="helper.updateField('enable_audio_bell', $event)"
              class="w-5 h-5 rounded flex-shrink-0"
            />
            <div>
              <span class="text-sm font-medium text-kitty-text">Enable Audio Bell</span>
              <p class="text-kitty-text-dim text-xs mt-0.5">Play a sound when the terminal bell is triggered</p>
            </div>
          </label>
        </div>

        <div class="form-group">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              [(ngModel)]="bell().window_alert_on_bell"
              (ngModelChange)="helper.updateField('window_alert_on_bell', $event)"
              class="w-5 h-5 rounded flex-shrink-0"
            />
            <div>
              <span class="text-sm font-medium text-kitty-text">Window Alert on Bell</span>
              <p class="text-kitty-text-dim text-xs mt-0.5">Flash or highlight the window in the taskbar when a bell fires</p>
            </div>
          </label>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-group">
          <label class="block text-sm font-medium text-kitty-text mb-2">
            Visual Bell Duration
            <span class="text-kitty-accent font-bold ml-2">{{ bell().visual_bell_duration }}s</span>
            <span class="text-kitty-text-dim text-xs ml-1">(0 = disabled)</span>
          </label>
          <app-number-input
            [(ngModel)]="bell().visual_bell_duration"
            (ngModelChange)="helper.updateField('visual_bell_duration', $event)"
            [min]="0"
            [step]="0.05"
          />
        </div>

        <div class="form-group">
          <label class="block text-sm font-medium text-kitty-text mb-2">
            Bell on Tab Indicator
            <span class="text-kitty-text-dim text-xs ml-2">Symbol shown in tab title when a bell fires in a background tab</span>
          </label>
          <input
            type="text"
            [(ngModel)]="bell().bell_on_tab"
            (ngModelChange)="helper.updateField('bell_on_tab', $event)"
            class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono"
            placeholder=" "
          />
        </div>
      </div>

      @if (helper.advancedMode()) {
        <div class="mt-6 pt-6 border-t border-kitty-border">
          <h3 class="text-lg font-semibold text-kitty-text mb-1">Bell Commands & Sounds</h3>
          <p class="text-kitty-text-dim text-sm mb-4">Execute a program or play a custom sound file when the bell fires</p>

          <div class="space-y-4">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Visual Bell Color
                <span class="text-kitty-text-dim text-xs ml-2">'none' uses current background</span>
              </label>
              <div class="flex gap-2 items-center">
                <app-color-input 
                  [value]="visualBellColorForPicker()" 
                  (valueChange)="helper.updateField('visual_bell_color', $event)" />
              </div>
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Command on Bell
                <span class="text-kitty-text-dim text-xs ml-2">'none' to disable. The <code class="bg-kitty-bg px-1 rounded font-mono">KITTY_CHILD_CMDLINE</code> env var is available.</span>
              </label>
              <input
                type="text"
                [(ngModel)]="bell().command_on_bell"
                (ngModelChange)="helper.updateField('command_on_bell', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder="none"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Bell Sound File
                <span class="text-kitty-text-dim text-xs ml-2">Path to a WAV/OGA/AIFF file. 'none' uses system bell.</span>
              </label>
              <input
                type="text"
                [(ngModel)]="bell().bell_path"
                (ngModelChange)="helper.updateField('bell_path', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder="none or /path/to/bell.wav"
              />
            </div>

            <div class="form-group" [class.opacity-60]="!linuxBellThemeAvailable()">
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-kitty-text">
                  Linux Bell Theme
                  <span class="text-kitty-text-dim text-xs ml-2">XDG sound theme for the bell sound on Linux</span>
                </label>
                @if (!linuxBellThemeAvailable()) {
                  <app-version-badge version="0.28.0" />
                }
              </div>
              <input
                type="text"
                [(ngModel)]="bell().linux_bell_theme"
                (ngModelChange)="helper.updateField('linux_bell_theme', $event)"
                [disabled]="!linuxBellThemeAvailable()"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm disabled:opacity-50"
                placeholder="__custom or freedesktop"
              />
            </div>
          </div>
        </div>
      }
    </app-form-section>
  `,
  styles: []
})
export class BellFormComponent {
  private readonly versionService = inject(KittyVersionService);

  readonly helper = createFormHelper('bell');
  readonly bell = this.helper.state.asReadonly();
  readonly linuxBellThemeAvailable = computed(() => this.versionService.isOptionAvailable('linux_bell_theme'));

  visualBellColorForPicker(): string {
    return this.bell().visual_bell_color?.startsWith('#') ? this.bell().visual_bell_color : '#ff0000';
  }
}
