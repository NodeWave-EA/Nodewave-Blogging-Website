import type { ApiResponse, Author } from '@/types'
import { moduleLoaded } from '@/utils/debug'
import { apiService } from './api'
import { buildStrapiQuery } from './queryBuilder'

moduleLoaded('authors.ts')

/**
 * authorsApi
 *
 * API client for interacting with the authors endpoints on the backend (Strapi).
 *
 * Provides convenience methods to fetch all authors or a single author by slug,
 * delegating network requests to the shared apiService and building Strapi-compatible
 * query strings where necessary.
 *
 * @remarks
 * - getAll builds a query with populate='*', sort by name ascending, and publicationState='live'.
 * - getBySlug fetches a single author resource using the slug-based endpoint.
 * - Consumers should handle errors thrown by apiService (network errors, non-2xx responses, etc.).
 *
 * @example
 * // Fetch all authors
 * const response = await authorsApi.getAll(); // Promise<ApiResponse<Author[]>>
 *
 * // Fetch a single author by slug
 * const single = await authorsApi.getBySlug('jane-doe'); // Promise<{ data: Author }>
 *
 * @public
 *
 * @property getAll(): Promise<ApiResponse<Author[]>>
 *   Fetches all authors with related data populated, sorted by name (ascending),
 *   and limited to published ("live") entries.
 *
 * @property getBySlug(slug: string): Promise<{ data: Author }>
 *   Fetches a single author by its slug.
 *   @param slug - The slug identifier of the author to retrieve.
 *   @returns A promise resolving to an object with a `data` field containing the Author.
 */
export const authorsApi = {
	getAll: async (): Promise<ApiResponse<Author[]>> => {
		const params = {
			populate: '*',
			'sort[0]': 'name:asc',
			publicationState: 'live',
		}

		const queryString = buildStrapiQuery(params)
		return apiService.get<ApiResponse<Author[]>>(`/authors?${queryString}`)
	},

	getBySlug: async (slug: string): Promise<{ data: Author }> => {
		return apiService.get<{ data: Author }>(`/authors/slug/${slug}`)
	},
}
