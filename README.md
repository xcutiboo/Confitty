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

Editing runs entirely in your browser. There is no account, and your config
never leaves the tab: it is held in local storage and turned into a file by
the same page you are looking at. The hosted site counts visits, which is one
number in a key-value store and no part of what you are editing. It also
carries one ad below the settings, which covers the domain and hosting; the
source has no ad configuration in it, so anything you build yourself has none.

> Not affiliated with the official Kitty Terminal project.

## What it does

It edits 230 settings across twelve categories: fonts, cursor, scrollback,
mouse, performance, bell, window layout, tab bar, colours, advanced,
OS-specific and keyboard shortcuts. That is every option in a released Kitty,
with the handful sitting in the unreleased 0.49 branch listed and waiting.

Names, types and defaults all come from Kitty's own `options/definition.py`, and
the tests hold both directions of that: one sets every option away from its
default, generates the file and asserts each directive is a name Kitty accepts;
another asserts every name Kitty accepts is one Confitty models. "It exports a
valid `kitty.conf`" is checked on every run rather than believed.

The preview updates as you type. Background, opacity, blur, tint, font, padding,
margins, borders, cursor shape and blink, selection, the ANSI palette, tab bar
styling and URL decoration all render live, and it reports the
foreground/background contrast ratio so you can see when a palette is going to
be hard work to read. It is an approximation rather than an emulator, and says
so in the UI.

Export writes only the values that differ from Kitty's defaults, so changing the
font size from 11 to 14 gives you one line rather than 230. There is no
timestamp in the output, which means re-exporting an unchanged config produces a
byte-identical file. That matters if you keep dotfiles in git.

Import goes the other way. Point it at an existing `kitty.conf` and it fills in
the editor. Anything it does not model, whether that is a kitten, an `include`
line, `env`, or an option from a Kitty newer than it knows about, is kept
verbatim and written back out.

Pick your Kitty version, anywhere from 0.15 to 0.48, and options that release
does not have are commented out with the version that introduced them instead of
being emitted silently.

Keyboard shortcuts are editable, not just viewable. Add, change and remove `map`
directives, with a picker built from the 55 actions Kitty binds by default, each
carrying the chord Kitty uses. The action field stays free text, because Kitty
accepts far more than those. It flags rows that are incomplete, and chords bound
twice, which Kitty resolves by keeping the last.

Your work is saved to `localStorage` as you edit, so closing the tab does not
throw the session away. Nothing is uploaded. Clearing site data or pressing
**Start fresh** removes it.

### Themes and presets

47 built-in colour themes, including Catppuccin (all four flavours), Tokyo
Night, Gruvbox, Nord, Dracula, Kanagawa, Rosé Pine, Ayu, Everforest, Solarized,
Monokai Pro, One Dark and the Confitty palette. 18 presets pair a theme with
functional settings for cases like performance, accessibility, presentation,
remote sessions and streaming.

All 230 settings are indexed for keyboard-navigable fuzzy search by name,
description or synonym. A test fails the build if an option is added without a
search entry.

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

Angular 21 with standalone components, signals and zoneless change detection.
TypeScript 6 in strict mode, Tailwind 3 against design tokens in
`global_styles.css`, Nx for task running, Bun as the package manager.

Three files carry the domain:

| File | Holds |
| --- | --- |
| `models/kitty-types.ts`, `models/kitty-defaults.ts` | The option model and Kitty's defaults |
| `services/kitty-parser.service.ts` | Reads `kitty.conf` |
| `services/kitty-generator.service.ts` | Writes `kitty.conf` |

The defaults table is correctness-critical. Export writes only what differs from
it, so a default that disagrees with Kitty's both makes the preview show a state
Kitty will never be in and drops the setting from the output when a user
deliberately picks Kitty's value. Anything the parser does not model is kept as
a raw directive, so imports round-trip without losing lines.

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

Four build environment variables switch on everything the hosted site has and a
local build does not. All optional, all independent; unset means the code is
never emitted and the request is never made:

| Variable | Value |
| --- | --- |
| `CONFITTY_ADSENSE_CLIENT` | Publisher ID, `ca-pub-` followed by 16 digits |
| `CONFITTY_ADSENSE_SLOT` | Numeric ad unit ID |
| `CONFITTY_ADBLOCK_RECOVERY` | `1` to emit Google's ad blocking recovery tag |
| `CONFITTY_CF_ANALYTICS_TOKEN` | Cloudflare Web Analytics beacon token |

`scripts/apply-site-config.mjs` validates them, writes the AdSense constants
into `src/config/ads.ts`, generates `ads.txt`, and injects the head tags between
the `deployment-tags` markers in `index.html`. Nothing it writes is committed,
and specs fail if any of it ever is.

A few things live in the AdSense dashboard rather than here: site approval, the
consent message for EEA and UK visitors under the certified-CMP requirement in
force since January 2024, and the wording of the ad blocking recovery message.
The recovery tag reports blocker rates even while that message is still a draft,
which is a reasonable way to find out how much is actually being blocked before
deciding whether to ask anyone anything.

If you would rather use the Pages one-click analytics setup under **Metrics →
Web Analytics**, leave `CONFITTY_CF_ANALYTICS_TOKEN` unset so the beacon is not
counted twice.

Security headers, caching and SPA routing come from `src/_headers` and
`src/_redirects`, which the build copies into the output.

Cloudflare now points new static sites at Workers rather than Pages, and Workers
reads the same `_headers` and `_redirects` files while adding logs and Logpush,
which Pages has no equivalent for. Moving over means a `wrangler.jsonc` at the
root and switching the deployment in the dashboard:

```jsonc
{
  "name": "confitty",
  "compatibility_date": "2026-08-17",
  "assets": { "directory": "./dist/confitty/browser/" }
}
```

That file becomes the source of truth once it exists, so the dashboard settings
above stop applying. Worth doing deliberately rather than as a side effect of a
push.

### Releases

Versioning is [semantic](https://semver.org/), driven by
[semantic-release](https://semantic-release.gitbook.io/) from
[Conventional Commits](https://www.conventionalcommits.org/) on the `confitty`
branch. `fix:` produces a patch, `feat:` a minor, and a `BREAKING CHANGE:`
footer a major. Do not bump the version in `package.json` by hand.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Bug reports and coverage gaps are both
useful. If Kitty has an option Confitty does not model, that is worth filing.

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
