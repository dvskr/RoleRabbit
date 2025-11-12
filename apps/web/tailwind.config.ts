import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Theme-aware custom colors
        theme: {
          bg: 'var(--theme-background)',
          'card-bg': 'var(--theme-card-bg)',
          'input-bg': 'var(--theme-input-bg)',
          'hover-bg': 'var(--theme-hover-bg)',
          'hover-bg-strong': 'var(--theme-hover-bg-strong)',
          'primary-text': 'var(--theme-primary-text)',
          'secondary-text': 'var(--theme-secondary-text)',
          'tertiary-text': 'var(--theme-tertiary-text)',
          'border': 'var(--theme-border)',
          'border-focused': 'var(--theme-border-focused)',
          'primary-blue': 'var(--theme-primary-blue)',
          'primary-blue-hover': 'var(--theme-primary-blue-hover)',
          'error': 'var(--theme-error-red)',
          'success': 'var(--theme-success-green)',
          'warning': 'var(--theme-warning-yellow)',
          'badge-info-bg': 'var(--theme-badge-info-bg)',
          'badge-info-text': 'var(--theme-badge-info-text)',
          'badge-error-bg': 'var(--theme-badge-error-bg)',
          'badge-error-text': 'var(--theme-badge-error-text)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
