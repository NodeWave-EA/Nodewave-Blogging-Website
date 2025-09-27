<template>
  <div class="min-h-screen bg-transparent">

    <!-- Loading State -->
    <div v-if="loading" class="py-16">
      <div class="container mx-auto px-4 text-center">
        <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-4 text-black dark:text-white">Loading author...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-16">
      <div class="container mx-auto px-4 text-center">
        <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-black dark:text-white mb-2">Author Not Found</h1>
        <p class="text-black dark:text-white mb-6">{{ error }}</p>
        <router-link to="/authors"
          class="rounded-lg font-semibold px-6 py-3 bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          View All Authors
        </router-link>
      </div>
    </div>

    <!-- Author Content -->
    <div v-else-if="author" class="py-8">
      <!-- Author Header -->
      <div class="container mx-auto px-4 max-w-4xl">
        <PageHeader :tag="author?.name || 'Author'" :title="author?.name || 'Author'"
          :description="author?.bio || undefined" size="regular" />
        <div class="flex flex-col md:flex-row items-center gap-8">
          <!-- Author Avatar -->
          <div class="flex-shrink-0">
            <img :src="getStrapiImageUrl(author?.avatar) ?? ''" :alt="author?.name || 'Author'"
              class="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-lg" />
          </div>

          <!-- Author Info -->
          <div class="flex-1 text-center md:text-left">
            <h1 class="text-4xl font-bold text-black dark:text-white mb-2">
              {{ author?.name }}
            </h1>

            <p v-if="author?.job_title" class="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-4">
              {{ author.job_title }}
            </p>

            <p v-if="author?.bio" class="text-lg text-black dark:text-white mb-6 leading-relaxed">
              {{ author.bio }}
            </p>

            <!-- Author Stats -->
            <div
              class="flex items-center justify-center md:justify-start gap-6 text-sm text-black dark:text-white mb-6">
              <div v-if="author?.follower_count" class="flex items-center gap-2">
                <UsersIcon class="w-5 h-5" />
                <span>{{ formatNumber(author.follower_count) }} followers</span>
              </div>

              <div v-if="author?.createdAt" class="flex items-center gap-2">
                <CalendarIcon class="w-5 h-5" />
                <span>Writing since
                  {{
                      new Date(author.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                      })
                    }}</span>
              </div>
            </div>

            <!-- Social Links -->
            <div v-if="author?.social_links" class="flex items-center justify-center md:justify-start gap-4">
              <span class="text-sm font-medium text-black dark:text-white">Follow:</span>

              <a v-if="getSocialUrl(author.social_links, 'twitter')"
                :href="getSocialUrl(author.social_links, 'twitter')" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center justify-center p-2 rounded-full transition-all text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
                title="Twitter">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a v-if="getSocialUrl(author.social_links, 'linkedin')"
                :href="getSocialUrl(author.social_links, 'linkedin')" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center justify-center p-2 rounded-full transition-all text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
                title="LinkedIn">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>

              <a v-if="getSocialUrl(author.social_links, 'github')" :href="getSocialUrl(author.social_links, 'github')"
                target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center justify-center p-2 rounded-full transition-all text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
                title="GitHub">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>

              <a v-if="getSocialUrl(author.social_links, 'website')"
                :href="getSocialUrl(author.social_links, 'website')" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center justify-center p-2 rounded-full transition-all text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
                title="Website">
                <GlobeAltIcon class="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <!-- Author Specialties -->
        <div v-if="author?.expertise_areas && author.expertise_areas.length > 0" class="mt-8">
          <h3 class="text-lg font-semibold text-black dark:text-white mb-4">Specialties</h3>
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in author.expertise_areas" :key="tag.id"
              class="px-3 py-1 text-sm font-medium rounded-full bg-transparent text-black dark:text-white border border-black dark:border-white">
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Author's Posts -->
      <section class="container mx-auto px-4 max-w-6xl">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-black dark:text-white mb-2">
            Posts by {{ author?.name }}
          </h2>
          <p class="text-black dark:text-white">
            {{ posts.length }} {{ posts.length === 1 ? 'post' : 'posts' }} published
          </p>
        </div>

        <!-- Posts Grid -->
        <div v-if="posts.length > 0" class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <BlogCard v-for="post in posts" :key="post.id" :post="post"
            class="hover:scale-105 transition-transform duration-300" />
        </div>

        <!-- No Posts -->
        <div v-else class="text-center py-16">
          <DocumentTextIcon class="w-16 h-16 text-black dark:text-white mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-black dark:text-white mb-2">No Posts Yet</h3>
          <p class="text-black dark:text-white mb-6">
            {{ author?.name }} hasn't published any posts yet.
          </p>
          <router-link to="/blog"
            class="rounded-lg font-semibold px-6 py-3 bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            Explore All Posts
          </router-link>
        </div>

        <!-- Pagination -->
        <div v-if="posts.length > 0 && pagination.pageCount > 1" class="mt-12">
          <div class="flex items-center justify-center gap-2">
            <button :disabled="pagination.page <= 1" @click="goToPage(pagination.page - 1)"
              class="px-4 py-2 text-sm font-medium text-black dark:text-white bg-transparent border border-black dark:border-white rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Previous
            </button>

            <span class="px-4 py-2 text-sm text-black dark:text-white">
              Page {{ pagination.page }} of {{ pagination.pageCount }}
            </span>

            <button :disabled="pagination.page >= pagination.pageCount" @click="goToPage(pagination.page + 1)"
              class="px-4 py-2 text-sm font-medium text-black dark:text-white bg-transparent border border-black dark:border-white rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    CalendarIcon,
    ChevronRightIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    UsersIcon,
  } from '@heroicons/vue/24/outline';
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

  // Components
  import PageHeader from '@/components/ui/PageHeader.vue';
  import BlogCard from '../../components/blog/BlogCard.vue';

  // Services & Types
  import { getSocialUrl } from '@/utils/social';
  import { authorsApi, blogPostsApi } from '../../services/blog';
  import type { Author, BlogPost, PaginationMeta } from '../../types';

  // Utils
  import { getStrapiImageUrl } from '../../utils/strapi';

  const route = useRoute()

  // State
  const author = ref<Author | null>(null)
  const posts = ref<BlogPost[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const pagination = ref<PaginationMeta>({
    page: 1,
    pageSize: 9,
    pageCount: 1,
    total: 0,
  })

  // Computed
  const slug = computed(() => route.params.slug as string)

  // Utility function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // Fetch author data
  const fetchAuthor = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await authorsApi.getBySlug(slug.value)
      author.value = response.data

      // Fetch author's posts
      await fetchAuthorPosts()
    } catch (err: any) {
      console.error('Error fetching author:', err)
      error.value = err.response?.data?.error?.message || 'Author not found'
    } finally {
      loading.value = false
    }
  }

  // Fetch author's posts
  const fetchAuthorPosts = async (page: number = 1) => {
    if (!author.value) return

    try {
      const response = await blogPostsApi.getByAuthor(author.value.id, {
        page,
        pageSize: pagination.value.pageSize,
      })

      posts.value = response.data
      if (response.meta?.pagination) {
        pagination.value = response.meta.pagination
      }
    } catch (err) {
      console.error('Error fetching author posts:', err)
    }
  }

  // Navigation
  const goToPage = (page: number) => {
    fetchAuthorPosts(page)
  }

  // Lifecycle
  onMounted(() => {
    fetchAuthor()
  })

  // Watch for route changes
  import { watch } from 'vue';
  watch(
    () => route.params.slug,
    () => {
      if (route.params.slug) {
        fetchAuthor()
      }
    },
  )
</script>
