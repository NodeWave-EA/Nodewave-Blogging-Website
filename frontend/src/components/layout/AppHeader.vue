<template>
  <!-- Spacer -->
  <div :class="[
    'transition-all duration-500',
    isScrolled ? 'h-14 lg:h-16' : 'h-16 lg:h-20',
  ]"></div>

  <header ref="headerRef" :class="[
    'fixed left-3 right-3 lg:left-6 lg:right-6 z-50 transition-all duration-500 border border-border/20',
    'backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70',
    isScrolled
      ? 'top-3 lg:top-6 rounded-2xl shadow-xl ring-1 ring-border/10'
      : 'top-0 rounded-none shadow-sm',
  ]">
    <nav :class="[
      'max-w-7xl mx-auto flex flex-col',
      isScrolled ? 'px-6 lg:px-8' : 'px-4 lg:px-6',
    ]">
      <!-- Top Row -->
      <div :class="[
        'flex justify-between items-center w-full',
        isScrolled ? 'h-14 lg:h-16 py-2' : 'h-16 lg:h-20 py-3',
      ]">
        <!-- Logo -->
        <div class="flex-shrink-0 z-10">
          <RouterLink to="/" class="flex items-center gap-3 group relative" aria-label="Home">
            <img v-if="currentLogo" :src="currentLogo" :alt="companyName + ' logo'" :class="[
              'w-auto transition-transform duration-300 group-hover:scale-105 drop-shadow-sm',
              isScrolled ? 'h-7 lg:h-8' : 'h-8 lg:h-10',
            ]" loading="lazy" decoding="async" />
            <span v-else :class="[
              'font-bold font-mono bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent',
              'transition-all duration-300',
              isScrolled ? 'text-lg lg:text-xl' : 'text-xl lg:text-2xl',
            ]">
              {{ companyName }}
            </span>
          </RouterLink>
        </div>

        <!-- Desktop Nav -->
        <div class="hidden lg:flex flex-1 justify-center">
          <AppNavigation type="desktop" />
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 lg:gap-2">
          <!-- Search -->
          <button @click="openSearch"
            class="p-2.5 lg:p-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 group"
            aria-label="Search">
            <MagnifyingGlassIcon class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          </button>

          <!-- Theme Toggle -->
          <ThemeToggle />

          <!-- Mobile Menu -->
          <button @click="toggleMobileMenu"
            class="lg:hidden p-2.5 lg:p-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 group"
            aria-label="Menu">
            <Bars3Icon v-if="!mobileMenuOpen" class="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            <XMarkIcon v-else class="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>
      </div>

      <!-- Mobile Nav -->
      <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
        <AppNavigation v-if="mobileMenuOpen" type="mobile" :mobile-menu-open="mobileMenuOpen"
          @close-mobile-menu="mobileMenuOpen = false" class="lg:hidden" />
      </transition>
    </nav>

    <!-- Search Modal -->
    <SearchModal v-if="searchOpen" @close="searchOpen = false" />
  </header>
</template>

<script setup lang="ts">
  import AppNavigation from '@/components/layout/AppNavigation.vue';
  import SearchModal from '@/components/ui/SearchModal.vue';
  import ThemeToggle from '@/components/layout/ThemeToggle.vue';
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
