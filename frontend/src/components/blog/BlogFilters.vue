<template>
  <section class="border-b border-black/10 dark:border-white/10 bg-transparent backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto mb-8" data-aos="fade-up">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input v-model="localSearch" @input="handleSearchInput" type="text" placeholder="Search blog posts..."
            class="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 backdrop-blur-sm transition-all duration-200" />
          <div v-if="localSearch" class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button @click="clearSearch"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6" data-aos="fade-up"
        data-aos-delay="100">
        <!-- Category Filter -->
        <div class="flex items-center space-x-4">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Filter by:
          </label>
          <div class="relative">
            <select v-model="localCategory"
              class="appearance-none bg-transparent border border-gray-300 dark:border-gray-600 text-black dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 backdrop-blur-sm block w-full pl-3 pr-10 py-2.5 transition-all duration-200">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.slug">
                {{ category.name }}
              </option>
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <ChevronDownIcon class="h-4 w-4" />
            </div>
          </div>
        </div>

        <!-- Sort Options -->
        <div class="flex items-center space-x-4">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Sort by:
          </label>
          <div class="relative">
            <select v-model="localSort"
              class="appearance-none bg-transparent border border-gray-300 dark:border-gray-600 text-black dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 backdrop-blur-sm block w-full pl-3 pr-10 py-2.5 transition-all duration-200">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="title">Alphabetical</option>
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <ChevronDownIcon class="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <!-- Active Filters -->
      <div v-if="hasActiveFilters" class="mt-6" data-aos="fade-up" data-aos-delay="200">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Active filters:</span>

          <!-- Search Filter -->
          <span v-if="localSearch"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 backdrop-blur-sm">
            Search: "{{ localSearch }}"
            <button @click="clearSearch"
              class="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100">
              <XMarkIcon class="h-3 w-3" />
            </button>
          </span>

          <!-- Category Filter -->
          <span v-if="localCategory"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 backdrop-blur-sm">
            Category: {{ getCategoryName(localCategory) }}
            <button @click="clearCategory"
              class="ml-2 text-emerald-600 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-100">
              <XMarkIcon class="h-3 w-3" />
            </button>
          </span>

          <!-- Clear All -->
          <button @click="clearAllFilters"
            class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline transition-colors">
            Clear all
          </button>
        </div>
      </div>

      <!-- Results Summary -->
      <div v-if="showResultsSummary" class="mt-6 text-sm text-gray-500 dark:text-gray-400" data-aos="fade-up"
        data-aos-delay="300">
        {{ resultsSummaryText }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline';
  import { computed, ref, watch } from 'vue';
  import type { Category } from '../../types';

  interface Props {
    search?: string
    category?: string
    sort?: 'newest' | 'oldest' | 'popular' | 'title'
    categories?: Category[]
    showResultsSummary?: boolean
    resultsCount?: number
    totalCount?: number
  }

  interface Emits {
    (e: 'update:search', value: string): void
    (e: 'update:category', value: string): void
    (e: 'update:sort', value: string): void
    (e: 'search'): void
    (e: 'filter-change'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    search: '',
    category: '',
    sort: 'newest',
    categories: () => [],
    showResultsSummary: false,
    resultsCount: 0,
    totalCount: 0,
  })

  const emit = defineEmits<Emits>()

  // Local reactive copies for v-model
  const localSearch = ref(props.search)
  const localCategory = ref(props.category)
  const localSort = ref(props.sort)

  // Computed properties
  const hasActiveFilters = computed(() => {
    return !!(localSearch.value || localCategory.value)
  })

  const resultsSummaryText = computed(() => {
    if (!props.showResultsSummary) return ''

    if (hasActiveFilters.value) {
      return `Showing ${props.resultsCount} of ${props.totalCount} posts`
    }
    return `${props.totalCount} posts total`
  })

  // Methods
  const handleSearchInput = () => {
    emit('update:search', localSearch.value)
    emit('search')
  }

  const clearSearch = () => {
    localSearch.value = ''
    emit('update:search', '')
    emit('filter-change')
  }

  const clearCategory = () => {
    localCategory.value = ''
    emit('update:category', '')
    emit('filter-change')
  }

  const clearAllFilters = () => {
    localSearch.value = ''
    localCategory.value = ''
    emit('update:search', '')
    emit('update:category', '')
    emit('filter-change')
  }

  const getCategoryName = (slug: string): string => {
    const category = props.categories.find((cat) => cat.slug === slug)
    return category?.name || slug
  }

  // Watchers to sync with parent
  watch(
    () => props.search,
    (newValue) => {
      localSearch.value = newValue
    },
  )

  watch(
    () => props.category,
    (newValue) => {
      localCategory.value = newValue
    },
  )

  watch(
    () => props.sort,
    (newValue) => {
      localSort.value = newValue
    },
  )

  // Emit updates when local values change
  watch(localCategory, (newValue) => {
    emit('update:category', newValue)
    emit('filter-change')
  })

  watch(localSort, (newValue) => {
    emit('update:sort', newValue)
    emit('filter-change')
  })
</script>

<!-- No custom styles: all styling is handled by Tailwind CSS v4 classes -->
