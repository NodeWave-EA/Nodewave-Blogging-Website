<template>
  <div class="min-h-screen bg-transparent">
    <!-- Loading State -->
    <AuthorIndexSkeleton v-if="loading" />

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
          <AuthorCard v-for="author in authors" :key="author.id" :author="author" />
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
import AuthorCard from '@/components/author/AuthorCard.vue'
import AuthorIndexSkeleton from '@/components/author/AuthorIndexSkeleton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
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
