import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigStoreService } from '../../services/config-store.service';
import { PresetSelectorComponent } from '../preset-selector/preset-selector.component';
import { FontsFormComponent } from '../forms/fonts-form/fonts-form.component';
import { CursorFormComponent } from '../forms/cursor-form/cursor-form.component';
import { ScrollbackFormComponent } from '../forms/scrollback-form/scrollback-form.component';
import { MouseFormComponent } from '../forms/mouse-form/mouse-form.component';
import { PerformanceFormComponent } from '../forms/performance-form/performance-form.component';
import { BellFormComponent } from '../forms/bell-form/bell-form.component';
import { WindowLayoutFormComponent } from '../forms/window-layout-form/window-layout-form.component';
import { TabBarFormComponent } from '../forms/tab-bar-form/tab-bar-form.component';
import { ColorsFormComponent } from '../forms/colors-form/colors-form.component';
import { AdvancedFormComponent } from '../forms/advanced-form/advanced-form.component';
import { OsSpecificFormComponent } from '../forms/os-specific-form/os-specific-form.component';
import { KeyboardShortcutsFormComponent } from '../forms/keyboard-shortcuts-form/keyboard-shortcuts-form.component';

@Component({
  selector: 'app-config-editor',
  imports: [
    CommonModule,
    PresetSelectorComponent,
    FontsFormComponent,
    CursorFormComponent,
    ScrollbackFormComponent,
    MouseFormComponent,
    PerformanceFormComponent,
    BellFormComponent,
    WindowLayoutFormComponent,
    TabBarFormComponent,
    ColorsFormComponent,
    AdvancedFormComponent,
    OsSpecificFormComponent,
    KeyboardShortcutsFormComponent
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 bg-kitty-darker min-h-full">
      <div class="max-w-5xl mx-auto space-y-6 lg:space-y-8">

        <div class="bg-kitty-surface rounded-xl border border-kitty-border overflow-hidden mb-4">
          <button
            (click)="presetsExpanded.set(!presetsExpanded())"
            class="w-full px-4 sm:px-7 py-4 sm:py-5 flex items-center justify-between hover:bg-kitty-surface-light transition-colors group"
          >
            <div class="flex items-center gap-4">
              <div class="w-9 h-9 rounded-lg bg-kitty-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-kitty-primary/15 transition-colors">
                <svg class="w-4 h-4 text-kitty-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div class="text-left">
                <h3 class="text-sm font-semibold text-kitty-text group-hover:text-kitty-primary transition-colors leading-tight">
                  Quick Start Presets
                </h3>
                <p class="text-xs text-kitty-text-dim mt-0.5 leading-snug">
                  Apply professionally crafted configurations instantly
                </p>
              </div>
            </div>
            <svg
              class="w-4 h-4 text-kitty-text-dim group-hover:text-kitty-primary transition-all duration-200 flex-shrink-0"
              [class.rotate-180]="presetsExpanded()"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          @if (presetsExpanded()) {
            <div class="border-t border-kitty-border">
              <app-preset-selector (presetApplied)="presetsExpanded.set(false)" />
            </div>
          }
        </div>

        @switch (configStore.activeCategory()) {
          @case ('fonts') {
            <app-fonts-form />
          }
          @case ('cursor') {
            <app-cursor-form />
          }
          @case ('scrollback') {
            <app-scrollback-form />
          }
          @case ('mouse') {
            <app-mouse-form />
          }
          @case ('performance') {
            <app-performance-form />
          }
          @case ('bell') {
            <app-bell-form />
          }
          @case ('window_layout') {
            <app-window-layout-form />
          }
          @case ('tab_bar') {
            <app-tab-bar-form />
          }
          @case ('colors') {
            <app-colors-form />
          }
          @case ('advanced') {
            <app-advanced-form />
          }
          @case ('os_specific') {
            <app-os-specific-form />
          }
          @case ('keyboard_shortcuts') {
            <app-keyboard-shortcuts-form />
          }
        }

      </div>
    </div>
  `,
  styles: []
})
export class ConfigEditorComponent {
  readonly presetsExpanded = signal(true);

  constructor(public readonly configStore: ConfigStoreService) {}
}
