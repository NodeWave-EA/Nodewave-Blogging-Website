import type { ApiResponse, BlogFilters, BlogPost } from '@/types'
import { dbg, moduleLoaded } from '@/utils/debug'
import { apiService } from './api'
import { buildStrapiQuery } from './queryBuilder'

moduleLoaded('posts.ts')

/**
 * blogPostsApi
 *
 * High-level wrapper around the backend blog-posts endpoints (Strapi-compatible),
 * providing convenience methods for common queries (list, filters, relations,
 * featured, latest, related, like toggling, and lookups by slug/category/author/tag).
 *
 * All list-returning methods construct Strapi-style query parameters (using
 * buildStrapiQuery) and perform GET requests via apiService.get. Methods that
 * modify state (toggleLike) use apiService.put. Basic logging is performed via
 * the dbg helper.
 *
 * Methods:
 *  - getAll(page = 1, pageSize = 12, filters: BlogFilters = {}): Promise<ApiResponse<BlogPost[]>>
 *    - Purpose: Retrieve a paginated list of blog posts with optional filtering and sorting.
 *    - Filters supported (via BlogFilters):
 *        - search: full-text search applied to title, excerpt and content (case-insensitive contains).
 *        - categories: array of category slugs (AND semantics via multiple $in entries).
 *        - tags: array of tag slugs.
 *        - authors: array of author slugs.
 *        - featured: boolean to filter featured posts.
 *        - dateFrom / dateTo: ISO date strings to filter publishedAt (>= dateFrom, <= dateTo).
 *        - sortBy / sortOrder: field and order (defaults to publishedAt:desc).
 *    - Returns: Promise resolving to ApiResponse<BlogPost[]> containing matched posts and pagination metadata.
 *
 *  - getBySlug(slug: string): Promise<{ data: BlogPost }>
 *    - Purpose: Retrieve a single blog post by its slug, including populated relations
 *      (author, categories, tags, featured image, gallery, related posts, social sharing, seo).
 *    - Behavior: Performs a filtered list query and returns the first match.
 *    - Throws: Error('Blog post not found') if no matching post is returned.
 *    - Returns: Promise resolving to an object with the single BlogPost in the data property.
 *
 *  - getFeatured(limit = 6): Promise<ApiResponse<BlogPost[]>>
 *    - Purpose: Retrieve a list of featured posts, limited by pageSize.
 *    - Defaults: limit = 6, sorted by publishedAt:desc, returns populated author, categories and featured_image.
 *
 *  - getLatest(limit = 12): Promise<ApiResponse<BlogPost[]>>
 *    - Purpose: Retrieve the latest posts by published date.
 *    - Defaults: limit = 12, sorted by publishedAt:desc, populated relations similar to getFeatured.
 *
 *  - getRelated(postId: number, limit = 4): Promise<ApiResponse<BlogPost[]>>
 *    - Purpose: Retrieve posts related to a given post id (excludes the given id).
 *    - Behavior: Excludes the provided postId via filters[id][$ne], limited and sorted by publishedAt:desc.
 *
 *  - toggleLike(id: number): Promise<{ data: BlogPost }>
 *    - Purpose: Toggle (add/remove) the authenticated user's "like" for a post.
 *    - Behavior: Sends a PUT to /blog-posts/{id}/like and returns the updated post payload.
 *    - Returns: Promise resolving to an object with the updated BlogPost in data.
 *    - Note: May require authentication depending on backend rules; errors propagate from apiService.
 *
 *  - getByCategory(categoryId: number, options?: { page?: number; pageSize?: number }): Promise<ApiResponse<BlogPost[]>>
 *    - Purpose: Retrieve posts filtered by a category id, with pagination options.
 *    - Defaults: page = 1, pageSize = 12, sorted by publishedAt:desc and populated relations.
 *
 *  - getByAuthor(authorId: number, options?: { page?: number; pageSize?: number }): Promise<ApiResponse<BlogPost[]>>
 *    - Purpose: Retrieve posts filtered by an author id, with pagination options.
 *
 *  - getByTag(tagId: number, options?: { page?: number; pageSize?: number }): Promise<ApiResponse<BlogPost[]>>
 *    - Purpose: Retrieve posts filtered by a tag id, with pagination options.
 *
 * Common notes:
 *  - All list endpoints set publicationState: 'live' by default (only published content).
 *  - Relations returned are populated as configured per-method (author, categories, tags,
 *    featured_image, gallery, related_posts, social_sharing, seo).
 *  - Returned types reference project types: BlogPost, BlogFilters and ApiResponse<T>.
 *
 * Example usage:
 *  - const resp = await blogPostsApi.getAll(1, 12, { search: 'graphql', categories: ['web'] });
 *  - const single = await blogPostsApi.getBySlug('my-post-slug'); // throws if not found
 *
 * @public
 */
export const blogPostsApi = {
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

    const queryString = buildStrapiQuery(params)
    dbg('posts.ts [blogPostsApi]', 'getAll', { url: `/blog-posts?${queryString}` })
    const resp = await apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)
    dbg('posts.ts [blogPostsApi]', 'getAll -> response received', {
      ok: !!resp,
      dataLen: resp?.data?.length,
    })
    return resp
  },

  getBySlug: async (slug: string): Promise<{ data: BlogPost }> => {
    dbg('posts.ts', 'getBySlug', { slug })
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

    const queryString = buildStrapiQuery(params)
    const response = await apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)

    if (!response.data || response.data.length === 0) {
      dbg('posts.ts', 'getBySlug -> not found', { slug })
      throw new Error('Blog post not found')
    }

    const post = response.data[0]
    dbg('posts.ts', 'getBySlug -> returning post', { id: post.id })
    return { data: post }
  },

  getFeatured: async (limit = 6): Promise<ApiResponse<BlogPost[]>> => {
    dbg('posts.ts', 'getFeatured', { limit })
    const params = {
      'filters[featured][$eq]': true,
      'pagination[pageSize]': limit,
      'populate[author][populate]': '*',
      'populate[categories]': '*',
      'populate[featured_image]': '*',
      'sort[0]': 'publishedAt:desc',
      publicationState: 'live',
    }

    const queryString = buildStrapiQuery(params)
    const resp = await apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)
    dbg('posts.ts', 'getFeatured -> response length', { len: resp?.data?.length })
    return resp
  },

  getLatest: async (limit = 12): Promise<ApiResponse<BlogPost[]>> => {
    dbg('posts.ts', 'getLatest', { limit })
    const params = {
      'pagination[pageSize]': limit,
      'populate[author][populate]': '*',
      'populate[categories]': '*',
      'populate[featured_image]': '*',
      'sort[0]': 'publishedAt:desc',
      publicationState: 'live',
    }

    const queryString = buildStrapiQuery(params)
    const resp = await apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)
    dbg('posts.ts', 'getLatest -> response length', { len: resp?.data?.length })
    return resp
  },

  getRelated: async (postId: number, limit = 4): Promise<ApiResponse<BlogPost[]>> => {
    dbg('posts.ts', 'getRelated', { postId, limit })
    const params = {
      'filters[id][$ne]': postId,
      'pagination[pageSize]': limit,
      'populate[author][populate]': '*',
      'populate[featured_image]': '*',
      'sort[0]': 'publishedAt:desc',
      publicationState: 'live',
    }

    const queryString = buildStrapiQuery(params)
    const resp = await apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)
    dbg('posts.ts', 'getRelated -> response length', { len: resp?.data?.length })
    return resp
  },

  toggleLike: async (id: number): Promise<{ data: BlogPost }> => {
    dbg('posts.ts', 'toggleLike', { id })
    const r = await apiService.put<{ data: BlogPost }>(`/blog-posts/${id}/like`)
    dbg('posts.ts', 'toggleLike -> returned', { ok: !!r, id: r?.data?.id })
    return r
  },

  getByCategory: async (
    categoryId: number,
    options: {
      page?: number
      pageSize?: number
      featured?: boolean
      sortBy?: string
      sortOrder?: string
    } = {},
  ): Promise<ApiResponse<BlogPost[]>> => {
    dbg('posts.ts', 'getByCategory', { categoryId, options })
    const params: Record<string, unknown> = {
      'filters[categories][id][$eq]': categoryId,
      'pagination[page]': options.page || 1,
      'pagination[pageSize]': options.pageSize || 12,
      'populate[author][populate]': '*',
      'populate[categories]': '*',
      'populate[tags]': '*',
      'populate[featured_image]': '*',
      publicationState: 'live',
    }

    if (options.sortBy) {
      params['sort[0]'] = `${options.sortBy}:${options.sortOrder || 'desc'}`
    } else {
      params['sort[0]'] = 'publishedAt:desc'
    }

    if (options.featured !== undefined) {
      params['filters[featured][$eq]'] = options.featured
    }

    const queryString = buildStrapiQuery(params)
    const resp = await apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)
    dbg('posts.ts', 'getByCategory -> response length', { len: resp?.data?.length })
    return resp
  },

  getByAuthor: async (
    authorId: number,
    options: {
      page?: number
      pageSize?: number
      featured?: boolean
      sortBy?: string
      sortOrder?: string
    } = {},
  ): Promise<ApiResponse<BlogPost[]>> => {
    dbg('posts.ts', 'getByAuthor', { authorId, options })
    const params: Record<string, unknown> = {
      'filters[author][id][$eq]': authorId,
      'pagination[page]': options.page || 1,
      'pagination[pageSize]': options.pageSize || 12,
      'populate[author][populate]': '*',
      'populate[categories]': '*',
      'populate[tags]': '*',
      'populate[featured_image]': '*',
      publicationState: 'live',
    }

    if (options.sortBy) {
      params['sort[0]'] = `${options.sortBy}:${options.sortOrder || 'desc'}`
    } else {
      params['sort[0]'] = 'publishedAt:desc'
    }

    if (options.featured !== undefined) {
      params['filters[featured][$eq]'] = options.featured
    }

    const queryString = buildStrapiQuery(params)
    const resp = await apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)
    dbg('posts.ts', 'getByAuthor -> response length', { len: resp?.data?.length })
    return resp
  },

  getByTag: async (
    tagId: number,
    options: {
      page?: number
      pageSize?: number
      featured?: boolean
      sortBy?: string
      sortOrder?: string
    } = {},
  ): Promise<ApiResponse<BlogPost[]>> => {
    dbg('posts.ts', 'getByTag', { tagId, options })
    const params: Record<string, unknown> = {
      'filters[tags][id][$eq]': tagId,
      'pagination[page]': options.page || 1,
      'pagination[pageSize]': options.pageSize || 12,
      'populate[author][populate]': '*',
      'populate[categories]': '*',
      'populate[tags]': '*',
      'populate[featured_image]': '*',
      publicationState: 'live',
    }

    if (options.sortBy) {
      params['sort[0]'] = `${options.sortBy}:${options.sortOrder || 'desc'}`
    } else {
      params['sort[0]'] = 'publishedAt:desc'
    }

    if (options.featured !== undefined) {
      params['filters[featured][$eq]'] = options.featured
    }

    const queryString = buildStrapiQuery(params)
    const resp = await apiService.get<ApiResponse<BlogPost[]>>(`/blog-posts?${queryString}`)
    dbg('posts.ts', 'getByTag -> response length', { len: resp?.data?.length })
    return resp
  },
}
