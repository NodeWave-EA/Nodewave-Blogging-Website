export interface BlogFilters {
  search?: string
  category?: string
  tag?: string
  author?: string
  status?: 'draft' | 'published'
  featured?: boolean
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  categories?: string[]
  tags?: string[]
  authors?: string[]
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface SortParams {
  sort?: string
  order?: 'asc' | 'desc'
}

export interface QueryParams extends BlogFilters, PaginationParams, SortParams {}
