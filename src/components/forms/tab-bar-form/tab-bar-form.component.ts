import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KittyTabBarEdge } from '../../../models/kitty-types';
import { NumberInputComponent } from '../../shared/number-input/number-input.component';
import { VersionBadgeComponent } from '../../shared/version-badge/version-badge.component';
import { FormSectionComponent } from '../../shared/form-section/form-section.component';
import { createFormHelper } from '../../../utils/form-helpers';
import { KittyVersionService } from '../../../services/kitty-version.service';

@Component({
  selector: 'app-tab-bar-form',
  imports: [CommonModule, FormsModule, NumberInputComponent, VersionBadgeComponent, FormSectionComponent],
  template: `
    <app-form-section title="Tab Bar" description="Customize tab bar appearance, behavior, and color scheme">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label class="block text-sm font-medium text-kitty-text mb-2">Tab Bar Position</label>
            <div class="grid grid-cols-2 gap-2">
              @for (edge of tabBarEdges; track edge) {
                <button
                  type="button"
                  (click)="helper.updateField('tab_bar_edge', edge)"
                  [class.bg-kitty-primary]="tabBar().tab_bar_edge === edge"
                  [class.text-kitty-dark]="tabBar().tab_bar_edge === edge"
                  [class.bg-kitty-surface-light]="tabBar().tab_bar_edge !== edge"
                  [class.text-kitty-text]="tabBar().tab_bar_edge !== edge"
                  class="px-4 py-2 rounded-lg text-sm capitalize hover:bg-kitty-primary hover:text-kitty-dark transition-colors border border-kitty-border"
                >
                  {{ edge }}
                </button>
              }
            </div>
          </div>

          <div class="form-group">
            <label class="block text-sm font-medium text-kitty-text mb-2">
              Tab Bar Style
              @if (!powerlineStyleAvailable() && tabBar().tab_bar_style === 'powerline') {
                <app-version-badge version="0.46.0" />
              }
            </label>
            <select
              [(ngModel)]="tabBar().tab_bar_style"
              (ngModelChange)="helper.updateField('tab_bar_style', $event)"
              class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
            >
              <option value="fade">Fade</option>
              <option value="slant">Slant</option>
              <option value="separator">Separator</option>
              <option value="powerline">Powerline</option>
              <option value="custom">Custom</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        @if (helper.advancedMode()) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">Alignment</label>
              <select
                [(ngModel)]="tabBar().tab_bar_align"
                (ngModelChange)="helper.updateField('tab_bar_align', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Min Tabs to Show
                <span class="text-kitty-text-dim text-xs ml-2">Hide bar if fewer tabs are open</span>
              </label>
              <app-number-input
                [(ngModel)]="tabBar().tab_bar_min_tabs"
                (ngModelChange)="helper.updateField('tab_bar_min_tabs', $event)"
                [min]="1"
                [max]="20"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Focus Strategy
                <span class="text-kitty-text-dim text-xs ml-2">Which tab to focus when current tab closes</span>
              </label>
              <select
                [(ngModel)]="tabBar().tab_switch_strategy"
                (ngModelChange)="helper.updateField('tab_switch_strategy', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
              >
                <option value="previous">Previously active tab</option>
                <option value="left">Tab to the left</option>
                <option value="right">Tab to the right</option>
                <option value="last">Last tab</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Separator String
                <span class="text-kitty-text-dim text-xs ml-2">Only used with 'separator' style</span>
              </label>
              <input
                type="text"
                [(ngModel)]="tabBar().tab_separator"
                (ngModelChange)="helper.updateField('tab_separator', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono"
                placeholder=" ┇"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Powerline Style
                <span class="text-kitty-text-dim text-xs ml-2">Arrow shape for 'powerline' style</span>
              </label>
              <select
                [(ngModel)]="tabBar().tab_powerline_style"
                (ngModelChange)="helper.updateField('tab_powerline_style', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
              >
                <option value="angled">Angled</option>
                <option value="slanted">Slanted</option>
                <option value="round">Round</option>
              </select>
            </div>
          </div>

          @if (tabBar().tab_bar_style === 'powerline') {
            <div class="bg-kitty-bg/60 border border-kitty-primary/20 rounded-lg p-4 space-y-3">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-kitty-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-sm text-kitty-text leading-relaxed">
                  <strong class="text-kitty-primary">Powerline Setup:</strong> For best results, use <code class="bg-kitty-bg px-1.5 py-0.5 rounded font-mono text-xs">symbol_map</code> in the Fonts section to map Powerline symbols (U+E0A0-U+E0A3, U+E0C0-U+E0C7) to a Nerd Font. This avoids needing patched fonts.
                </div>
              </div>
              <div class="text-xs text-kitty-text-dim space-y-1.5">
                <div><strong class="text-kitty-text">Example symbol_map:</strong> <code class="bg-kitty-surface px-1.5 py-0.5 rounded font-mono">U+E0A0-U+E0A3,U+E0C0-U+E0C7 Symbols Nerd Font</code></div>
                <div><strong class="text-kitty-text">Color formatting:</strong> Use <code class="bg-kitty-surface px-1.5 py-0.5 rounded font-mono">&#123;fmt.fg._fff&#125;</code> in title templates for custom colors</div>
                <div><strong class="text-kitty-text">Works great with:</strong> powerlevel10k, starship, zsh themes</div>
              </div>
            </div>
          }

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Tab Title Template
                <span class="text-kitty-text-dim text-xs ml-2">Variables: &#123;title&#125;, &#123;index&#125;, &#123;num_windows&#125;</span>
              </label>
              <input
                type="text"
                [(ngModel)]="tabBar().tab_title_template"
                (ngModelChange)="helper.updateField('tab_title_template', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder="{title}"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Active Tab Title Template
                <span class="text-kitty-text-dim text-xs ml-2">Override for active tab. 'none' uses tab_title_template</span>
              </label>
              <input
                type="text"
                [(ngModel)]="tabBar().active_tab_title_template"
                (ngModelChange)="helper.updateField('active_tab_title_template', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder="none or {fmt.fg._fff}{title}"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Activity Symbol
                <span class="text-kitty-text-dim text-xs ml-2">Shown in tab title when activity occurs. 'none' to disable.</span>
              </label>
              <input
                type="text"
                [(ngModel)]="tabBar().tab_activity_symbol"
                (ngModelChange)="helper.updateField('tab_activity_symbol', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono"
                placeholder="none or ✦"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Tab Bar Hide Path
                <span class="text-kitty-text-dim text-xs ml-2">Regex to hide tab bar when CWD matches (e.g., /private/)</span>
              </label>
              <input
                type="text"
                [(ngModel)]="tabBar().tab_bar_hide_path"
                (ngModelChange)="helper.updateField('tab_bar_hide_path', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder="none or regex pattern"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Tab Title Max Length
                <span class="text-kitty-text-dim text-xs ml-2">Maximum characters in tab title (0 = unlimited)</span>
              </label>
              <app-number-input
                [(ngModel)]="tabBar().tab_title_max_length"
                (ngModelChange)="helper.updateField('tab_title_max_length', $event)"
                [min]="0"
                [max]="100"
                [step]="1"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Tab Bar Margin Width
                <span class="text-kitty-text-dim text-xs ml-2">Left/right margin spacing</span>
              </label>
              <app-number-input
                [(ngModel)]="tabBar().tab_bar_margin_width"
                (ngModelChange)="helper.updateField('tab_bar_margin_width', $event)"
                [min]="0"
                [max]="20"
                [step]="0.5"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Margin Height (Top)
                <span class="text-kitty-text-dim text-xs ml-2">Space above tab bar</span>
              </label>
              <app-number-input
                [(ngModel)]="tabBarMarginHeightTop"
                (ngModelChange)="setMarginHeight()"
                [min]="0"
                [max]="10"
                [step]="0.5"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Margin Height (Bottom)
                <span class="text-kitty-text-dim text-xs ml-2">Space below tab bar</span>
              </label>
              <app-number-input
                [(ngModel)]="tabBarMarginHeightBottom"
                (ngModelChange)="setMarginHeight()"
                [min]="0"
                [max]="10"
                [step]="0.5"
              />
            </div>

            <div class="form-group" [class.opacity-60]="!tabBarDragThresholdAvailable()">
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-kitty-text">
                  Drag Threshold
                  <span class="text-kitty-text-dim text-xs ml-2">Pixels of drag to trigger tab reorder (0 = disabled)</span>
                </label>
                @if (!tabBarDragThresholdAvailable()) {
                  <app-version-badge version="0.46.0" />
                }
              </div>
              <app-number-input
                [(ngModel)]="tabBar().tab_bar_drag_threshold"
                (ngModelChange)="helper.updateField('tab_bar_drag_threshold', $event)"
                [min]="0"
                [step]="1"
                [disabled]="!tabBarDragThresholdAvailable()"
              />
            </div>
          </div>
        }

      <div class="bg-kitty-surface rounded-lg p-6 border border-kitty-border">
        <h3 class="text-lg font-semibold text-kitty-text mb-4">Tab Colors</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-kitty-accent">Active Tab</h4>

            <div class="form-group">
              <label class="block text-xs font-medium text-kitty-text-dim mb-1.5">Foreground</label>
              <div class="flex gap-2">
                <input type="color" [(ngModel)]="tabBar().active_tab_foreground" (ngModelChange)="helper.updateField('active_tab_foreground', $event)"
                  class="w-12 h-9 rounded cursor-pointer bg-kitty-bg border border-kitty-border flex-shrink-0" />
                <input type="text" [(ngModel)]="tabBar().active_tab_foreground" (ngModelChange)="helper.updateField('active_tab_foreground', $event)"
                  class="flex-1 px-3 py-1.5 text-sm bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono" />
              </div>
            </div>

            <div class="form-group">
              <label class="block text-xs font-medium text-kitty-text-dim mb-1.5">Background</label>
              <div class="flex gap-2">
                <input type="color" [(ngModel)]="tabBar().active_tab_background" (ngModelChange)="helper.updateField('active_tab_background', $event)"
                  class="w-12 h-9 rounded cursor-pointer bg-kitty-bg border border-kitty-border flex-shrink-0" />
                <input type="text" [(ngModel)]="tabBar().active_tab_background" (ngModelChange)="helper.updateField('active_tab_background', $event)"
                  class="flex-1 px-3 py-1.5 text-sm bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono" />
              </div>
            </div>

            @if (helper.advancedMode()) {
              <div class="form-group">
                <label class="block text-xs font-medium text-kitty-text-dim mb-1.5">Font Style</label>
                <select [(ngModel)]="tabBar().active_tab_font_style" (ngModelChange)="helper.updateField('active_tab_font_style', $event)"
                  class="w-full px-3 py-1.5 text-sm bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary">
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="italic">Italic</option>
                  <option value="bold-italic">Bold Italic</option>
                </select>
              </div>
            }
          </div>

          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-kitty-text-dim">Inactive Tab</h4>

            <div class="form-group">
              <label class="block text-xs font-medium text-kitty-text-dim mb-1.5">Foreground</label>
              <div class="flex gap-2">
                <input type="color" [(ngModel)]="tabBar().inactive_tab_foreground" (ngModelChange)="helper.updateField('inactive_tab_foreground', $event)"
                  class="w-12 h-9 rounded cursor-pointer bg-kitty-bg border border-kitty-border flex-shrink-0" />
                <input type="text" [(ngModel)]="tabBar().inactive_tab_foreground" (ngModelChange)="helper.updateField('inactive_tab_foreground', $event)"
                  class="flex-1 px-3 py-1.5 text-sm bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono" />
              </div>
            </div>

            <div class="form-group">
              <label class="block text-xs font-medium text-kitty-text-dim mb-1.5">Background</label>
              <div class="flex gap-2">
                <input type="color" [(ngModel)]="tabBar().inactive_tab_background" (ngModelChange)="helper.updateField('inactive_tab_background', $event)"
                  class="w-12 h-9 rounded cursor-pointer bg-kitty-bg border border-kitty-border flex-shrink-0" />
                <input type="text" [(ngModel)]="tabBar().inactive_tab_background" (ngModelChange)="helper.updateField('inactive_tab_background', $event)"
                  class="flex-1 px-3 py-1.5 text-sm bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono" />
              </div>
            </div>

            @if (helper.advancedMode()) {
              <div class="form-group">
                <label class="block text-xs font-medium text-kitty-text-dim mb-1.5">Font Style</label>
                <select [(ngModel)]="tabBar().inactive_tab_font_style" (ngModelChange)="helper.updateField('inactive_tab_font_style', $event)"
                  class="w-full px-3 py-1.5 text-sm bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary">
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="italic">Italic</option>
                  <option value="bold-italic">Bold Italic</option>
                </select>
              </div>
            }
          </div>
        </div>

        @if (helper.advancedMode()) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Tab Bar Background
                <span class="text-kitty-text-dim text-xs ml-2">'none' inherits from terminal background</span>
              </label>
              <div class="flex gap-2">
                <input type="color" [(ngModel)]="tabBar().tab_bar_background" (ngModelChange)="helper.updateField('tab_bar_background', $event)"
                  class="w-12 h-10 rounded cursor-pointer bg-kitty-bg border border-kitty-border flex-shrink-0" />
                <input type="text" [(ngModel)]="tabBar().tab_bar_background" (ngModelChange)="helper.updateField('tab_bar_background', $event)"
                  class="flex-1 px-3 py-2 text-sm bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono" placeholder="none" />
              </div>
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Tab Bar Margin Color
                <span class="text-kitty-text-dim text-xs ml-2">Color of the margin areas around the tab bar</span>
              </label>
              <div class="flex gap-2">
                <input type="color" [(ngModel)]="tabBar().tab_bar_margin_color" (ngModelChange)="helper.updateField('tab_bar_margin_color', $event)"
                  class="w-12 h-10 rounded cursor-pointer bg-kitty-bg border border-kitty-border flex-shrink-0" />
                <input type="text" [(ngModel)]="tabBar().tab_bar_margin_color" (ngModelChange)="helper.updateField('tab_bar_margin_color', $event)"
                  class="flex-1 px-3 py-2 text-sm bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono" placeholder="none" />
              </div>
            </div>
          </div>
        }
      </div>
    </app-form-section>
  `,
  styles: []
})
export class TabBarFormComponent {
  private readonly versionService = inject(KittyVersionService);

  readonly helper = createFormHelper('tab_bar');
  readonly tabBar = this.helper.state.asReadonly();
  readonly powerlineStyleAvailable = computed(() => this.versionService.isOptionAvailable('tab_bar_style_powerline'));
  readonly tabBarDragThresholdAvailable = computed(() => this.versionService.isOptionAvailable('tab_bar_drag_threshold'));
  
  readonly tabBarEdges: KittyTabBarEdge[] = ['top', 'bottom'];

  get tabBarMarginHeightTop(): number {
    return this.tabBar().tab_bar_margin_height?.[0] || 0;
  }

  get tabBarMarginHeightBottom(): number {
    return this.tabBar().tab_bar_margin_height?.[1] || 0;
  }

  setMarginHeight(): void {
    this.helper.updateField('tab_bar_margin_height', [this.tabBarMarginHeightTop, this.tabBarMarginHeightBottom]);
  }
}
