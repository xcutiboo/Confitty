# Contributing to Confitty

Thanks for wanting to help. Here's what you need to know.

<div align="center">

## 📁 Project Structure

</div>

```text
src/
├── app/
│   └── app.component.ts              # Root shell - layout, header, footer, about modal
├── components/
│   ├── about-modal/                  # About dialog (mascot, Ko-fi, GitHub)
│   ├── category-navigation/          # Left sidebar with config categories
│   ├── config-editor/                # Center panel - form switcher + preset selector
│   ├── forms/
│   │   ├── fonts-form/
│   │   ├── cursor-form/
│   │   ├── scrollback-form/
│   │   ├── mouse-form/
│   │   ├── performance-form/
│   │   ├── bell-form/
│   │   ├── window-layout-form/
│   │   ├── tab-bar-form/
│   │   ├── colors-form/
│   │   ├── advanced-form/
│   │   └── os-specific-form/
│   ├── header/                       # Top bar - search, import, export, mode toggle
│   ├── live-preview/                 # Right panel - terminal preview + config text view
│   ├── preset-selector/              # Preset browser with category tabs
│   ├── search-bar/                   # Global search component
│   └── shared/                       # Shared UI components
├── models/
│   ├── kitty-types.ts                # TypeScript interfaces for Kitty config
│   └── kitty-defaults.ts             # Default values matching Kitty's defaults
└── services/
    ├── config-store.service.ts       # Central state (Angular signals)
    ├── kitty-parser.service.ts       # Parses .conf files into KittyConfigAST
    ├── kitty-generator.service.ts    # Generates .conf text from KittyConfigAST
    ├── color-themes.service.ts       # Quick-apply color themes
    ├── presets.service.ts            # Full config presets
    ├── font-presets.service.ts       # Font database with metadata
    ├── search.service.ts             # Global search index and result routing
    └── theme.service.ts              # Theme management
```

<div align="center">

## 🚀 Getting Started

</div>

```bash
git clone https://github.com/xcutiboo/Confitty.git
cd Confitty
bun install
bun start
```

The app runs at `http://localhost:4200` with hot reload.

<div align="center">

## 📝 Coding Conventions

</div>

This is an Angular 21 project using standalone components and signals.

### Components

- **Standalone only** — no NgModule
- **Inline templates** — no separate `.html` files
- **Angular signals** — use `signal()`, `computed()`, `effect()` for state, not RxJS
- **New control flow** — use `@if`, `@for`, `@switch`, not `*ngIf` / `*ngFor`

### TypeScript

- **Strict mode** — don't use `any` unless absolutely necessary
- **Central types** — all Kitty config types live in `kitty-types.ts`
- **Dependency injection** — use `inject()`, not constructor injection

### Styling

- **Tailwind only** — no separate CSS files for components
- **Color palette** — use `kitty-*` colors from `tailwind.config.js`
- **Branding** — pink (`pink-*`) colors reserved for Confitty accents

### Naming

| Type | Convention | Example |
| ---- | ---------- | ------- |
| Components | kebab-case folder, PascalCase class | `fonts-form/FontsFormComponent` |
| Services | camelCase with `Service` suffix | `configStoreService` |
| Files | kebab-case | `kitty-types.ts` |

<div align="center">

## ➕ Adding a New Config Option

</div>

When Kitty adds a new config setting:

1. **Add the type** — add the property to the right interface in `kitty-types.ts`
2. **Add the default** — add the default value in `kitty-defaults.ts` (check [Kitty docs](https://sw.kovidgoyal.net/kitty/conf/))
3. **Add the parser** — handle the new key in `kitty-parser.service.ts`
4. **Add the form field** — add UI control in the relevant form component
5. **Verify the generator** — check `kitty-generator.service.ts` for special formatting needs

**Note:** The generator only outputs settings that differ from defaults. Make sure your default value matches Kitty's actual default.

<div align="center">

## 🎨 Adding a New Preset

</div>

Presets live in `src/services/presets.service.ts`:

```ts
{
  id: 'my-preset',         // unique, kebab-case
  name: 'My Preset',
  description: 'One sentence about what this is for.',
  category: 'theme',       // 'theme' | 'performance' | 'minimal' | 'feature-rich' | 'gaming'
  author: 'author name',     // optional
  tags: ['tag1', 'tag2'],    // optional, for display only
  config: {
    // flat key-value pairs matching kitty config keys
    // only include what differs from default
    foreground: '#f8f8f2',
    background: '#282a36',
    // ...
  }
}
```

For color themes, also add to `src/services/color-themes.service.ts` with the 16-color palette so it appears in the Colors form quick-apply buttons.

<div align="center">

## 🔀 Pull Requests

</div>

- One logical change per PR — no unrelated fixes bundled together
- Test in the browser before opening — including live preview and export
- Ensure `bun run build` passes with no errors
- For color themes, verify hex values against official theme sources
- Use imperative commit messages: "Add Rosé Pine theme", "Fix opacity slider"

<div align="center">

## 🐛 Reporting Issues

</div>

Open an issue on GitHub with:

- What you expected to happen
- What actually happened
- Your browser and OS
- Sample `.conf` file if it's a config export issue
