import { apiService } from './api'
import type {
  Author,
  Category,
  Tag,
  BlogSetting,
  Newsletter,
  Page,
  ApiResponse,
  BlogPost,
} from '../types'

export interface ContentMetrics {
  totalPosts: number
  totalCategories: number
  totalTags: number
  totalAuthors: number
  totalViews: number
  totalLikes: number
}

export interface PopularContent {
  posts: BlogPost[]
  categories: Category[]
  tags: Tag[]
  authors: Author[]
}

export const contentService = {
  // Get site statistics and metrics
  getMetrics: async (): Promise<ContentMetrics> => {
    const [postsCount, categoriesCount, tagsCount, authorsCount] = await Promise.all([
      apiService.get<{ count: number }>('/blog-posts/count'),
      apiService.get<{ count: number }>('/categories/count'),
      apiService.get<{ count: number }>('/tags/count'),
      apiService.get<{ count: number }>('/authors/count'),
    ])

    return {
      totalPosts: (postsCount as { count: number }).count || 0,
      totalCategories: (categoriesCount as { count: number }).count || 0,
      totalTags: (tagsCount as { count: number }).count || 0,
      totalAuthors: (authorsCount as { count: number }).count || 0,
      totalViews: 0, // Will be calculated from posts
      totalLikes: 0, // Will be calculated from posts
    }
  },

  // Get popular content
  getPopularContent: async (): Promise<PopularContent> => {
    const params = {
      'populate[author][populate]': '*',
      'populate[categories]': '*',
      'populate[featured_image]': '*',
      'sort[0]': 'view_count:desc',
      'pagination[pageSize]': 10,
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    const popularPosts = await apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)

    // For now, return posts only. Categories, tags, and authors can be calculated based on post engagement
    return {
      posts: popularPosts.data || [],
      categories: [],
      tags: [],
      authors: [],
    }
  },

  // Newsletter subscription
  subscribeToNewsletter: async (data: {
    email: string
    subscribed_at: string
    status: string
  }): Promise<ApiResponse<Newsletter>> => {
    return apiService.post<ApiResponse<Newsletter>>('/newsletters', {
      data,
    })
  },

  // Get newsletter subscribers (for stats)
  getNewsletterSubscribers: async (options?: {
    pagination?: { page: number; pageSize: number }
  }): Promise<ApiResponse<Newsletter[]>> => {
    const params: Record<string, string> = {}

    if (options?.pagination) {
      params['pagination[page]'] = options.pagination.page.toString()
      params['pagination[pageSize]'] = options.pagination.pageSize.toString()
    }

    const queryString = new URLSearchParams(params).toString()
    return apiService.get<ApiResponse<Newsletter[]>>(
      `/newsletters${queryString ? '?' + queryString : ''}`,
    )
  },

  // Get content sitemap for SEO
  getSitemap: async (): Promise<{
    posts: Array<{ slug: string; updatedAt: string; priority: number }>
    categories: Array<{ slug: string; updatedAt: string }>
    tags: Array<{ slug: string; updatedAt: string }>
    pages: Array<{ slug: string; updatedAt: string }>
  }> => {
    const [posts, categories, tags, pages] = await Promise.all([
      apiService.get<ApiResponse<BlogPost[]>>(
        '/blog-posts?fields[0]=slug&fields[1]=updatedAt&fields[2]=priority&publicationState=live',
      ),
      apiService.get<ApiResponse<Category[]>>(
        '/categories?fields[0]=slug&fields[1]=updatedAt&publicationState=live',
      ),
      apiService.get<ApiResponse<Tag[]>>(
        '/tags?fields[0]=slug&fields[1]=updatedAt&publicationState=live',
      ),
      apiService.get<ApiResponse<Page[]>>(
        '/pages?fields[0]=slug&fields[1]=updatedAt&publicationState=live',
      ),
    ])

    return {
      posts: (posts.data || []).map((post: BlogPost) => ({
        slug: post.slug,
        updatedAt: post.updatedAt,
        priority: post.priority === 'high' ? 0.9 : post.priority === 'normal' ? 0.7 : 0.5,
      })),
      categories: categories.data || [],
      tags: tags.data || [],
      pages: pages.data || [],
    }
  },

  // RSS Feed data
  getRSSFeed: async (): Promise<{
    posts: BlogPost[]
    siteInfo: {
      title: string
      description: string
      link: string
      lastBuildDate: string
    }
  }> => {
    const params = {
      'populate[author]': '*',
      'populate[categories]': '*',
      'populate[featured_image]': '*',
      'sort[0]': 'publishedAt:desc',
      'pagination[pageSize]': 50,
      publicationState: 'live',
    }

    const queryString = apiService.buildStrapiQuery(params)
    const posts = await apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)

    return {
      posts: posts.data || [],
      siteInfo: {
        title: 'NodeWave Blog',
        description: 'Latest insights and updates from NodeWave',
        link: import.meta.env.VITE_SITE_URL || 'https://nodewave.com',
        lastBuildDate: new Date().toISOString(),
      },
    }
  },
}

export const authorService = {
  async getAuthors(): Promise<ApiResponse<Author[]>> {
    const queryParams = new URLSearchParams()
    queryParams.append('populate[0]', 'avatar')
    queryParams.append('sort[0]', 'name:asc')

    return apiService.get<ApiResponse<Author[]>>(`/authors?${queryParams.toString()}`)
  },

  async getAuthorBySlug(slug: string): Promise<ApiResponse<Author[]>> {
    const queryParams = new URLSearchParams()
    queryParams.append('populate[0]', 'avatar')
    queryParams.append('filters[slug][$eq]', slug)

    return apiService.get<ApiResponse<Author[]>>(`/authors?${queryParams.toString()}`)
  },
}

export const categoryService = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const queryParams = new URLSearchParams()
    queryParams.append('sort[0]', 'name:asc')

    return apiService.get<ApiResponse<Category[]>>(`/categories?${queryParams.toString()}`)
  },

  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category[]>> {
    const queryParams = new URLSearchParams()
    queryParams.append('filters[slug][$eq]', slug)

    return apiService.get<ApiResponse<Category[]>>(`/categories?${queryParams.toString()}`)
  },

  async getCategoriesWithPostCounts(): Promise<ApiResponse<Category[]>> {
    // This would require a custom endpoint in Strapi or additional processing
    return this.getCategories()
  },
}

export const tagService = {
  async getTags(): Promise<ApiResponse<Tag[]>> {
    const queryParams = new URLSearchParams()
    queryParams.append('sort[0]', 'name:asc')

    return apiService.get<ApiResponse<Tag[]>>(`/tags?${queryParams.toString()}`)
  },

  async getPopularTags(limit = 20): Promise<ApiResponse<Tag[]>> {
    const queryParams = new URLSearchParams()
    queryParams.append('sort[0]', 'name:asc')
    queryParams.append('pagination[pageSize]', limit.toString())

    return apiService.get<ApiResponse<Tag[]>>(`/tags?${queryParams.toString()}`)
  },
}

export const settingsService = {
  async getBlogSettings(): Promise<ApiResponse<BlogSetting>> {
    const queryParams = new URLSearchParams()
    queryParams.append('populate[0]', 'site_logo')
    queryParams.append('populate[1]', 'site_favicon')

    return apiService.get<ApiResponse<BlogSetting>>(`/blog-settings?${queryParams.toString()}`)
  },
}

export const newsletterService = {
  async subscribe(email: string): Promise<ApiResponse<Newsletter>> {
    return apiService.post<ApiResponse<Newsletter>>('/newsletters', {
      data: {
        email,
        status: 'subscribed',
      },
    })
  },

  async unsubscribe(email: string): Promise<void> {
    // This would require a custom endpoint or finding by email first
    return apiService.put('/newsletters/unsubscribe', { email })
  },
}

export const pageService = {
  async getPages(): Promise<ApiResponse<Page[]>> {
    const queryParams = new URLSearchParams()
    queryParams.append('populate[0]', 'featured_image')
    queryParams.append('sort[0]', 'title:asc')

    return apiService.get<ApiResponse<Page[]>>(`/pages?${queryParams.toString()}`)
  },

  async getPageBySlug(slug: string): Promise<ApiResponse<Page[]>> {
    const queryParams = new URLSearchParams()
    queryParams.append('populate[0]', 'featured_image')
    queryParams.append('filters[slug][$eq]', slug)

    return apiService.get<ApiResponse<Page[]>>(`/pages?${queryParams.toString()}`)
  },
}

export const contactService = {
  async submitContactForm(data: {
    name: string
    email: string
    subject?: string
    message: string
  }): Promise<void> {
    return apiService.post('/contact', { data })
  },
}
