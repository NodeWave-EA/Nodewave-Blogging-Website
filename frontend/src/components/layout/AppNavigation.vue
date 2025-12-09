<template>
  <div v-bind="$attrs">
    <!-- Desktop Navigation -->
    <div v-if="type === 'desktop'" class="hidden lg:flex lg:items-center lg:gap-2">
      <RouterLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        class="relative px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all duration-300 group"
        :class="{
          'text-blue-600 dark:text-blue-400': isCurrentRoute(item.href),
        }"
      >
        <span class="nav-text relative inline-block">
          <span class="block">{{ item.name }}</span>
          <!-- Gradient underline -->
          <span
            class="absolute left-0 bottom-0 h-0.5 w-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 rounded-full transition-all duration-300 group-hover:w-full"
            :class="isCurrentRoute(item.href) ? 'w-full' : ''"
          ></span>
        </span>
      </RouterLink>
    </div>

    <!-- Mobile Navigation -->
    <div
      v-else-if="type === 'mobile' && mobileMenuOpen"
      class="lg:hidden border-t border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg rounded-b-2xl bg-transparent"
    >
      <div class="px-4 py-4 space-y-2">
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          @click="$emit('closeMobileMenu')"
          class="block px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 rounded-lg transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5"
          :class="{
            'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20': isCurrentRoute(
              item.href,
            ),
          }"
        >
          {{ item.name }}
        </RouterLink>
      </div>
    </div>
  </div>
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

const _props = defineProps<Props>()

defineEmits<{
  closeMobileMenu: []
}>()

const route = useRoute()

const navigation: NavigationItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '/blog' },
  { name: 'Categories', href: '/categories' },
  { name: 'Authors', href: '/authors' },
  { name: 'Tags', href: '/tags' },
  { name: 'Contact', href: '/contact' },
]

const isCurrentRoute = (href: string): boolean => {
  if (href === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(href)
}
</script>

<style scoped>
/* Keep accessibility */
a:focus-visible {
  outline: 2px solid rgb(59 130 246);
  outline-offset: 2px;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  a {
    transition: none;
  }
}
</style>
