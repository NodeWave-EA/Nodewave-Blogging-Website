import type { ApiResponse, Category } from '@/types'
import { moduleLoaded } from '@/utils/debug'
import { apiService } from './api'
import { buildStrapiQuery } from './queryBuilder'

moduleLoaded('categories.ts')

/**
 * Client wrapper for the Categories endpoint (Strapi).
 *
 * Provides convenience methods to fetch category data with common query parameters
 * (populate relations, only published entries, and consistent sorting).
 *
 * getAll()
 * - Fetches all categories with relations populated, sorted by name ascending, and only published entries.
 * - Query used: { populate: '*', 'sort[0]': 'name:asc', publicationState: 'live' }
 *
 * @returns Promise<ApiResponse<Category[]>> A promise that resolves to the API response containing an array of categories.
 *
 * getBySlug(slug)
 * - Fetches a single category that exactly matches the given slug, with relations populated and only published entries.
 * - Query used: { 'filters[slug][$eq]': slug, populate: '*', publicationState: 'live' }
 *
 * @param slug - The slug string identifying the desired category.
 * @returns Promise<{ data: Category }> A promise that resolves to an object containing the matched category in the `data` field.
 * @throws Error If no category matches the provided slug.
 *
 * @remarks
 * - Both methods build query strings using `buildStrapiQuery` and perform HTTP GET requests via `apiService.get`.
 * - Callers should also be prepared to handle network or HTTP errors propagated by `apiService.get`.
 *
 * @public
 */
export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const params = {
      populate: '*',
      'sort[0]': 'name:asc',
      publicationState: 'live',
    }

    const queryString = buildStrapiQuery(params)
    return apiService.get<ApiResponse<Category[]>>(`/categories?${queryString}`)
  },

  getBySlug: async (slug: string): Promise<{ data: Category }> => {
    const params = {
      'filters[slug][$eq]': slug,
      populate: '*',
      publicationState: 'live',
    }

    const queryString = buildStrapiQuery(params)
    const response = await apiService.get<ApiResponse<Category[]>>(`/categories?${queryString}`)

    if (!response.data || response.data.length === 0) {
      throw new Error('Category not found')
    }

    return { data: response.data[0] }
  },
}
