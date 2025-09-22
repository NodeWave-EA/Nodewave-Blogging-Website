/**
 * newsletter controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::newsletter.newsletter', ({ strapi }) => ({
	async create(ctx) {
		// Use core create
		const response = await super.create(ctx)

		// Attempt to publish immediately if draft/publish is enabled
		try {
			const id = (response as any)?.data?.id
			if (id) {
				await strapi.entityService.update('api::newsletter.newsletter', id, {
					data: { publishedAt: new Date().toISOString() },
				})
			}
		} catch (e) {
			// ignore if publish fails; entry will remain draft
		}

		// If email present, generate a confirmation token and send confirmation email
		try {
			const createdId = (response as any)?.data?.id
			const email = (response as any)?.data?.email
			if (createdId && email) {
				const token = Buffer.from(`${createdId}:${Date.now()}`).toString('base64url')
				await strapi.entityService.update('api::newsletter.newsletter', createdId, {
					data: { confirmation_token: token, confirmed: false },
				})

				// Send confirmation email using email service
				try {
					const emailService = strapi.service('api::email.email')
					if (emailService) {
						await emailService.sendNewsletterConfirmation(email, token)
						strapi.log.info(`Newsletter confirmation email sent to ${email}`)
					} else {
						// Fallback to custom email service if the API service doesn't exist
						const customEmailService = require('../../../services/email').default({ strapi })
						await customEmailService.sendNewsletterConfirmation(email, token)
						strapi.log.info(`Newsletter confirmation email sent to ${email} via custom service`)
					}
				} catch (emailError) {
					strapi.log.error('Failed to send newsletter confirmation email:', emailError)
					// Don't fail the registration if email fails
				}
			}
		} catch (e) {
			strapi.log.error('Error in newsletter confirmation process:', e)
		}

		return response
	},

	async unsubscribe(ctx) {
		const { email } = ctx.request.body || {}
		if (!email || typeof email !== 'string') {
			return ctx.badRequest('Email is required')
		}

		// Find by email
		const existing = await strapi.entityService.findMany('api::newsletter.newsletter', {
			filters: { email: { $eq: email } },
			limit: 1,
			publicationState: 'preview',
		})

		if (!existing || existing.length === 0) {
			return ctx.notFound('Subscription not found')
		}

		const entry = existing[0]
		await strapi.entityService.delete('api::newsletter.newsletter', entry.id)
		ctx.send({ message: 'You have been unsubscribed and your data was removed.' })
	},

	async confirm(ctx) {
		const { token } = ctx.request.query as { token?: string }
		if (!token) {
			return ctx.badRequest('Token is required')
		}
		const matches = await strapi.entityService.findMany('api::newsletter.newsletter', {
			filters: { confirmation_token: { $eq: token } },
			limit: 1,
			publicationState: 'preview',
		})
		if (!matches || matches.length === 0) {
			return ctx.notFound('Invalid confirmation token')
		}
		const entry = matches[0]
		await strapi.entityService.update('api::newsletter.newsletter', entry.id, {
			data: {
				confirmed: true,
				confirmation_token: null,
				subscribed: true,
			},
		})
		ctx.send({ message: 'Subscription confirmed.' })
	},
}))
