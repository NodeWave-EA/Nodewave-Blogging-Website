import type { ContactForm } from '@/types'
import { apiService } from './api'

interface ContactResponse {
  success: boolean
  message: string
  data: {
    adminNotificationSent: boolean
    autoReplySent: boolean
  }
}

/**
 * Service encapsulating contact-related API operations.
 *
 * Provides a single method to submit a contact form to the backend contact endpoint.
 *
 * @remarks
 * The implementation uses the default API token configured in api.ts and performs a POST
 * request to the '/contact' endpoint.
 *
 * @async
 * @param formData - The contact form payload to send. Must conform to the ContactForm type.
 * @returns A promise that resolves with the server's ContactResponse on success.
 * @throws {Error} When the submission fails due to network or server errors. The thrown error
 *                 contains a user-facing message ("Failed to send message. Please try again.").
 * @example
 * const response = await contactService.submitContactForm({
 *   name: 'Jane Doe',
 *   email: 'jane@example.com',
 *   message: 'Hello!'
 * })
 */
export const contactService = {
  async submitContactForm(formData: ContactForm): Promise<ContactResponse> {
    try {
      // Use default API token for contact form (configured in api.ts)
      return await apiService.post<ContactResponse>('/contact', formData)
    } catch (error) {
      console.error('Contact form submission error:', error)
      throw new Error('Failed to send message. Please try again.')
    }
  },
}
