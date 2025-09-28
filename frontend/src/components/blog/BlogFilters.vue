<template>
  <section
    class="relative border-b border-slate-200/50 dark:border-slate-700/50 bg-transparent backdrop-blur-md shadow-md">
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Search Bar -->
      <div v-if="showSearch" class="max-w-3xl mx-auto mb-12" data-aos="fade-up">
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <MagnifyingGlassIcon
              class="h-6 w-6 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input v-model="localSearch" @input="handleSearchInput" type="text"
            placeholder="Search articles, topics, or authors..."
            class="block w-full rounded-full pl-14 pr-14 py-4 text-lg font-medium border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl" />
          <div v-if="localSearch" class="absolute inset-y-0 right-0 pr-5 flex items-center">
            <button @click="clearSearch"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8" data-aos="fade-up"
        data-aos-delay="100">
        <!-- Category Filter -->
        <div class="flex items-center space-x-5">
          <label class="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Filter by:
          </label>
          <div class="w-52">
            <!-- Use the same styled SortOptions dropdown for categories so styling is consistent -->
            <SortOptions v-model="localCategory" :options="categoryOptions" />
          </div>
        </div>

        <!-- Active Filters (moved between category and sort) -->
        <div class="mt-4 lg:mt-0 lg:mx-6 flex items-center" v-if="hasActiveFilters">
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-base font-semibold text-slate-600 dark:text-slate-400">Active filters:</span>

            <!-- Search Filter -->
            <span v-if="localSearch"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 shadow-sm">
              Search: "{{ localSearch }}"
              <button @click="clearSearch"
                class="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100 rounded-full p-0.5 transition-colors">
                <XMarkIcon class="h-4 w-4" />
              </button>
            </span>

            <!-- Category Filter -->
            <span v-if="localCategory"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 shadow-sm">
              Category: {{ getCategoryName(localCategory) }}
              <button @click="clearCategory"
                class="text-emerald-600 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-100 rounded-full p-0.5 transition-colors">
                <XMarkIcon class="h-4 w-4" />
              </button>
            </span>

            <!-- Clear All -->
            <button @click="clearAllFilters"
              class="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline underline-offset-2 decoration-2 hover:decoration-blue-500 transition-colors">
              Clear all
            </button>
          </div>
        </div>

        <!-- Sort Options -->
        <div class="flex items-center space-x-5">
          <label class="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Sort by:
          </label>
          <div class="w-52">
            <SortOptions v-model="localSort" :options="sortOptions" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline';
  import { computed, ref, watch } from 'vue';
  import type { Category } from '../../types';
  import SortOptions from './SortOptions.vue';

  const sortOptions = [
    { label: 'Featured', value: 'featured' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Alphabetical', value: 'title' },
  ]

  interface Props {
    search?: string
    category?: string
    sort?: 'newest' | 'oldest' | 'popular' | 'title' | 'featured'
    categories?: Category[]
    showResultsSummary?: boolean
    resultsCount?: number
    totalCount?: number
    showSearch?: boolean
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
    sort: 'title',
    categories: () => [],
    showResultsSummary: false,
    resultsCount: 0,
    totalCount: 0,
    showSearch: true,
  })

  const emit = defineEmits<Emits>()

  // Local reactive copies for v-model
  const localSearch = ref(props.search)
  const localCategory = ref(props.category)
  const localSort = ref(props.sort)

  // Computed properties
  const hasActiveFilters = computed(() => {
    return !!((props.showSearch && localSearch.value) || localCategory.value)
  })


  const categoryOptions = computed(() => [
    { label: 'All Categories', value: '' },
    ...(props.categories || []).map((c) => ({ label: c.name, value: c.slug })),
  ])

  // Methods
  const handleSearchInput = () => {
    // Only emit search events when the search control is enabled
    if (!props.showSearch) return
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
