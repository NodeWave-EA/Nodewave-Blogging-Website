<template>
  <section class="relative overflow-hidden py-24 sm:py-32 lg:py-40">
    <!-- Content Container -->
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center animate-fade-in">
        <!-- Company Info -->
        <div v-if="companyInfo" class="mb-12">
          <img v-if="getStrapiImageUrl(companyInfo.logo)" :src="getStrapiImageUrl(companyInfo.logo)!"
            :alt="companyInfo.site_title || 'Company Logo'"
            class="h-20 mx-auto mb-8 filter drop-shadow-xl transition-transform duration-300 hover:scale-105" />
          <div v-else class="mb-8">
            <h1
              class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-heading">
              {{ companyInfo.site_title || 'NodeWave' }}
            </h1>
          </div>
        </div>

        <!-- Hero Title -->
        <h1
          class="text-4xl tracking-tight font-extrabold text-black dark:text-white sm:text-5xl md:text-6xl lg:text-7xl font-heading">
          <span class="block mb-2">Nodewave</span>
          <span class="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            Blog
          </span>
        </h1>

        <!-- Hero Description -->
        <p
          class="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300 sm:text-xl md:text-2xl leading-relaxed">
          {{
            companyInfo?.site_description ||
            'Discover insights, innovations, and stories from our team. Stay updated with the latest industry trends and company news.'
          }}
        </p>

        <!-- CTA Buttons -->
        <div class="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
          <router-link to="/blog" class="btn btn-primary w-full sm:w-auto group">
            <BookOpenIcon class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            Explore Blog
          </router-link>

          <a href="#newsletter" class="btn btn-outline w-full sm:w-auto group">
            <EnvelopeIcon class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            Subscribe
          </a>
        </div>

        <!-- Stats Section -->
        <div class="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
          <div class="stats-card group">
            <div class="stats-icon bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <BookOpenIcon class="w-6 h-6" />
            </div>
            <div class="stats-content">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Posts
              </dt>
              <dd class="text-3xl font-bold text-black dark:text-white mt-1">
                {{ stats.totalPosts || '0' }}
              </dd>
            </div>
          </div>

          <div class="stats-card group">
            <div class="stats-icon bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div class="stats-content">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Categories
              </dt>
              <dd class="text-3xl font-bold text-black dark:text-white mt-1">
                {{ stats.totalCategories || '0' }}
              </dd>
            </div>
          </div>

          <div class="stats-card group">
            <div class="stats-icon bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div class="stats-content">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Authors
              </dt>
              <dd class="text-3xl font-bold text-black dark:text-white mt-1">
                {{ stats.totalAuthors || '0' }}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle no-print">
      <ChevronDownIcon class="w-6 h-6 text-gray-400 dark:text-gray-500" />
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useCompanyInfo } from '@/composables/useCompanyInfo';
  import { authorsApi, blogPostsApi, categoriesApi } from '@/services/blog';
  import { getStrapiImageUrl } from '@/utils/strapi';
  import { BookOpenIcon, ChevronDownIcon, EnvelopeIcon } from '@heroicons/vue/24/outline';
  import { onMounted, ref } from 'vue';

  const { companyInfo } = useCompanyInfo()

  const stats = ref({
    totalPosts: 0,
    totalCategories: 0,
    totalAuthors: 0,
  })

  const loadStats = async () => {
    try {
      // Load blog stats
      const [postsResponse, categoriesResponse, authorsResponse] = await Promise.all([
        blogPostsApi.getAll(1, 1),
        categoriesApi.getAll(),
        authorsApi.getAll(),
      ])

      stats.value = {
        totalPosts: postsResponse.meta?.pagination?.total || 0,
        totalCategories: categoriesResponse.meta?.pagination?.total || 0,
        totalAuthors: authorsResponse.meta?.pagination?.total || 0,
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  onMounted(() => {
    loadStats()
  })
</script>

<style scoped>

  /* Stats card component with transparent backgrounds and theme-aware styling */
  .stats-card {
    position: relative;
    padding: 2rem;
    border-radius: 1rem;
    border: 1px solid rgb(0 0 0 / 0.1);
    backdrop-filter: blur(8px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: transparent;
  }

  .stats-card:hover {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    transform: translateY(-4px);
  }

  .dark .stats-card {
    border-color: rgb(255 255 255 / 0.1);
  }

  .dark .stats-card:hover {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.2);
  }

  .stats-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .group:hover .stats-icon {
    transform: scale(1.1);
  }

  .stats-content {
    text-align: center;
  }

  /* Animation delays for stats cards */
  .stats-card:nth-child(1) {
    animation-delay: 0.1s;
  }

  .stats-card:nth-child(2) {
    animation-delay: 0.2s;
  }

  .stats-card:nth-child(3) {
    animation-delay: 0.3s;
  }

  /* Ensure smooth animations */
  @media (prefers-reduced-motion: no-preference) {
    .stats-card {
      animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
  }

  /* Reduced motion fallback */
  @media (prefers-reduced-motion: reduce) {
    .stats-card {
      animation: none;
    }

    .stats-card:hover {
      transform: none;
    }

    .group:hover .stats-icon {
      transform: none;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
