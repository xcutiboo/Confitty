<div align="center">
  <img src="./src/assets/confitty.svg" alt="" width="112" height="112">
  <h1>Confitty</h1>
  <p>A visual configuration builder for the <a href="https://sw.kovidgoyal.net/kitty/">Kitty terminal</a>.</p>

  <p>
    <a href="https://github.com/xcutiboo/Confitty/actions/workflows/ci.yml"><img src="https://github.com/xcutiboo/Confitty/actions/workflows/ci.yml/badge.svg?branch=confitty" alt="CI"></a>
    <a href="https://github.com/xcutiboo/Confitty/releases/latest"><img src="https://img.shields.io/github/v/release/xcutiboo/Confitty" alt="Latest release"></a>
    <a href="./LICENSE"><img src="https://img.shields.io/github/license/xcutiboo/Confitty" alt="MIT licence"></a>
  </p>

  <p><strong><a href="https://confitty.app">confitty.app</a></strong></p>

  <img src="./docs/assets/confitty-terminal-divider.svg" alt="" width="100%">
</div>

Kitty is configured by hand-editing `kitty.conf`, which means reading reference
documentation for roughly 225 options to change your font size. Confitty gives
those options a UI, shows the result in a live terminal preview, and exports a
`kitty.conf` containing only what you actually changed.

It runs entirely in your browser. There is no account, no backend, and nothing
is uploaded anywhere — your config never leaves the tab.

> Not affiliated with the official Kitty Terminal project.

## What it does

**Edits every option it models.** 231 settings across twelve categories: fonts,
cursor, scrollback, mouse, performance, bell, window layout, tab bar, colours,
advanced, OS-specific, and keyboard shortcuts. Option names, types and default
values are checked against Kitty's own `options/definition.py`, so the exported
file is one Kitty will accept.

**Previews as you type.** Background, opacity, blur, tint, font, padding,
margins, borders, cursor shape and blink, selection, the ANSI palette, tab bar
styling and URL decoration all render live. The preview is an approximation, not
an emulator, and says so in the UI.

**Exports a minimal diff.** Only values differing from Kitty's defaults are
written. Change the font size from 11 to 14 and you get one line, not 231. The
output carries no timestamp, so re-exporting an unchanged config produces an
identical file — which matters if you keep dotfiles in git.

**Imports what you already have.** Point it at an existing `kitty.conf` and it
populates the editor. Directives it does not model — kittens, `include` lines,
`env`, options from a newer Kitty than it knows about — are preserved verbatim
and written back out.

**Targets a specific Kitty version.** Pick anything from 0.15 to 0.47 and
options that release does not have are commented out with the version that
introduced them, rather than silently emitted.

**Binds keys.** Add, edit and remove `map` directives, with a picker built from
the 55 actions Kitty binds by default — each carrying the chord Kitty uses — and
free text for everything else. It warns about rows that are incomplete, and
about a chord bound twice, which Kitty resolves by keeping the last.

**Reports contrast.** The preview shows the foreground/background contrast
ratio, flagged when it falls under the 4.5:1 WCAG AA threshold for body text.
Two of the bundled themes do, faithfully.

**Remembers your work.** The config is saved to `localStorage` as you edit, so
closing the tab does not throw the session away. Nothing is uploaded; clearing
site data or **Start fresh** removes it.

### Themes and presets

47 built-in colour themes, including Catppuccin (all four flavours), Tokyo
Night, Gruvbox, Nord, Dracula, Kanagawa, Rosé Pine, Ayu, Everforest, Solarized,
Monokai Pro, One Dark and the Confitty palette. 18 presets combine a theme with
functional settings for cases like performance, accessibility, presentation,
remote sessions and streaming.

Every one of the 230 settings is indexed for keyboard-navigable fuzzy search, by
name, description or synonym. A test fails the build if an option is added
without a search entry.

<div align="center">
  <img src="./docs/assets/confitty-config-divider.svg" alt="" width="100%">
</div>

## Using it

1. Open [confitty.app](https://confitty.app).
2. Pick a preset, or work through the categories in the sidebar.
3. Watch the preview, or switch it to **Config** to read the generated file.
4. **Export**, then install it:

```sh
mkdir -p ~/.config/kitty
cp ~/Downloads/kitty.conf ~/.config/kitty/kitty.conf
```

Reload with <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F5</kbd>, or restart Kitty.

<div align="center">
  <img src="./docs/assets/confitty-window-divider.svg" alt="" width="100%">
</div>

## Development

Requires [Bun](https://bun.sh) 1.3+ and Node.js 22.

```sh
git clone https://github.com/xcutiboo/Confitty.git
cd Confitty
bun install
bun start          # http://localhost:4200
```

| Command | Purpose |
| --- | --- |
| `bun start` | Dev server with hot reload |
| `bun run test` | Unit tests (Vitest, via the Angular test builder) |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run build:prod` | Production build into `dist/confitty/browser/` |

CI runs the type check, the tests and a production build on every push and pull
request.

### Architecture

Angular 21 with standalone components, signals and zoneless change detection;
TypeScript 6 in strict mode; Tailwind 3 for styling against design tokens in
`global_styles.css`; Nx for task running; Bun as the package manager.

The domain lives in three places worth knowing about:

- `src/models/kitty-types.ts` and `kitty-defaults.ts` — the option model. The
  defaults table is correctness-critical: because export writes only what
  differs from it, a default that disagrees with Kitty's makes the preview lie
  and drops settings from the output.
- `src/services/kitty-parser.service.ts` — reads `kitty.conf`. Anything it does
  not model is kept as a raw directive so imports round-trip losslessly.
- `src/services/kitty-generator.service.ts` — writes `kitty.conf`, applying the
  default diff and the version gate.

Parser and generator are covered by unit tests, including round-trip cases.
Changes to either should come with one.

### Deployment

Cloudflare Pages, built from the `confitty` branch. Configure it in the
Cloudflare dashboard:

| Setting | Value |
| --- | --- |
| Build command | `bun run build:prod` |
| Build output directory | `dist/confitty/browser` |
| Node version | `22` |

Security headers, caching and SPA routing come from `src/_headers` and
`src/_redirects`, which the build copies into the output.

### Releases

Versioning is [semantic](https://semver.org/), driven by
[semantic-release](https://semantic-release.gitbook.io/) from
[Conventional Commits](https://www.conventionalcommits.org/) on the `confitty`
branch. `fix:` produces a patch, `feat:` a minor, and a `BREAKING CHANGE:`
footer a major. Do not bump the version in `package.json` by hand.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Bug reports and config-option
coverage gaps are both useful — if Kitty has an option Confitty does not model,
that is a bug worth filing.

Community: [Discord](https://discord.gg/kxG674AadQ).

## Licence

MIT. See [LICENSE](./LICENSE).

If Confitty saved you an afternoon in the Kitty docs, you can
[buy me a coffee](https://ko-fi.com/xcutiboo). Donations cover the domain and
hosting; the project stays free either way.

<div align="center">
  <img src="./docs/assets/confitty-terminal-divider.svg" alt="" width="100%">

  <sub>The mascot is Kitty's ghost cat, if someone had dropped her in pink paint
  and then set off a confetti cannon in her face. The confetti is permanent.
  She has accepted this.</sub>
</div>
