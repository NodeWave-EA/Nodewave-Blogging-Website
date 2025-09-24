<template>
  <div class="min-h-screen">
    <!-- Page Header -->
    <PageHeader title="Our Blog" description="Discover insights, stories, and updates from our team" />

    <!-- Search and Filters -->
    <BlogFilters v-model:search="searchQuery" v-model:category="selectedCategory" v-model:sort="sortBy"
      :categories="categories" :show-results-summary="true" :results-count="posts.length" :total-count="totalPosts"
      @search="handleSearch" @filter-change="handleFilterChange" />

    <!-- Blog Posts Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Section Title -->
      <div class="text-center mb-16" data-aos="fade-up">
        <h2 class="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent mb-4">
          Latest Articles
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading && posts.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import BlogCard from '@/components/blog/BlogCard.vue'
  import BlogFilters from '@/components/blog/BlogFilters.vue'
  import BlogPostSkeleton from '@/components/ui/BlogPostSkeleton.vue'
  import EmptyState from '@/components/ui/EmptyState.vue'
  import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
  import PageHeader from '@/components/ui/PageHeader.vue'
  import { blogPostsApi, categoriesApi } from '@/services/blog'
  import type { BlogPost, Category } from '@/types'
  import { debounce } from '@/utils/format'
  import { updateSEO } from '@/utils/seo'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  const route = useRoute()
  const router = useRouter()

  // Reactive data
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const sortBy = ref<'newest' | 'oldest' | 'popular' | 'title'>('newest')
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

      const response = await blogPostsApi.getAll(append ? currentPage.value + 1 : 1, pageSize, {
        search: searchQuery.value || undefined,
        category: selectedCategory.value || undefined,
        sortBy: getSortField(sortBy.value),
        sortOrder: getSortOrder(sortBy.value),
      })

      if (response.data) {
        if (append) {
          posts.value.push(...response.data)
          currentPage.value += 1
        } else {
          posts.value = response.data
          currentPage.value = 1
        }

        totalPages.value = response.meta?.pagination?.pageCount || 1
        totalPosts.value = response.meta?.pagination?.total || 0
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

  const handleSearch = debounce(async () => {
    await fetchPosts()
    updateURL()
  }, 300)

  const handleFilterChange = async () => {
    await fetchPosts()
    updateURL()
  }

  const updateURL = () => {
    const query: Record<string, string> = {}

    if (searchQuery.value) query.search = searchQuery.value
    if (selectedCategory.value) query.category = selectedCategory.value
    if (sortBy.value !== 'newest') query.sort = sortBy.value

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
    fetchPosts()
  })

  // Lifecycle
  onMounted(async () => {
    // Set initial values from URL params
    searchQuery.value = (route.query.search as string) || ''
    selectedCategory.value = (route.query.category as string) || ''
    sortBy.value = (route.query.sort as 'newest' | 'oldest' | 'popular' | 'title') || 'newest'

    // Fetch data
    await Promise.all([fetchPosts(), fetchCategories()])

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
