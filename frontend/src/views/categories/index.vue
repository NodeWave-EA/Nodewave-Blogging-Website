<template>
  <div class="min-h-screen bg-transparent">
    <!-- Loading State: show full-page skeleton while initial API request is pending -->
    <CategoryPageSkeleton v-if="loading" mode="index" />

    <!-- Error State -->
    <div v-else-if="error" class="py-16">
      <div class="container mx-auto px-4 text-center">
        <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-black dark:text-white mb-2">Error Loading Categories</h1>
        <p class="text-black dark:text-white mb-8">{{ error }}</p>
        <router-link to="/blog"
          class="inline-flex items-center px-6 py-3 rounded-lg bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          Back to Blog
        </router-link>
      </div>
    </div>

    <!-- Categories Content -->
    <div v-else class="py-8">
      <!-- Page Header -->
      <PageHeader tag="Categories" title="Explore by Category"
        description="Browse our blog posts organized by categories to find exactly what you're looking for."
        size="regular" />

      <!-- Categories Grid -->
      <div class="container mx-auto px-4 max-w-6xl">
        <div v-if="categories.length === 0" class="text-center py-16">
          <FolderIcon class="w-16 h-16 text-black dark:text-white mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-black dark:text-white mb-2">No Categories Found</h3>
          <p class="text-black dark:text-white">
            Categories will appear here as blog posts are published.
          </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <router-link v-for="category in categories" :key="category.id" :to="`/categories/${category.slug}`"
            class="group bg-transparent backdrop-blur-xl rounded-xl p-8 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-black dark:border-white">
            <!-- Category Icon/Image -->
            <div class="mb-6">
              <div v-if="category.icon"
                class="w-16 h-16 rounded-lg flex items-center justify-center text-2xl bg-transparent"
                :style="{ color: category.color || undefined }">
                <FontAwesomeIcon :icon="category.icon" :color="category.color" size="w-8 h-8">
                  <template #default>
                    <FolderIcon class="w-8 h-8" />
                  </template>
                </FontAwesomeIcon>
              </div>
              <div v-else
                class="w-16 h-16 rounded-lg flex items-center justify-center text-black dark:text-white bg-transparent">
                <FolderIcon class="w-8 h-8" />
              </div>
            </div>

            <!-- Category Info -->
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-3 group-hover:underline transition-colors"
                :style="{ color: category.color || undefined }">
                {{ category.name }}
              </h3>

              <p v-if="category.description" class="text-black dark:text-white mb-4 line-clamp-3">
                {{ category.description }}
              </p>

              <!-- Post Count -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm text-black dark:text-white">
                  <DocumentTextIcon class="w-4 h-4" />
                  <span>{{ category.post_count || 0 }} posts</span>
                </div>

                <ArrowRightIcon
                  class="w-5 h-5 text-black dark:text-white group-hover:underline transform group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Popular Categories -->
      <div v-if="popularCategories.length > 0" class="container mx-auto px-4 max-w-6xl mt-16">
        <h2 class="text-2xl font-bold text-black dark:text-white mb-8 text-center">
          Popular Categories
        </h2>
        <div class="flex flex-wrap justify-center gap-3">
          <router-link v-for="category in popularCategories" :key="category.id" :to="`/categories/${category.slug}`"
            class="inline-flex items-center px-4 py-2 rounded-full border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 font-semibold text-sm transition-all"
            :style="{
              color: category.color || undefined,
              borderColor: category.color || undefined,
            }">
            {{ category.name }}
            <span class="ml-2 text-xs opacity-75">({{ category.post_count }})</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import FontAwesomeIcon from '@/components/ui/FontAwesomeIcon.vue';
  import PageHeader from '@/components/ui/PageHeader.vue';
  import { blogPostsApi, categoriesApi } from '@/services';
  import type { Category } from '@/types';
  import { dbg } from '@/utils/debug';
  import { updateSEO } from '@/utils/seo';
  import {
    ArrowLeftIcon,
    ArrowRightIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    FolderIcon,
  } from '@heroicons/vue/24/outline';
  import { computed, onMounted, ref } from 'vue';
  import CategoryPageSkeleton from '../../components/category/CategoryPageSkeleton.vue';

  // Reactive data
  const categories = ref<Category[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Computed properties
  const popularCategories = computed(() => {
    return categories.value
      .filter((cat) => (cat.post_count || 0) > 0)
      .sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
      .slice(0, 8)
  })

  // Methods
  // FontAwesome icon parsing moved into FontAwesomeIcon component; categories view now uses that wrapper.
  const fetchCategories = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await categoriesApi.getAll()
      dbg('Categories.vue', 'fetchCategories response', { length: response })
      categories.value = response.data || []

      // Fallback: if post_count is missing or zero for any category, fetch a lightweight count
      const missing = categories.value.filter((c) => !c.post_count || c.post_count === 0)
      if (missing.length > 0) {
        await Promise.all(
          missing.map(async (cat) => {
            try {
              const r = await blogPostsApi.getByCategory(cat.id, { page: 1, pageSize: 1 })
              const total = r.meta?.pagination?.total ?? (r.data?.length || 0)
              cat.post_count = total
            } catch (e) {
              // ignore per-category failures
              console.warn('Failed to fetch fallback count for category', cat.id, e)
            }
          }),
        )
      }

      // Update SEO
      updateSEO({
        title: 'Blog Categories',
        description:
          'Explore our blog posts organized by categories. Find content that interests you.',
        type: 'website',
        url: window.location.href,
      })
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      error.value = 'Failed to load categories. Please try again later.'
    } finally {
      loading.value = false
    }
  }

  // Lifecycle
  onMounted(() => {
    fetchCategories()
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
