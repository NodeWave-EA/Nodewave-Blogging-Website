<template>
  <div class="min-h-screen bg-transparent">
    <!-- Loading State -->
    <div v-if="loading" class="py-16">
      <div class="container mx-auto px-4">
        <div class="animate-pulse">
          <div class="h-8 rounded-lg mb-8 max-w-md bg-transparent"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="rounded-xl h-64 bg-transparent"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-16">
      <div class="container mx-auto px-4 text-center">
        <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-black dark:text-white mb-2">Error Loading Authors</h1>
        <p class="text-black dark:text-white mb-8">{{ error }}</p>
        <router-link
          to="/blog"
          class="inline-flex items-center px-6 py-3 rounded-lg bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          Back to Blog
        </router-link>
      </div>
    </div>

    <!-- Authors Content -->
    <div v-else class="py-8">
      <!-- Header -->
      <div class="container mx-auto px-4 max-w-4xl text-center">
        <PageHeader
          tag="Authors"
          title="Meet Our Authors"
          description="Discover the talented writers and experts behind our blog content."
          size="regular"
        />
      </div>

      <!-- Authors Grid -->
      <div class="container mx-auto px-4 max-w-6xl">
        <div v-if="authors.length === 0" class="text-center py-16">
          <UserGroupIcon class="w-16 h-16 text-black dark:text-white mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-black dark:text-white mb-2">No Authors Found</h3>
          <p class="text-black dark:text-white">
            Authors will appear here as they publish content.
          </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <router-link
            v-for="author in authors"
            :key="author.id"
            :to="`/authors/${author.slug || author.id}`"
            class="group bg-transparent backdrop-blur-xl rounded-xl p-8 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-black dark:border-white"
          >
            <!-- Author Avatar -->
            <div class="text-center mb-6">
              <div class="relative inline-block">
                <img
                  :src="getStrapiImageUrl(author.avatar) ?? ''"
                  :alt="author.name"
                  class="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-zinc-700 shadow-lg group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-300"
                />

                <!-- Featured indicator (mapped from `featured`) -->
                <div
                  v-if="author.featured"
                  class="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-zinc-700"
                  title="Featured Author"
                ></div>
              </div>
            </div>

            <!-- Author Info -->
            <div class="text-center">
              <h3
                class="text-xl font-bold text-black dark:text-white mb-2 group-hover:underline transition-colors"
              >
                {{ author.name }}
              </h3>

              <p v-if="author.job_title" class="text-blue-600 dark:text-blue-400 font-medium mb-3">
                {{ author.job_title }}
              </p>

              <p v-if="author.bio" class="text-black dark:text-white text-sm mb-4 line-clamp-3">
                {{ author.bio }}
              </p>

              <!-- Stats -->
              <div
                class="flex items-center justify-center gap-4 text-sm text-black dark:text-white mb-4"
              >
                <div class="flex items-center gap-1">
                  <DocumentTextIcon class="w-4 h-4" />
                  <span>{{ author.blog_posts?.length || 0 }} posts</span>
                </div>
              </div>

              <!-- Social Links -->
              <div v-if="author.social_links" class="flex items-center justify-center gap-3 mb-4">
                <a
                  v-if="getSocialUrl(author.social_links, 'twitter')"
                  :href="getSocialUrl(author.social_links, 'twitter')"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center p-2 rounded-lg transition-all text-blue-500 hover:text-blue-600 hover:bg-black/10 dark:hover:bg-white/10"
                  @click.stop
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
                    />
                  </svg>
                </a>
                <a
                  v-if="getSocialUrl(author.social_links, 'linkedin')"
                  :href="getSocialUrl(author.social_links, 'linkedin')"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center p-2 rounded-lg transition-all text-blue-700 hover:text-blue-800 hover:bg-black/10 dark:hover:bg-white/10"
                  @click.stop
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                    />
                  </svg>
                </a>
                <a
                  v-if="getSocialUrl(author.social_links, 'github')"
                  :href="getSocialUrl(author.social_links, 'github')"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center p-2 rounded-lg transition-all text-black dark:text-white hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                  @click.stop
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                    />
                  </svg>
                </a>
                <a
                  v-if="getSocialUrl(author.social_links, 'website')"
                  :href="getSocialUrl(author.social_links, 'website')"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center p-2 rounded-lg transition-all text-black dark:text-white hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                  @click.stop
                >
                  <GlobeAltIcon class="w-4 h-4" />
                </a>
              </div>

              <!-- Specialties/Tags -->
              <div
                v-if="author.expertise_areas && author.expertise_areas.length > 0"
                class="flex flex-wrap justify-center gap-2"
              >
                <span
                  v-for="tag in author.expertise_areas.slice(0, 3)"
                  :key="tag.id"
                  class="px-2 py-1 text-xs font-medium rounded-full bg-transparent text-black dark:text-white border border-black dark:border-white"
                >
                  {{ tag.name }}
                </span>
                <span
                  v-if="author.expertise_areas.length > 3"
                  class="px-2 py-1 text-xs font-medium rounded-full bg-transparent text-black dark:text-white border border-black dark:border-white"
                >
                  +{{ author.expertise_areas.length - 3 }} more
                </span>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Featured Authors -->
      <div v-if="featuredAuthors.length > 0" class="container mx-auto px-4 max-w-6xl mt-16">
        <h2 class="text-2xl font-bold text-black dark:text-white mb-8 text-center">
          Top Contributors
        </h2>
        <div class="flex flex-wrap justify-center gap-6">
          <router-link
            v-for="author in featuredAuthors"
            :key="author.id"
            :to="`/authors/${author.slug || author.id}`"
            class="flex items-center gap-3 p-4 bg-transparent backdrop-blur-xl rounded-xl hover:shadow-lg transition-all duration-300 border border-black dark:border-white"
          >
            <img
              v-if="getStrapiImageUrl(author.avatar)"
              :src="getStrapiImageUrl(author.avatar)!"
              :alt="author.name"
              class="w-12 h-12 rounded-full object-cover"
            />
            <UserCircleIcon v-else class="w-12 h-12 text-black dark:text-white" />
            <div>
              <div class="font-semibold text-black dark:text-white">{{ author.name }}</div>
              <div class="text-sm text-black dark:text-white">
                {{ author.blog_posts?.length || 0 }} posts
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import { getSocialUrl } from '@/utils/social'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  UserCircleIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline'
import { computed, onMounted, ref } from 'vue'
import { authorsApi } from '../../services/blog'
import type { Author } from '../../types'
import { updateSEO } from '../../utils/seo'
import { getStrapiImageUrl } from '../../utils/strapi'

// Reactive data
const authors = ref<Author[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Computed properties
const featuredAuthors = computed(() => {
  return authors.value
    .filter((author) => (author.blog_posts?.length || 0) > 0)
    .sort((a, b) => (b.blog_posts?.length || 0) - (a.blog_posts?.length || 0))
    .slice(0, 5)
})

// Methods
const fetchAuthors = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await authorsApi.getAll()
    authors.value = response.data || []

    // Update SEO
    updateSEO({
      title: 'Blog Authors',
      description: 'Meet the talented writers and experts behind our blog content.',
      type: 'website',
      url: window.location.href,
    })
  } catch (err) {
    console.error('Failed to fetch authors:', err)
    error.value = 'Failed to load authors. Please try again later.'
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchAuthors()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
