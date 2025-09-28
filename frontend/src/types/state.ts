import type { Author } from './author'
import type { BlogPost } from './blogPost'
import type { Category } from './category'
import type { BlogFilters } from './filters'
import type { ThemeConfig, ThemeMode } from './navigationTheme'
import type { PaginationMeta } from './paginationMeta'
import type { Tag } from './tag'

export interface BlogState {
  posts: BlogPost[]
  currentPost: BlogPost | null
  categories: Category[]
  tags: Tag[]
  authors: Author[]
  loading: boolean
  error: string | null
  filters: BlogFilters
  pagination: PaginationMeta | null
}

export interface ThemeState {
  mode: ThemeMode
  config: ThemeConfig
}

export interface UIState {
  sidebarOpen: boolean
  modalOpen: boolean
  currentModal: string | null
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timeout?: number
  }>
}
