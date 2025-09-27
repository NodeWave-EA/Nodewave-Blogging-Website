<template>
  <div class="min-h-screen bg-transparent">
    <!-- Loading State -->
    <div v-if="loading" class="py-16">
      <div class="container mx-auto px-4">
        <div class="animate-pulse">
          <div class="h-8 rounded-lg mb-8 max-w-md bg-transparent"></div>
          <div class="flex flex-wrap gap-3">
            <div v-for="i in 20" :key="i" class="h-10 rounded-full w-24 bg-transparent"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-16">
      <div class="container mx-auto px-4 text-center">
        <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-black dark:text-white mb-2">Error Loading Tags</h1>
        <p class="text-black dark:text-white mb-8">{{ error }}</p>
        <router-link to="/blog"
          class="inline-flex items-center px-6 py-3 rounded-lg bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          Back to Blog
        </router-link>
      </div>
    </div>

    <!-- Tags Content -->
    <div v-else class="py-8">
      <!-- Header -->
      <header class="bg-transparent backdrop-blur-xl py-16 mb-12">
        <div class="container mx-auto px-4 max-w-4xl text-center">
          <!-- Breadcrumb -->
          <nav class="flex items-center justify-center space-x-2 text-sm text-black dark:text-white mb-8">
            <router-link to="/" class="hover:underline">Home</router-link>
            <ChevronRightIcon class="w-4 h-4" />
            <router-link to="/blog" class="hover:underline">Blog</router-link>
            <ChevronRightIcon class="w-4 h-4" />
            <span class="text-black dark:text-white">Tags</span>
          </nav>

          <h1 class="text-4xl md:text-5xl font-bold text-black dark:text-white mb-6">
            Explore by Tags
          </h1>
          <p class="text-xl text-black dark:text-white max-w-2xl mx-auto">
            Discover content through our comprehensive tag system. Find exactly what interests you.
          </p>
        </div>
      </header>



      <!-- Tags Cloud -->
      <div class="container mx-auto px-4 max-w-6xl">
        <div v-if="tags.length === 0" class="text-center py-16">
          <TagIcon class="w-16 h-16 text-black dark:text-white mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-black dark:text-white mb-2">
            No Tags Available
          </h3>
          <p class="text-black dark:text-white">
            Tags will appear here as blog posts are published.
          </p>
        </div>

        <div v-else>
          <!-- Popular Tags -->
          <div v-if="popularTags.length > 0" class="mb-12">
            <h2 class="text-2xl font-bold text-black dark:text-white mb-8 text-center">
              Popular Tags
            </h2>
            <div class="flex flex-wrap justify-center gap-4">
              <router-link v-for="tag in popularTags" :key="tag.id" :to="`/tags/${tag.slug}`"
                class="inline-flex items-center px-4 py-2 rounded-full border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 font-semibold text-sm transition-all"
                :style="{ fontSize: getTagSize(tag.post_count) }">
                <span class="font-semibold">#{{ tag.name }}</span>
                <span class="ml-2 text-sm opacity-75">({{ tag.post_count }})</span>
              </router-link>
            </div>
          </div>

          <!-- All Tags -->
          <div>

            <h2 class="text-2xl font-bold text-black dark:text-white mb-8 text-center">
              All Tags
            </h2>

            <!-- Sort Options -->
            <div class="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
              <div class="text-sm text-black dark:text-white">
                {{ tags.length }} {{ tags.length === 1 ? 'tag' : 'tags' }}
              </div>

              <div class="flex items-center gap-4">
                <label class="text-sm text-black dark:text-white">Sort by:</label>
                <select v-model="sortBy"
                  class="px-3 py-2 text-sm border border-black dark:border-white rounded-lg bg-transparent text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="popular">Most Popular</option>
                  <option value="name">Name A-Z</option>
                  <option value="recent">Recently Used</option>
                </select>
              </div>
            </div>

            <!-- Tags Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <router-link v-for="tag in sortedTags" :key="tag.id" :to="`/tags/${tag.slug}`"
                class="inline-flex flex-col items-center px-4 py-2 rounded-full border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 font-semibold text-sm transition-all">
                <span class="font-semibold">#{{ tag.name }}</span>
                <span class="mt-2 text-sm opacity-75">{{ tag.post_count || 0 }}
                  {{ (tag.post_count || 0) === 1 ? 'post' : 'posts' }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    ArrowLeftIcon,
    ChevronRightIcon,
    ExclamationTriangleIcon,
    TagIcon,
  } from '@heroicons/vue/24/outline';
  import { computed, onMounted, ref } from 'vue';
  import { tagsApi } from '../../services/blog';
  import type { Tag } from '../../types';
  import { updateSEO } from '../../utils/seo';

  // Reactive data
  const tags = ref<Tag[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const sortBy = ref('popular')

  // Computed properties

  const sortedTags = computed(() => {
    const sorted = [...tags.value]

    switch (sortBy.value) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'recent':
        return sorted.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime(),
        )
      case 'popular':
      default:
        return sorted.sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
    }
  })

  const popularTags = computed(() => {
    return tags.value
      .filter((tag) => (tag.post_count || 0) > 0)
      .sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
      .slice(0, 10)
  })

  const totalPosts = computed(() => {
    return tags.value.reduce((sum, tag) => sum + (tag.post_count || 0), 0)
  })

  const averageTagsPerPost = computed(() => {
    const postsWithTags = tags.value.filter((tag) => (tag.post_count || 0) > 0)
    if (postsWithTags.length === 0) return 0
    return totalPosts.value / postsWithTags.length
  })

  // Methods
  const fetchTags = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await tagsApi.getAll()
      tags.value = response.data || []

      // Update SEO
      updateSEO({
        title: 'Blog Tags',
        description: 'Explore our comprehensive tag system to find content that interests you.',
        type: 'website',
        url: window.location.href,
      })
    } catch (err) {
      console.error('Failed to fetch tags:', err)
      error.value = 'Failed to load tags. Please try again later.'
    } finally {
      loading.value = false
    }
  }

  const getTagSize = (postCount: number | undefined): string => {
    const count = postCount || 0
    if (count > 50) return '2rem'
    if (count > 20) return '1.5rem'
    if (count > 10) return '1.25rem'
    if (count > 5) return '1.125rem'
    return '1rem'
  }

  // Lifecycle
  onMounted(() => {
    fetchTags()
  })
</script>

<style scoped></style>
