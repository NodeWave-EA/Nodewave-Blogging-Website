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
        <h1 class="text-2xl font-bold text-black dark:text-white mb-2">Category Not Found</h1>
        <p class="text-black dark:text-white mb-8">{{ error }}</p>
        <router-link to="/categories"
          class="inline-flex items-center px-6 py-3 rounded-lg bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          View All Categories
        </router-link>
      </div>
    </div>

    <!-- Category Content -->
    <div v-else-if="category" class="py-8">
      <!-- Header -->
      <header class="bg-transparent backdrop-blur-xl py-16 mb-12">
        <div class="container mx-auto px-4 max-w-4xl">
          <!-- Breadcrumb -->
          <nav class="flex items-center space-x-2 text-sm text-black dark:text-white mb-8">
            <router-link to="/" class="hover:underline">Home</router-link>
            <ChevronRightIcon class="w-4 h-4" />
            <router-link to="/blog" class="hover:underline">Blog</router-link>
            <ChevronRightIcon class="w-4 h-4" />
            <router-link to="/categories" class="hover:underline">Categories</router-link>
            <ChevronRightIcon class="w-4 h-4" />
            <span class="text-black dark:text-white">{{ category.name }}</span>
          </nav>

          <!-- Category Header -->
          <div class="text-center">
            <!-- Category Icon -->
            <div class="mb-6 flex justify-center">
              <div v-if="category.icon" class="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl"
                :class="getCategoryColor(category.name)">
                {{ category.icon }}
              </div>
              <div v-else class="w-20 h-20 rounded-2xl flex items-center justify-center"
                :class="getCategoryColor(category.name)">
                <TagIcon class="w-10 h-10" />
              </div>
            </div>

            <h1 class="text-4xl md:text-5xl font-bold text-black dark:text-white mb-6">
              {{ category.name }}
            </h1>

            <p v-if="category.description" class="text-xl text-black dark:text-white mb-8 max-w-2xl mx-auto">
              {{ category.description }}
            </p>

            <!-- Stats -->
            <div class="flex items-center justify-center gap-6 text-black dark:text-white">
              <div class="flex items-center gap-2">
                <DocumentTextIcon class="w-5 h-5" />
                <span>{{ posts.length }} {{ posts.length === 1 ? 'post' : 'posts' }}</span>
              </div>
              <div v-if="category.createdAt" class="flex items-center gap-2">
                <CalendarIcon class="w-5 h-5" />
                <span>Since
                  {{
                    new Date(category.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })
                  }}</span>
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
            Posts in the {{ category.name }} category will appear here when published.
          </p>
          <router-link to="/blog"
            class="inline-flex items-center px-6 py-3 rounded-lg bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
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
              <select v-model="sortBy" @change="sortPosts"
                class="px-3 py-2 text-sm border border-black dark:border-white rounded-lg bg-transparent text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          <!-- Posts Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BlogCard v-for="post in sortedPosts" :key="post.id" :post="post" :show-category="false" />
          </div>

          <!-- Load More -->
          <div v-if="hasMore" class="text-center mt-12">
            <button @click="loadMore" :disabled="loadingMore"
              class="inline-flex items-center px-8 py-3 rounded-lg bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <span v-if="loadingMore" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
              </span>
              {{ loadingMore ? 'Loading...' : 'Load More Posts' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Related Categories -->
      <div v-if="relatedCategories.length > 0" class="container mx-auto px-4 max-w-6xl mt-16">
        <h2 class="text-2xl font-bold text-black dark:text-white mb-8 text-center">
          Related Categories
        </h2>
        <div class="flex flex-wrap justify-center gap-3">
          <router-link v-for="relatedCategory in relatedCategories" :key="relatedCategory.id"
            :to="`/categories/${relatedCategory.slug}`"
            class="inline-flex items-center px-4 py-2 rounded-full border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 font-semibold text-sm transition-all">
            {{ relatedCategory.name }}
            <span class="ml-2 text-xs opacity-75">({{ relatedCategory.post_count }})</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    ArrowLeftIcon,
    CalendarIcon,
    ChevronRightIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    TagIcon,
  } from '@heroicons/vue/24/outline';
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import BlogCard from '../../components/blog/BlogCard.vue';
  import { blogPostsApi, categoriesApi } from '../../services/blog';
  import type { BlogPost, Category } from '../../types';
  import { updateSEO } from '../../utils/seo';

  const route = useRoute()

  // Reactive data
  const category = ref<Category | null>(null)
  const posts = ref<BlogPost[]>([])
  const relatedCategories = ref<Category[]>([])
  const loading = ref(true)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(false)
  const currentPage = ref(1)
  const sortBy = ref('newest')

  // Computed properties
  const sortedPosts = computed(() => {
    const sorted = [...posts.value]

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
  const fetchCategoryAndPosts = async (slug: string) => {
    try {
      loading.value = true
      error.value = null
      currentPage.value = 1

      // Fetch category
      const categoryResponse = await categoriesApi.getBySlug(slug)
      category.value = categoryResponse.data

      if (!category.value) {
        error.value = 'Category not found.'
        return
      }

      // Fetch posts for this category
      const postsResponse = await blogPostsApi.getByCategory(category.value.id, {
        page: 1,
        pageSize: 12,
      })

      posts.value = postsResponse.data || []
      hasMore.value = (postsResponse.meta?.pagination?.pageCount || 1) > 1

      // Fetch related categories
      await fetchRelatedCategories()

      // Update SEO
      updateSEO({
        title: `${category.value.name} - Blog Category`,
        description:
          category.value.description || `Browse all posts in the ${category.value.name} category.`,
        type: 'website',
        url: window.location.href,
      })
    } catch (err) {
      console.error('Failed to fetch category:', err)
      error.value = 'Failed to load category. Please try again later.'
    } finally {
      loading.value = false
    }
  }

  const fetchRelatedCategories = async () => {
    try {
      const response = await categoriesApi.getAll()
      relatedCategories.value = (response.data || [])
        .filter((cat) => cat.id !== category.value?.id && (cat.post_count || 0) > 0)
        .sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
        .slice(0, 6)
    } catch (err) {
      console.error('Failed to fetch related categories:', err)
    }
  }

  const loadMore = async () => {
    if (!category.value || loadingMore.value || !hasMore.value) return

    try {
      loadingMore.value = true
      currentPage.value += 1

      const response = await blogPostsApi.getByCategory(category.value.id, {
        page: currentPage.value,
        pageSize: 12,
      })

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

  const sortPosts = () => {
    // Computed property will handle the actual sorting
  }

  const getCategoryColor = (categoryName: string): string => {
    const colors: Record<string, string> = {
      Technology: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      Business: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      Design: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      Development: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      Marketing: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      News: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      Updates: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    }

    return colors[categoryName] || 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300'
  }

  // Watch for route changes
  watch(
    () => route.params.slug,
    (newSlug) => {
      if (newSlug && typeof newSlug === 'string') {
        fetchCategoryAndPosts(newSlug)
      }
    },
    { immediate: true },
  )

  // Lifecycle
  onMounted(() => {
    const slug = route.params.slug as string
    if (slug) {
      fetchCategoryAndPosts(slug)
    } else {
      error.value = 'No category slug provided.'
      loading.value = false
    }
  })
</script>

<style scoped></style>
