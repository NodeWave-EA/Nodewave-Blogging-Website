/**
 * Modern Theme Configuration for TailwindCSS v4
 *
 * This file centralizes all theming configurations using modern design patterns.
 * All styling follows TailwindCSS v4 conventions with zinc/slate/neutral colors.
 */

import type { BackgroundConfig } from '@/components/ui/Background.vue'

// Page-specific background configurations using modern design system
export const pageBackgroundConfigs: Record<string, Partial<BackgroundConfig>> = {
  // Home page with primary gradient for brand presence
  home: {
    style: 'gradient',
    variant: 'primary',
    intensity: 'normal',
    texture: true,
    grid: false,
    animated: true,
  },

  // Blog listing with neutral background and subtle grid
  blog: {
    style: 'gradient',
    variant: 'neutral',
    intensity: 'subtle',
    texture: true,
    grid: true,
    animated: true,
  },

  // Individual blog post with minimal distraction
  post: {
    style: 'minimal',
    variant: 'neutral',
    intensity: 'subtle',
    texture: true,
    grid: false,
    animated: false,
  },

  // About page with warm, welcoming feel
  about: {
    style: 'gradient',
    variant: 'warm',
    intensity: 'normal',
    texture: true,
    grid: false,
    animated: true,
  },

  // Contact page with cool, professional feel
  contact: {
    style: 'gradient',
    variant: 'cool',
    intensity: 'normal',
    texture: true,
    grid: false,
    animated: true,
  },

  // Author pages with secondary branding
  author: {
    style: 'gradient',
    variant: 'secondary',
    intensity: 'subtle',
    texture: true,
    grid: false,
    animated: true,
  },

  // Category pages with neutral background and grid
  category: {
    style: 'gradient',
    variant: 'neutral',
    intensity: 'subtle',
    texture: true,
    grid: true,
    animated: true,
  },

  // Default fallback - minimal and clean
  default: {
    style: 'minimal',
    variant: 'neutral',
    intensity: 'subtle',
    texture: true,
    grid: false,
    animated: false,
  },
}

// Global theme settings using modern design principles
export const globalThemeConfig = {
  // Typography scale (TailwindCSS v4 recommended)
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      heading: ['Poppins', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },
    scale: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
      '6xl': '3.75rem', // 60px
    },
  },

  // Color system using modern TailwindCSS v4 patterns
  colors: {
    // Modern neutral palette
    background: {
      light: '#ffffff',
      dark: '#0f0f10',
    },
    foreground: {
      light: '#0f0f10',
      dark: '#ffffff',
    },
    muted: {
      light: '#f5f5f6',
      dark: '#1a1a1b',
    },
    border: {
      light: '#e4e4e7',
      dark: '#27272a',
    },
    // Primary brand colors
    primary: {
      light: '#2563eb',
      dark: '#60a5fa',
    },
    // Surface colors for cards, modals, etc.
    surface: {
      light: 'rgba(255, 255, 255, 0.95)',
      dark: 'rgba(15, 15, 16, 0.95)',
    },
  },

  // Spacing system following 8px grid
  spacing: {
    xs: '0.5rem', // 8px
    sm: '0.75rem', // 12px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
    '4xl': '6rem', // 96px
    '5xl': '8rem', // 128px
  },

  // Border radius scale
  borderRadius: {
    none: '0',
    sm: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadow system
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },

  // Animation settings
  animations: {
    // Smooth transitions
    transition: {
      fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    // Spring animations for delightful interactions
    spring: {
      fast: '200ms cubic-bezier(0.16, 1, 0.3, 1)',
      normal: '400ms cubic-bezier(0.16, 1, 0.3, 1)',
      slow: '600ms cubic-bezier(0.16, 1, 0.3, 1)',
    },
  },

  // Component design tokens
  components: {
    button: {
      height: {
        sm: '2rem', // 32px
        md: '2.5rem', // 40px
        lg: '3rem', // 48px
      },
      padding: {
        sm: '0.5rem 0.75rem',
        md: '0.75rem 1rem',
        lg: '1rem 1.5rem',
      },
      fontSize: {
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
      },
    },
    card: {
      padding: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      },
      borderRadius: '0.75rem',
      shadow: 'var(--shadow-sm)',
    },
    input: {
      height: '2.5rem',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
    },
  },
}

// Breakpoint system following TailwindCSS v4 conventions
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Z-index scale for consistent layering
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  toast: 70,
}

/**
 * Utility function to get background config for a specific page
 */
export function getPageBackgroundConfig(pageName: string): Partial<BackgroundConfig> {
  return pageBackgroundConfigs[pageName] || pageBackgroundConfigs.default
}

/**
 * Utility function to create custom background config
 */
export function createCustomBackgroundConfig(
  overrides: Partial<BackgroundConfig>,
): Partial<BackgroundConfig> {
  return {
    ...pageBackgroundConfigs.default,
    ...overrides,
  }
}

/**
 * Get responsive container classes
 */
export function getContainerClasses(): string {
  return 'mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl'
}

/**
 * Get responsive spacing classes
 */
export function getSpacingClasses(size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string {
  const spacingMap = {
    sm: 'space-y-4 sm:space-y-6',
    md: 'space-y-6 sm:space-y-8 lg:space-y-12',
    lg: 'space-y-8 sm:space-y-12 lg:space-y-16',
    xl: 'space-y-12 sm:space-y-16 lg:space-y-20',
  }
  return spacingMap[size]
}

/**
 * Get button classes based on variant and size
 */
export function getButtonClasses(
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md',
): string {
  const baseClasses =
    'btn inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  }

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }

  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`
}

/**
 * Get card classes with consistent styling
 */
export function getCardClasses(variant: 'default' | 'elevated' | 'outlined' = 'default'): string {
  const baseClasses = 'card rounded-xl transition-all duration-200'

  const variantClasses = {
    default: 'border border-zinc-200 dark:border-zinc-800 shadow-sm',
    elevated: 'border-0 shadow-lg dark:shadow-zinc-900/20',
    outlined: 'border-2 border-zinc-200 dark:border-zinc-800 shadow-none',
  }

  return `${baseClasses} ${variantClasses[variant]}`
}
