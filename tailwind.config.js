/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'kitty-dark':          'rgb(var(--kitty-dark) / <alpha-value>)',
        'kitty-darker':        'rgb(var(--kitty-deeper) / <alpha-value>)',
        'kitty-bg':            'rgb(var(--kitty-bg) / <alpha-value>)',
        'kitty-surface':       'rgb(var(--kitty-surface) / <alpha-value>)',
        'kitty-surface-light': 'rgb(var(--kitty-surface-light) / <alpha-value>)',
        'kitty-primary':       'rgb(var(--kitty-primary) / <alpha-value>)',
        'kitty-primary-dim':   'rgb(var(--kitty-primary-dim) / <alpha-value>)',
        'kitty-primary-hover': 'rgb(var(--kitty-primary-hover) / <alpha-value>)',
        'kitty-secondary':     'rgb(var(--kitty-secondary) / <alpha-value>)',
        'kitty-accent':        'rgb(var(--kitty-accent) / <alpha-value>)',
        'kitty-accent-dim':    'rgb(var(--kitty-accent-dim) / <alpha-value>)',
        'kitty-warning':       'rgb(var(--kitty-warning) / <alpha-value>)',
        'kitty-text':          'rgb(var(--kitty-text) / <alpha-value>)',
        'kitty-text-dim':      'rgb(var(--kitty-text-dim) / <alpha-value>)',
        'kitty-border':        'rgb(var(--kitty-border) / <alpha-value>)',
        'kitty-border-light':  'rgb(var(--kitty-border-light) / <alpha-value>)',
      }
    },
  },
  plugins: [],
}
