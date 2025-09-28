<template>
  <div class="relative theme-toggle">
    <!-- Simple Toggle Button -->
    <button
      v-if="variant === 'simple'"
      @click="toggleTheme"
      class="group relative p-2.5 rounded-xl bg-transparent hover:bg-muted/50 border border-border/20 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background hover:scale-105 hover:shadow-md"
      :title="themeButtonTitle"
      :aria-label="themeButtonTitle"
    >
      <!-- Light Mode Icon (Sun) -->
      <SunIcon
        v-if="theme === 'dark' || (theme === 'system' && prefersDarkScheme)"
        class="w-5 h-5 text-amber-500 transition-all duration-300 hover:text-amber-400 group-hover:rotate-12 group-hover:scale-110"
      />
      <!-- Dark Mode Icon (Moon) -->
      <MoonIcon
        v-else-if="theme === 'light' || (theme === 'system' && !prefersDarkScheme)"
        class="w-5 h-5 text-muted-foreground transition-all duration-300 hover:text-foreground group-hover:-rotate-12 group-hover:scale-110"
      />
      <!-- System Mode Icon (Computer) -->
      <ComputerDesktopIcon
        v-else
        class="w-5 h-5 text-muted-foreground transition-all duration-300 hover:text-foreground group-hover:scale-110"
      />

      <!-- Animated background circle -->
      <div
        class="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
    </button>

    <!-- Dropdown Toggle Button -->
    <button
      v-else
      @click="isDropdownOpen = !isDropdownOpen"
      class="group relative p-2.5 rounded-xl bg-card/80 hover:bg-card border border-border/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
      :title="`Current theme: ${getThemeDisplayName(theme)}`"
      :aria-label="`Current theme: ${getThemeDisplayName(theme)}. Click to see options.`"
      aria-haspopup="true"
      :aria-expanded="isDropdownOpen"
    >
      <div class="flex items-center gap-2">
        <!-- Current Theme Icon -->
        <SunIcon
          v-if="theme === 'light'"
          class="w-5 h-5 text-amber-500 transition-all duration-300 group-hover:rotate-12"
        />
        <MoonIcon
          v-else-if="theme === 'dark'"
          class="w-5 h-5 text-muted-foreground transition-all duration-300 group-hover:-rotate-12"
        />
        <ComputerDesktopIcon v-else class="w-5 h-5 text-muted-foreground" />

        <!-- Dropdown Arrow -->
        <ChevronDownIcon
          class="w-3 h-3 text-muted-foreground transition-all duration-300"
          :class="{ 'rotate-180': isDropdownOpen }"
        />
      </div>

      <!-- Animated background circle -->
      <div
        class="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-1"
    >
      <div
        v-if="isDropdownOpen && variant === 'dropdown'"
        class="absolute right-0 top-full mt-2 w-64 bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 py-2 z-50 overflow-hidden"
        @click.stop
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-border/20">
          <h3 class="text-sm font-semibold font-mono text-foreground">Theme Preference</h3>
          <p class="text-xs text-muted-foreground mt-1">Choose how the interface looks</p>
        </div>

        <!-- Theme Options -->
        <div class="py-2">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            @click="selectTheme(option.value)"
            class="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-all duration-200 group relative"
            :class="{
              'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400':
                theme === option.value,
            }"
          >
            <!-- Icon -->
            <div
              class="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-all duration-200"
              :class="{
                'bg-primary-100 dark:bg-primary-900/30': theme === option.value,
              }"
            >
              <component
                :is="getThemeIcon(option.value)"
                class="w-4 h-4 transition-all duration-200"
                :class="{
                  'text-primary-600 dark:text-primary-400': theme === option.value,
                  'text-zinc-600 dark:text-zinc-400': theme !== option.value,
                }"
              />
            </div>

            <!-- Content -->
            <div class="flex-grow min-w-0">
              <div
                class="font-medium text-sm text-zinc-900 dark:text-zinc-100 transition-colors duration-200"
              >
                {{ option.label }}
              </div>
              <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {{ option.description }}
              </div>
            </div>

            <!-- Check Icon -->
            <CheckIcon
              v-if="theme === option.value"
              class="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 transition-all duration-200"
            />

            <!-- Hover indicator -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
            />
          </button>
        </div>

        <!-- System Preference Indicator -->
        <div
          v-if="theme === 'system'"
          class="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50"
        >
          <div class="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <div
              class="w-2 h-2 rounded-full transition-all duration-300"
              :class="prefersDarkScheme ? 'bg-slate-600 dark:bg-slate-400' : 'bg-amber-500'"
            />
            <span>System is currently {{ prefersDarkScheme ? 'dark' : 'light' }} mode</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { ThemeMode } from '@/composables/useTheme'
import { useTheme } from '@/composables/useTheme'
import {
  CheckIcon,
  ChevronDownIcon,
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/vue/24/outline'
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Props {
  variant?: 'simple' | 'dropdown'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'simple',
})

const { theme, setTheme, toggleTheme, prefersDarkScheme, getThemeDisplayName, getThemeIcon } =
  useTheme()
const isDropdownOpen = ref(false)

const themeButtonTitle = computed(() => {
  switch (theme.value) {
    case 'light':
      return props.variant === 'simple' ? 'Switch to dark mode' : 'Light mode active'
    case 'dark':
      return props.variant === 'simple' ? 'Switch to system mode' : 'Dark mode active'
    case 'system':
      return props.variant === 'simple' ? 'Switch to light mode' : 'System mode active'
    default:
      return 'Toggle theme'
  }
})

const themeOptions = computed(() => [
  {
    value: 'light' as ThemeMode,
    label: 'Light',
    description: 'Clean and bright interface',
  },
  {
    value: 'dark' as ThemeMode,
    label: 'Dark',
    description: 'Easy on the eyes in low light',
  },
  {
    value: 'system' as ThemeMode,
    label: 'System',
    description: 'Adapts to your system setting',
  },
])

const selectTheme = (newTheme: ThemeMode) => {
  setTheme(newTheme)
  isDropdownOpen.value = false

  // Add a small haptic feedback (if supported)
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.theme-toggle')) {
    isDropdownOpen.value = false
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isDropdownOpen.value) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  if (props.variant === 'dropdown') {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
/* Custom animation for theme icons with spring physics */
@media (prefers-reduced-motion: no-preference) {
  .theme-toggle button svg {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .theme-toggle button:hover svg {
    transform-origin: center;
  }
}

/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .theme-toggle *,
  .theme-toggle *::before,
  .theme-toggle *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Enhanced focus styles for better accessibility */
.theme-toggle button:focus-visible {
  box-shadow:
    0 0 0 2px rgb(59 130 246 / 0.5),
    0 0 0 4px rgb(59 130 246 / 0.1);
}

/* Backdrop blur fallback for older browsers */
@supports not (backdrop-filter: blur(1px)) {
  .theme-toggle button,
  .theme-toggle > div > div {
    background-color: rgb(255 255 255);
  }

  .dark .theme-toggle button,
  .dark .theme-toggle > div > div {
    background-color: rgb(24 24 27);
  }
}
</style>
