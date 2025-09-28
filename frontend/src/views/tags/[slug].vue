<template>
  <div class="min-h-screen bg-transparent">
    <!-- Loading State -->
    <div v-if="loading" class="py-16">
      <div class="container mx-auto px-4">
        <div class="animate-pulse">
          <div class="h-8 rounded-lg mb-8 max-w-md bg-transparent"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="rounded-xl h-96 bg-transparent"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-16">
      <div class="container mx-auto px-4 text-center">
        <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-black dark:text-white mb-2">Tag Not Found</h1>
        <p class="text-black dark:text-white mb-8">{{ error }}</p>
        <router-link
          to="/tags"
          class="inline-flex items-center px-6 py-3 rounded-lg bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          View All Tags
        </router-link>
      </div>
    </div>

    <!-- Tag Content -->
    <div v-else-if="tag" class="py-8">
      <!-- Header -->
      <header class="bg-transparent backdrop-blur-xl py-16 mb-12">
        <div class="container mx-auto px-4 max-w-4xl">
          <!-- Breadcrumb -->
          <nav class="flex items-center space-x-2 text-sm text-black dark:text-white mb-8">
            <router-link to="/" class="hover:underline">Home</router-link>
            <ChevronRightIcon class="w-4 h-4" />
            <router-link to="/blog" class="hover:underline">Blog</router-link>
            <ChevronRightIcon class="w-4 h-4" />
            <router-link to="/tags" class="hover:underline">Tags</router-link>
            <ChevronRightIcon class="w-4 h-4" />
            <span class="text-black dark:text-white">#{{ tag.name }}</span>
          </nav>

          <!-- Tag Header -->
          <div class="text-center">
            <!-- Tag Icon -->
            <div class="mb-6 flex justify-center">
              <div class="inline-block">
                <div
                  class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl"
                >
                  #
                </div>
              </div>
            </div>

            <PageHeader
              :tag="tag?.name ? `#${tag.name}` : undefined"
              :title="tag?.name ? `#${tag.name}` : ''"
              :description="tag?.description ?? undefined"
              size="regular"
            />

            <!-- Stats -->
            <div class="flex items-center justify-center gap-6 text-black dark:text-white">
              <div class="flex items-center gap-2">
                <DocumentTextIcon class="w-5 h-5" />
                <span>{{ posts.length }} {{ posts.length === 1 ? 'post' : 'posts' }}</span>
              </div>
              <div v-if="tag.createdAt" class="flex items-center gap-2">
                <CalendarIcon class="w-5 h-5" />
                <span
                  >Since
                  {{
                    new Date(tag.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })
                  }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Posts Grid -->
      <div class="container mx-auto px-4 max-w-6xl">
        <!-- Posts -->
        <div v-if="posts.length === 0" class="text-center py-16">
          <DocumentTextIcon class="w-16 h-16 text-black dark:text-white mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-black dark:text-white mb-2">No Posts Yet</h3>
          <p class="text-black dark:text-white mb-8">
            Posts tagged with #{{ tag.name }} will appear here when published.
          </p>
          <router-link
            to="/blog"
            class="inline-flex items-center px-6 py-3 rounded-lg bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            Browse All Posts
          </router-link>
        </div>

        <div v-else>
          <!-- Filters and Sort -->
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div class="flex items-center gap-2">
              <span class="text-sm text-black dark:text-white">
                Showing {{ posts.length }} {{ posts.length === 1 ? 'post' : 'posts' }}
              </span>
            </div>

            <!-- Sort Options -->
            <div class="flex items-center gap-4">
              <label class="text-sm text-black dark:text-white">Sort by:</label>
              <SortOptions v-model="sortBy" :options="sortOptions" />
            </div>
            <div
              v-if="usingFeaturedFallback"
              class="w-full mt-2 text-sm text-slate-600 dark:text-slate-400"
            >
              No featured posts found for this tag — showing latest posts instead.
            </div>
          </div>

          <!-- Posts Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BlogCard
              v-for="post in sortedPosts"
              :key="post.id"
              :post="post"
              :highlighted-tag="tag.name"
            />
          </div>

          <!-- UI: fallback message when featured had no results -->
          <div v-if="usingFeaturedFallback" class="text-center text-sm text-gray-500 mt-4">
            Showing results without the featured posts fallback.
          </div>

          <!-- Load More -->
          <div v-if="hasMore" class="text-center mt-12">
            <button
              @click="loadMore"
              :disabled="loadingMore"
              class="inline-flex items-center px-8 py-3 rounded-lg bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="loadingMore" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
              {{ loadingMore ? 'Loading...' : 'Load More Posts' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Related Tags -->
      <div v-if="relatedTags.length > 0" class="container mx-auto px-4 max-w-6xl mt-16">
        <h2 class="text-2xl font-bold text-black dark:text-white mb-8 text-center">Related Tags</h2>
        <div class="flex flex-wrap justify-center gap-3">
          <router-link
            v-for="relatedTag in relatedTags"
            :key="relatedTag.id"
            :to="`/tags/${relatedTag.slug}`"
            class="inline-flex items-center px-4 py-2 rounded-full border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 font-semibold text-sm transition-all"
          >
            #{{ relatedTag.name }}
            <span class="ml-2 text-xs opacity-75">({{ relatedTag.post_count }})</span>
          </router-link>
        </div>
      </div>

      <!-- Tag Cloud -->
      <div v-if="tagCloud.length > 0" class="container mx-auto px-4 max-w-6xl mt-16">
        <h2 class="text-2xl font-bold text-black dark:text-white mb-8 text-center">
          Explore More Tags
        </h2>
        <div class="text-center">
          <router-link
            v-for="cloudTag in tagCloud"
            :key="cloudTag.id"
            :to="`/tags/${cloudTag.slug}`"
            class="inline-block m-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:underline transition-all"
            :style="{
              fontSize: getTagSize(cloudTag.post_count),
              fontWeight: getTagWeight(cloudTag.post_count),
            }"
          >
            #{{ cloudTag.name }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BlogCard from '../../components/blog/BlogCard.vue'
import SortOptions from '../../components/blog/SortOptions.vue'
import { blogPostsApi, tagsApi } from '../../services/blog'
import type { BlogPost, Tag } from '../../types'
import { updateSEO } from '../../utils/seo'

const route = useRoute()

// Reactive data
const tag = ref<Tag | null>(null)
const posts = ref<BlogPost[]>([])
const relatedTags = ref<Tag[]>([])
const tagCloud = ref<Tag[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const hasMore = ref(false)
const currentPage = ref(1)
const sortBy = ref<'newest' | 'oldest' | 'popular' | 'title' | 'featured'>('title')
const usingFeaturedFallback = ref(false)

const sortOptions = [
  { label: 'Title A-Z', value: 'title' },
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Most Popular', value: 'popular' },
]

// Computed properties
const sortedPosts = computed(() => {
  const sorted = [...posts.value]

  if (sortBy.value === 'featured' && !usingFeaturedFallback.value) {
    return sorted.filter((p) => !!p.featured)
  }

  switch (sortBy.value) {
    case 'oldest':
      return sorted.sort(
        (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      )
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'popular':
      return sorted.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    case 'newest':
    default:
      return sorted.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
  }
})

// Methods
const fetchTagAndPosts = async (slug: string) => {
  try {
    loading.value = true
    error.value = null
    currentPage.value = 1

    // Fetch tag
    const tagResponse = await tagsApi.getBySlug(slug)
    tag.value = tagResponse.data

    if (!tag.value) {
      error.value = 'Tag not found.'
      return
    }

    // Fetch posts for this tag
    usingFeaturedFallback.value = false
    let postsResponse = await blogPostsApi.getByTag(tag.value.id, {
      page: 1,
      pageSize: 12,
      featured: sortBy.value === 'featured' && !usingFeaturedFallback.value,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    })

    if (sortBy.value === 'featured' && (!postsResponse.data || postsResponse.data.length === 0)) {
      usingFeaturedFallback.value = true
      postsResponse = await blogPostsApi.getByTag(tag.value.id, {
        page: 1,
        pageSize: 12,
        sortBy: 'publishedAt',
        sortOrder: 'desc',
      })
    }

    posts.value = postsResponse.data || []
    hasMore.value = (postsResponse.meta?.pagination?.pageCount || 1) > 1

    // Fetch related tags and tag cloud
    await Promise.all([fetchRelatedTags(), fetchTagCloud()])

    // Update SEO
    updateSEO({
      title: `#${tag.value.name} - Blog Tag`,
      description: tag.value.description || `Browse all posts tagged with #${tag.value.name}.`,
      type: 'website',
      url: window.location.href,
    })
  } catch (err) {
    console.error('Failed to fetch tag:', err)
    error.value = 'Failed to load tag. Please try again later.'
  } finally {
    loading.value = false
  }
}

const fetchRelatedTags = async () => {
  try {
    const response = await tagsApi.getRelated(tag.value!.id)
    relatedTags.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch related tags:', err)
  }
}

const fetchTagCloud = async () => {
  try {
    const response = await tagsApi.getAll()
    tagCloud.value = (response.data || [])
      .filter((t) => t.id !== tag.value?.id && (t.post_count || 0) > 0)
      .sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
      .slice(0, 20)
  } catch (err) {
    console.error('Failed to fetch tag cloud:', err)
  }
}

const loadMore = async () => {
  if (!tag.value || loadingMore.value || !hasMore.value) return

  try {
    loadingMore.value = true
    currentPage.value += 1

    let response = await blogPostsApi.getByTag(tag.value.id, {
      page: currentPage.value,
      pageSize: 12,
      featured: sortBy.value === 'featured' && !usingFeaturedFallback.value,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    })

    if (usingFeaturedFallback.value) {
      response = await blogPostsApi.getByTag(tag.value.id, {
        page: currentPage.value,
        pageSize: 12,
        sortBy: 'publishedAt',
        sortOrder: 'desc',
      })
    }

    if (response.data && response.data.length > 0) {
      posts.value.push(...response.data)
      hasMore.value = currentPage.value < (response.meta?.pagination?.pageCount || 1)
    } else {
      hasMore.value = false
    }
  } catch (err) {
    console.error('Failed to load more posts:', err)
  } finally {
    loadingMore.value = false
  }
}

const getTagSize = (postCount: number | undefined): string => {
  const count = postCount || 0
  if (count > 50) return '1.5rem'
  if (count > 20) return '1.25rem'
  if (count > 10) return '1.125rem'
  if (count > 5) return '1rem'
  return '0.875rem'
}

const getTagWeight = (postCount: number | undefined): string => {
  const count = postCount || 0
  if (count > 20) return '700'
  if (count > 10) return '600'
  if (count > 5) return '500'
  return '400'
}

// Watch for route changes
watch(
  () => route.params.slug,
  (newSlug) => {
    if (newSlug && typeof newSlug === 'string') {
      fetchTagAndPosts(newSlug)
    }
  },
  { immediate: true },
)

// When sort option changes, re-fetch posts to honor server-side featured filtering
watch(
  () => sortBy.value,
  () => {
    usingFeaturedFallback.value = false
    if (tag.value && tag.value.slug) {
      fetchTagAndPosts(tag.value.slug)
    }
  },
)

// Lifecycle
onMounted(() => {
  const slug = route.params.slug as string
  if (slug) {
    fetchTagAndPosts(slug)
  } else {
    error.value = 'No tag slug provided.'
    loading.value = false
  }
})
</script>

<style scoped></style>
