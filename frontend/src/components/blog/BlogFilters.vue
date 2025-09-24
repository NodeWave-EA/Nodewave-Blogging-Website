<template>
  <section class="relative border-b border-slate-200/50 dark:border-slate-700/50">
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto mb-10" data-aos="fade-up">
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-6 w-6 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input v-model="localSearch" @input="handleSearchInput" type="text" placeholder="Search articles, topics, or authors..."
            class="block w-full pl-12 pr-12 py-4 text-lg border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl" />
          <div v-if="localSearch" class="absolute inset-y-0 right-0 pr-4 flex items-center">
            <button @click="clearSearch"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8" data-aos="fade-up"
        data-aos-delay="100">
        <!-- Category Filter -->
        <div class="flex items-center space-x-6">
          <label class="text-lg font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Filter by:
          </label>
          <div class="relative group">
            <select v-model="localCategory"
              class="appearance-none bg-white/90 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 backdrop-blur-sm block w-full pl-4 pr-12 py-3 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.slug">
                {{ category.name }}
              </option>
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-700 dark:text-slate-300">
              <ChevronDownIcon class="h-5 w-5 transition-transform group-hover:rotate-180" />
            </div>
          </div>
        </div>

        <!-- Sort Options -->
        <div class="flex items-center space-x-6">
          <label class="text-lg font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Sort by:
          </label>
          <div class="relative group">
            <select v-model="localSort"
              class="appearance-none bg-white/90 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 backdrop-blur-sm block w-full pl-4 pr-12 py-3 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="title">Alphabetical</option>
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-700 dark:text-slate-300">
              <ChevronDownIcon class="h-5 w-5 transition-transform group-hover:rotate-180" />
            </div>
          </div>
        </div>
      </div>

      <!-- Active Filters -->
      <div v-if="hasActiveFilters" class="mt-8" data-aos="fade-up" data-aos-delay="200">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-base font-semibold text-slate-600 dark:text-slate-400">Active filters:</span>

          <!-- Search Filter -->
          <span v-if="localSearch"
            class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 backdrop-blur-sm border border-blue-200 dark:border-blue-800 shadow-md">
            Search: "{{ localSearch }}"
            <button @click="clearSearch"
              class="ml-3 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5 transition-colors">
              <XMarkIcon class="h-4 w-4" />
            </button>
          </span>

          <!-- Category Filter -->
          <span v-if="localCategory"
            class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800 shadow-md">
            Category: {{ getCategoryName(localCategory) }}
            <button @click="clearCategory"
              class="ml-3 text-emerald-600 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-100 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 rounded-full p-0.5 transition-colors">
              <XMarkIcon class="h-4 w-4" />
            </button>
          </span>

          <!-- Clear All -->
          <button @click="clearAllFilters"
            class="text-base text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline decoration-2 underline-offset-2 transition-colors hover:decoration-blue-500">
            Clear all
          </button>
        </div>
      </div>

      <!-- Results Summary -->
      <div v-if="showResultsSummary" class="mt-8 text-center" data-aos="fade-up"
        data-aos-delay="300">
        <p class="text-lg font-medium text-slate-600 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 px-6 py-3 rounded-2xl inline-block backdrop-blur-sm">
          {{ resultsSummaryText }}
        </p>
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
