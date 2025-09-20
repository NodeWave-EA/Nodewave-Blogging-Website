<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useCompanyInfo } from '@/composables/useCompanyInfo'

// Layout Components
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import BackToTop from '@/components/ui/BackToTop.vue'
import NewsletterPopup from '@/components/ui/NewsletterPopup.vue'
import Background from '@/components/ui/Background.vue'

// Theme & Company Info
const { initializeTheme } = useTheme()
const { companyInfo, fetchCompanyInfo } = useCompanyInfo()

// Route-based background logic
const route = useRoute()
const currentPage = computed(() => {
  if (route.name) {
    return String(route.name).toLowerCase()
  }
  const path = route.path.slice(1)
  if (!path) return 'home'
  if (path.startsWith('blog/') && path !== 'blog') {
    return 'post'
  }
  return path.split('/')[0] || 'home'
})

// Newsletter popup
const showNewsletterPopup = ref(false)
let newsletterTimer: NodeJS.Timeout | null = null

onMounted(async () => {
  // Initialize theme
  initializeTheme()

  // Fetch company info
  await fetchCompanyInfo()

  // Show newsletter popup after 30s (if enabled)
  if (companyInfo.value?.newsletter_enabled) {
    newsletterTimer = setTimeout(() => {
      const hasSeenPopup = localStorage.getItem('newsletter-popup-seen')
      if (!hasSeenPopup) {
        showNewsletterPopup.value = true
        localStorage.setItem('newsletter-popup-seen', 'true')
      }
    }, 30000)
  }
})

onUnmounted(() => {
  if (newsletterTimer) {
    clearTimeout(newsletterTimer)
  }
})
</script>

<template>
  <div id="app" class="min-h-screen flex flex-col relative">
    <!-- Centralized Background - Applied site-wide -->
    <Background :page="currentPage" />

    <!-- Header with transparent background -->
    <AppHeader />

    <!-- Main content (router pages) - All pages inherit transparent backgrounds -->
    <main class="flex-1 relative z-10">
      <RouterView />
    </main>

    <!-- Footer with transparent background -->
    <AppFooter />

    <!-- UI Components -->
    <BackToTop />

    <!-- Newsletter Popup -->
    <NewsletterPopup v-if="showNewsletterPopup" @close="showNewsletterPopup = false" />
  </div>
</template>

<style scoped>
/* App-specific styles */
#app {
  font-family: Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
}

/* Ensure smooth transitions for the entire app */
#app * {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  #app * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  #app {
    filter: contrast(1.2);
  }
}

/* Print styles */
@media print {
  #app {
    background: white !important;
  }

  /* Hide interactive elements during print */
  .no-print {
    display: none !important;
  }
}
</style>
