<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" @click="close">
        <div class="min-h-screen px-4 text-center">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

          <!-- Center content -->
          <span class="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

          <!-- Modal -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div
              v-if="isOpen"
              class="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-zinc-900 shadow-xl rounded-2xl border border-zinc-200 dark:border-zinc-700"
              @click.stop
            >
              <!-- Header -->
              <div
                class="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700"
              >
                <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">Search</h3>
                <button
                  @click="close"
                  class="p-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label="Close search"
                >
                  <XMarkIcon class="w-5 h-5" />
                </button>
              </div>

              <!-- Search Input -->
              <div class="p-4 border-b border-zinc-200 dark:border-zinc-700">
                <div class="relative">
                  <MagnifyingGlassIcon
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
                  />
                  <input
                    ref="searchInput"
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search for posts, authors, categories..."
                    class="w-full pl-10 pr-4 py-3 text-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white placeholder:text-zinc-400 transition-colors"
                    @keydown.enter="performSearch"
                    @keydown.escape="close"
                  />
                </div>

                <!-- Quick Actions -->
                <div class="flex flex-wrap gap-2 mt-3">
                  <button
                    v-for="filter in quickFilters"
                    :key="filter.key"
                    @click="applyQuickFilter(filter)"
                    class="px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                  >
                    {{ filter.label }}
                  </button>
                </div>
              </div>

              <!-- Results Scrollable -->
              <div class="max-h-96 overflow-y-auto custom-scroll">
                <!-- States (Loading, Results, Empty, No Results) -->
                <!-- ... keep as is, just updated gray → zinc in classes -->
              </div>

              <!-- Footer -->
              <div
                class="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between"
              >
                <div class="flex items-center space-x-4">
                  <span class="flex items-center space-x-1">
                    <kbd
                      class="px-1.5 py-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded"
                    >
                      ↵
                    </kbd>
                    <span>to select</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <kbd
                      class="px-1.5 py-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded"
                    >
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
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  DocumentTextIcon,
  UserIcon,
  TagIcon,
  FolderIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'
import { debounce } from '@/utils/debounce'
import { apiService } from '@/services/api'
import LoadingSpinner from './LoadingSpinner.vue'
import type { SearchResult, SearchResults, Category } from '@/types'

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
const searchInput = ref<HTMLInputElement>()
const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const loading = ref(false)
const selectedIndex = ref(0)
const recentSearches = ref<string[]>([])
const popularCategories = ref<Category[]>([])
const totalResults = ref(0)

// Computed
const isOpen = computed(() => props.modelValue)
const hasMoreResults = computed(() => totalResults.value > searchResults.value.length)

// Quick filters
const quickFilters = [
  { key: 'recent', label: 'Recent Posts', filter: 'recent' },
  { key: 'popular', label: 'Popular', filter: 'popular' },
  { key: 'featured', label: 'Featured', filter: 'featured' },
]

// Type helpers
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'post':
      return DocumentTextIcon
    case 'author':
      return UserIcon
    case 'category':
      return FolderIcon
    case 'tag':
      return TagIcon
    default:
      return DocumentTextIcon
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'post':
      return 'Post'
    case 'author':
      return 'Author'
    case 'category':
      return 'Category'
    case 'tag':
      return 'Tag'
    default:
      return 'Content'
  }
}

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'post':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    case 'author':
      return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    case 'category':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    case 'tag':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
    default:
      return 'bg-zinc-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
  }
}

const getTypeBadgeStyles = (type: string) => {
  switch (type) {
    case 'post':
      return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
    case 'author':
      return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
    case 'category':
      return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
    case 'tag':
      return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
    default:
      return 'bg-zinc-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200'
  }
}

// Search functionality
const performSearch = debounce(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    totalResults.value = 0
    return
  }

  loading.value = true
  selectedIndex.value = 0

  try {
    const response: SearchResults = await apiService.get('/api/search', {
      params: {
        q: searchQuery.value,
        limit: 8,
      },
    })

    searchResults.value = response.results || []
    totalResults.value = response.total || 0

    // Add to recent searches
    addToRecentSearches(searchQuery.value)
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
  }
}, 300)

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
    const response: { data: Category[] } = await apiService.get('/api/categories', {
      params: {
        sort: 'blog_posts.length:desc',
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

const searchCategory = (category: Category) => {
  router.push(`/blog?category=${category.slug}`)
  close()
}

const viewAllResults = () => {
  router.push(`/blog?search=${encodeURIComponent(searchQuery.value)}`)
  close()
}

// Modal controls
const close = () => {
  emit('close')
  emit('update:modelValue', false)
}

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
        viewAllResults()
      }
      break
  }
}

// Watch for search query changes
watch(searchQuery, performSearch)

// Focus input when opened
watch(isOpen, async (newValue) => {
  if (newValue) {
    await nextTick()
    searchInput.value?.focus()
  }
})

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  loadRecentSearches()
  loadPopularCategories()

  // Focus input
  nextTick(() => {
    searchInput.value?.focus()
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
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
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
