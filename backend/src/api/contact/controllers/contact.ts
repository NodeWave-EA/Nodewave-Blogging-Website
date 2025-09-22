/**
 * Contact controller
 * Handles contact form submissions and sends notification emails
 */

interface ContactFormData {
	name: string
	email: string
	subject: string
	message: string
}

export default {
	async submit(ctx) {
		try {
			const { name, email, subject, message }: ContactFormData = ctx.request.body

			// Validate required fields
			if (!name || !email || !subject || !message) {
				return ctx.badRequest('All fields are required')
			}

			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			if (!emailRegex.test(email)) {
				return ctx.badRequest('Please provide a valid email address')
			}

			// Get email service
			const emailService = strapi.service('api::contact.contact')

			// Send notification email to admin
			const adminEmailSent = await emailService.sendAdminNotification({
				name,
				email,
				subject,
				message,
			})

			// Send auto-reply to user
			const autoReplySent = await emailService.sendAutoReply({
				name,
				email,
				subject,
			})

			// Log the results
			strapi.log.info(`Contact form submission from ${name} (${email})`)
			strapi.log.info(`Admin notification sent: ${adminEmailSent}`)
			strapi.log.info(`Auto-reply sent: ${autoReplySent}`)

			// Return success response
			ctx.send({
				success: true,
				message: 'Your message has been sent successfully. We will get back to you soon.',
				data: {
					adminNotificationSent: adminEmailSent,
					autoReplySent: autoReplySent,
				},
			})
		} catch (error) {
			strapi.log.error('Contact form submission error:', error)
			ctx.internalServerError('Failed to process your request. Please try again later.')
		}
	},
}
