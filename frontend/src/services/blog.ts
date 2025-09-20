import type {
  ApiResponse,
  Author,
  BlogFilters,
  BlogPost,
  BlogSetting,
  Category,
  Comment,
  CommentForm,
  ContactForm,
  Newsletter,
  NewsletterForm,
  Page,
  Tag,
} from '@/types'
import { apiService } from './api'

// Blog Posts API
export const blogPostsApi = {
  // Get all blog posts with filters and pagination
  getAll: async (
    page = 1,
    pageSize = 12,
    filters: BlogFilters = {},
  ): Promise<ApiResponse<BlogPost[]>> => {
    const params: Record<string, unknown> = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'populate[author][populate]': '*',
      'populate[categories]': '*',
      'populate[tags]': '*',
      'populate[featured_image]': '*',
      'populate[seo]': '*',
      'sort[0]': filters.sortBy
        ? `${filters.sortBy}:${filters.sortOrder || 'desc'}`
        : 'publishedAt:desc',
      publicationState: 'live',
    }

    // Apply filters
    if (filters.search) {
      params['filters[$or][0][title][$containsi]'] = filters.search
      params['filters[$or][1][excerpt][$containsi]'] = filters.search
      params['filters[$or][2][content][$containsi]'] = filters.search
    }

    if (filters.categories && filters.categories.length > 0) {
      filters.categories.forEach((category, index) => {
        params[`filters[categories][slug][$in][${index}]`] = category
      })
    }

    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach((tag, index) => {
        params[`filters[tags][slug][$in][${index}]`] = tag
      })
    }

    if (filters.authors && filters.authors.length > 0) {
      filters.authors.forEach((author, index) => {
        params[`filters[author][slug][$in][${index}]`] = author
      })
    }

    if (filters.featured !== undefined) {
      params['filters[featured][$eq]'] = filters.featured
    }

    if (filters.dateFrom) {
      params['filters[publishedAt][$gte]'] = filters.dateFrom
    }

    if (filters.dateTo) {
      params['filters[publishedAt][$lte]'] = filters.dateTo
    }

    const queryString = apiService.buildStrapiQuery(params)
    return apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)
  },

  // Get single blog post by slug
  getBySlug: async (slug: string): Promise<{ data: BlogPost }> => {
    const params = {
      'filters[slug][$eq]': slug,
      'populate[author][populate]': '*',
      'populate[categories]': '*',
      'populate[tags]': '*',
      'populate[featured_image]': '*',
      'populate[gallery]': '*',
      'populate[related_posts][populate][0]': 'featured_image',
      'populate[related_posts][populate][1]': 'author',
      'populate[social_sharing]': '*',
      'populate[seo]': '*',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    const response = await apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)

    if (!response.data || response.data.length === 0) {
      throw new Error('Blog post not found')
    }

    return { data: response.data[0] }
  },

  // Get featured posts
  getFeatured: async (limit = 6): Promise<ApiResponse<BlogPost[]>> => {
    const params = {
      'filters[featured][$eq]': true,
      'pagination[pageSize]': limit,
      'populate[author][populate]': '*',
      'populate[categories]': '*',
      'populate[featured_image]': '*',
      'sort[0]': 'publishedAt:desc',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    return apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)
  },

  // Get latest posts
  getLatest: async (limit = 12): Promise<ApiResponse<BlogPost[]>> => {
    const params = {
      'pagination[pageSize]': limit,
      'populate[author][populate]': '*',
      'populate[categories]': '*',
      'populate[featured_image]': '*',
      'sort[0]': 'publishedAt:desc',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    return apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)
  },

  // Get related posts
  getRelated: async (postId: number, limit = 4): Promise<ApiResponse<BlogPost[]>> => {
    const params = {
      'filters[id][$ne]': postId,
      'pagination[pageSize]': limit,
      'populate[author][populate]': '*',
      'populate[featured_image]': '*',
      'sort[0]': 'publishedAt:desc',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    return apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)
  },

  // Like/Unlike post
  toggleLike: async (id: number): Promise<{ data: BlogPost }> => {
    return apiService.put<{ data: BlogPost }>(`/blog-posts/${id}/like`)
  },

  // Get posts by category
  getByCategory: async (
    categoryId: number,
    options: { page?: number; pageSize?: number } = {},
  ): Promise<ApiResponse<BlogPost[]>> => {
    const params = {
      'filters[categories][id][$eq]': categoryId,
      'pagination[page]': options.page || 1,
      'pagination[pageSize]': options.pageSize || 12,
      'populate[author][populate]': '*',
      'populate[categories]': '*',
      'populate[tags]': '*',
      'populate[featured_image]': '*',
      'sort[0]': 'publishedAt:desc',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    return apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)
  },

  // Get posts by author
  getByAuthor: async (
    authorId: number,
    options: { page?: number; pageSize?: number } = {},
  ): Promise<ApiResponse<BlogPost[]>> => {
    const params = {
      'filters[author][id][$eq]': authorId,
      'pagination[page]': options.page || 1,
      'pagination[pageSize]': options.pageSize || 12,
      'populate[author][populate]': '*',
      'populate[categories]': '*',
      'populate[tags]': '*',
      'populate[featured_image]': '*',
      'sort[0]': 'publishedAt:desc',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    return apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)
  },

  // Get posts by tag
  getByTag: async (
    tagId: number,
    options: { page?: number; pageSize?: number } = {},
  ): Promise<ApiResponse<BlogPost[]>> => {
    const params = {
      'filters[tags][id][$eq]': tagId,
      'pagination[page]': options.page || 1,
      'pagination[pageSize]': options.pageSize || 12,
      'populate[author][populate]': '*',
      'populate[categories]': '*',
      'populate[tags]': '*',
      'populate[featured_image]': '*',
      'sort[0]': 'publishedAt:desc',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    return apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)
  },
}

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const params = {
      populate: '*',
      'sort[0]': 'name:asc',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    return apiService.get<ApiResponse<Category[]>>(`/categories?${queryString}`)
  },

  getBySlug: async (slug: string): Promise<{ data: Category }> => {
    const params = {
      'filters[slug][$eq]': slug,
      populate: '*',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    const response = await apiService.get<ApiResponse<Category[]>>(`/categories?${queryString}`)

    if (!response.data || response.data.length === 0) {
      throw new Error('Category not found')
    }

    return { data: response.data[0] }
  },
}

// Tags API
export const tagsApi = {
  getAll: async (): Promise<ApiResponse<Tag[]>> => {
    const params = {
      'sort[0]': 'name:asc',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    return apiService.get<ApiResponse<Tag[]>>(`/tags?${queryString}`)
  },

  getBySlug: async (slug: string): Promise<{ data: Tag }> => {
    const params = {
      'filters[slug][$eq]': slug,
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    const response = await apiService.get<ApiResponse<Tag[]>>(`/tags?${queryString}`)

    if (!response.data || response.data.length === 0) {
      throw new Error('Tag not found')
    }

    return { data: response.data[0] }
  },

  getRelated: async (tagId: number, limit = 6): Promise<ApiResponse<Tag[]>> => {
    const params = {
      'filters[id][$ne]': tagId,
      'pagination[pageSize]': limit,
      'sort[0]': 'name:asc',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    return apiService.get<ApiResponse<Tag[]>>(`/tags?${queryString}`)
  },
}

// Authors API
export const authorsApi = {
  getAll: async (): Promise<ApiResponse<Author[]>> => {
    const params = {
      populate: '*',
      'sort[0]': 'name:asc',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    return apiService.get<ApiResponse<Author[]>>(`/authors?${queryString}`)
  },

  getBySlug: async (slug: string): Promise<{ data: Author }> => {
    return apiService.get<{ data: Author }>(`/authors/slug/${slug}`)
  },
}
export const commentsApi = {
  getByPostId: async (postId: number): Promise<ApiResponse<Comment[]>> => {
    const params = {
      'filters[blog_post][id][$eq]': postId,
      'filters[approved][$eq]': true,
      'populate[parent_comment]': '*',
      'sort[0]': 'createdAt:asc',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    return apiService.get<ApiResponse<Comment[]>>(`/comments?${queryString}`)
  },

  create: async (data: CommentForm): Promise<{ data: Comment }> => {
    return apiService.post<{ data: Comment }>('/comments', { data })
  },
}

// Pages API
export const pagesApi = {
  getBySlug: async (slug: string): Promise<{ data: Page }> => {
    const params = {
      'filters[slug][$eq]': slug,
      populate: '*',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    const response = await apiService.get<ApiResponse<Page[]>>(`/pages?${queryString}`)

    if (!response.data || response.data.length === 0) {
      throw new Error('Page not found')
    }

    return { data: response.data[0] }
  },

  getMenuPages: async (): Promise<ApiResponse<Page[]>> => {
    const params = {
      'filters[show_in_menu][$eq]': true,
      'sort[0]': 'menu_order:asc',
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    return apiService.get<ApiResponse<Page[]>>(`/pages?${queryString}`)
  },
}

// Blog Settings API
export const blogSettingsApi = {
  get: async (): Promise<{ data: BlogSetting }> => {
    const params = {
      populate: '*',
    }

    const queryString = apiService.buildStrapiQuery(params)
    const response = await apiService.get<ApiResponse<BlogSetting[]>>(
      `/blog-settings?${queryString}`,
    )

    if (!response.data || response.data.length === 0) {
      throw new Error('Blog settings not found')
    }

    return { data: response.data[0] }
  },
}

// Newsletter API
export const newsletterApi = {
  subscribe: async (data: NewsletterForm): Promise<{ data: Newsletter }> => {
    return apiService.post<{ data: Newsletter }>('/newsletters', { data })
  },

  unsubscribe: async (email: string): Promise<{ message: string }> => {
    return apiService.post<{ message: string }>('/newsletters/unsubscribe', { email })
  },
}

// Contact API
export const contactApi = {
  send: async (data: ContactForm): Promise<{ message: string }> => {
    return apiService.post<{ message: string }>('/contact', data)
  },
}

// Search API
export const searchApi = {
  global: async (
    query: string,
    limit = 20,
  ): Promise<{
    posts: BlogPost[]
    categories: Category[]
    tags: Tag[]
    authors: Author[]
  }> => {
    const params = {
      q: query,
      limit,
    }

    const queryString = apiService.buildStrapiQuery(params)
    return apiService.get<{
      posts: BlogPost[]
      categories: Category[]
      tags: Tag[]
      authors: Author[]
    }>(`/search?${queryString}`)
  },
}

// Legacy export for compatibility
export const blogService = blogPostsApi
