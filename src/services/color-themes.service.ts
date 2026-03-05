import { Injectable, signal } from '@angular/core';
import { KittyColorConfig } from '../models/kitty-types';

export interface ColorTheme {
  name: string;
  description: string;
  colors: Partial<KittyColorConfig>;
}

type ColorSet = [
  string, string, string, string, string, string, string, string,
  string, string, string, string, string, string, string, string,
  string, string, string, string
];

function theme(name: string, description: string, colors: ColorSet): ColorTheme {
  const [fg, bg, selFg, selBg, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15] = colors;
  return {
    name,
    description,
    colors: {
      foreground: fg, background: bg, selection_foreground: selFg, selection_background: selBg,
      color0: c0, color1: c1, color2: c2, color3: c3, color4: c4, color5: c5, color6: c6, color7: c7,
      color8: c8, color9: c9, color10: c10, color11: c11, color12: c12, color13: c13, color14: c14, color15: c15
    }
  };
}

@Injectable({ providedIn: 'root' })
export class ColorThemesService {
  // Built-in themes - extensive collection organized by category
  readonly themes: ColorTheme[] = [
    // Confitty official
    theme('Confitty', 'Official Confitty theme with soft pinks and confetti accents',
      ['#FFFFFF', '#564D50', '#FFFFFF', '#FFB5C6',
       '#564D50', '#FE8AEC', '#76D36E', '#FAF089', '#9DC3CA', '#C1A3C4', '#B2DAB3', '#FFFFFF',
       '#6B6164', '#FF9DED', '#8EE486', '#FBF59D', '#B0D4DA', '#D4B8D7', '#C2E4C3', '#F0F0F0']),

    // Popular themes
    theme('Dracula', 'Dark theme with purple and pink accents',
      ['#f8f8f2', '#282a36', '#ffffff', '#44475a',
       '#21222c', '#ff5555', '#50fa7b', '#f1fa8c', '#bd93f9', '#ff79c6', '#8be9fd', '#f8f8f2',
       '#6272a4', '#ff6e6e', '#69ff94', '#ffffa5', '#d6acff', '#ff92df', '#a4ffff', '#ffffff']),
    theme('Monokai Pro', 'Refined Monokai with improved contrast',
      ['#fcfcfa', '#2d2a2e', '#000000', '#ffd866',
       '#403e41', '#ff6188', '#a9dc76', '#ffd866', '#fc9867', '#ab9df2', '#78dce8', '#fcfcfa',
       '#727072', '#ff6188', '#a9dc76', '#ffd866', '#fc9867', '#ab9df2', '#78dce8', '#fcfcfa']),
    theme('One Dark', 'Atom One Dark theme',
      ['#abb2bf', '#282c34', '#abb2bf', '#3e4451',
       '#282c34', '#e06c75', '#98c379', '#e5c07b', '#61afef', '#c678dd', '#56b6c2', '#abb2bf',
       '#5c6370', '#e06c75', '#98c379', '#e5c07b', '#61afef', '#c678dd', '#56b6c2', '#ffffff']),
    theme('One Light', 'Atom One Light theme',
      ['#383a42', '#fafafa', '#383a42', '#e5e5e5',
       '#f0f0f0', '#e45649', '#50a14f', '#c18401', '#4078f2', '#a626a4', '#0184bc', '#383a42',
       '#a0a1a7', '#e45649', '#50a14f', '#c18401', '#4078f2', '#a626a4', '#0184bc', '#ffffff']),

    // Catppuccin variants
    theme('Catppuccin Mocha', 'Soothing pastel dark theme — warm and cozy',
      ['#cdd6f4', '#1e1e2e', '#1e1e2e', '#585b70',
       '#45475a', '#f38ba8', '#a6e3a1', '#f9e2af', '#89b4fa', '#f5c2e7', '#94e2d5', '#bac2de',
       '#585b70', '#f38ba8', '#a6e3a1', '#f9e2af', '#89b4fa', '#f5c2e7', '#94e2d5', '#a6adc8']),
    theme('Catppuccin Macchiato', 'Medium contrast Catppuccin variant',
      ['#cad3f5', '#24273a', '#24273a', '#5b6078',
       '#494d64', '#ed8796', '#a6da95', '#eed49f', '#8aadf4', '#f5bde6', '#8bd5ca', '#b8c0e0',
       '#5b6078', '#ed8796', '#a6da95', '#eed49f', '#8aadf4', '#f5bde6', '#8bd5ca', '#a5adcb']),
    theme('Catppuccin Frappe', 'Lower contrast Catppuccin variant',
      ['#c6d0f5', '#303446', '#303446', '#626880',
       '#51576d', '#e78284', '#a6d189', '#e5c890', '#8caaee', '#f4b8e4', '#81c8be', '#b5bfe2',
       '#626880', '#e78284', '#a6d189', '#e5c890', '#8caaee', '#f4b8e4', '#81c8be', '#a5adce']),
    theme('Catppuccin Latte', 'Soothing pastel light theme — clean and bright',
      ['#4c4f69', '#eff1f5', '#eff1f5', '#acb0be',
       '#5c5f77', '#d20f39', '#40a02b', '#df8e1d', '#1e66f5', '#ea76cb', '#179299', '#acb0be',
       '#6c6f85', '#d20f39', '#40a02b', '#df8e1d', '#1e66f5', '#ea76cb', '#179299', '#bcc0cc']),

    // Tokyo Night variants
    theme('Tokyo Night', 'Dark theme inspired by the Tokyo night sky',
      ['#c0caf5', '#1a1b26', '#1a1b26', '#283457',
       '#15161e', '#f7768e', '#9ece6a', '#e0af68', '#7aa2f7', '#bb9af7', '#7dcfff', '#a9b1d6',
       '#414868', '#f7768e', '#9ece6a', '#e0af68', '#7aa2f7', '#bb9af7', '#7dcfff', '#c0caf5']),
    theme('Tokyo Night Storm', 'Tokyo Night variant with stormy gray tones',
      ['#c0caf5', '#24283b', '#24283b', '#2e3c64',
       '#1f2335', '#f7768e', '#9ece6a', '#e0af68', '#7aa2f7', '#bb9af7', '#7dcfff', '#a9b1d6',
       '#414868', '#f7768e', '#9ece6a', '#e0af68', '#7aa2f7', '#bb9af7', '#7dcfff', '#c0caf5']),
    theme('Tokyo Night Day', 'Light variant of Tokyo Night',
      ['#3760bf', '#d5d6db', '#d5d6db', '#b4b5b9',
       '#e6e7ec', '#f52a65', '#587539', '#8c6c3e', '#2e7de9', '#9854f1', '#007197', '#6172b0',
       '#a1a6c5', '#f52a65', '#587539', '#8c6c3e', '#2e7de9', '#9854f1', '#007197', '#3760bf']),

    // Gruvbox variants
    theme('Gruvbox Dark', 'Retro groove with warm earthy tones',
      ['#ebdbb2', '#282828', '#282828', '#ebdbb2',
       '#282828', '#cc241d', '#98971a', '#d79921', '#458588', '#b16286', '#689d6a', '#a89984',
       '#928374', '#fb4934', '#b8bb26', '#fabd2f', '#83a598', '#d3869b', '#8ec07c', '#ebdbb2']),
    theme('Gruvbox Light', 'Light variant of the retro groove theme',
      ['#3c3836', '#fbf1c7', '#fbf1c7', '#3c3836',
       '#fbf1c7', '#cc241d', '#98971a', '#d79921', '#458588', '#b16286', '#689d6a', '#7c6f64',
       '#928374', '#9d0006', '#79740e', '#b57614', '#076678', '#8f3f71', '#427b58', '#3c3836']),

    // Rose Pine variants
    theme('Rose Pine', 'All natural pine, faux fur and a bit of soho vibes',
      ['#e0def4', '#191724', '#191724', '#524f67',
       '#26233a', '#eb6f92', '#31748f', '#f6c177', '#9ccfd8', '#c4a7e7', '#ebbcba', '#e0def4',
       '#6e6a86', '#eb6f92', '#31748f', '#f6c177', '#9ccfd8', '#c4a7e7', '#ebbcba', '#e0def4']),
    theme('Rose Pine Moon', 'Rose Pine variant with dimmed lights',
      ['#e0def4', '#232136', '#232136', '#44415a',
       '#393552', '#eb6f92', '#3e8fb0', '#f6c177', '#9ccfd8', '#c4a7e7', '#ea9a97', '#e0def4',
       '#817c9c', '#eb6f92', '#3e8fb0', '#f6c177', '#9ccfd8', '#c4a7e7', '#ea9a97', '#e0def4']),
    theme('Rose Pine Dawn', 'Rose Pine variant for the early risers',
      ['#575279', '#faf4ed', '#faf4ed', '#f2e9e1',
       '#f4ede8', '#b4637a', '#56949f', '#ea9d34', '#9ccfd8', '#c4a7e7', '#d7827e', '#9893a5',
       '#6e6a86', '#b4637a', '#56949f', '#ea9d34', '#9ccfd8', '#c4a7e7', '#d7827e', '#575279']),

    // Everforest variants
    theme('Everforest Dark', 'Comfortable warm-green dark theme for long coding sessions',
      ['#d3c6aa', '#2d353b', '#2d353b', '#475258',
       '#374247', '#e67e80', '#a7c080', '#dbbc7f', '#7fbbb3', '#d699b6', '#83c092', '#d3c6aa',
       '#475258', '#e67e80', '#a7c080', '#dbbc7f', '#7fbbb3', '#d699b6', '#83c092', '#d3c6aa']),
    theme('Everforest Light', 'Comfortable warm-green light theme',
      ['#5c6a72', '#fdf6e3', '#fdf6e3', '#f3eadb',
       '#f3eadb', '#f85552', '#8da101', '#dfa000', '#3a94c5', '#df69ba', '#35a77c', '#5c6a72',
       '#829181', '#f85552', '#8da101', '#dfa000', '#3a94c5', '#df69ba', '#35a77c', '#5c6a72']),

    // Kanagawa variants
    theme('Kanagawa Wave', 'Dark theme inspired by the paintings of Katsushika Hokusai',
      ['#dcd7ba', '#1f1f28', '#1f1f28', '#2d4f67',
       '#16161d', '#c34043', '#76946a', '#c0a36e', '#7e9cd8', '#957fb8', '#6a9589', '#c8c093',
       '#717c7c', '#e82424', '#98bb6c', '#e6c384', '#7fb4ca', '#938aa9', '#7aa89f', '#dcd7ba']),
    theme('Kanagawa Dragon', 'Kanagawa variant with darker, richer colors',
      ['#c5c9c5', '#181616', '#181616', '#8ba4b0',
       '#0d0c0c', '#c4746e', '#8a9a7b', '#c4b28a', '#8ba4b0', '#a292a3', '#8ea4a2', '#c5c9c5',
       '#4a4a4a', '#e46876', '#87a987', '#e6c384', '#7fb4ca', '#938aa9', '#7aa89f', '#c5c9c5']),

    // Solarized variants
    theme('Solarized Dark', 'Precision colors for machines and people — dark',
      ['#839496', '#002b36', '#002b36', '#657b83',
       '#073642', '#dc322f', '#859900', '#b58900', '#268bd2', '#d33682', '#2aa198', '#eee8d5',
       '#002b36', '#cb4b16', '#586e75', '#657b83', '#839496', '#6c71c4', '#93a1a1', '#fdf6e3']),
    theme('Solarized Light', 'Precision colors for machines and people — light',
      ['#657b83', '#fdf6e3', '#fdf6e3', '#eee8d5',
       '#eee8d5', '#dc322f', '#859900', '#b58900', '#268bd2', '#d33682', '#2aa198', '#073642',
       '#fdf6e3', '#cb4b16', '#93a1a1', '#839496', '#657b83', '#6c71c4', '#586e75', '#073642']),

    // Nord
    theme('Nord', 'An arctic, north-bluish color palette',
      ['#d8dee9', '#2e3440', '#2e3440', '#4c566a',
       '#3b4252', '#bf616a', '#a3be8c', '#ebcb8b', '#81a1c1', '#b48ead', '#88c0d0', '#e5e9f0',
       '#4c566a', '#bf616a', '#a3be8c', '#ebcb8b', '#81a1c1', '#b48ead', '#8fbcbb', '#eceff4']),

    // Ayu variants
    theme('Ayu Dark', 'Simple dark theme with warm and cold color accents',
      ['#bfbab0', '#0a0e14', '#0a0e14', '#273747',
       '#01060e', '#ff3333', '#b8cc52', '#e7c547', '#36a3d9', '#f07178', '#95e6cb', '#c7c7c7',
       '#323232', '#ff6565', '#eafe84', '#fff779', '#68d5ff', '#ffa3aa', '#c7fffd', '#ffffff']),
    theme('Ayu Mirage', 'Ayu variant with muted colors',
      ['#cccac2', '#1f2430', '#1f2430', '#33415e',
       '#1f2430', '#ff3333', '#bae67e', '#ffd580', '#73d0ff', '#f28779', '#95e6cb', '#cccac2',
       '#546e7a', '#ff6565', '#c2d94c', '#ffe6b3', '#59c2ff', '#ff8f8f', '#95e6cb', '#ffffff']),
    theme('Ayu Light', 'Simple light theme — crisp with warm orange accents',
      ['#5c6773', '#fafafa', '#fafafa', '#cdd6d4',
       '#ffffff', '#ff3333', '#86b300', '#f29718', '#41a6d9', '#a37acc', '#4dbf99', '#5c6773',
       '#8a9199', '#ff3333', '#86b300', '#f29718', '#41a6d9', '#a37acc', '#4dbf99', '#5c6773']),

    // Material variants
    theme('Material Ocean', 'Material design inspired ocean blue theme',
      ['#eeffff', '#0f111a', '#0f111a', '#717cb4',
       '#090b10', '#f07178', '#c3e88d', '#ffcb6b', '#82aaff', '#c792ea', '#89ddff', '#eeffff',
       '#464b5d', '#ff5370', '#c3e88d', '#ffcb6b', '#82aaff', '#c792ea', '#89ddff', '#ffffff']),
    theme('Material Palenight', 'Material design inspired palenight theme',
      ['#a6accd', '#292d3e', '#292d3e', '#444267',
       '#292d3e', '#f07178', '#c3e88d', '#ffcb6b', '#82aaff', '#c792ea', '#89ddff', '#676e95',
       '#676e95', '#ff5370', '#c3e88d', '#ffcb6b', '#82aaff', '#c792ea', '#89ddff', '#ffffff']),

    // Nightfox variants
    theme('Nightfox', 'Dark medium-contrast theme with vivid accent colors',
      ['#cdcecf', '#192330', '#192330', '#2b3b51',
       '#212e3f', '#c94f6d', '#81b29a', '#dbc074', '#719cd6', '#9d79d6', '#63cdcf', '#dfdfe0',
       '#526176', '#d16983', '#8ebaa4', '#e0c989', '#86abdc', '#baa1e2', '#7ad4d6', '#e4e4e5']),
    theme('Terafox', 'Nightfox variant with warm earth tones',
      ['#e6eaea', '#2f3339', '#2f3339', '#4f5b5e',
       '#2f3339', '#e85c51', '#7aa4a1', '#fda47f', '#5a93aa', '#ad6c83', '#a1cdd8', '#ebebeb',
       '#4f5b5e', '#e85c51', '#7aa4a1', '#fda47f', '#5a93aa', '#ad6c83', '#a1cdd8', '#ebebeb']),
    theme('Carbonfox', 'Nightfox variant inspired by Carbon Design System',
      ['#f2f4f8', '#161616', '#161616', '#525252',
       '#161616', '#ee5396', '#42be65', '#ffe97b', '#33b1ff', '#be95ff', '#ff7eb6', '#f2f4f8',
       '#525252', '#ee5396', '#42be65', '#ffe97b', '#33b1ff', '#be95ff', '#ff7eb6', '#ffffff']),

    // Modern/popular themes
    theme('Cyberdream', 'High-contrast neon dark theme for terminal maximalists',
      ['#ffffff', '#16181a', '#16181a', '#ffffff',
       '#000000', '#ff6e5e', '#5eff6c', '#f1ff5e', '#5ea1ff', '#bd5eff', '#5ef1ff', '#ffffff',
       '#5eff6c', '#ff6e5e', '#5eff6c', '#f1ff5e', '#5ea1ff', '#bd5eff', '#5ef1ff', '#ffffff']),
    theme('Cobalt2', 'Bright and colorful theme inspired by Wes Bos',
      ['#ffffff', '#193549', '#ffffff', '#1f4662',
       '#000000', '#ff628c', '#3ad900', '#f9d71c', '#3476ff', '#ff9d00', '#80fcff', '#ffffff',
       '#808080', '#ff628c', '#3ad900', '#f9d71c', '#3476ff', '#ff9d00', '#80fcff', '#ffffff']),

    // IDE-inspired themes
    theme('VS Code Dark', 'Visual Studio Code default dark theme',
      ['#d4d4d4', '#1e1e1e', '#d4d4d4', '#264f78',
       '#000000', '#cd3131', '#0dbc79', '#e5e510', '#2472c8', '#bc3fbc', '#11a8cd', '#e5e5e5',
       '#666666', '#f14c4c', '#23d18b', '#f5f543', '#3b8eea', '#d670d6', '#29b8db', '#e5e5e5']),
    theme('VS Code Light', 'Visual Studio Code default light theme',
      ['#3b3b3b', '#ffffff', '#3b3b3b', '#add6ff',
       '#000000', '#c72c0c', '#357a38', '#bc5a01', '#0070c1', '#bc05bc', '#0374c2', '#000000',
       '#808080', '#c72c0c', '#357a38', '#bc5a01', '#0070c1', '#bc05bc', '#0374c2', '#000000']),
    theme('IntelliJ Dark', 'IntelliJ IDEA default dark theme',
      ['#bbbbbb', '#2b2b2b', '#bbbbbb', '#214283',
       '#000000', '#ff6b68', '#a9dc76', '#ffd866', '#78dce8', '#ab9df2', '#78dce8', '#f8f8f2',
       '#727072', '#ff6188', '#a9dc76', '#ffd866', '#fc9867', '#ab9df2', '#78dce8', '#f8f8f2']),
    theme('GitHub Dark', 'GitHub interface inspired dark theme',
      ['#c9d1d9', '#0d1117', '#0d1117', '#3b3b3b',
       '#24292f', '#ff7b72', '#7ee787', '#ffa657', '#79c0ff', '#d2a8ff', '#56d4dd', '#f0f6fc',
       '#8c959f', '#ff7b72', '#7ee787', '#ffa657', '#79c0ff', '#d2a8ff', '#56d4dd', '#f0f6fc']),
    theme('Monokai Classic', 'Classic Monokai theme',
      ['#f8f8f2', '#272822', '#f8f8f2', '#49483e',
       '#272822', '#f92672', '#a6e22e', '#f4bf75', '#66d9ef', '#ae81ff', '#a1efe4', '#f8f8f2',
       '#75715e', '#f92672', '#a6e22e', '#f4bf75', '#66d9ef', '#ae81ff', '#a1efe4', '#f9f8f5']),

    // Accessibility-focused themes
    theme('High Contrast Dark', 'Maximum contrast for accessibility',
      ['#ffffff', '#000000', '#000000', '#ffffff',
       '#000000', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff',
       '#808080', '#ff4444', '#44ff44', '#ffff44', '#4444ff', '#ff44ff', '#44ffff', '#ffffff']),
    theme('High Contrast Light', 'Maximum contrast for accessibility (light)',
      ['#000000', '#ffffff', '#ffffff', '#000000',
       '#ffffff', '#cc0000', '#008800', '#aa8800', '#0000cc', '#cc00cc', '#008888', '#000000',
       '#666666', '#cc0000', '#008800', '#aa8800', '#0000cc', '#cc00cc', '#008888', '#000000']),

    // Terminal default themes
    theme('Campbell', 'Windows Terminal default theme',
      ['#cccccc', '#0c0c0c', '#ffffff', '#0037da',
       '#0c0c0c', '#c50f1f', '#13a10e', '#c19c00', '#0037da', '#881798', '#3a96dd', '#cccccc',
       '#767676', '#e74856', '#16c60c', '#f9f1a5', '#3b78ff', '#b4009e', '#61d6d6', '#f2f2f2']),
    theme('Tango', 'Tango Desktop Project color palette',
      ['#eeeeec', '#2e3436', '#eeeeec', '#3465a4',
       '#2e3436', '#cc0000', '#4e9a06', '#c4a000', '#3465a4', '#75507b', '#06989a', '#d3d7cf',
       '#555753', '#ef2929', '#8ae234', '#fce94f', '#729fcf', '#ad7fa8', '#34e2e2', '#eeeeec']),
    theme('Ubuntu', 'Ubuntu Terminal default colors',
      ['#eeeeec', '#300a24', '#eeeeec', '#3465a4',
       '#2e3436', '#cc0000', '#4e9a06', '#c4a000', '#3465a4', '#75507b', '#06989a', '#d3d7cf',
       '#555753', '#ef2929', '#8ae234', '#fce94f', '#729fcf', '#ad7fa8', '#34e2e2', '#ffffff']),
    theme('Alacritty', 'Alacritty terminal default theme',
      ['#c5c8c6', '#1d1f21', '#1d1f21', '#373b41',
       '#000000', '#cc6666', '#b5bd68', '#f0c674', '#81a2be', '#b294bb', '#8abeb7', '#c5c8c6',
       '#969896', '#d54e53', '#b9ca4a', '#e7c547', '#7aa6da', '#c397d8', '#70c0b1', '#eaeaea']),
    theme('WezTerm', 'WezTerm terminal default theme',
      ['#c0c0c0', '#000000', '#000000', '#505050',
       '#000000', '#cc5555', '#55cc55', '#cdcd55', '#5455cb', '#cc55cc', '#7acaca', '#000000',
       '#555555', '#ff5555', '#55ff55', '#ffff55', '#5555ff', '#ff55ff', '#55ffff', '#ffffff']),
    theme('Windows PowerShell', 'PowerShell blue theme',
      ['#eeedf2', '#012456', '#ffffff', '#0037da',
       '#000000', '#c50f1f', '#13a10e', '#c19c00', '#0037da', '#881798', '#3a96dd', '#cccccc',
       '#767676', '#e74856', '#16c60c', '#f9f1a5', '#3b78ff', '#b4009e', '#61d6d6', '#f2f2f2']),
  ];

  // Custom user themes storage
  private readonly _customThemes = signal<ColorTheme[]>([]);

  getTheme(name: string): ColorTheme | undefined {
    return this.themes.find(t => t.name === name) ?? this._customThemes().find(t => t.name === name);
  }

  getAllThemes(): ColorTheme[] {
    return [...this.themes, ...this._customThemes()];
  }

  /**
   * Add a custom user theme
   */
  addCustomTheme(theme: ColorTheme): boolean {
    if (this.themes.some(t => t.name === theme.name)) {
      return false; // Cannot override built-in themes
    }
    this._customThemes.update(themes => [...themes.filter(t => t.name !== theme.name), theme]);
    return true;
  }

  /**
   * Remove a custom user theme
   */
  removeCustomTheme(name: string): boolean {
    this._customThemes.update(themes => themes.filter(t => t.name !== name));
    return true;
  }

  /**
   * Check if a theme is custom (user-created)
   */
  isCustomTheme(name: string): boolean {
    return this._customThemes().some(t => t.name === name);
  }

  /**
   * Get themes grouped by category
   */
  getThemesByCategory(): Record<string, ColorTheme[]> {
    const categories: Record<string, ColorTheme[]> = {
      'Popular': [],
      'Catppuccin': [],
      'Tokyo Night': [],
      'Gruvbox': [],
      'Rose Pine': [],
      'Everforest': [],
      'Kanagawa': [],
      'Solarized': [],
      'Ayu': [],
      'Material': [],
      'Nightfox': [],
      'Modern': [],
      'IDE-inspired': [],
      'Accessibility': [],
      'Terminal Defaults': [],
      'Custom': this._customThemes()
    };

    for (const theme of this.themes) {
      const name = theme.name.toLowerCase();

      if (name.includes('catppuccin')) {
        categories['Catppuccin']!.push(theme);
      } else if (name.includes('tokyo night')) {
        categories['Tokyo Night']!.push(theme);
      } else if (name.includes('gruvbox')) {
        categories['Gruvbox']!.push(theme);
      } else if (name.includes('rose pine')) {
        categories['Rose Pine']!.push(theme);
      } else if (name.includes('everforest')) {
        categories['Everforest']!.push(theme);
      } else if (name.includes('kanagawa')) {
        categories['Kanagawa']!.push(theme);
      } else if (name.includes('solarized')) {
        categories['Solarized']!.push(theme);
      } else if (name.includes('ayu')) {
        categories['Ayu']!.push(theme);
      } else if (name.includes('material')) {
        categories['Material']!.push(theme);
      } else if (name.includes('fox') || name.includes('carbonfox') || name.includes('terafox')) {
        categories['Nightfox']!.push(theme);
      } else if (['vs code', 'intellij', 'github', 'monokai classic'].some(n => name.includes(n.toLowerCase()))) {
        categories['IDE-inspired']!.push(theme);
      } else if (name.includes('high contrast')) {
        categories['Accessibility']!.push(theme);
      } else if (['campbell', 'tango', 'ubuntu', 'alacritty', 'wezterm', 'powershell'].some(n => name.includes(n))) {
        categories['Terminal Defaults']!.push(theme);
      } else if (['dracula', 'monokai pro', 'one dark', 'one light', 'nord', 'cobalt2', 'cyberdream'].includes(name)) {
        categories['Popular']!.push(theme);
      } else {
        categories['Modern']!.push(theme);
      }
    }

    // Remove empty categories
    return Object.fromEntries(Object.entries(categories).filter(([, themes]) => themes.length > 0));
  }
}
