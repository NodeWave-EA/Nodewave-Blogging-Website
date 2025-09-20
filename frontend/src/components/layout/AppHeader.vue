<template>
  <!-- Header spacer to prevent content jump -->
  <div :class="[
    'transition-all duration-700',
    {
      'h-14 lg:h-16': isScrolled,
      'h-16 lg:h-20': !isScrolled,
    },
  ]"></div>

  <header ref="headerRef" :class="[
    'fixed left-2 right-2 lg:left-6 lg:right-6 z-50 transition-all duration-700 ease-out',
    'border border-black/10 dark:border-white/10 bg-transparent backdrop-blur-2xl',
    {
      'top-3 lg:top-6 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 ring-1 ring-black/5 dark:ring-white/5':
        isScrolled,
      'top-0 rounded-none shadow-sm backdrop-blur-xl':
        !isScrolled,
    },
  ]">
    <nav :class="[
      'max-w-7xl mx-auto transition-all duration-700',
      {
        'px-6 lg:px-8': isScrolled,
        'px-4 lg:px-6': !isScrolled,
      },
    ]">
      <div :class="[
        'flex justify-between items-center transition-all duration-700',
        {
          'h-14 lg:h-16 py-2': isScrolled,
          'h-16 lg:h-20 py-3': !isScrolled,
        },
      ]">
        <!-- Logo (Theme-aware, improved accessibility & style) -->
        <div class="flex-shrink-0 z-10">
          <RouterLink to="/" class="flex items-center gap-3 group relative" aria-label="Home">
            <div
              class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-2 pointer-events-none">
            </div>
            <img v-if="currentLogo" :src="currentLogo" :alt="companyName + ' logo'" :class="[
              'w-auto transition-all duration-300 group-hover:scale-105 relative z-10 drop-shadow-sm',
              {
                'h-7 lg:h-8': isScrolled,
                'h-8 lg:h-10': !isScrolled,
              },
            ]" :style="actualTheme === 'dark'
                  ? 'filter: drop-shadow(0 2px 8px rgba(0,0,0,0.25)) brightness(0.95)'
                  : 'filter: drop-shadow(0 2px 8px rgba(0,0,0,0.10))'
                " loading="lazy" decoding="async" />
            <span v-else class="logo-text" :class="[
              'font-bold font-heading bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-blue-500 relative z-10',
              {
                'text-lg lg:text-xl': isScrolled,
                'text-xl lg:text-2xl': !isScrolled,
              },
            ]">
              {{ companyName }}
            </span>
          </RouterLink>
        </div>

        <!-- Desktop Navigation -->
        <AppNavigation type="desktop" />

        <!-- Right side: Search, Theme Toggle, Mobile Menu -->
        <div class="flex items-center gap-1 lg:gap-2">
          <!-- Search Button -->
          <button @click="openSearch"
            class="p-3 rounded-xl bg-transparent text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 group"
            aria-label="Search">
            <MagnifyingGlassIcon class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          </button>

          <!-- Theme Toggle -->
          <div class="relative">
            <ThemeToggle />
          </div>

          <!-- Mobile menu button -->
          <button @click="toggleMobileMenu"
            class="lg:hidden p-3 rounded-xl bg-transparent text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 group"
            aria-label="Menu">
            <Bars3Icon v-if="!mobileMenuOpen" class="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            <XMarkIcon v-else class="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <AppNavigation type="mobile" :mobile-menu-open="mobileMenuOpen" @close-mobile-menu="mobileMenuOpen = false" />
    </nav>

    <!-- Search Modal -->
    <SearchModal v-if="searchOpen" @close="searchOpen = false" />
  </header>
</template>

<script setup lang="ts">
  import AppNavigation from '@/components/layout/AppNavigation.vue';
  import SearchModal from '@/components/ui/SearchModal.vue';
  import ThemeToggle from '@/components/ui/ThemeToggle.vue';
  import { useCompanyInfo } from '@/composables/useCompanyInfo';
  import { useTheme } from '@/composables/useTheme';
  import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline';
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import { RouterLink } from 'vue-router';

  const { logo, logoDark, companyName } = useCompanyInfo()
  const { actualTheme } = useTheme()

  const mobileMenuOpen = ref(false)
  const searchOpen = ref(false)

  // Scroll state for floating navigation
  const isScrolled = ref(false)

  // Current logo based on theme
  const currentLogo = computed(() => {
    if (actualTheme.value === 'dark') {
      return logoDark.value || logo.value
    }
    return logo.value
  })

  // Open search modal
  const openSearch = () => {
    searchOpen.value = true
  }

  // Handle scroll detection for floating navigation
  const handleScroll = () => {
    const currentScrollY = window.scrollY

    // Set scrolled state for floating styling
    isScrolled.value = currentScrollY > 50
  }

  // Close mobile menu on route change

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  // Close mobile menu on Escape key
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      mobileMenuOpen.value = false
      searchOpen.value = false
    }
  }

  // Close mobile menu when clicking outside
  const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement
    if (mobileMenuOpen.value && !target.closest('nav')) {
      mobileMenuOpen.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('scroll', handleScroll)
  })
</script>

<style scoped>

  /* Logo text gradient animation on hover */
  .logo-text:hover {
    background-size: 200% 200%;
    animation: gradient-shift 2s ease-in-out infinite;
  }

  @keyframes gradient-shift {

    0%,
    100% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {

    .logo-text,
    header,
    nav,
    div,
    button {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
