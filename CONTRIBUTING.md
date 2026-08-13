# Contributing

Thanks for considering a contribution. Confitty is a small, focused project
and changes should keep it that way.

## Setup

```bash
git clone https://github.com/xcutiboo/Confitty.git
cd Confitty
bun install
bun start
```

Dev server runs on `http://localhost:4200` with hot reload.

## Project layout

```
src/
├── app/app.component.ts                Root shell (layout, header, footer, about modal).
├── components/
│   ├── about-modal/                    About dialog.
│   ├── category-navigation/            Left sidebar.
│   ├── config-editor/                  Center panel, preset selector + form switch.
│   ├── forms/                          One form per Kitty config section.
│   ├── header/                         Top bar: search, import, export, theme toggle.
│   ├── live-preview/                   Right panel: terminal preview + raw config view.
│   ├── preset-selector/                Preset browser with category tabs.
│   ├── search-bar/                     Global option search.
│   └── shared/                         Reusable form primitives.
├── models/
│   ├── kitty-types.ts                  TypeScript shape of a Kitty config.
│   └── kitty-defaults.ts               Default values matching Kitty itself.
├── models/
│   └── config-serialization.ts         Rebuilds a config from untrusted JSON.
└── services/
    ├── config-store.service.ts         Central state (Angular signals).
    ├── config-persistence.service.ts   Saves and restores state via localStorage.
    ├── kitty-parser.service.ts         Parses `.conf` → `KittyConfigAST`.
    ├── kitty-generator.service.ts      Generates minimal `.conf` text.
    ├── kitty-version.service.ts        Version-gated option availability.
    ├── color-themes.service.ts         16-color palettes.
    ├── presets.service.ts              Full config presets.
    ├── font-presets.service.ts         Font metadata + on-demand webfont loader.
    ├── search.service.ts               Search index and result routing.
    └── theme.service.ts                Light/dark UI theme.
```

## Stack and conventions

Angular 21 with standalone components and signals.

- Standalone components only, no NgModule.
- Inline templates and styles. No separate `.html` files.
- State via `signal()`, `computed()`, `effect()`, not RxJS.
- Control flow with `@if` / `@for` / `@switch`, not the `*ng` directives.
- `inject()` for dependencies, not constructor injection.
- TypeScript strict mode. Avoid `any`.
- Tailwind for styling. Brand colors via the `kitty-*` design tokens defined in
  `src/global_styles.css`. Don't hardcode Tailwind `pink-*` etc.

Naming:

| Type       | Convention                          | Example                          |
| ---------- | ----------------------------------- | -------------------------------- |
| Components | kebab-case folder, PascalCase class | `fonts-form/FontsFormComponent`  |
| Services   | camelCase with `Service` suffix     | `configStoreService`             |
| Files      | kebab-case                          | `kitty-types.ts`                 |

## Adding a Kitty option

Check the option against Kitty's own
[`kitty/options/definition.py`](https://github.com/kovidgoyal/kitty/blob/master/kitty/options/definition.py)
first, not the rendered docs. That file is the source of truth for the exact
name, the value type and the default.

1. Add the property to the relevant interface in `kitty-types.ts`, using the
   type Kitty actually parses. An option taking a float or a keyword is not a
   boolean, however much it reads like one.
2. Add the default value to `kitty-defaults.ts`. It **must** match Kitty's
   actual default. Export writes only what differs from this table, so a wrong
   default both makes the preview show a state Kitty will never be in and drops
   the setting from the output when a user deliberately picks Kitty's default.
3. Handle the key in `kitty-parser.service.ts`. Adding the field to the model is
   what makes the parser accept the key at all, so this step is only about
   converting the value.
4. Add a control in the matching form component.
5. If the option has special formatting (repeated directives, comma-separated
   values, quoting) extend `kitty-generator.service.ts`. Getting the separator
   wrong produces a file Kitty rejects.
6. If it arrived in a specific Kitty version, register it in
   `kitty-version.service.ts` so older targets emit a guarded comment.
7. Add a case to `kitty-generator.service.spec.ts`, and to
   `kitty-parser.service.spec.ts` if parsing is not a plain assignment.

## Adding a theme

Themes live in `src/services/color-themes.service.ts`. Each entry needs the
foreground, background, both selection colors, and the full `color0..color15`
palette. Cross-check hex values against the original source. Don't approximate.

Full preset configs (more than just a palette) live in
`src/services/presets.service.ts`.

## Pull requests

- One logical change per PR.
- Verify in the browser before opening. Exercise live preview and export.
- `bun run typecheck`, `bun run test` and `bun run build:prod` must pass. Note
  that `typecheck` does not check templates; only the build does.
- Conventional Commits, imperative mood: `feat: add Rosé Pine theme`,
  `fix: correct the opacity slider range`. The subject line drives the release
  version, so `fix:` and `feat:` are not interchangeable.
- Don't bundle formatting noise into substantive PRs.

## Reporting issues

Use the issue templates. Include browser + OS, what you expected, what you
got, and a sample `kitty.conf` slice if it's a parse or export issue.
