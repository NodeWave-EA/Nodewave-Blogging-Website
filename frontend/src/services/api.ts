import { dbg, moduleLoaded } from '@/utils/debug'
import type { AxiosRequestConfig } from 'axios'
import { axiosClient } from './axiosClient'
import { buildStrapiQuery } from './queryBuilder'

moduleLoaded('api.ts')

// Configuration
const API_TOKEN = import.meta.env.VITE_API_TOKEN

// Enforce presence of API token — this project expects a token to access Strapi endpoints
if (!API_TOKEN) {
  dbg(
    'api.ts',
    'Error',
    'VITE_API_TOKEN is not set. Requests to Strapi will fail without a valid API token.',
  )
  throw new Error('VITE_API_TOKEN is required to access the Strapi API. Check your .env file.')
}

/**
 * apiService
 *
 * A small, typed wrapper around an axios client that centralizes HTTP calls and
 * standardizes logging and response extraction. Each method logs the request
 * and the response status via the `dbg` helper, forwards options to the
 * underlying `axiosClient`, and returns the response payload (i.e. `response.data`).
 *
 * Generic type parameter T is used to type the resolved payload for each method.
 *
 * Methods
 * - get<T>(url, config?): Send an HTTP GET and return the parsed response data.
 * - post<T>(url, data?, config?): Send an HTTP POST with optional body and return the parsed response data.
 * - put<T>(url, data?, config?): Send an HTTP PUT with optional body and return the parsed response data.
 * - delete<T>(url, config?): Send an HTTP DELETE and return the parsed response data.
 * - buildStrapiQuery(params): Backward-compatibility helper that delegates to the centralized query builder.
 *
 * Notes
 * - Errors thrown by axios (network errors, non-2xx responses when not handled by interceptors, etc.)
 *   are propagated to callers unchanged.
 * - Logging side effects occur via the `dbg` calls before and after each request.
 *
 * Examples
 * ```ts
 * // retrieve a list of posts
 * const posts = await apiService.get<Post[]>('/posts');
 *
 * // create a new post
 * const created = await apiService.post<Post>('/posts', { title: 'Hello' });
 * ```
 *
 * @remarks
 * This object is intended to be a lightweight façade over the configured axios instance,
 * returning only the deserialized payload and keeping call-sites concise and strongly typed.
 *
 * @property get - Perform a GET request and return response data typed as T.
 * @template T - Expected shape of the response payload.
 * @param url - The request URL (relative or absolute).
 * @param config - Optional Axios request configuration.
 * @returns Promise<T> resolved with the response payload.
 *
 * @property post - Perform a POST request with an optional body and return response data typed as T.
 * @template T - Expected shape of the response payload.
 * @param url - The request URL.
 * @param data - Optional request body to send.
 * @param config - Optional Axios request configuration.
 * @returns Promise<T> resolved with the response payload.
 *
 * @property put - Perform a PUT request with an optional body and return response data typed as T.
 * @template T - Expected shape of the response payload.
 * @param url - The request URL.
 * @param data - Optional request body to send.
 * @param config - Optional Axios request configuration.
 * @returns Promise<T> resolved with the response payload.
 *
 * @property delete - Perform a DELETE request and return response data typed as T.
 * @template T - Expected shape of the response payload.
 * @param url - The request URL.
 * @param config - Optional Axios request configuration.
 * @returns Promise<T> resolved with the response payload.
 *
 * @property buildStrapiQuery - Delegates to the centralized query builder for Strapi query serialization.
 * @param params - A record of query parameters to be converted by the centralized builder.
 * @returns The result produced by the centralized `buildStrapiQuery` function (format depends on that implementation).
 */
export const apiService = {
  get: async <T>(url: string, config?: AxiosRequestConfig) => {
    dbg('api.ts', 'apiService.get', { url })
    const response = await axiosClient.get<T>(url, config)
    dbg('api.ts', 'apiService.get -> returned', { url, status: (response as any)?.status })
    return response.data
  },

  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    dbg('api.ts', 'apiService.post', { url })
    const response = await axiosClient.post<T>(url, data, config)
    dbg('api.ts', 'apiService.post -> returned', { url, status: (response as any)?.status })
    return response.data
  },

  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    dbg('api.ts', 'apiService.put', { url })
    const response = await axiosClient.put<T>(url, data, config)
    dbg('api.ts', 'apiService.put -> returned', { url, status: (response as any)?.status })
    return response.data
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig) => {
    dbg('api.ts', 'apiService.delete', { url })
    const response = await axiosClient.delete<T>(url, config)
    dbg('api.ts', 'apiService.delete -> returned', { url, status: (response as any)?.status })
    return response.data
  },

  // Utility function for backward compatibility — delegates to centralized query builder
  buildStrapiQuery: (params: Record<string, unknown>) => buildStrapiQuery(params),
}
