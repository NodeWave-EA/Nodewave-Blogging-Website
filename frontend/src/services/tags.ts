import type { ApiResponse, Tag } from '@/types';
import { moduleLoaded } from '@/utils/debug';
import { apiService } from './api';
import { buildStrapiQuery } from './queryBuilder';

moduleLoaded('tags.ts')

/**
 * tagsApi
 *
 * Client for interacting with the tags endpoints of the API.
 * Each method builds a Strapi-compatible query string (via buildStrapiQuery)
 * and delegates the HTTP request to apiService.
 *
 * Methods:
 *
 * - getAll(): Fetches all tags with a default sort of `name:asc` and `publicationState: 'live'`.
 *   @returns Promise<ApiResponse<Tag[]>> - The raw API response containing an array of tags.
 *
 * - getBySlug(slug: string): Fetches a single tag filtered by its slug.
 *   The function returns the first matched tag wrapped in an object with a `data` property.
 *   @param slug - The slug value to filter tags by.
 *   @throws Error - Throws an Error with message "Tag not found" if the API returns no matching tag.
 *   @returns Promise<{ data: Tag }> - An object whose `data` property is the matched Tag.
 *
 * - getRelated(tagId: number, limit = 6): Fetches tags related to (i.e., excluding) the provided tag id.
 *   Results are limited via pagination[pageSize] and sorted by `name:asc`.
 *   @param tagId - Numeric id of the tag to exclude from the results.
 *   @param limit - Optional page size limit for the number of related tags to return (default: 6).
 *   @returns Promise<ApiResponse<Tag[]>> - The raw API response containing the related tags.
 *
 * Notes:
 * - All requests include `publicationState: 'live'` to only return published/live entries.
 * - Query strings are constructed using `buildStrapiQuery` and endpoints are requested via `apiService.get`.
 */
export const tagsApi = {
	getAll: async (): Promise<ApiResponse<Tag[]>> => {
		const params = {
			'sort[0]': 'name:asc',
			publicationState: 'live',
		}

		const queryString = buildStrapiQuery(params)
		return apiService.get<ApiResponse<Tag[]>>(`/tags?${queryString}`)
	},

	getBySlug: async (slug: string): Promise<{ data: Tag }> => {
		const params = {
			'filters[slug][$eq]': slug,
			publicationState: 'live',
		}

		const queryString = buildStrapiQuery(params)
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

		const queryString = buildStrapiQuery(params)
		return apiService.get<ApiResponse<Tag[]>>(`/tags?${queryString}`)
	},
}
