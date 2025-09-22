<template>
  <footer class="border-t border-border/20 bg-transparent backdrop-blur-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <p class="text-sm text-muted-foreground">&copy; {{ currentYear }} {{ companyName }}. All rights reserved.</p>
        <div class="flex flex-wrap justify-center md:justify-end items-center space-x-6 text-sm">
          <RouterLink to="/privacy" class="text-muted-foreground hover:text-primary transition-colors duration-200">
            Privacy Policy
          </RouterLink>
          <RouterLink to="/terms" class="text-muted-foreground hover:text-primary transition-colors duration-200">
            Terms of Service
          </RouterLink>
          <a :href="rssUrl" class="text-muted-foreground hover:text-primary transition-colors duration-200"
            target="_blank" rel="noopener noreferrer">
            RSS Feed
          </a>
        </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import { useBlogData } from '@/composables/useBlogData';
  import { useCompanyInfo } from '@/composables/useCompanyInfo';
  import { useTheme } from '@/composables/useTheme';
  import {
    AtSymbolIcon,
    LinkIcon,
    // Social media icons from Heroicons
    ShareIcon,
  } from '@heroicons/vue/24/outline';
  import { computed, onMounted } from 'vue';
  import { RouterLink } from 'vue-router';

  const { logo, logoDark, companyName, siteDescription, socialLinks } = useCompanyInfo()
  const { actualTheme } = useTheme()
  const { categories, fetchCategories } = useBlogData()

  const currentYear = new Date().getFullYear()

  // Current logo based on theme
  const currentLogo = computed(() => {
    if (actualTheme.value === 'dark') {
      return logoDark.value || logo.value
    }
    return logo.value
  })



  // Top categories (limit to 5)

  // RSS feed URL
  const rssUrl = computed(() => {
    return `${import.meta.env.VITE_API_URL}/rss`
  })

  // Get social media icon component
  const getSocialIcon = (platform: string) => {
    const icons: Record<string, any> = {
      twitter: ShareIcon,
      linkedin: LinkIcon,
      facebook: ShareIcon,
      instagram: ShareIcon,
      github: ShareIcon,
      youtube: ShareIcon,
      default: AtSymbolIcon,
    }

    return icons[platform.toLowerCase()] || icons.default
  }

  onMounted(async () => {
    // Fetch categories for footer
    await fetchCategories({ limit: 10 })
  })
</script>
