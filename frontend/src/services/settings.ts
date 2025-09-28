import type { ApiResponse, BlogSetting } from '@/types'
import { moduleLoaded } from '@/utils/debug'
import { apiService } from './api'
import { buildStrapiQuery } from './queryBuilder'

moduleLoaded('settings.ts')

/**
 * Blog settings API helper.
 *
 * Exposes methods to retrieve blog settings from the backend (Strapi).
 *
 * The implementation builds a Strapi query with `populate: '*'` to include related fields,
 * performs a GET request to `/blog-settings`, and returns the first entry found.
 *
 * @property
 * get - Fetches the blog settings.
 *
 * @async
 * @returns Promise<{ data: BlogSetting }> A promise that resolves with an object containing
 * the first BlogSetting entry under the `data` property.
 *
 * @throws {Error} If the request returns no data or the returned array is empty,
 * an Error with the message "Blog settings not found" is thrown.
 *
 * @remarks
 * - Internally uses `buildStrapiQuery` to construct the query string and `apiService.get`
 *   to perform the HTTP request.
 * - Designed to return a single settings object (the first result) even though the API
 *   endpoint returns an array.
 *
 * @example
 * const { data } = await blogSettingsApi.get();
 * console.log(data.siteTitle);
 *
 * @see buildStrapiQuery
 * @see apiService.get
 */
export const blogSettingsApi = {
  get: async (): Promise<{ data: BlogSetting }> => {
    const params = {
      populate: '*',
    }

    const queryString = buildStrapiQuery(params)
    const response = await apiService.get<ApiResponse<BlogSetting[]>>(
      `/blog-settings?${queryString}`,
    )

    if (!response.data || response.data.length === 0) {
      throw new Error('Blog settings not found')
    }

    return { data: response.data[0] }
  },
}
