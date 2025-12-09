<template>
  <footer class="border-t border-border/20 bg-transparent backdrop-blur-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <p class="text-sm text-muted-foreground">
        &copy; {{ currentYear }} {{ companyName }}. All rights reserved.
      </p>
      <div class="flex flex-wrap justify-center md:justify-end items-center space-x-6 text-sm">
        <RouterLink
          to="/privacy"
          class="text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          Privacy Policy
        </RouterLink>
        <RouterLink
          to="/terms"
          class="text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          Terms of Service
        </RouterLink>
        <a
          :href="rssUrl"
          class="text-muted-foreground hover:text-primary transition-colors duration-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          RSS Feed
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useBlogData } from '@/composables/useBlogData'
import { useCompanyInfo } from '@/composables/useCompanyInfo'
import { useTheme } from '@/composables/useTheme'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const { companyName } = useCompanyInfo()
const { _actualTheme } = useTheme()
const { _fetchCategories } = useBlogData()

const currentYear = new Date().getFullYear()

// RSS feed URL
const rssUrl = computed(() => {
  return `${import.meta.env.VITE_API_URL}/rss`
})
</script>
