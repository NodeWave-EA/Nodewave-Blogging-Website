import { reactive, ref } from 'vue'
// Local loading shape to avoid depending on a project-level type that isn't exported
type LocalLoadingState = { isLoading: boolean; error: string | null }

export function useApi<T>() {
  const data = ref<T | null>(null)
  const loading = reactive<LocalLoadingState>({
    isLoading: false,
    error: null,
  })

  const execute = async (apiCall: () => Promise<T>): Promise<T | null> => {
    loading.isLoading = true
    loading.error = null

    try {
      const result = await apiCall()
      data.value = result
      return result
    } catch (error) {
      console.error('API Error:', error)
      loading.error = error instanceof Error ? error.message : 'An unknown error occurred'
      return null
    } finally {
      loading.isLoading = false
    }
  }

  const reset = () => {
    data.value = null
    loading.isLoading = false
    loading.error = null
  }

  return {
    data,
    loading,
    execute,
    reset,
  }
}

// Specialized hook for paginated data
export function usePaginatedApi<T>() {
  const data = ref<T[]>([])
  const totalItems = ref(0)
  const currentPage = ref(1)
  const totalPages = ref(0)
  const pageSize = ref(10)

  const loading = reactive<LocalLoadingState>({
    isLoading: false,
    error: null,
  })

  const loadMore = ref(false) // For infinite scroll

  const execute = async (
    apiCall: (
      page: number,
      size: number,
    ) => Promise<{
      data: T[]
      meta: {
        pagination: {
          page: number
          pageSize: number
          pageCount: number
          total: number
        }
      }
    }>,
  ): Promise<void> => {
    loading.isLoading = true
    loading.error = null

    try {
      const result = await apiCall(currentPage.value, pageSize.value)

      if (loadMore.value && currentPage.value > 1) {
        // Append data for infinite scroll
        data.value = [...(data.value as T[]), ...result.data]
      } else {
        // Replace data for new search/filter
        data.value = result.data
      }
      totalItems.value = result.meta.pagination.total
      totalPages.value = result.meta.pagination.pageCount
    } catch (error) {
      console.error('API Error:', error)
      loading.error = error instanceof Error ? error.message : 'An unknown error occurred'
    } finally {
      loading.isLoading = false
    }
  }

  const loadNextPage = async (
    apiCall: (
      page: number,
      size: number,
    ) => Promise<{
      data: T[]
      meta: {
        pagination: {
          page: number
          pageSize: number
          pageCount: number
          total: number
        }
      }
    }>,
  ) => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
      loadMore.value = true
      await execute(apiCall)
    }
  }

  const reset = () => {
    data.value = []
    totalItems.value = 0
    currentPage.value = 1
    totalPages.value = 0
    loading.isLoading = false
    loading.error = null
    loadMore.value = false
  }

  const setPage = (page: number) => {
    currentPage.value = page
    loadMore.value = false
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    loadMore.value = false
  }

  return {
    data,
    totalItems,
    currentPage,
    totalPages,
    pageSize,
    loading,
    loadMore,
    execute,
    loadNextPage,
    reset,
    setPage,
    setPageSize,
  }
}
