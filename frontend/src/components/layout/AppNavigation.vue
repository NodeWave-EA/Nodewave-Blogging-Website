<template>
  <!-- Desktop Navigation -->
  <div v-if="type === 'desktop'" class="hidden lg:flex lg:items-center lg:gap-1">
    <RouterLink v-for="item in navigation" :key="item.name" :to="item.href"
      class="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all duration-200"
      :class="{ 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20': isCurrentRoute(item.href) }">
      {{ item.name }}
    </RouterLink>
  </div>

  <!-- Mobile Navigation -->
  <Transition v-if="type === 'mobile'" enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform -translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-2 opacity-0">
    <div v-if="mobileMenuOpen" class="lg:hidden border-t border-black/10 dark:border-white/10 bg-transparent">
      <div class="px-4 py-4 space-y-2">
        <RouterLink v-for="item in navigation" :key="item.name" :to="item.href" @click="$emit('closeMobileMenu')"
          class="block px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all duration-200"
          :class="{ 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20': isCurrentRoute(item.href) }">
          {{ item.name }}
        </RouterLink>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { RouterLink, useRoute } from 'vue-router'

  interface NavigationItem {
    name: string
    href: string
  }

  interface Props {
    type: 'desktop' | 'mobile'
    mobileMenuOpen?: boolean
  }

  const props = defineProps<Props>()

  defineEmits<{
    closeMobileMenu: []
  }>()

  const route = useRoute()

  // Navigation items - now includes Tags
  const navigation: NavigationItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Categories', href: '/categories' },
    { name: 'Authors', href: '/authors' },
    { name: 'Tags', href: '/tags' },
    { name: 'Contact', href: '/contact' },
  ]

  // Check if current route matches navigation item
  const isCurrentRoute = (href: string): boolean => {
    if (href === '/') {
      return route.path === '/'
    }
    return route.path.startsWith(href)
  }
</script>

<style scoped>

  /* Focus styles for accessibility */
  a:focus-visible {
    outline: 2px solid rgb(59 130 246);
    outline-offset: 2px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    a {
      transition: none;
    }
  }
</style>
