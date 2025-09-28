<template>
  <div class="min-h-screen">
    <!-- Full-page skeleton while initial data loads; renders entire header+filters+posts -->
    <BlogPageSkeleton v-if="pageLoading" />

    <template v-else>
      <!-- Page Header -->
      <PageHeader tag="Blog & Insights" title="Our Blog"
        description="Discover insights, stories, and updates from our team" />

      <!-- Filters (search disabled here because global search exists in navigation) -->
      <BlogFilters :show-search="false" v-model:category="selectedCategories" v-model:sort="sortBy"
        :categories="categories" :results-count="posts.length" :total-count="totalPosts"
        @filter-change="handleFilterChange" />
    </template>

    <div v-if="usingFeaturedFallback"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-sm text-slate-600 dark:text-slate-400">
      No featured posts found — showing latest posts instead.
    </div>

    <!-- Blog Posts Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Section Title -->
      <div class="text-center mb-16" data-aos="fade-up">
        <h2
          class="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent mb-4">
          Latest Articles
        </h2>
      </div>

      <!-- Loading state handled at top-level (pageLoading). Show individual post skeletons only for subsequent loads -->
      <div v-if="loading && posts.length === 0 && !pageLoading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <BlogPostSkeleton v-for="n in 6" :key="n" />
      </div>

      <!-- Posts Grid -->
      <div v-else-if="posts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <BlogCard v-for="(post, index) in posts" :key="post.id" :post="post" data-aos="fade-up"
          :data-aos-delay="index * 50" />
      </div>

      <!-- Empty State -->
      <EmptyState v-else-if="!loading" title="No posts found" description="Try adjusting your search or filter criteria"
        icon="document" />

      <!-- Load More Button -->
      <div v-if="hasMorePages && posts.length > 0" class="text-center mt-16">
        <button @click="loadMore" :disabled="loading"
          class="group relative inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-sm transform hover:scale-105">
          <LoadingSpinner v-if="loading" class="w-5 h-5 mr-3" />
          {{ loading ? 'Loading...' : 'Load More Articles' }}
          <div
            class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import BlogCard from '@/components/blog/BlogCard.vue';
  import BlogFilters from '@/components/blog/BlogFilters.vue';
  import BlogPageSkeleton from '@/components/blog/BlogPageSkeleton.vue';
  import BlogPostSkeleton from '@/components/blog/BlogPostSkeleton.vue';
  import EmptyState from '@/components/ui/EmptyState.vue';
  import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
  import PageHeader from '@/components/ui/PageHeader.vue';
  import { blogPostsApi, categoriesApi } from '@/services';
  import type { BlogPost, Category } from '@/types';
  import { dbg } from '@/utils/debug';
  import { updateSEO } from '@/utils/seo';
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  const route = useRoute()
  const router = useRouter()

  // Reactive data
  const searchQuery = ref('')
  const selectedCategories = ref<string[]>([])
  // Page-level loading state to show full-page skeleton until initial API calls complete
  const pageLoading = ref(true)
  const sortBy = ref<'newest' | 'oldest' | 'popular' | 'title' | 'featured'>('title')
  const usingFeaturedFallback = ref(false)
  const categories = ref<Category[]>([])
  const posts = ref<BlogPost[]>([])
  const loading = ref(false)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalPosts = ref(0)
  const pageSize = 12

  // Computed
  const hasMorePages = computed(() => currentPage.value < totalPages.value)

  // Methods
  const fetchPosts = async (append = false) => {
    try {
      loading.value = true

      // Build filters for the API
      const filters: any = {
        search: searchQuery.value || undefined,
        categories: selectedCategories.value && selectedCategories.value.length ? selectedCategories.value : undefined,
      }

      if (sortBy.value === 'featured') {
        // If we're already using a featured fallback, don't request featured posts anymore;
        // otherwise request featured posts only and fallback to newest if none exist.
        if (!usingFeaturedFallback.value) {
          filters.featured = true
        }
        filters.sortBy = 'publishedAt'
        filters.sortOrder = 'desc'
      } else {
        filters.sortBy = getSortField(sortBy.value)
        filters.sortOrder = getSortOrder(sortBy.value)
      }

      let response = await blogPostsApi.getAll(append ? currentPage.value + 1 : 1, pageSize, filters)

      // If user requested featured and API returned zero (no featured posts),
      // fall back to newest posts and mark the fallback so UI can indicate it if desired.
      if (!append && sortBy.value === 'featured' && (!response.data || response.data.length === 0)) {
        usingFeaturedFallback.value = true
        const fallbackFilters = { ...filters }
        delete fallbackFilters.featured
        fallbackFilters.sortBy = 'publishedAt'
        fallbackFilters.sortOrder = 'desc'
        response = await blogPostsApi.getAll(1, pageSize, fallbackFilters)
      }

      dbg('blog/index.vue', 'Fetched posts:', response)

      if (response.data) {
        if (append) {
          posts.value.push(...response.data)
          currentPage.value += 1
        } else {
          posts.value = response.data
          currentPage.value = 1
        }

        totalPosts.value = response.meta?.pagination?.total || response.data.length
        totalPages.value = response.meta?.pagination?.pageCount || 1
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      posts.value = []
    } finally {
      loading.value = false
    }
  }

  const getSortField = (sort: string): string => {
    switch (sort) {
      case 'oldest':
      case 'newest':
        return 'publishedAt'
      case 'popular':
        return 'view_count'
      case 'title':
        return 'title'
      default:
        return 'publishedAt'
    }
  }

  const getSortOrder = (sort: string): 'asc' | 'desc' => {
    switch (sort) {
      case 'oldest':
      case 'title':
        return 'asc'
      default:
        return 'desc'
    }
  }

  const loadMore = async () => {
    if (!hasMorePages.value || loading.value) return
    await fetchPosts(true)
  }

  const handleFilterChange = async () => {
    usingFeaturedFallback.value = false
    await fetchPosts()
    updateURL()
  }

  const updateURL = () => {
    const query: Record<string, string> = {}

    if (searchQuery.value) query.search = searchQuery.value
    if (selectedCategories.value && selectedCategories.value.length)
      query.category = selectedCategories.value.join(',')
    if (sortBy.value !== 'title') query.sort = sortBy.value

    router.replace({
      path: route.path,
      query: Object.keys(query).length ? query : undefined,
    })
  }

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll()
      categories.value = response.data || []
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      categories.value = []
    }
  }

  // Watchers
  watch([sortBy], () => {
    usingFeaturedFallback.value = false
    fetchPosts()
  })

  // Lifecycle
  onMounted(async () => {
    // Set initial values from URL params
    // Note: searchQuery is still populated from the URL so global search navigation works
    searchQuery.value = (route.query.search as string) || ''
    // legacy single-category assignment removed; we now use selectedCategories array
    sortBy.value =
      (route.query.sort as 'newest' | 'oldest' | 'popular' | 'title' | 'featured') || 'title'

    // Parse category query which may be a comma-separated list or repeated params
    const catQuery = route.query.category
    if (!catQuery) selectedCategories.value = []
    else if (Array.isArray(catQuery)) selectedCategories.value = catQuery as string[]
    else selectedCategories.value = (catQuery as string).split(',').map((s) => s.trim()).filter(Boolean)

    // Fetch initial data (posts + categories)
    await Promise.all([fetchPosts(), fetchCategories()])
    // Hide full-page skeleton once initial data has loaded (regardless of errors)
    pageLoading.value = false

    // Update SEO
    updateSEO({
      title: 'Blog',
      description:
        'Read our latest blog posts and insights. Stay updated with industry trends, tips, and company news.',
      type: 'website',
      url: `${window.location.origin}/blog`,
    })
  })
</script>
