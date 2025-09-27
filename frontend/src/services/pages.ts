import type { ApiResponse, Page } from '@/types';
import { moduleLoaded } from '@/utils/debug';
import { apiService } from './api';
import { buildStrapiQuery } from './queryBuilder';

moduleLoaded('pages.ts')

/**
 * pagesApi
 *
 * A small client for interacting with the Pages endpoints of the backend (Strapi).
 * Each method constructs a Strapi-compatible query (via buildStrapiQuery) and issues
 * a GET request through apiService.get.
 *
 * @public
 *
 * @remarks
 * - All requests set populate = '*' and publicationState = 'live' to retrieve published
 *   content with its related entities populated.
 * - Query construction details are handled internally; callers only supply high-level inputs.
 *
 * @property getBySlug
 * Retrieves a single Page by its slug.
 *
 * @param slug - The slug value used to filter pages (matches filters[slug][$eq]).
 * @returns A promise that resolves to an object containing the matched Page in the `data` property:
 *          { data: Page }.
 * @throws {Error} If no page matches the provided slug (throws "Page not found") or if the request fails.
 * @example
 * const { data: page } = await pagesApi.getBySlug('about-us');
 *
 * @property getMenuPages
 * Retrieves pages flagged to appear in site navigation.
 *
 * @returns A promise that resolves to an ApiResponse containing an array of Pages (ApiResponse<Page[]>).
 * @remarks
 * - The query filters for show_in_menu = true and sorts results by menu_order ascending
 *   (sort[0] = 'menu_order:asc').
 * - Useful for building navigation menus or site maps.
 * @example
 * const response = await pagesApi.getMenuPages();
 * const menuPages = response.data;
 */
export const pagesApi = {
	getBySlug: async (slug: string): Promise<{ data: Page }> => {
		const params = {
			'filters[slug][$eq]': slug,
			populate: '*',
			publicationState: 'live',
		}

		const queryString = buildStrapiQuery(params)
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

		const queryString = buildStrapiQuery(params)
		return apiService.get<ApiResponse<Page[]>>(`/pages?${queryString}`)
	},
}
