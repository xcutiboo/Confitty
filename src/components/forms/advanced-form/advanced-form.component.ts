import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NumberInputComponent } from '../../shared/number-input/number-input.component';
import { VersionBadgeComponent } from '../../shared/version-badge/version-badge.component';
import { FormSectionComponent } from '../../shared/form-section/form-section.component';
import { createFormHelper } from '../../../utils/form-helpers';
import { KittyVersionService } from '../../../services/kitty-version.service';

@Component({
  selector: 'app-advanced-form',
  imports: [CommonModule, FormsModule, NumberInputComponent, VersionBadgeComponent, FormSectionComponent],
  template: `
    <app-form-section title="Advanced" description="Shell integration, remote control, startup configuration, and system settings">
      <div class="bg-kitty-warning/10 border border-kitty-warning/30 rounded-lg p-4">
        <p class="text-kitty-warning text-sm">
          Settings marked
          <span class="inline-flex items-center gap-1 bg-kitty-warning/20 text-kitty-warning px-2 py-0.5 rounded text-xs font-medium">restart required</span>
          will not take effect until Kitty is fully restarted.
        </p>
      </div>

      <div class="space-y-6 bg-kitty-surface rounded-lg p-6 border border-kitty-border">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label class="block text-sm font-medium text-kitty-text mb-2">
              Shell
              <span class="text-kitty-text-dim text-xs ml-2">Default '.' reads from $SHELL</span>
            </label>
            <input
              type="text"
              [(ngModel)]="advanced().shell"
              (ngModelChange)="helper.updateField('shell', $event)"
              class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
              placeholder=". (uses $SHELL)"
            />
          </div>

          @if (helper.advancedMode()) {
            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Editor
                <span class="text-kitty-text-dim text-xs ml-2">Default '.' reads $VISUAL then $EDITOR</span>
              </label>
              <input
                type="text"
                [(ngModel)]="advanced().editor"
                (ngModelChange)="helper.updateField('editor', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder=". (uses $EDITOR)"
              />
            </div>
          }
        </div>

        <div class="form-group">
          <label class="block text-sm font-medium text-kitty-text mb-2">
            Shell Integration
            <span class="text-kitty-text-dim text-xs ml-2">Injects code into bash/zsh/fish for enhanced features</span>
          </label>
          <select
            [(ngModel)]="advanced().shell_integration"
            (ngModelChange)="helper.updateField('shell_integration', $event)"
            class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
          >
            <option value="enabled">Enabled (recommended)</option>
            <option value="disabled">Disabled</option>
            <option value="enabled no-rc">Enabled, skip shell rc injection</option>
            <option value="enabled no-cwd">Enabled, no CWD tracking</option>
            <option value="enabled no-prompt-mark">Enabled, no prompt marks</option>
            <option value="enabled no-complete">Enabled, no completions</option>
            <option value="enabled no-sudo">Enabled, no sudo passthrough</option>
          </select>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label class="block text-sm font-medium text-kitty-text mb-2">Allow Remote Control</label>
            <select
              [(ngModel)]="advanced().allow_remote_control"
              (ngModelChange)="helper.updateField('allow_remote_control', $event)"
              class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
            >
              <option value="no">No</option>
              <option value="yes">Yes (any terminal)</option>
              <option value="socket-only">Socket only</option>
              <option value="socket">Socket (with socket auth)</option>
              <option value="password">Password protected</option>
            </select>
          </div>

          <div class="form-group">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="advanced().close_on_child_death"
                (ngModelChange)="helper.updateField('close_on_child_death', $event)"
                class="w-5 h-5 rounded flex-shrink-0"
              />
              <div>
                <span class="text-sm font-medium text-kitty-text">Close Window on Shell Exit</span>
                <p class="text-kitty-text-dim text-xs mt-0.5">Instantly close the Kitty window when the child shell process exits</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      @if (helper.advancedMode()) {
        <div class="bg-kitty-surface rounded-lg p-6 border border-kitty-border">
          <h3 class="text-lg font-semibold text-kitty-text mb-4">System & Network</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="flex items-center gap-2 text-sm font-medium text-kitty-text mb-2">
                Listen On
                <span class="inline-flex items-center gap-1 bg-kitty-warning/20 text-kitty-warning px-2 py-0.5 rounded text-xs font-medium">restart required</span>
              </label>
              <input
                type="text"
                [(ngModel)]="advanced().listen_on"
                (ngModelChange)="helper.updateField('listen_on', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder="none or unix:/tmp/mykitty"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Terminal Type ($TERM)
                <span class="text-kitty-text-dim text-xs ml-2">TERM environment variable value</span>
              </label>
              <input
                type="text"
                [(ngModel)]="advanced().term"
                (ngModelChange)="helper.updateField('term', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm"
                placeholder="xterm-kitty"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="form-group">
              <label class="flex items-center gap-2 text-sm font-medium text-kitty-text mb-2">
                Update Check Interval
                <span class="inline-flex items-center gap-1 bg-kitty-warning/20 text-kitty-warning px-2 py-0.5 rounded text-xs font-medium">restart required</span>
              </label>
              <app-number-input
                [(ngModel)]="advanced().update_check_interval"
                (ngModelChange)="helper.updateField('update_check_interval', $event)"
                [min]="0"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-kitty-text mb-2">
                Allow OSC 8 Hyperlinks
                <span class="text-kitty-text-dim text-xs ml-2">How to handle clickable hyperlinks from applications</span>
              </label>
              <select
                [(ngModel)]="advanced().allow_hyperlinks"
                (ngModelChange)="helper.updateField('allow_hyperlinks', $event)"
                class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary"
              >
                <option value="yes">Yes (always allow)</option>
                <option value="no">No (disable hyperlinks)</option>
                <option value="ask">Ask (prompt on each click)</option>
              </select>
            </div>
          </div>

          <div class="form-group mt-4" [class.opacity-60]="!filterNotificationAvailable()">
            <div class="flex items-center gap-2 mb-2">
              <label class="block text-sm font-medium text-kitty-text">
                Filter Notification
                <span class="text-kitty-text-dim text-xs ml-2">Filter desktop notifications (field:regexp format)</span>
              </label>
              @if (!filterNotificationAvailable()) {
                <app-version-badge version="0.36.0" />
              }
            </div>
            <input
              type="text"
              [(ngModel)]="advanced().filter_notification"
              (ngModelChange)="helper.updateField('filter_notification', $event)"
              [disabled]="!filterNotificationAvailable()"
              class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm disabled:opacity-50"
              placeholder="title:Spam|body:unwanted"
            />
            <p class="text-kitty-text-dim text-xs mt-1">Fields: title, body, app, type, all. Use all to filter all notifications.</p>
          </div>
        </div>

        <div class="bg-kitty-surface rounded-lg p-6 border border-kitty-border" [class.opacity-60]="!startupSessionAvailable()">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-lg font-semibold text-kitty-text">Startup Session</h3>
            @if (!startupSessionAvailable()) {
              <app-version-badge version="0.24.0" />
            }
          </div>
          <p class="text-kitty-text-dim text-sm mb-4">
            Path to a session file to execute when Kitty starts.
            <span class="inline-flex items-center gap-1 bg-kitty-warning/20 text-kitty-warning px-2 py-0.5 rounded text-xs font-medium ml-1">restart required</span>
          </p>
          <input
            type="text"
            [(ngModel)]="advanced().startup_session"
            (ngModelChange)="helper.updateField('startup_session', $event)"
            [disabled]="!startupSessionAvailable()"
            class="w-full px-4 py-2 bg-kitty-bg border border-kitty-border rounded-lg text-kitty-text focus:outline-none focus:ring-2 focus:ring-kitty-primary font-mono text-sm disabled:opacity-50"
            placeholder="none or /path/to/session.conf"
          />
        </div>
      }

      <div class="bg-kitty-surface rounded-lg border border-kitty-border overflow-hidden">
        <button
          (click)="fastfetchExpanded.set(!fastfetchExpanded())"
          class="w-full px-6 py-4 flex items-center justify-between hover:bg-kitty-surface-light transition-colors group"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-kitty-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-kitty-accent/15 transition-colors">
              <svg class="w-4 h-4 text-kitty-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
            </div>
            <div class="text-left">
              <h3 class="text-sm font-semibold text-kitty-text group-hover:text-kitty-accent transition-colors leading-tight">
                Fastfetch on Startup
              </h3>
              <p class="text-xs text-kitty-text-dim mt-0.5 leading-snug">
                Show system info automatically when a new terminal opens
              </p>
            </div>
          </div>
          <svg
            class="w-4 h-4 text-kitty-text-dim group-hover:text-kitty-accent transition-all duration-200 flex-shrink-0"
            [class.rotate-180]="fastfetchExpanded()"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        @if (fastfetchExpanded()) {
          <div class="border-t border-kitty-border px-6 py-5 space-y-5">
            <div class="text-sm text-kitty-text-dim leading-relaxed">
              <strong class="text-kitty-text font-medium">Fastfetch</strong> is a system info tool that displays your OS, CPU, memory, and other details in a styled block when a new shell session starts. To run it automatically, add the command to your shell's startup file - not to <code class="bg-kitty-bg px-1 py-0.5 rounded font-mono text-xs text-kitty-accent">kitty.conf</code>.
            </div>

            <div class="bg-kitty-bg/60 border border-kitty-warning/20 rounded-lg px-4 py-3 text-xs text-kitty-warning leading-relaxed">
              <strong class="font-semibold">Before editing:</strong> Back up your shell config first - a syntax error in your rc file can prevent your shell from loading.
              Avoid adding <code class="bg-kitty-warning/10 px-1 rounded font-mono">fastfetch</code> more than once or it will run multiple times per tab.
            </div>

            <div class="space-y-4">
              <div>
                <div class="text-xs font-semibold text-kitty-text mb-1 uppercase tracking-wide">Bash</div>
                <div class="text-xs text-kitty-text-dim mb-2">Add to <code class="bg-kitty-bg px-1 rounded font-mono text-kitty-accent">~/.bashrc</code></div>
                <div class="relative group/snippet">
                  <pre class="bg-kitty-bg border border-kitty-border rounded-lg px-4 py-3 text-xs font-mono text-[#b3b1ad] overflow-x-auto">{{ bashSnippet }}</pre>
                  <button
                    (click)="copySnippet('bash')"
                    class="absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-medium transition-all duration-150"
                    [class.bg-kitty-primary]="copiedShell() === 'bash'"
                    [class.text-kitty-dark]="copiedShell() === 'bash'"
                    [class.bg-kitty-surface-light]="copiedShell() !== 'bash'"
                    [class.text-kitty-text-dim]="copiedShell() !== 'bash'"
                  >{{ copiedShell() === 'bash' ? 'Copied' : 'Copy' }}</button>
                </div>
              </div>

              <div>
                <div class="text-xs font-semibold text-kitty-text mb-1 uppercase tracking-wide">Zsh</div>
                <div class="text-xs text-kitty-text-dim mb-2">Add to <code class="bg-kitty-bg px-1 rounded font-mono text-kitty-accent">~/.zshrc</code></div>
                <div class="relative group/snippet">
                  <pre class="bg-kitty-bg border border-kitty-border rounded-lg px-4 py-3 text-xs font-mono text-[#b3b1ad] overflow-x-auto">{{ zshSnippet }}</pre>
                  <button
                    (click)="copySnippet('zsh')"
                    class="absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-medium transition-all duration-150"
                    [class.bg-kitty-primary]="copiedShell() === 'zsh'"
                    [class.text-kitty-dark]="copiedShell() === 'zsh'"
                    [class.bg-kitty-surface-light]="copiedShell() !== 'zsh'"
                    [class.text-kitty-text-dim]="copiedShell() !== 'zsh'"
                  >{{ copiedShell() === 'zsh' ? 'Copied' : 'Copy' }}</button>
                </div>
              </div>

              <div>
                <div class="text-xs font-semibold text-kitty-text mb-1 uppercase tracking-wide">Fish</div>
                <div class="text-xs text-kitty-text-dim mb-2">Add to <code class="bg-kitty-bg px-1 rounded font-mono text-kitty-accent">~/.config/fish/config.fish</code></div>
                <div class="relative group/snippet">
                  <pre class="bg-kitty-bg border border-kitty-border rounded-lg px-4 py-3 text-xs font-mono text-[#b3b1ad] overflow-x-auto">{{ fishSnippet }}</pre>
                  <button
                    (click)="copySnippet('fish')"
                    class="absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-medium transition-all duration-150"
                    [class.bg-kitty-primary]="copiedShell() === 'fish'"
                    [class.text-kitty-dark]="copiedShell() === 'fish'"
                    [class.bg-kitty-surface-light]="copiedShell() !== 'fish'"
                    [class.text-kitty-text-dim]="copiedShell() !== 'fish'"
                  >{{ copiedShell() === 'fish' ? 'Copied' : 'Copy' }}</button>
                </div>
              </div>
            </div>

            <div class="text-xs text-kitty-text-dim leading-relaxed">
              Don't have fastfetch installed? Run
              <code class="bg-kitty-bg px-1 py-0.5 rounded font-mono text-kitty-accent">brew install fastfetch</code>,
              <code class="bg-kitty-bg px-1 py-0.5 rounded font-mono text-kitty-accent">sudo apt install fastfetch</code>, or
              see the <a href="https://github.com/fastfetch-cli/fastfetch" target="_blank" rel="noopener" class="text-kitty-primary hover:underline">fastfetch GitHub page</a> for other package managers.
            </div>
          </div>
        }
      </div>
    </app-form-section>
  `,
  styles: []
})
export class AdvancedFormComponent {
  private readonly versionService = inject(KittyVersionService);

  readonly helper = createFormHelper('advanced');
  readonly advanced = this.helper.state.asReadonly();
  readonly startupSessionAvailable = computed(() => this.versionService.isOptionAvailable('startup_session'));
  readonly filterNotificationAvailable = computed(() => this.versionService.isOptionAvailable('filter_notification'));

  fastfetchExpanded = signal(false);
  copiedShell = signal<'bash' | 'zsh' | 'fish' | null>(null);

  readonly bashSnippet = `# ~/.bashrc
if command -v fastfetch &>/dev/null; then
  fastfetch
fi`;
  readonly zshSnippet = `# ~/.zshrc
if (( $+commands[fastfetch] )); then
  fastfetch
fi`;
  readonly fishSnippet = `# ~/.config/fish/config.fish
if command -v fastfetch &>/dev/null
  fastfetch
end`;

  copySnippet(shell: 'bash' | 'zsh' | 'fish'): void {
    const snippets: Record<'bash' | 'zsh' | 'fish', string> = {
      bash: this.bashSnippet,
      zsh: this.zshSnippet,
      fish: this.fishSnippet,
    };
    navigator.clipboard.writeText(snippets[shell]).then(() => {
      this.copiedShell.set(shell);
      setTimeout(() => this.copiedShell.set(null), 2000);
    });
  }
}
