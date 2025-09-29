<template>
  <!-- Full-screen overlay modal (centered card on larger screens) -->
  <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
    <Teleport to="body">
      <div v-if="isOpen" class="fixed inset-0 z-50 px-4 py-6 md:py-12">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true"></div>

        <!-- Card (teleported to body so it's always positioned relative to viewport) -->
        <!-- Centered card on all screen sizes with a small margin to viewport edges -->
        <div ref="rootRef" role="dialog" aria-modal="true" :aria-labelledby="isOpen ? 'search-modal-title' : undefined"
          class="fixed left-1/2 top-1/2 z-10 w-full max-w-[calc(100%_-_2rem)] md:max-w-5xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden transform -translate-x-1/2 -translate-y-1/2 flex flex-col max-h-[calc(100vh-2rem)]">

          <!-- Main column: header + input + results -->
          <div class="w-full flex flex-col">
            <!-- Input area (full-width top with small horizontal margins) -->
            <div class="px-0 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <div class="mx-3 md:mx-4">
                <div class="relative">
                  <SearchInput ref="searchInput" v-model="searchQuery"
                    placeholder="Search posts, authors, categories and tags" @enter="performSearchImmediate"
                    @clear="() => (searchQuery = '')" class="w-full" />
                  <!-- (close button moved to modal footer) -->
                </div>
              </div>
            </div>

            <!-- Results area -->
            <div class="p-4 md:p-6 flex-1 overflow-y-auto custom-scroll">
              <SearchResults :results="searchResults" :suggestions="suggestionItems" :previewResults="previewResults"
                :loading="loading" :query="searchQuery" :selectedIndex="selectedIndex" :total="totalResults"
                :mode="mode" :filteredFor="filteredFor" :groups="computedGroups" @select-result="onSelectResult"
                @view-all="onViewAll" @select-suggestion="onSelectSuggestion" @jump-to="(i) => (selectedIndex = i)" />
            </div>
          </div>

          <!-- Footer: centered Close button -->
          <div class="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
            <div class="mx-3 md:mx-4 flex justify-center">
              <button @click="close" aria-label="Close search"
                class="px-4 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-white hover:bg-zinc-200">
                Close
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>
  </Transition>
</template>

<script setup lang="ts">
  import { searchService } from '@/services';
  import type { SearchResult, SearchResults as SearchResultsType } from '@/types';
  import { debounce } from '@/utils/debounce';
  import { dbg } from '@/utils/debug';
  import { highlightText } from '@/utils/highlight';
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
  const previewResults = ref<SearchResult[]>([])
  const searchResults = ref<SearchResult[]>([])
  const mode = ref<'idle' | 'suggest' | 'results' | 'mixed'>('idle')
  const filteredFor = ref<{ text: string; type: string } | null>(null)
  // Abort controllers to cancel in-flight requests and avoid quota consumption
  const suggestController = ref<AbortController | null>(null)
  const quickController = ref<AbortController | null>(null)
  const fullSearchController = ref<AbortController | null>(null)
  const MIN_QUERY_LENGTH = 3
  const loading = ref(false)
  const selectedIndex = ref(0)
  // Total number of results returned by the last full search or current suggestions/preview
  const totalResults = ref<number>(0)
  // recent searches removed

  // Computed
  const isOpen = computed(() => props.modelValue)

  // Type helpers

  // Search functionality
  const performSearchImmediate = async (signal?: AbortSignal) => {
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
      // cancel previous full search if one is running
      if (fullSearchController.value) {
        try {
          fullSearchController.value.abort()
        } catch (e) { }
      }
      fullSearchController.value = new AbortController()
      const response: SearchResultsType = await searchService.search(searchQuery.value, 20, signal || fullSearchController.value.signal)

      dbg('SearchModal.vue', 'performSearchImmediate response', response)

      // Apply highlighting to title/excerpt
      const results = (response.results || []).map((r) => ({
        ...r,
        highlightedTitle: highlightText(r.title || '', searchQuery.value),
        highlightedExcerpt: highlightText(r.excerpt || '', searchQuery.value),
      }))

      searchResults.value = results as any
      // Clear preview results when showing full search results so that sorting applies to full results
      previewResults.value = []

      totalResults.value = response.total || results.length

      // recent searches removed
    } catch (err: any) {
      if (err?.name !== 'AbortError' && err?.code !== 'ERR_CANCELED') {
        console.error('Search error:', err)
        searchResults.value = []
        totalResults.value = 0
      }
    } finally {
      loading.value = false
    }
  }

  // Debounced suggestions (typeahead) — uses lightweight suggest endpoint
  const performSuggest = debounce(async () => {
    if (!searchQuery.value.trim() || searchQuery.value.length < MIN_QUERY_LENGTH) {
      suggestionItems.value = []
      previewResults.value = []
      mode.value = 'idle'
      return
    }
    // cancel any previously running suggest request
    try {
      suggestController.value?.abort()
    } catch (_) { }
    suggestController.value = new AbortController()
    const signal = suggestController.value.signal

    try {
      loading.value = true
      const resp: any = await searchService.suggest(searchQuery.value, 8, signal)

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
      // While typing, also request a few preview results (top matches) to show beneath suggestions
      try {
        // abort previous quick request if any
        quickController.value?.abort()
      } catch (_) { }
      quickController.value = new AbortController()
      const qSignal = quickController.value.signal

      try {
        const qResp: any = await searchService.quick(searchQuery.value, undefined, 4, qSignal)
        const rows: any[] = qResp?.data || []
        previewResults.value = rows.map((r: any) => ({
          type: (r.type as any) || (r.title ? 'post' : 'post'),
          id: r.id,
          title: r.title || r.name || '',
          slug: r.slug,
          excerpt: r.excerpt || r.description || r.bio || '',
          url: r.slug ? (r.title ? `/blog/${r.slug}` : `/${r.slug}`) : '/',
          highlightedTitle: highlightText((r.title || r.name || ''), searchQuery.value),
          highlightedExcerpt: highlightText((r.excerpt || r.description || r.bio || ''), searchQuery.value),
        }))
      } catch (e) {
        // ignore aborts and other errors for preview
        previewResults.value = []
      }

      // show mixed mode (suggestions + preview results)
      mode.value = 'mixed'
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') {
        // request was cancelled — normal behaviour
        return
      }
      console.error('Suggest error', err)
    } finally {
      loading.value = false
    }
  }, 300)

  // When user stops typing, perform the full search automatically
  const performAutoSearch = debounce(async () => {
    if (!searchQuery.value.trim()) return
    // simply trigger the full search; performSearchImmediate handles aborting the previous full search
    await performSearchImmediate()
  }, 600)

  // For compatibility, keep a performSearch wrapper that calls the immediate full search

  // Result selection (navigates but does not close modal)
  const selectResult = (result: SearchResult) => {
    router.push(result.url)
    // intentionally do not close the modal; user requested modal stays open until X button
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
        // cancel previous quick request
        try { quickController.value?.abort() } catch (_) { }
        quickController.value = new AbortController()
        const qSignal = quickController.value.signal
        const resp: any = await searchService.quick(payload.text, payload.type, 20, qSignal)
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
          // set filteredFor banner context so user knows this is a filtered view
          filteredFor.value = { text: payload.text, type: payload.type }
          // recent searches removed
          return
        }
      }
      // clear any previous filteredFor context when falling back to full search
      filteredFor.value = null

      // If quick didn't return anything, fall back to full search to show more possibilities
      await performSearchImmediate()
    } catch (e) {
      console.error('selectSuggestion quick search error', e)
      await performSearchImmediate()
    } finally {
      loading.value = false
    }
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
        // Escape key no longer closes the modal — closing only via X button per user request
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
        // If user presses Alt+Enter and we have suggestions, accept the top suggestion and navigate immediately
        if (event.altKey && suggestionItems.value && suggestionItems.value.length) {
          event.preventDefault()
          const top = suggestionItems.value[0]
          if (top && top.url) {
            router.push(top.url)
            // do not close
            return
          }
        }

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

  // Lock body scroll while modal is open to prevent background scrolling on mobile
  watch(isOpen, (open) => {
    try {
      if (open) {
        document.body.style.overflow = 'hidden'
        document.documentElement.style.touchAction = 'none'
      } else {
        document.body.style.overflow = ''
        document.documentElement.style.touchAction = ''
      }
    } catch (e) {
      // ignore in non-browser environments
    }
  })

  // Restore scroll on unmount just in case
  onUnmounted(() => {
    try {
      document.body.style.overflow = ''
      document.documentElement.style.touchAction = ''
    } catch (e) { }
  })

  // Lifecycle
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)

    // Focus input on mount if open
    nextTick(() => {
      if (isOpen.value) {
        try {
          if (searchInput.value?.focus) searchInput.value.focus()
          else searchInput.value?.focus()
        } catch (e) { }
      }
    })
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    // abort any outstanding requests
    try { suggestController.value?.abort() } catch (_) { }
    try { quickController.value?.abort() } catch (_) { }
    try { fullSearchController.value?.abort() } catch (_) { }
  })

  // Handlers for child component events
  const onSelectSuggestion = (payload: any) => selectSuggestion(payload)
  // categories emit using select-suggestion now, so onSelectCategory not needed
  const onSelectResult = (r: SearchResult) => selectResult(r)
  const onViewAll = () => {
    // open blog page with query param
    router.push(`/blog?search=${encodeURIComponent(searchQuery.value)}`)
    // close() removed per user request — modal should stay open
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
