# Confitty

<div align="center">
  <img src="./src/assets/confitty.svg" alt="Confitty Logo" width="150" height="150">

  <p><em>A visual config builder for <a href="https://sw.kovidgoyal.net/kitty/">Kitty terminal</a></em></p>

  <p>
    <a href="https://github.com/xcutiboo/Confitty/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/xcutiboo/Confitty/ci.yml?branch=main&style=for-the-badge&label=build" alt="Build Status">
    </a>
    <a href="https://confitty.app">
      <img src="https://img.shields.io/badge/Live%20Demo-FF6B9D?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Live Demo">
    </a>
    <a href="./LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-5A4D50?style=for-the-badge" alt="MIT License">
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 21">
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Bun-1.3+-FDF8F9?style=for-the-badge&logo=bun&logoColor=black" alt="Bun 1.3+">
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

## ✨ Features

### 🎨 Visual Configuration

- **Live Preview** – See terminal colors, cursor, fonts, and tab bar update in real time.
- **11 Config Categories** – Fonts, cursor, scrollback, mouse, performance, bell, window layout, tab bar, colors, advanced, OS-specific.
- **Simple/Advanced Modes** – Beginner-friendly defaults or full control over 400+ options.
- **Global Search** – Find any config option instantly with fuzzy matching.

### 🎭 Themes & Presets

- **72 Professional Presets** – Dracula, Nord, Tokyo Night, Catppuccin variants, Gruvbox, Kanagawa, Ayu, Monokai, Solarized, VS Code, GitHub, iTerm2, plus 15 original Confitty themes and more.
- **Quick Theme Switcher** – One-click color themes in the Colors section.
- **Performance Profiles** – Gaming (ultra-low latency), Minimal (distraction-free), Power User.

### 🔧 Import & Export

- **Config Import** – Upload an existing `kitty.conf` and edit visually.
- **Smart Export** – Generates clean configs with only your changed values.
- **Diff Algorithm** – Compares against standard Kitty defaults to minimize output bloat.

### 🚀 Advanced Features

- **Tab Bar Styles** – Preview fade, powerline, separator, and slant styles live.
- **Cursor Trail Animation** – Configurable decay and thresholds.
- **Symbol Mapping** – Powerline/Nerd Fonts without needing patched fonts.
- **Background Effects** – Blur, opacity, and tint with accurate rendering.

<div align="center">
  <img src="./src/assets/dividers/confitty-config-divider.svg" alt="divider" width="100%">
</div>

## 🚀 Quick Start

### Using Confitty

1. **Open** [confitty.app](https://confitty.app) (or run locally).
2. **Navigate** using the sidebar to explore config categories.
3. **Customize** settings – preview updates instantly.
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

- **Bun 1.3+** (recommended) or Node.js 20+

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

Output directory: `dist/confitty/`

## 📦 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Angular 21** | Framework with standalone components & signals |
| **TypeScript** | Strict mode for robust type safety |
| **Tailwind CSS** | Utility-first styling |
| **Bun** | Fast package manager & bundler |

**Architecture:** 100% client-side. No backend required; runs entirely in the browser.

## 🤝 Contributing

Contributions are welcome! See [**CONTRIBUTING.md**](./CONTRIBUTING.md) for:

- Development setup instructions
- Coding conventions and style guide
- How to add new presets or config options
- Pull request guidelines

## 📄 License

This project is licensed under the **MIT License** – see [LICENSE](./LICENSE) for details.

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
