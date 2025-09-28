import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'
import aspectRatio from '@tailwindcss/aspect-ratio'

const config: Config = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"IBM Plex Mono"',
          '"Source Code Pro"',
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
        mono: [
          '"IBM Plex Mono"',
          '"Source Code Pro"',
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      colors: {
        // Custom color palette using CSS variables for theme switching
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--color-muted-foreground) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        input: 'rgb(var(--color-input) / <alpha-value>)',
        ring: 'rgb(var(--color-ring) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--color-card-foreground) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-foreground': 'rgb(var(--color-primary-foreground) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        'secondary-foreground': 'rgb(var(--color-secondary-foreground) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-foreground': 'rgb(var(--color-accent-foreground) / <alpha-value>)',
        destructive: 'rgb(var(--color-destructive) / <alpha-value>)',
        'destructive-foreground': 'rgb(var(--color-destructive-foreground) / <alpha-value>)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        progress: 'progress 1s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'rgb(var(--color-foreground))',
            a: {
              color: 'rgb(var(--color-primary))',
              textDecoration: 'underline',
              fontWeight: '500',
              '&:hover': {
                color: 'rgb(var(--color-primary) / 0.8)',
              },
            },
            h1: {
              color: 'rgb(var(--color-foreground))',
              fontFamily: '"IBM Plex Mono", monospace',
              fontWeight: '700',
            },
            h2: {
              color: 'rgb(var(--color-foreground))',
              fontFamily: '"IBM Plex Mono", monospace',
              fontWeight: '600',
            },
            h3: {
              color: 'rgb(var(--color-foreground))',
              fontFamily: '"IBM Plex Mono", monospace',
              fontWeight: '600',
            },
            h4: {
              color: 'rgb(var(--color-foreground))',
              fontFamily: '"IBM Plex Mono", monospace',
              fontWeight: '500',
            },
            strong: {
              color: 'rgb(var(--color-foreground))',
              fontWeight: '600',
            },
            code: {
              color: 'rgb(var(--color-foreground))',
              backgroundColor: 'rgb(var(--color-muted))',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontSize: '0.85em',
              fontWeight: '500',
            },
            pre: {
              backgroundColor: 'rgb(var(--color-card))',
              border: '1px solid rgb(var(--color-border))',
            },
            blockquote: {
              borderLeftColor: 'rgb(var(--color-border))',
              color: 'rgb(var(--color-muted-foreground))',
            },
            hr: {
              borderColor: 'rgb(var(--color-border))',
            },
            table: {
              borderColor: 'rgb(var(--color-border))',
            },
            th: {
              color: 'rgb(var(--color-foreground))',
              borderBottomColor: 'rgb(var(--color-border))',
            },
            td: {
              borderBottomColor: 'rgb(var(--color-border))',
            },
          },
        },
      },
    },
  },
  plugins: [
    typography,
    forms,
    aspectRatio,
  ],
}

export default config
