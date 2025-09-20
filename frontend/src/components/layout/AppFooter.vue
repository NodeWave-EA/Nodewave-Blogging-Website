<template>
  <footer class="border-t border-black/10 dark:border-white/10 bg-transparent backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        <!-- Company Info -->
        <div class="lg:col-span-1">
          <div class="flex items-center space-x-2 mb-4">
            <img v-if="currentLogo" :src="currentLogo" :alt="companyName" class="h-8 w-auto" />
            <span v-else class="text-xl font-bold text-black dark:text-white">
              {{ companyName }}
            </span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {{ siteDescription }}
          </p>
          <div class="flex space-x-4">
            <a v-for="social in socialLinks" :key="social.platform" :href="social.url"
              :aria-label="social.label || social.platform" target="_blank" rel="noopener noreferrer"
              class="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110">
              <component :is="getSocialIcon(social.platform)" class="h-5 w-5" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-sm font-semibold text-black dark:text-white uppercase tracking-wide mb-4">
            Quick Links
          </h3>
          <ul class="space-y-3">
            <li v-for="link in quickLinks" :key="link.name">
              <RouterLink :to="link.href"
                class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200">
                {{ link.name }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Categories -->
        <div>
          <h3 class="text-sm font-semibold text-black dark:text-white uppercase tracking-wide mb-4">
            Categories
          </h3>
          <ul class="space-y-3">
            <li v-for="category in topCategories" :key="category.slug">
              <RouterLink :to="`/categories/${category.slug}`"
                class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200">
                {{ category.name }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Newsletter Signup -->
        <div>
          <h3 class="text-sm font-semibold text-black dark:text-white uppercase tracking-wide mb-4">
            Stay Updated
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Subscribe to our newsletter for the latest updates and insights.
          </p>
          <NewsletterForm variant="footer" />
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="border-t border-black/10 dark:border-white/10 mt-8 lg:mt-12 pt-6 lg:pt-8">
        <div class="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
          <div
            class="flex flex-wrap justify-center lg:justify-start items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; {{ currentYear }} {{ companyName }}. All rights reserved.</p>
          </div>
          <div class="flex flex-wrap justify-center lg:justify-end items-center space-x-6 text-sm">
            <RouterLink to="/privacy"
              class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
              Privacy Policy
            </RouterLink>
            <RouterLink to="/terms"
              class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
              Terms of Service
            </RouterLink>
            <a :href="rssUrl"
              class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              target="_blank" rel="noopener noreferrer">
              RSS Feed
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import NewsletterForm from '@/components/ui/NewsletterForm.vue';
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

  // Quick links for footer
  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
    { name: 'Search', href: '/search' },
  ]

  // Top categories (limit to 5)
  const topCategories = computed(() => {
    return categories.value.slice(0, 5)
  })

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

<!-- No custom styles: all styling is handled by Tailwind CSS v4 classes -->
