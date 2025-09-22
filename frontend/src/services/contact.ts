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
