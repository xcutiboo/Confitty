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
└── services/
    ├── config-store.service.ts         Central state (Angular signals).
    ├── kitty-parser.service.ts         Parses `.conf` → `KittyConfigAST`.
    ├── kitty-generator.service.ts      Generates minimal `.conf` text.
    ├── kitty-version.service.ts        Version-gated option availability.
    ├── color-themes.service.ts         16-color palettes.
    ├── presets.service.ts              Full config presets.
    ├── font-presets.service.ts         Font metadata + Google Fonts loader.
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

1. Add the property to the relevant interface in `kitty-types.ts`.
2. Add the default value to `kitty-defaults.ts`. It **must** match Kitty's
   actual default. The generator only emits values that differ from the
   default, so an incorrect default leaks into every exported config.
3. Handle the key in `kitty-parser.service.ts`.
4. Add a control in the matching form component.
5. If the option has special formatting in `kitty.conf`, extend
   `kitty-generator.service.ts`.
6. If it was added in a specific Kitty version, register it in
   `kitty-version.service.ts` so older versions emit a guarded comment.

## Adding a theme

Themes live in `src/services/color-themes.service.ts`. Each entry needs the
foreground, background, both selection colors, and the full `color0..color15`
palette. Cross-check hex values against the original source. Don't approximate.

Full preset configs (more than just a palette) live in
`src/services/presets.service.ts`.

## Pull requests

- One logical change per PR.
- Verify in the browser before opening. Exercise live preview and export.
- `bun run typecheck` and `bun run build:prod` must pass.
- Imperative commit messages: "Add Rosé Pine theme", "Fix opacity slider", not
  "Added X" or "Fixing Y".
- Don't bundle formatting noise into substantive PRs.

## Reporting issues

Use the issue templates. Include browser + OS, what you expected, what you
got, and a sample `kitty.conf` slice if it's a parse or export issue.
