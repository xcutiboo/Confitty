import { Injectable } from '@angular/core';

export interface FontPreset {
  name: string;
  family: string;
  description: string;
  ligatures: boolean;
  popular: boolean;
  googleFontsFamily?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FontPresetsService {
  readonly fonts: FontPreset[] = [
    { name: 'JetBrains Mono', family: 'JetBrains Mono', description: 'Modern, developer-friendly with ligatures', ligatures: true, popular: true, googleFontsFamily: 'JetBrains+Mono' },
    { name: 'Fira Code', family: 'Fira Code', description: 'Free monospaced font with programming ligatures', ligatures: true, popular: true, googleFontsFamily: 'Fira+Code' },
    { name: 'Cascadia Code', family: 'Cascadia Code', description: 'Microsoft\'s modern coding font', ligatures: true, popular: true },
    { name: 'Monaco', family: 'Monaco', description: 'Classic macOS terminal font', ligatures: false, popular: true },
    { name: 'Menlo', family: 'Menlo', description: 'macOS system monospace font', ligatures: false, popular: true },
    { name: 'Consolas', family: 'Consolas', description: 'Windows terminal font', ligatures: false, popular: false },
    { name: 'Source Code Pro', family: 'Source Code Pro', description: 'Adobe\'s monospaced font family', ligatures: false, popular: true, googleFontsFamily: 'Source+Code+Pro' },
    { name: 'Hack', family: 'Hack', description: 'Hand-groomed typeface for source code', ligatures: false, popular: false },
    { name: 'Inconsolata', family: 'Inconsolata', description: 'Humanist monospace font', ligatures: false, popular: false, googleFontsFamily: 'Inconsolata' },
    { name: 'DejaVu Sans Mono', family: 'DejaVu Sans Mono', description: 'Based on Bitstream Vera', ligatures: false, popular: false },
    { name: 'Liberation Mono', family: 'Liberation Mono', description: 'Metrically compatible with Courier New', ligatures: false, popular: false },
    { name: 'Ubuntu Mono', family: 'Ubuntu Mono', description: 'Ubuntu\'s monospace font', ligatures: false, popular: false, googleFontsFamily: 'Ubuntu+Mono' },
    { name: 'Courier New', family: 'Courier New', description: 'Classic typewriter-style font', ligatures: false, popular: false },
    { name: 'Monospace', family: 'monospace', description: 'System default monospace', ligatures: false, popular: false },
    { name: 'SF Mono', family: 'SF Mono', description: 'Apple\'s San Francisco Mono', ligatures: false, popular: true },
    { name: 'Operator Mono', family: 'Operator Mono', description: 'Premium coding font', ligatures: false, popular: false },
    { name: 'Dank Mono', family: 'Dank Mono', description: 'Stylish italic monospace', ligatures: false, popular: false },
    { name: 'Victor Mono', family: 'Victor Mono', description: 'Free programming font with cursive italics', ligatures: true, popular: false },
    { name: 'Iosevka', family: 'Iosevka', description: 'Slender monospace font', ligatures: true, popular: true },
    { name: 'IBM Plex Mono', family: 'IBM Plex Mono', description: 'IBM\'s open-source mono font', ligatures: false, popular: false, googleFontsFamily: 'IBM+Plex+Mono' },
    { name: 'Roboto Mono', family: 'Roboto Mono', description: 'Google\'s monospace variant', ligatures: false, popular: false, googleFontsFamily: 'Roboto+Mono' },
    { name: 'Space Mono', family: 'Space Mono', description: 'Fixed-width typeface with a retro feel', ligatures: false, popular: false, googleFontsFamily: 'Space+Mono' },
    { name: 'Noto Sans Mono', family: 'Noto Sans Mono', description: 'Universal Unicode coverage', ligatures: false, popular: false, googleFontsFamily: 'Noto+Sans+Mono' },
  ];

  private readonly loadedFonts = new Set<string>();

  getPopularFonts(): FontPreset[] {
    return this.fonts.filter(f => f.popular);
  }

  getAllFonts(): FontPreset[] {
    return this.fonts;
  }

  getFontByFamily(family: string): FontPreset | undefined {
    return this.fonts.find(f => f.family === family);
  }

  loadWebFont(family: string): void {
    if (this.loadedFonts.has(family)) return;
    const preset = this.getFontByFamily(family);
    if (!preset?.googleFontsFamily) return;
    this.loadedFonts.add(family);
    const id = `gf-${family.replaceAll(' ', '-').toLowerCase()}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${preset.googleFontsFamily}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  }
}
