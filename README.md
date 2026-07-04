# Confitty

<div align="center">
  <img src="./src/assets/confitty.svg" alt="Confitty Logo" width="150" height="150">

  <p><em>A visual config builder for <a href="https://sw.kovidgoyal.net/kitty/">Kitty terminal</a></em></p>

  <p>
    <a href="https://github.com/xcutiboo/Confitty/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/xcutiboo/Confitty/ci.yml?branch=confitty&style=for-the-badge&logo=githubactions&logoColor=white&color=2ea44f&label=Build" alt="Build Status">
    </a>
    <a href="https://github.com/xcutiboo/Confitty/releases/latest">
      <img src="https://img.shields.io/github/v/release/xcutiboo/Confitty?style=for-the-badge&logo=github&logoColor=white&color=FFB5C6&label=Release" alt="Latest Release">
    </a>
    <img src="https://img.shields.io/badge/UPDATE-Design_Revamp-7A52FF?style=for-the-badge&logo=sparkles&logoColor=white" alt="Latest Update">
    <a href="https://confitty.app">
      <img src="https://img.shields.io/badge/Live_Demo-confitty.app-FF6B9D?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Live Demo">
    </a>
    <a href="./LICENSE">
      <img src="https://img.shields.io/github/license/xcutiboo/Confitty?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=5A4D50" alt="MIT License">
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Angular_21-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 21">
    <img src="https://img.shields.io/badge/TypeScript_6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Bun_1.3-FDF8F9?style=for-the-badge&logo=bun&logoColor=black" alt="Bun 1.3+">
    <img src="https://img.shields.io/badge/Nx_22-143055?style=for-the-badge&logo=nx&logoColor=white" alt="Nx 22">
    <img src="https://img.shields.io/badge/TailwindCSS_3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS 3">
  </p>

  <p>
    <a href="https://ko-fi.com/xcutiboo">
      <img src="https://img.shields.io/badge/Support-Ko--fi-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white" alt="Ko-fi">
    </a>
    <a href="https://discord.gg/kxG674AadQ">
      <img src="https://img.shields.io/badge/Join-Discord-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord">
    </a>
  </p>

  <br>

  <h3 align="center">✨ Pick your settings · See the result live · Export <code>kitty.conf</code> ✨</h3>

  <p><sub>Not affiliated with the official Kitty Terminal project.</sub></p>

  <br>
</div>

<div align="center">
  <img src="./src/assets/dividers/confitty-terminal-divider.svg" alt="divider" width="100%">
</div>

## 💭 What Even Is This?

Kitty terminal is great. Reading 400+ config options to change your font size? Not so great.

**Confitty** is a visual config builder: tweak everything, see it live in the preview, then export your `kitty.conf` when you're done. No documentation trauma required.

### Meet the Mascot 🐱

She's Kitty Terminal's ghost cat mascot if someone dropped her in pink paint and then set off a confetti cannon directly in her face. She does not know what year it is. She is thriving. The confetti in her fur is permanent. She has accepted this.

## 📢 What's New

> **🎉 Full Kitty 0.47 Support**
> Confitty now supports all configuration options up to Kitty **0.47.0**, including `progress_bar` UI settings, `macos_fullscreen_ignore_safe_area_insets`, `palette_generate`, and `auto_reload_config`.

## ✨ Features

### 🎨 Visual Configuration

- **Live Preview**: Background, opacity, blur, tint, font, padding, margins, border, cursor (block/beam/underline) with blink interval, selection, ANSI palette, tab bar (fade/slant/separator/powerline angled/slanted/round), and URL decoration all update in real time.
- **12 Config Categories**: Fonts, cursor, scrollback, mouse, performance, bell, window layout, tab bar, colors, advanced, OS-specific, keyboard shortcuts.
- **Simple / Advanced Modes**: Beginner-friendly defaults or every option Kitty exposes.
- **Global Search**: Fuzzy search across 130+ indexed options, keyboard-navigable.

### 🎭 Themes & Presets

- **47 built-in color themes**: Dracula, Nord, Tokyo Night (3 variants), Catppuccin (Latte, Frappé, Macchiato, Mocha), Gruvbox (light + dark, soft + hard), Kanagawa (3 variants), Ayu (3 variants), Rosé Pine (3 variants), Solarized (light + dark), Everforest, Material, Nightfox, Monokai Pro, One Dark, One Light, IntelliJ, VS Code, GitHub, Cyberdream, Cobalt2, plus the original Confitty palette.
- **18 full presets**: 10 themed setups plus functional profiles for performance, minimal, gaming, accessibility, presentation, remote-server, streaming, and a developer default.
- **Quick palette switcher**: 16-color picker in the Colors section.

### 🔧 Import & Export

- **Import** an existing `kitty.conf` and edit visually; unrecognised directives (kittens, includes, env) survive the round-trip.
- **Export** only writes the values that differ from Kitty's own defaults, so the output is minimal and merge-friendly.
- **Version-gated**: select your Kitty version (0.15 → 0.47) and the exporter comments out options that don't exist in that release.

### 🚀 Advanced

- **Tab Bar Styles**: fade, slant, separator, powerline (angled, slanted, round), all rendered in the preview.
- **Cursor Trail**: configurable trail length, decay curve, and start threshold.
- **Symbol Mapping**: point Powerline / Nerd Font codepoints at a specific font without patching glyphs.
- **Background**: opacity, blur, image, layout, linear scaling, tint, gaps tint.

<div align="center">
  <img src="./src/assets/dividers/confitty-config-divider.svg" alt="divider" width="100%">
</div>

## 🚀 Quick Start

### Using Confitty

1. **Open** [confitty.app](https://confitty.app) (or run locally).
2. **Navigate** using the sidebar to explore config categories.
3. **Customize** settings. Preview updates instantly.
4. **Review** raw output in the **Config** tab.
5. **Export** your `kitty.conf` file.

### Applying Your Config

```bash
# Save to Kitty config directory
mkdir -p ~/.config/kitty
cp kitty.conf ~/.config/kitty/

# Reload Kitty without restarting
# Press: Ctrl+Shift+F5
```

> **Note:** If you've remapped the reload shortcut, use your custom binding. See [Kitty keyboard shortcuts](https://sw.kovidgoyal.net/kitty/actions/).

### 📥 Importing Existing Configs

Click **Import** and select your `kitty.conf`. Confitty parses it and populates the visual editor. Complex configs (custom kittens, include directives, environment variables) are preserved in the output even if they don't map to visual controls.

## ⚙️ How It Works

Confitty uses a **smart diff algorithm** that exports only the settings that differ from Kitty's defaults:

- **Change font size** from 11 to 14? → Output includes `font_size 14`
- **Leave it at 11?** → Not included in output

**Why this matters:**

- ✅ Keeps configs highly readable and minimal.
- ✅ Avoids overriding defaults that may improve in future Kitty updates.
- ✅ Makes it easy to track exactly what you've customized.

<div align="center">
  <img src="./src/assets/dividers/confitty-window-divider.svg" alt="divider" width="100%">
</div>

## 🛠️ Development

### Prerequisites

- **Bun 1.3+** (recommended) or Node.js 22+

### Local Setup

```bash
# Clone repository
git clone https://github.com/xcutiboo/Confitty.git
cd Confitty

# Install dependencies
bun install

# Start dev server
bun start
```

Open **[http://localhost:4200](http://localhost:4200)** in your browser.

### Build for Production

```bash
bun run build
```

Output directory: `dist/confitty/browser/`

## 📦 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Angular 21** | Standalone components and signals |
| **TypeScript 6** | Strict mode: `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, `strictTemplates`, `strictStandalone`. Zero `any` casts in `src/` |
| **Tailwind 3** | Utility classes, design-token palette in `global_styles.css` |
| **Bun 1.3** | Package install, dev server, production build |
| **Nx 22** | Workspace tooling (`nx serve`, `nx build`) |

**Architecture:** 100% client-side. The exported `kitty.conf` is generated, diffed against defaults, and downloaded entirely in the browser. No backend, no telemetry.

## 🤝 Contributing

Contributions are welcome! See [**CONTRIBUTING.md**](./CONTRIBUTING.md) for:

- Development setup instructions
- Coding conventions and style guide
- How to add new presets or config options
- Pull request guidelines

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

## ☕ Support

If Confitty saved you from reading Kitty docs for three hours, consider supporting the project:

<div align="center">
  <a href="https://ko-fi.com/xcutiboo">
    <img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support on Ko-fi">
  </a>
</div>

Donations help keep the website running and the confetti cannon loaded for our mascot. 🎉

## 💬 Community

Join the [**Discord server**](https://discord.gg/kxG674AadQ) to:

- Share your Kitty configs and setups
- Get help with configuration issues
- Discuss terminal customization
- Hang out with other terminal enthusiasts

<div align="center">
  <img src="./src/assets/dividers/confitty-terminal-divider.svg" alt="divider" width="100%">
</div>

<div align="center">
  <p><strong>Made with ❤️ by <a href="https://github.com/xcutiboo">xcutiboo</a></strong></p>
  <p><sub>Star ⭐ this repo if you found it helpful!</sub></p>
</div>
