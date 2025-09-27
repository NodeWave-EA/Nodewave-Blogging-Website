import { authorsApi, blogPostsApi, categoriesApi, tagsApi } from '@/services'
import type { Author, BlogPost, Category, Tag } from '@/types'
import { reactive, ref } from 'vue'

interface BlogDataState {
  posts: BlogPost[]
  categories: Category[]
  authors: Author[]
  tags: Tag[]
  loading: boolean
  error: string | null
}

const state = reactive<BlogDataState>({
  posts: [],
  categories: [],
  authors: [],
  tags: [],
  loading: false,
  error: null,
})

export function useBlogData() {
  const setLoading = (loading: boolean) => {
    state.loading = loading
  }

  const setError = (error: string | null) => {
    state.error = error
  }

  const fetchPosts = async (params?: any) => {
    try {
      setLoading(true)
      setError(null)
      const response = await blogPostsApi.getAll(
        params?.pagination?.page,
        params?.pagination?.pageSize,
        params,
      )
      state.posts = response.data || []
      return response
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setError('Failed to fetch posts')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await categoriesApi.getAll()
      state.categories = response.data || []
      return response
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setError('Failed to fetch categories')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await authorsApi.getAll()
      state.authors = response.data || []
      return response
    } catch (error) {
      console.error('Failed to fetch authors:', error)
      setError('Failed to fetch authors')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await tagsApi.getAll()
      state.tags = response.data || []
      return response
    } catch (error) {
      console.error('Failed to fetch tags:', error)
      setError('Failed to fetch tags')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    posts: ref(state.posts),
    categories: ref(state.categories),
    authors: ref(state.authors),
    tags: ref(state.tags),
    loading: ref(state.loading),
    error: ref(state.error),

    // Actions
    fetchPosts,
    fetchCategories,
    fetchAuthors,
    fetchTags,
    setLoading,
    setError,
  }
}
