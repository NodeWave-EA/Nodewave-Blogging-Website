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
          <div class="w-52 relative" ref="catRoot">
            <button type="button" ref="catButton" :aria-expanded="categoriesOpen" aria-haspopup="listbox"
              aria-controls="category-menu" @click="toggleCategoryDropdown"
              class="appearance-none w-full bg-transparent border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl px-4 py-3 pr-10 flex items-center justify-between shadow-md hover:shadow-lg">
              <span class="truncate">
                {{ localCategories.length ? String(localCategories.length) : 'All Categories' }}
              </span>
              <svg class="h-5 w-5 text-slate-500 dark:text-slate-400" viewBox="0 0 20 20" fill="currentColor"
                aria-hidden="true">
                <path fill-rule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.04 1.08l-4.25 4a.75.75 0 01-1.04 0l-4.25-4a.75.75 0 01-.02-1.06z"
                  clip-rule="evenodd" />
              </svg>
            </button>

            <teleport to="body">
              <transition name="fade">
                <ul v-if="categoriesOpen" ref="catMenuRef" role="listbox" tabindex="-1"
                  class="absolute z-[9999] mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 overflow-auto max-h-72"
                  :style="catMenuStyle">
                  <li v-for="(opt) in categoryOptions" :key="opt.value" role="option"
                    @click.prevent.stop="opt.value === '' ? clearAllCategories() : toggleCategory(opt.value)" :class="[
                      'px-4 py-2 text-sm cursor-pointer truncate flex items-center gap-2',
                      opt.value === '' ? 'font-medium' : isCategorySelected(opt.value) ? 'bg-slate-100 dark:bg-slate-900 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-700',
                    ]">
                    <input v-if="opt.value !== ''" type="checkbox" class="mr-2" :checked="isCategorySelected(opt.value)"
                      readonly />
                    <span>{{ opt.label }}</span>
                  </li>
                </ul>
              </transition>
            </teleport>
          </div>
        </div>

        <!-- Active Filters (moved between category and sort) -->
        <div class="mt-4 lg:mt-0 lg:mx-6 flex items-center" v-if="hasActiveFilters">
          <div class="flex flex-wrap items-center gap-3">
            <!-- Search Filter chip (no "Search:" label) -->
            <span v-if="localSearch"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 shadow-sm">
              "{{ localSearch }}"
              <button @click="clearSearch"
                class="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100 rounded-full p-0.5 transition-colors">
                <XMarkIcon class="h-4 w-4" />
              </button>
            </span>

            <!-- Category chips: show only category names and x to remove single category -->
            <template v-for="slug in localCategories" :key="slug">
              <span
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 shadow-sm">
                {{ getCategoryName(slug) }}
                <button @click="clearCategoryChip(slug)"
                  class="text-emerald-600 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-100 rounded-full p-0.5 transition-colors">
                  <XMarkIcon class="h-4 w-4" />
                </button>
              </span>
            </template>
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
  import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
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
    // Support single or multiple selected categories
    category?: string | string[]
    sort?: 'newest' | 'oldest' | 'popular' | 'title' | 'featured'
    categories?: Category[]
    showResultsSummary?: boolean
    resultsCount?: number
    totalCount?: number
    showSearch?: boolean
  }

  interface Emits {
    (e: 'update:search', value: string): void
    (e: 'update:category', value: string | string[]): void
    (e: 'update:sort', value: string): void
    (e: 'search'): void
    (e: 'filter-change'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    search: '',
    category: () => [],
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
  // Keep a local copy (separate array) so mutations don't directly mutate the incoming prop
  const localCategories = ref<string[]>(
    Array.isArray(props.category) ? ([...(props.category as string[])]) : props.category ? [props.category as string] : [],
  )
  const localSort = ref(props.sort)

  // Computed properties
  const hasActiveFilters = computed(() => {
    return !!((props.showSearch && localSearch.value) || (localCategories.value && localCategories.value.length > 0))
  })


  const categoryOptions = computed(() => [
    { label: 'All Categories', value: '' },
    ...(props.categories || []).map((c) => ({ label: c.name, value: c.slug })),
  ])

  // Dropdown state for category multi-select
  const categoriesOpen = ref(false)
  const catRoot = ref<HTMLElement | null>(null)
  const catButton = ref<HTMLElement | null>(null)
  const catMenuRef = ref<HTMLElement | null>(null)
  const catMenuStyle = ref<Record<string, string>>({})

  const toggleCategoryDropdown = () => {
    categoriesOpen.value = !categoriesOpen.value
    if (categoriesOpen.value) {
      nextTick(positionCatMenu)
      addCatDocListeners()
    } else {
      removeCatDocListeners()
    }
  }

  const positionCatMenu = () => {
    if (!catButton.value) return
    const rect = catButton.value.getBoundingClientRect()
    const top = rect.bottom + window.scrollY
    const left = rect.left + window.scrollX
    catMenuStyle.value = {
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      width: `${rect.width}px`,
    }
  }

  const handleCatDocClick = (e: MouseEvent) => {
    const target = e.target as Node | null
    if (!target) return
    if (catRoot.value && catRoot.value.contains(target)) return
    if (catMenuRef.value && catMenuRef.value.contains(target)) return
    categoriesOpen.value = false
    removeCatDocListeners()
  }

  const handleCatWindowChange = () => {
    if (!categoriesOpen.value) return
    positionCatMenu()
  }

  const addCatDocListeners = () => {
    document.addEventListener('mousedown', handleCatDocClick)
    window.addEventListener('resize', handleCatWindowChange)
    window.addEventListener('scroll', handleCatWindowChange, true)
  }

  const removeCatDocListeners = () => {
    document.removeEventListener('mousedown', handleCatDocClick)
    window.removeEventListener('resize', handleCatWindowChange)
    window.removeEventListener('scroll', handleCatWindowChange, true)
  }

  onUnmounted(() => {
    removeCatDocListeners()
  })

  const isCategorySelected = (slug: string) => localCategories.value.includes(slug)

  const toggleCategory = (slug: string) => {
    const idx = localCategories.value.indexOf(slug)
    if (idx === -1) {
      localCategories.value.push(slug)
    } else {
      localCategories.value.splice(idx, 1)
    }
    emitCategoryChange()
  }

  const clearCategoryChip = (slug: string) => {
    const idx = localCategories.value.indexOf(slug)
    if (idx !== -1) {
      localCategories.value.splice(idx, 1)
    }
    emitCategoryChange()
  }

  const clearAllCategories = () => {
    localCategories.value = []
    emitCategoryChange()
  }

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


  const getCategoryName = (slug: string): string => {
    const category = props.categories.find((cat) => cat.slug === slug)
    return category?.name || slug
  }

  // Utility to compare arrays shallowly

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
      // normalize incoming prop to array and copy to avoid shared references
      if (Array.isArray(newValue)) localCategories.value = [...(newValue as string[])]
      else if (newValue) localCategories.value = [newValue as string]
      else localCategories.value = []
    },
  )

  watch(
    () => props.sort,
    (newValue) => {
      localSort.value = newValue
    },
  )

  // Emit when the user changes sort option (guard against reflecting back parent updates)
  watch(
    () => localSort.value,
    (newValue) => {
      if (newValue === props.sort) return
      emit('update:sort', newValue)
      emit('filter-change')
    },
  )

  // Emit updates when user interacts (avoid emitting on programmatic prop sync to prevent loops)
  const emitCategoryChange = () => {
    emit('update:category', [...localCategories.value])
    emit('filter-change')
  }
</script>
