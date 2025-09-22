/**
 * Contact service
 * Handles contact form email notifications
 */

interface ContactFormData {
	name: string
	email: string
	subject: string
	message: string
}

interface AutoReplyData {
	name: string
	email: string
	subject: string
}

export default () => ({
	/**
	 * Send admin notification email
	 */
	async sendAdminNotification({ name, email, subject, message }: ContactFormData): Promise<boolean> {
		try {
			const adminEmail = process.env.ADMIN_EMAIL || 'admin@nodewave.blog'
			const companyName = process.env.COMPANY_NAME || 'NodeWave Blog'

			const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>New Contact Form Submission</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e5e5e5;
                border-top: none;
              }
              .field {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #f0f0f0;
              }
              .field:last-child {
                border-bottom: none;
                margin-bottom: 0;
              }
              .label {
                font-weight: 600;
                color: #555;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
              }
              .value {
                color: #333;
                font-size: 16px;
                line-height: 1.5;
              }
              .message-value {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #667eea;
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                border-radius: 0 0 8px 8px;
                border: 1px solid #e5e5e5;
                border-top: none;
              }
              .footer p {
                margin: 0;
                color: #666;
                font-size: 12px;
              }
              .reply-info {
                background: #e3f2fd;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #2196F3;
                margin: 15px 0;
              }
              .reply-info strong {
                color: #1976D2;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📧 New Contact Form Submission</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">From ${companyName} Website</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 Name</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">📧 Email</div>
                <div class="value">${email}</div>
              </div>
              <div class="field">
                <div class="label">📝 Subject</div>
                <div class="value">${subject}</div>
              </div>
              <div class="field">
                <div class="label">💬 Message</div>
                <div class="value message-value">${message.replace(/\n/g, '<br>')}</div>
              </div>
              <div class="reply-info">
                <strong>💡 Quick Reply:</strong> Reply directly to this email to respond to ${name}
              </div>
            </div>
            <div class="footer">
              <p>Received on ${new Date().toLocaleString()} via ${companyName} contact form</p>
            </div>
          </body>
        </html>
      `

			const text = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Received on ${new Date().toLocaleString()} via ${companyName} contact form
Reply directly to this email to respond to ${name}.
      `

			await strapi.plugins.email.services.email.send({
				to: adminEmail,
				from: process.env.EMAIL_DEFAULT_FROM || 'noreply@nodewave.blog',
				replyTo: email, // Allow admin to reply directly to the user
				subject: `[Contact Form] ${subject}`,
				text,
				html,
			})

			return true
		} catch (error) {
			strapi.log.error('Failed to send admin notification email:', error)
			return false
		}
	},

	/**
	 * Send auto-reply email to user
	 */
	async sendAutoReply({ name, email, subject }: AutoReplyData): Promise<boolean> {
		try {
			const companyName = process.env.COMPANY_NAME || 'NodeWave Blog'
			const supportEmail = process.env.EMAIL_DEFAULT_REPLY_TO || 'support@nodewave.blog'

			const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Thank you for contacting us</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e5e5e5;
                border-top: none;
              }
              .greeting {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
              }
              .subject-reference {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #28a745;
                margin: 20px 0;
                font-style: italic;
              }
              .response-time {
                background: #fff3cd;
                border: 1px solid #ffeeba;
                color: #856404;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
              }
              .contact-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 6px;
                margin: 20px 0;
              }
              .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                border-radius: 0 0 8px 8px;
                border: 1px solid #e5e5e5;
                border-top: none;
              }
              .footer p {
                margin: 0;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✅ Message Received!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for contacting ${companyName}</p>
            </div>
            <div class="content">
              <div class="greeting">
                Hello <strong>${name}</strong>,
              </div>

              <p>Thank you for reaching out to us! Your email about <strong>"${subject}"</strong> has been received and we appreciate you taking the time to contact us.</p>

              <div class="subject-reference">
                <strong>Your message subject:</strong> "${subject}"
              </div>

              <div class="response-time">
                <strong>⏱️ Response Time:</strong> We typically respond to inquiries within 24 hours during business days. For urgent matters, please call us directly.
              </div>

              <p>Our team will review your message and get back to you as soon as possible. In the meantime, feel free to:</p>

              <ul>
                <li>📖 Browse our latest blog posts for helpful content</li>
                <li>🔍 Check our FAQ section for common questions</li>
                <li>📱 Follow us on social media for updates</li>
              </ul>

              <div class="contact-info">
                <strong>Need immediate assistance?</strong><br>
                Email: <a href="mailto:${supportEmail}">${supportEmail}</a>
              </div>

              <p>Best regards,<br>
              The ${companyName} Team</p>
            </div>
            <div class="footer">
              <p>This is an automated confirmation email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </div>
          </body>
        </html>
      `

			const text = `
Hello ${name},

Thank you for reaching out to us! Your email about "${subject}" has been received and we appreciate you taking the time to contact us.

Response Time: We typically respond to inquiries within 24 hours during business days. For urgent matters, please contact us directly.

Our team will review your message and get back to you as soon as possible.

Best regards,
The ${companyName} Team

---
This is an automated confirmation email. Please do not reply to this message.
© ${new Date().getFullYear()} ${companyName}. All rights reserved.
      `

			await strapi.plugins.email.services.email.send({
				to: email,
				from: process.env.EMAIL_DEFAULT_FROM || 'noreply@nodewave.blog',
				replyTo: supportEmail,
				subject: `Re: ${subject} - Message Received`,
				text,
				html,
			})

			return true
		} catch (error) {
			strapi.log.error('Failed to send auto-reply email:', error)
			return false
		}
	},
})
