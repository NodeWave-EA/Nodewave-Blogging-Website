<template>
  <!-- Inline dropdown (no overlay/backdrop) -->
  <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-1"
    enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
    <div v-if="isOpen" ref="rootRef"
      class="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 z-50 w-full max-w-2xl overflow-hidden text-left bg-white dark:bg-zinc-900 shadow-xl rounded-2xl border border-zinc-200 dark:border-zinc-700"
      @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">Search</h3>
        <button @click="close"
          class="p-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Close search">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Search Input (modular) -->
      <div class="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <SearchInput ref="searchInput" v-model="searchQuery" placeholder="Search for posts, authors, categories..."
          @enter="performSearchImmediate" @clear="() => (searchQuery = '')" />

        <!-- Quick Actions -->
        <div class="flex flex-wrap gap-2 mt-3">
          <button v-for="filter in quickFilters" :key="filter.key" @click="applyQuickFilter(filter)"
            class="px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors">
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Results Scrollable (modular) -->
      <div class="max-h-96 overflow-y-auto custom-scroll">
        <SearchResults :results="currentResults" :loading="loading" :query="searchQuery" :selectedIndex="selectedIndex"
          :total="totalResults" :recentSearches="recentSearches" :popularCategories="popularCategories" :mode="mode"
          :groups="computedGroups" @select-result="onSelectResult" @view-all="onViewAll"
          @select-suggestion="onSelectSuggestion" @select-category="onSelectCategory"
          @jump-to="(i) => (selectedIndex = i)" />
      </div>

      <!-- Footer -->
      <div
        class="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <span class="flex items-center space-x-1">
            <kbd
              class="px-1.5 py-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded">
              ↵
            </kbd>
            <span>to select</span>
          </span>
          <span class="flex items-center space-x-1">
            <kbd
              class="px-1.5 py-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded">
              esc
            </kbd>
            <span>to close</span>
          </span>
        </div>
        <div v-if="searchResults.length > 0">
          {{ searchResults.length }} of {{ totalResults }} results
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { apiService, searchService } from '@/services';
  import type { Category, SearchResult, SearchResults as SearchResultsType } from '@/types';
  import { debounce } from '@/utils/debounce';
  import { dbg } from '@/utils/debug';
  import { highlightText } from '@/utils/highlight';
  import { XMarkIcon } from '@heroicons/vue/24/outline';
  import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import SearchInput from './SearchInput.vue';
  import SearchResults from './SearchResults.vue';

  interface Props {
    modelValue?: boolean
  }

  interface Emits {
    (e: 'close'): void
    (e: 'update:modelValue', value: boolean): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: true,
  })

  const emit = defineEmits<Emits>()

  const router = useRouter()

  // Reactive state
  const searchInput = ref<any>(null)
  const rootRef = ref<HTMLElement | null>(null)
  const searchQuery = ref('')
  const suggestionItems = ref<SearchResult[]>([])
  const searchResults = ref<SearchResult[]>([])
  const mode = ref<'idle' | 'suggest' | 'results'>('idle')
  const loading = ref(false)
  const selectedIndex = ref(0)
  const recentSearches = ref<string[]>([])
  const popularCategories = ref<Category[]>([])
  const totalResults = ref(0)

  const currentResults = computed(() => (mode.value === 'suggest' ? suggestionItems.value : searchResults.value))

  // Computed
  const isOpen = computed(() => props.modelValue)

  // Quick filters
  const quickFilters = [
    { key: 'recent', label: 'Recent Posts', filter: 'recent' },
    { key: 'popular', label: 'Popular', filter: 'popular' },
    { key: 'featured', label: 'Featured', filter: 'featured' },
  ]

  // Type helpers

  // Search functionality
  const performSearchImmediate = async () => {
    if (!searchQuery.value.trim()) {
      searchResults.value = []
      totalResults.value = 0
      return
    }

    // mark we are showing full search results
    mode.value = 'results'
    loading.value = true
    selectedIndex.value = 0

    try {
      const response: SearchResultsType = await searchService.search(searchQuery.value, 20)

      dbg('SearchModal.vue', 'performSearchImmediate response', response)

      // Apply highlighting to title/excerpt
      const results = (response.results || []).map((r) => ({
        ...r,
        highlightedTitle: highlightText(r.title || '', searchQuery.value),
        highlightedExcerpt: highlightText(r.excerpt || '', searchQuery.value),
      }))

      searchResults.value = results as any
      totalResults.value = response.total || results.length

      // Add to recent searches
      addToRecentSearches(searchQuery.value)
    } catch (error) {
      console.error('Search error:', error)
      searchResults.value = []
      totalResults.value = 0
    } finally {
      loading.value = false
    }
  }

  // Debounced suggestions (typeahead) — uses lightweight suggest endpoint
  const performSuggest = debounce(async () => {
    if (!searchQuery.value.trim()) return
    try {
      loading.value = true
      const resp: any = await searchService.suggest(searchQuery.value, 8)

      dbg('SearchModal.vue', 'performSuggest response', resp)

      // Map server suggestions into SearchResult-like objects so they can be rendered and selected
      const suggestions = (resp.suggestions || []).map((s: any) => {
        const base = {
          type: s.type,
          id: s.id || 0,
          title: s.text,
          slug: s.slug || undefined,
          excerpt: '',
          url:
            s.url ||
            (s.type === 'post'
              ? `/blog/${s.slug}`
              : s.type === 'author'
                ? `/authors/${s.slug}`
                : s.type === 'category'
                  ? `/categories/${s.slug}`
                  : s.type === 'tag'
                    ? `/tags/${s.slug}`
                    : '/'),
        }
        return {
          ...base,
          highlightedTitle: highlightText(base.title || '', searchQuery.value),
        }
      })

      suggestionItems.value = suggestions as any
      totalResults.value = suggestions.length
      selectedIndex.value = 0
      // show suggestion mode while user is actively typing
      mode.value = 'suggest'
    } catch (e) {
      console.error('Suggest error', e)
    } finally {
      loading.value = false
    }
  }, 250)

  // When user stops typing, perform the full search automatically
  const performAutoSearch = debounce(async () => {
    if (!searchQuery.value.trim()) return
    await performSearchImmediate()
  }, 600)

  // For compatibility, keep a performSearch wrapper that calls the immediate full search

  // Recent searches management
  const addToRecentSearches = (query: string) => {
    const searches = recentSearches.value.filter((s) => s !== query)
    searches.unshift(query)
    recentSearches.value = searches.slice(0, 5)
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value))
  }

  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem('recentSearches')
      if (stored) {
        recentSearches.value = JSON.parse(stored)
      }
    } catch (error) {
      recentSearches.value = []
    }
  }

  // Categories
  const loadPopularCategories = async () => {
    try {
      const response: { data: Category[] } = await apiService.get('/categories', {
        params: {
          sort: 'post_count:desc',
          pagination: { limit: 6 },
          populate: 'blog_posts',
        },
      })
      popularCategories.value = response.data || []
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  // Quick filter actions
  const applyQuickFilter = (filter: any) => {
    switch (filter.filter) {
      case 'recent':
        router.push('/blog?sort=newest')
        break
      case 'popular':
        router.push('/blog?sort=popular')
        break
      case 'featured':
        router.push('/blog?featured=true')
        break
    }
    close()
  }

  // Result selection
  const selectResult = (result: SearchResult) => {
    router.push(result.url)
    close()
  }

  // Suggestions selection
  const selectSuggestion = async (payload: string | { text: string; type: string; url?: string; slug?: string }) => {
    if (typeof payload === 'string') {
      searchQuery.value = payload
      // user selected a recent text search — run full search immediately
      await performSearchImmediate()
      return
    }

    // Instead of navigating directly, show a filtered result list so user can choose between multiple matches.
    searchQuery.value = payload.text
    selectedIndex.value = 0
    mode.value = 'results'
    loading.value = true
    try {
      // Prefer the quick endpoint when a type is provided for more focused results
      if (payload.type) {
        const resp: any = await searchService.quick(payload.text, payload.type, 20)
        // quick endpoint returns { data: [...] }
        const rows: any[] = resp?.data || []
        if (rows.length > 0) {
          const mapped = rows.map((r: any) => {
            switch (payload.type) {
              case 'post':
                return {
                  type: 'post',
                  id: r.id,
                  title: r.title,
                  slug: r.slug,
                  excerpt: r.excerpt || r.description || '',
                  url: `/blog/${r.slug}`,
                  highlightedTitle: highlightText(r.title || '', searchQuery.value),
                }
              case 'author':
                return {
                  type: 'author',
                  id: r.id,
                  title: r.name,
                  slug: r.slug,
                  excerpt: r.bio || r.job_title || '',
                  url: `/authors/${r.slug}`,
                  highlightedTitle: highlightText(r.name || '', searchQuery.value),
                }
              case 'category':
                return {
                  type: 'category',
                  id: r.id,
                  title: r.name,
                  slug: r.slug,
                  excerpt: r.description || '',
                  url: `/categories/${r.slug}`,
                  highlightedTitle: highlightText(r.name || '', searchQuery.value),
                }
              case 'tag':
                return {
                  type: 'tag',
                  id: r.id,
                  title: r.name,
                  slug: r.slug,
                  excerpt: r.description || '',
                  url: `/tags/${r.slug}`,
                  highlightedTitle: highlightText(r.name || '', searchQuery.value),
                }
              default:
                return {
                  type: payload.type as any,
                  id: r.id,
                  title: r.title || r.name || '',
                  slug: r.slug,
                  excerpt: r.excerpt || r.description || '',
                  url: r.slug ? `/${payload.type}/${r.slug}` : '/',
                  highlightedTitle: highlightText(r.title || r.name || '', searchQuery.value),
                }
            }
          })
          searchResults.value = mapped as any
          totalResults.value = mapped.length
          addToRecentSearches(searchQuery.value)
          return
        }
      }

      // If quick didn't return anything, fall back to full search to show more possibilities
      await performSearchImmediate()
    } catch (e) {
      console.error('selectSuggestion quick search error', e)
      await performSearchImmediate()
    } finally {
      loading.value = false
    }
  }

  const selectCategorySuggestion = (slug: string) => {
    router.push(`/categories/${slug}`)
    close()
  }

  // Modal controls
  const close = () => {
    emit('close')
    emit('update:modelValue', false)
  }

  // Compute group starts mapping based on current search results
  const computeGroupStarts = () => {
    const map: Record<string, number> = {}
    for (let i = 0; i < searchResults.value.length; i++) {
      const t = searchResults.value[i].type
      if (map[t] === undefined) map[t] = i
    }
    return map
  }

  // Reactive groupStarts map used for keyboard jumps
  const groupStarts = computed(() => computeGroupStarts())

  // Compute grouped metadata for results to render headers with counts
  const computedGroups = computed(() => {
    const order = ['post', 'author', 'category', 'tag']
    const groupsArr: Array<{ type: string; start: number; count: number }> = []
    order.forEach((t) => {
      const start = searchResults.value.findIndex((r) => r.type === t)
      if (start >= 0) {
        const count = searchResults.value.filter((r) => r.type === t).length
        groupsArr.push({ type: t, start, count })
      }
    })
    return groupsArr
  })

  // Keyboard navigation
  const handleKeydown = (event: KeyboardEvent) => {
    if (!isOpen.value) return

    switch (event.key) {
      case 'Escape':
        close()
        break
      case 'ArrowDown':
        event.preventDefault()
        selectedIndex.value = Math.min(selectedIndex.value + 1, searchResults.value.length - 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
        break
      case 'Enter':
        event.preventDefault()
        if (searchResults.value[selectedIndex.value]) {
          selectResult(searchResults.value[selectedIndex.value])
        } else {
          // If there is no selected result, run an immediate search but keep the overlay open
          performSearchImmediate()
        }
        break
      // Jump to group via Alt+1..4
      case '1':
        if (event.altKey) {
          event.preventDefault()
          if (groupStarts.value['post'] !== undefined) selectedIndex.value = groupStarts.value['post']
        }
        break
      case '2':
        if (event.altKey) {
          event.preventDefault()
          if (groupStarts.value['author'] !== undefined) selectedIndex.value = groupStarts.value['author']
        }
        break
      case '3':
        if (event.altKey) {
          event.preventDefault()
          if (groupStarts.value['category'] !== undefined) selectedIndex.value = groupStarts.value['category']
        }
        break
      case '4':
        if (event.altKey) {
          event.preventDefault()
          if (groupStarts.value['tag'] !== undefined) selectedIndex.value = groupStarts.value['tag']
        }
        break
    }
  }

  // Watch for search query changes — show suggestions while typing and auto-search when user stops
  watch(searchQuery, (val) => {
    if (!val || !val.trim()) {
      // if query cleared, show recent searches/popular categories
      suggestionItems.value = []
      searchResults.value = []
      totalResults.value = 0
      loading.value = false
      mode.value = 'idle'
      return
    }
    // Show typeahead suggestions quickly
    performSuggest()
    // If user pauses typing, automatically run full search and show full results
    performAutoSearch()
  })

  // Focus input when opened
  watch(isOpen, async (newValue) => {
    if (newValue) {
      await nextTick()
      // If SearchInput exposes focus via defineExpose, call it; otherwise call DOM focus
      try {
        if (searchInput.value?.focus) {
          searchInput.value.focus()
        } else {
          searchInput.value?.focus()
        }
      } catch (e) {
        // ignore
      }
    }
  })

  // Lifecycle
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    loadRecentSearches()
    loadPopularCategories()

    // Focus input on mount if open
    nextTick(() => {
      if (isOpen.value) {
        try {
          if (searchInput.value?.focus) searchInput.value.focus()
          else searchInput.value?.focus()
        } catch (e) { }
      }
    })

    // Close when clicking outside the panel
    const onDocClick = (e: MouseEvent) => {
      if (!isOpen.value) return
      const target = e.target as Node
      if (rootRef.value && rootRef.value.contains(target)) return
      close()
    }
    document.addEventListener('click', onDocClick)

    onUnmounted(() => {
      document.removeEventListener('click', onDocClick)
    })
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  // Handlers for child component events
  const onSelectSuggestion = (payload: any) => selectSuggestion(payload)
  const onSelectCategory = (slug: string) => selectCategorySuggestion(slug)
  const onSelectResult = (r: SearchResult) => selectResult(r)
  const onViewAll = () => {
    // open blog page with query param
    router.push(`/blog?search=${encodeURIComponent(searchQuery.value)}`)
    close()
  }
</script>

<style scoped>

  /* Scoped styles for scrollbar */
  .custom-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scroll::-webkit-scrollbar-track {
    background-color: rgb(244 244 245);
    /* zinc-100 */
  }

  .custom-scroll::-webkit-scrollbar-thumb {
    background-color: rgb(212 212 216);
    /* zinc-300 */
    border-radius: 9999px;
  }

  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background-color: rgb(161 161 170);
    /* zinc-400 */
  }

  /* Line clamp */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
