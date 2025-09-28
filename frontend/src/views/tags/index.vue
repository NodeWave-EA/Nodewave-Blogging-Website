<template>
  <div class="min-h-screen bg-transparent">
    <!-- Loading State -->
    <div v-if="loading" class="py-16">
      <TagSkeleton :count="20" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-16">
      <div class="container mx-auto px-4 text-center">
        <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-black dark:text-white mb-2">Error Loading Tags</h1>
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

    <!-- Tags Content -->
    <div v-else class="py-8">
      <!-- Header -->
      <div class="container mx-auto px-4 max-w-4xl text-center">
        <PageHeader
          tag="Tags"
          title="Explore by Tags"
          description="Discover content through our comprehensive tag system. Find exactly what interests you."
          size="regular"
        />
      </div>

      <!-- Tags Cloud -->
      <div class="container mx-auto px-4 max-w-6xl">
        <div v-if="tags.length === 0" class="text-center py-16">
          <TagIcon class="w-16 h-16 text-black dark:text-white mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-black dark:text-white mb-2">No Tags Available</h3>
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
              <TagPill v-for="tag in popularTags" :key="tag.id" :tag="tag" :showCount="true" />
            </div>
          </div>

          <!-- All Tags -->
          <div>
            <!-- Sort Options -->
            <div class="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
              <div class="text-sm text-black dark:text-white">
                {{ tags.length }} {{ tags.length === 1 ? 'tag' : 'tags' }}
              </div>

              <div class="flex items-center gap-4">
                <label class="text-sm text-black dark:text-white">Sort by:</label>
                <SortOptions v-model="sortBy" :options="sortOptions" />
              </div>
            </div>

            <!-- Tags Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <TagPill v-for="tag in sortedTags" :key="tag.id" :tag="tag" :showCount="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SortOptions from '@/components/blog/SortOptions.vue'
import TagPill from '@/components/tag/TagPill.vue'
import TagSkeleton from '@/components/tag/TagSkeleton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { tagsApi } from '@/services'
import type { Tag } from '@/types'
import { dbg } from '@/utils/debug'
import { updateSEO } from '@/utils/seo'
import { ArrowLeftIcon, ExclamationTriangleIcon, TagIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted, ref } from 'vue'

// Reactive data
const tags = ref<Tag[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const sortBy = ref('popular')

const sortOptions = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Trending', value: 'trending' },
  { label: 'Name A-Z', value: 'name' },
  { label: 'Recently Used', value: 'recent' },
]

// Computed properties

const sortedTags = computed(() => {
  const sorted = [...tags.value]

  // Build comparator based on chosen sort method
  const comparator = (a: Tag, b: Tag) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'recent':
        return (
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
        )
      case 'trending':
        // When explicitly sorting by trending, within each group we prefer highest post count
        return (b.post_count || 0) - (a.post_count || 0)
      case 'popular':
      default:
        return (b.post_count || 0) - (a.post_count || 0)
    }
  }

  // Ensure trending tags always come first, then apply chosen comparator
  return sorted.sort((a, b) => {
    const trendingDiff = Number(Boolean(b.trending)) - Number(Boolean(a.trending))
    if (trendingDiff !== 0) return trendingDiff
    return comparator(a, b)
  })
})

const popularTags = computed(() => {
  return tags.value
    .filter((tag) => (tag.post_count || 0) > 0)
    .sort(
      (a, b) =>
        Number(Boolean(b.trending)) - Number(Boolean(a.trending)) ||
        (b.post_count || 0) - (a.post_count || 0),
    )
    .slice(0, 10)
})

// Methods
const fetchTags = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await tagsApi.getAll()
    dbg('[Tags]', 'Fetch tags response:', response)

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

// Populate tag.post_count by asking the posts API for the total matching posts for each tag.
// This is a best-effort fallback when the tag object doesn't contain a reliable post_count.

// Lifecycle
onMounted(() => {
  fetchTags()
})
</script>

<style scoped></style>
