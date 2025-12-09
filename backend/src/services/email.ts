/**
 * Email Service
 * Provides email sending functionality using SMTP
 */

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
  from?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

class EmailService {
  private strapi: any

  constructor(strapi: any) {
    this.strapi = strapi
  }

  /**
   * Send email using configured provider
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const emailConfig = this.strapi.config.get('plugin.email', {})
      const defaultFrom = emailConfig.settings?.defaultFrom || 'noreply@nodewave.blog'
      const defaultReplyTo = emailConfig.settings?.defaultReplyTo || 'support@nodewave.blog'

      const emailData = {
        to: options.to,
        from: options.from || defaultFrom,
        replyTo: options.replyTo || defaultReplyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      }

      await this.strapi.plugins.email.services.email.send(emailData)

      this.strapi.log.info(`Email sent successfully to ${options.to}`)
      return true
    } catch (error) {
      this.strapi.log.error('Failed to send email:', error)
      return false
    }
  }

  /**
   * Send newsletter confirmation email
   */
  async sendNewsletterConfirmation(email: string, confirmationToken: string): Promise<boolean> {
    const confirmationUrl = `${process.env.FRONTEND_URL}/newsletter/confirm?token=${confirmationToken}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Confirm Your Newsletter Subscription</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NodeWave Blog</h1>
            </div>
            <div class="content">
              <h2>Confirm Your Newsletter Subscription</h2>
              <p>Thank you for subscribing to our newsletter! To complete your subscription, please click the button below:</p>
              <a href="${confirmationUrl}" class="button">Confirm Subscription</a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${confirmationUrl}">${confirmationUrl}</a></p>
              <p>If you didn't subscribe to our newsletter, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} NodeWave Blog. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      Confirm Your Newsletter Subscription

      Thank you for subscribing to our newsletter!

      To complete your subscription, please visit this link:
      ${confirmationUrl}

      If you didn't subscribe to our newsletter, you can safely ignore this email.

      © ${new Date().getFullYear()} NodeWave Blog. All rights reserved.
    `

    return this.sendEmail({
      to: email,
      subject: 'Confirm Your Newsletter Subscription - NodeWave Blog',
      text,
      html,
    })
  }

  /**
   * Send contact form notification
   */
  async sendContactFormNotification(formData: {
    name: string
    email: string
    subject?: string
    message: string
  }): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nodewave.blog'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Contact Form Submission</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-top: 5px; padding: 10px; background-color: white; border-left: 4px solid #28a745; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${formData.name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${formData.email}</div>
              </div>
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${formData.subject || 'No subject provided'}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${formData.message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: adminEmail,
      subject: `New Contact Form: ${formData.subject || 'From ' + formData.name}`,
      html,
      replyTo: formData.email,
    })
  }

  /**
   * Send test email to verify SMTP configuration
   */
  async sendTestEmail(testEmail?: string): Promise<boolean> {
    const emailConfig = this.strapi.config.get('plugin.email', {})
    const recipient = testEmail || emailConfig.settings?.testAddress || 'test@example.com'

    return this.sendEmail({
      to: recipient,
      subject: 'NodeWave Blog - Email Configuration Test',
      text: 'This is a test email to verify your email configuration is working correctly.',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email to verify your SMTP configuration is working correctly.</p>
        <p><strong>Provider:</strong> SMTP (${process.env.SMTP_HOST || 'Unknown'})</p>
        <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
      `,
    })
  }

  /**
   * Send admin notification
   */
  async sendAdminNotification(subject: string, message: string): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nodewave.blog'

    return this.sendEmail({
      to: adminEmail,
      subject: `[NodeWave Blog] ${subject}`,
      text: message,
      html: `
        <h2>${subject}</h2>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <small>This is an automated notification from NodeWave Blog.</small>
      `,
    })
  }
}

// Export service factory
export default ({ strapi }: { strapi: any }) => new EmailService(strapi)
