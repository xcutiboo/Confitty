import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';
import type { SearchResult } from '../../search/search.types';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <div class="relative">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kitty-text-dim pointer-events-none transition-colors"
          [class.text-kitty-primary]="isFocused()"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          #inputEl
          type="text"
          [(ngModel)]="inputValue"
          (ngModelChange)="onInput($event)"
          (focus)="isFocused.set(true)"
          (blur)="onBlur()"
          (keydown)="onKeydown($event)"
          placeholder="Search settings..."
          autocomplete="off"
          spellcheck="false"
          class="w-full sm:w-72 pl-9 pr-8 py-2.5 sm:py-2 bg-kitty-bg border border-kitty-border rounded-lg text-base sm:text-sm text-kitty-text
                 focus:outline-none focus:ring-2 focus:ring-kitty-primary/50 focus:border-kitty-primary/60
                 placeholder:text-kitty-text-dim transition-all duration-200"
        />

        @if (inputValue) {
          <button
            (click)="clearInput()"
            (mousedown)="$event.preventDefault()"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center
                   rounded text-kitty-text-dim hover:text-kitty-text hover:bg-kitty-surface-light transition-all duration-150"
            title="Clear search"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        }
      </div>

      @if (isOpen()) {
        <div
          class="absolute top-full left-0 right-0 sm:left-auto sm:right-auto sm:w-72 mt-2 bg-kitty-surface border border-kitty-border
                 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up will-change-transform"
          style="max-height: 60vh; overflow-y: auto;"
        >
          @for (result of searchService.results(); track result.item.key; let i = $index) {
            <button
              (mousedown)="onSelect(result)"
              class="w-full px-4 py-3 text-left transition-colors border-b border-kitty-border/40
                     last:border-b-0 group focus:outline-none"
              [class.bg-kitty-surface-light]="i === activeIndex()"
              [class.hover:bg-kitty-surface-light]="i !== activeIndex()"
            >
              <div class="flex items-start gap-3">
                <div class="w-5 h-5 flex-shrink-0 mt-0.5 text-kitty-text-dim group-hover:text-kitty-primary transition-colors"
                     [class.text-kitty-primary]="i === activeIndex()">
                  {{ getCategoryIcon(result.item.category) }}
                </div>

                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-kitty-text leading-snug"
                       [class.text-kitty-primary]="i === activeIndex()">
                    @for (segment of result.labelMatches; track $index) {
                      @if (segment.matched) {
                        <mark class="bg-kitty-primary/20 text-kitty-primary rounded-sm px-0 font-semibold not-italic">{{ segment.text }}</mark>
                      } @else {
                        <span>{{ segment.text }}</span>
                      }
                    }
                  </div>
                  <div class="text-xs text-kitty-text-dim mt-0.5 line-clamp-1 leading-relaxed">
                    {{ result.item.description }}
                  </div>
                </div>

                <span class="px-2 py-0.5 bg-kitty-bg rounded-md text-[10px] font-medium text-kitty-primary flex-shrink-0 self-start mt-0.5">
                  {{ result.item.categoryLabel }}
                </span>
              </div>
            </button>
          }

          <div class="px-4 py-2 border-t border-kitty-border/40 bg-kitty-bg/50 flex items-center justify-between">
            <span class="text-[10px] text-kitty-text-dim">
              {{ searchService.results().length }} result{{ searchService.results().length !== 1 ? 's' : '' }}
            </span>
            <span class="text-[10px] text-kitty-text-dim flex items-center gap-2">
              <kbd class="px-1.5 py-0.5 bg-kitty-surface border border-kitty-border rounded text-[9px] font-mono">↑↓</kbd> navigate
              <kbd class="px-1.5 py-0.5 bg-kitty-surface border border-kitty-border rounded text-[9px] font-mono">↵</kbd> go
              <kbd class="px-1.5 py-0.5 bg-kitty-surface border border-kitty-border rounded text-[9px] font-mono">esc</kbd> close
            </span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    mark {
      background: rgb(var(--kitty-primary) / 0.18);
      color: rgb(var(--kitty-primary));
    }
  `]
})
export class SearchBarComponent {
  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

  readonly searchService = inject(SearchService);

  inputValue = '';
  readonly isFocused = signal(false);
  readonly activeIndex = signal(-1);

  readonly isOpen = computed(() =>
    this.isFocused() && this.searchService.results().length > 0
  );

  onInput(value: string): void {
    this.activeIndex.set(-1);
    this.searchService.search(value);
  }

  onBlur(): void {
    setTimeout(() => this.isFocused.set(false), 150);
  }

  onKeydown(event: KeyboardEvent): void {
    const results = this.searchService.results();

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        this.activeIndex.update(i => Math.min(i + 1, results.length - 1));
        break;
      }

      case 'ArrowUp': {
        event.preventDefault();
        this.activeIndex.update(i => Math.max(i - 1, -1));
        break;
      }

      case 'Enter': {
        event.preventDefault();
        const idx = this.activeIndex();
        if (idx >= 0 && idx < results.length) {
          const result = results[idx];
          if (result) {
            this.onSelect(result);
          }
        } else if (results.length > 0) {
          const firstResult = results[0];
          if (firstResult) {
            this.onSelect(firstResult);
          }
        }
        break;
      }

      case 'Escape':
        this.clearInput();
        this.inputEl?.nativeElement.blur();
        break;
    }
  }

  onSelect(result: SearchResult): void {
    this.searchService.select(result);
    this.inputValue = '';
    this.isFocused.set(false);
    this.activeIndex.set(-1);
  }

  clearInput(): void {
    this.inputValue = '';
    this.searchService.clear();
    this.activeIndex.set(-1);
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      fonts:         '✦',
      cursor:        '▌',
      scrollback:    '↕',
      mouse:         '⊙',
      performance:   '⚡',
      bell:          '◎',
      window_layout: '▣',
      tab_bar:       '▤',
      colors:        '◈',
      advanced:      '⚙',
      os_specific:   '⊞',
    };
    return icons[category] ?? '○';
  }
}
