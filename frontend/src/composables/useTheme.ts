import { ref, computed } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

// Global theme state - singleton pattern
const globalTheme = ref<ThemeMode>('system')
const isDark = ref(false)
const systemTheme = ref<'light' | 'dark'>('light')
let mediaQuery: MediaQueryList | null = null

export function useTheme() {
  // Computed properties
  const actualTheme = computed(() => {
    if (globalTheme.value === 'system') {
      return systemTheme.value
    }
    return globalTheme.value
  })

  const prefersDarkScheme = computed(() => {
    return systemTheme.value === 'dark'
  })

  const initTheme = () => {
    // Get theme from localStorage or default to 'system'
    const stored = localStorage.getItem('theme') as ThemeMode
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      globalTheme.value = stored
    } else {
      globalTheme.value = 'system'
    }

    // Initialize system theme detection
    updateSystemTheme()
    updateTheme()

    // Set up media query listener
    if (!mediaQuery) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    }
  }

  const updateSystemTheme = () => {
    if (typeof window !== 'undefined') {
      systemTheme.value = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
  }

  const updateTheme = () => {
    if (typeof document === 'undefined') return

    const root = document.documentElement

    // Determine if dark mode should be active
    let shouldBeDark = false

    if (globalTheme.value === 'system') {
      shouldBeDark = systemTheme.value === 'dark'
    } else {
      shouldBeDark = globalTheme.value === 'dark'
    }

    isDark.value = shouldBeDark

    // Apply theme to document
    if (shouldBeDark) {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }

    // Update meta theme-color for mobile browsers
    updateMetaThemeColor(shouldBeDark)

    // Emit custom event for other components
    window.dispatchEvent(
      new CustomEvent('themeChanged', {
        detail: {
          theme: globalTheme.value,
          actualTheme: shouldBeDark ? 'dark' : 'light',
        },
      }),
    )
  }

  const updateMetaThemeColor = (isDark: boolean) => {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')

    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(metaThemeColor)
    }

    // Use appropriate colors for light/dark modes
    const lightColor = '#ffffff'
    const darkColor = '#0f172a'

    metaThemeColor.setAttribute('content', isDark ? darkColor : lightColor)
  }

  const setTheme = (newTheme: ThemeMode) => {
    globalTheme.value = newTheme
    localStorage.setItem('theme', newTheme)
    updateTheme()

    // Add haptic feedback if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  const toggleTheme = () => {
    // Cycle: system -> light -> dark -> system
    if (globalTheme.value === 'system') {
      setTheme('light')
    } else if (globalTheme.value === 'light') {
      setTheme('dark')
    } else {
      setTheme('system')
    }
  }

  const cycleTheme = () => {
    toggleTheme()
  }

  // Handle system theme changes
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    systemTheme.value = e.matches ? 'dark' : 'light'

    // Only update theme if currently using system preference
    if (globalTheme.value === 'system') {
      updateTheme()
    }
  }

  // Utility functions
  const getThemeDisplayName = (themeMode: ThemeMode): string => {
    const names = {
      system: 'System',
      light: 'Light',
      dark: 'Dark',
    }
    return names[themeMode]
  }

  const getThemeIcon = (themeMode: ThemeMode): string => {
    const icons = {
      system: 'computer-desktop',
      light: 'sun',
      dark: 'moon',
    }
    return icons[themeMode]
  }

  const isSystemDark = computed(() => {
    return systemTheme.value === 'dark'
  })

  // Theme options for dropdowns/selects
  const themeOptions = computed(() => [
    {
      value: 'system' as ThemeMode,
      label: 'System',
      description: 'Follow system preference',
      icon: 'computer-desktop',
    },
    {
      value: 'light' as ThemeMode,
      label: 'Light',
      description: 'Always use light mode',
      icon: 'sun',
    },
    {
      value: 'dark' as ThemeMode,
      label: 'Dark',
      description: 'Always use dark mode',
      icon: 'moon',
    },
  ])

  // Initialize theme if not already done
  if (typeof window !== 'undefined' && !mediaQuery) {
    initTheme()
  }

  return {
    // State
    theme: globalTheme,
    actualTheme,
    systemTheme: computed(() => systemTheme.value),
    isDark: computed(() => isDark.value),
    prefersDarkScheme,
    isSystemDark,

    // Actions
    setTheme,
    toggleTheme,
    cycleTheme,
    initTheme,

    // Utilities
    getThemeDisplayName,
    getThemeIcon,
    themeOptions,

    // For backwards compatibility
    initializeTheme: initTheme,
  }
}

// Export a function to clean up theme listeners (useful for SSR)
export function cleanupTheme() {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
    mediaQuery = null
  }
}

// Helper function for system theme detection
function handleSystemThemeChange(e: MediaQueryListEvent) {
  systemTheme.value = e.matches ? 'dark' : 'light'

  // Only update theme if currently using system preference
  if (globalTheme.value === 'system') {
    const root = document.documentElement
    isDark.value = e.matches

    if (e.matches) {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }

    // Update meta theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', e.matches ? '#0f172a' : '#ffffff')
    }

    // Emit theme change event
    window.dispatchEvent(
      new CustomEvent('themeChanged', {
        detail: {
          theme: 'system',
          actualTheme: e.matches ? 'dark' : 'light',
        },
      }),
    )
  }
}

// Auto-initialize theme on module load (for browser environments)
if (typeof window !== 'undefined') {
  // Use a small delay to ensure DOM is ready
  setTimeout(() => {
    const { initTheme } = useTheme()
    initTheme()
  }, 0)
}
