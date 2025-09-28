import type { ApiResponse, Newsletter } from '@/types'
import { dbg, moduleLoaded } from '@/utils/debug'
import { apiService } from './api'

moduleLoaded('newsletter.ts')

/**
 * Client service for interacting with newsletter-related backend endpoints.
 *
 * Provides methods to subscribe an email address to the newsletter and to
 * unsubscribe the current user. The unsubscribe method is a deliberate
 * placeholder and will throw an error until the backend exposes a matching
 * endpoint (for example, POST /newsletters/unsubscribe).
 *
 * @remarks
 * - Uses an underlying apiService to perform HTTP requests.
 * - subscribe posts { data: { email, status: 'subscribed' } } to POST /newsletters.
 * - unsubscribe currently throws to avoid accidental 404s; implement the backend
 *   route to enable it.
 *
 * @example
 * // Subscribe an email
 * await newsletterService.subscribe('user@example.com')
 *
 * @public
 */

/**
 * Subscribe an email address to the newsletter.
 *
 * Sends a POST request to the /newsletters endpoint with the provided email
 * and a subscription status of "subscribed". Resolves with the API response
 * containing the created Newsletter resource on success.
 *
 * @param email - The email address to subscribe. Should be a valid email string.
 * @returns A promise that resolves to ApiResponse<Newsletter> when the request succeeds.
 *
 * @throws {Error} If the network request fails or the API returns an error.
 */

/**
 * Unsubscribe the current user from the newsletter.
 *
 * This method is a placeholder that throws an error by default to avoid
 * hitting a non-existent endpoint. To support unsubscription, add a backend
 * route (for example, POST /newsletters/unsubscribe) and update this method
 * to call that endpoint.
 *
 * @returns A promise that resolves when the unsubscription completes.
 *
 * @throws {Error} Currently always throws with the message
 * 'Unsubscribe endpoint not implemented in backend' until a backend endpoint is added.
 */
export const newsletterService = {
  async subscribe(email: string): Promise<ApiResponse<Newsletter>> {
    return apiService.post<ApiResponse<Newsletter>>('/newsletters', {
      data: {
        email,
        status: 'subscribed',
      },
    })
  },

  async unsubscribe(email?: string): Promise<void> {
    // Try to call a backend unsubscribe endpoint if implemented.
    // If no email is provided or the endpoint is not available, throw a helpful error.
    if (!email) throw new Error('Email required to unsubscribe')

    try {
      // Use a conventional route if backend provides it
      await apiService.post('/newsletters/unsubscribe', { data: { email } })
      return
    } catch (err) {
      // Endpoint not implemented or returned an error; surface a clear message
      dbg('newsletterService.unsubscribe', 'error', err)
      throw new Error('Unsubscribe endpoint not implemented in backend')
    }
  },
}
