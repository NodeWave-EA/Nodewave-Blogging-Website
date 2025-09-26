/**
 * Users & Permissions plugin server extension
 * Automatically assigns 'Author' role to new user registrations
 * Properly integrates with Strapi's email service
 */

const _ = require('lodash');
const { sanitize } = require('@strapi/utils');
const { ApplicationError } = require('@strapi/utils/lib/errors');

module.exports = (plugin) => {
	// Override the register controller
	plugin.controllers.auth.register = async (ctx) => {
		const pluginStore = await strapi.store({
			environment: '',
			type: 'plugin',
			name: 'users-permissions',
		});

		const settings = await pluginStore.get({
			key: 'advanced',
		});

		if (!settings.allow_register) {
			throw new ApplicationError('Register action is currently disabled');
		}

		const params = {
			..._.omit(ctx.request.body, ['confirmed', 'blocked', 'confirmationToken', 'resetPasswordToken']),
			provider: 'local',
		};

		await strapi.plugin('users-permissions').service('user').validateRegisterBody(params);

		// Find the 'Author' role or create it if it doesn't exist
		let role = await strapi.query('plugin::users-permissions.role').findOne({
			where: { type: 'author' },
		});

		if (!role) {
			// If 'Author' role doesn't exist, fall back to 'authenticated' role
			role = await strapi.query('plugin::users-permissions.role').findOne({
				where: { type: 'authenticated' },
			});

			if (!role) {
				throw new ApplicationError('Unable to find default role for registration');
			}

			strapi.log.warn('Author role not found, using authenticated role as fallback');
		} else {
			strapi.log.info('Assigning Author role to new user');
		}

		const { email, username, provider } = params;

		const identifierFilter = {
			$or: [
				{ email: email.toLowerCase() },
				{ username: email.toLowerCase() },
				{ username },
				{ email: username },
			],
		};

		const conflictingUserCount = await strapi.query('plugin::users-permissions.user').count({
			where: { ...identifierFilter, provider },
		});

		if (conflictingUserCount > 0) {
			throw new ApplicationError('Email or Username are already taken');
		}

		if (settings.unique_email) {
			const conflictingUserCount = await strapi.query('plugin::users-permissions.user').count({
				where: { ...identifierFilter },
			});

			if (conflictingUserCount > 0) {
				throw new ApplicationError('Email or Username are already taken');
			}
		}

		const newUser = {
			...params,
			role: role.id,
			email: email.toLowerCase(),
			username,
			confirmed: !settings.email_confirmation,
		};

		const user = await strapi.plugin('users-permissions').service('user').add(newUser);

		const sanitizedUser = await sanitize.contentAPI.output(user, strapi.getModel('plugin::users-permissions.user'));

		if (settings.email_confirmation) {
			try {
				// Use the custom email service for confirmation
				await sendConfirmationEmail(sanitizedUser);

				console.log('✅ Confirmation email sent to:', sanitizedUser.email);

				return ctx.send({
					user: sanitizedUser,
					message: 'Please check your inbox to verify your email address before signing in.'
				});
			} catch (err) {
				console.error('❌ Error sending confirmation email:', err);
				throw new ApplicationError(`Registration successful, but confirmation email could not be sent: ${err.message}`);
			}
		}

		const jwt = strapi.plugin('users-permissions').service('jwt').issue({
			id: user.id,
		});

		return ctx.send({
			jwt,
			user: sanitizedUser,
		});
	};

	// Override the email confirmation controller to provide better feedback
	plugin.controllers.auth.emailConfirmation = async (ctx) => {
		const { confirmation: confirmationToken } = ctx.query;

		const { user: userService, jwt: jwtService } = strapi.plugins['users-permissions'].services;

		if (_.isEmpty(confirmationToken)) {
			throw new ApplicationError('Missing confirmation token');
		}

		const user = await userService.fetch({ confirmationToken }, []);

		if (!user) {
			throw new ApplicationError('Invalid confirmation token');
		}

		await userService.edit(user.id, { confirmed: true, confirmationToken: null });

		const jwt = jwtService.issue({
			id: user.id,
		});

		// Redirect to a success page or login page with success message
		const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

		ctx.send({
			jwt,
			user: await sanitize.contentAPI.output(user, strapi.getModel('plugin::users-permissions.user')),
			message: 'Your email has been confirmed successfully! You can now sign in.',
			redirectUrl: `${redirectUrl}?emailConfirmed=true`
		});
	};

	return plugin;
};

/**
 * Send confirmation email using Strapi's email service
 * Custom implementation that uses the configured email provider
 */
async function sendConfirmationEmail(user) {
	try {
		const pluginStore = await strapi.store({
			environment: '',
			type: 'plugin',
			name: 'users-permissions',
		});

		const settings = await pluginStore.get({ key: 'email' });

		if (!settings?.confirmation?.enabled) {
			return;
		}

		const userInfo = await strapi.query('plugin::users-permissions.user').findOne({
			where: { id: user.id },
		});

		const confirmationToken = userInfo.confirmationToken;

		// Build confirmation URL
		const apiUrl = strapi.config.get('server.url') ||
			`${strapi.config.get('server.host')}:${strapi.config.get('server.port')}`;
		const confirmationUrl = `${apiUrl}/api/auth/email-confirmation?confirmation=${confirmationToken}`;

		// Email content with NodeWave branding
		const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirm Your NodeWave Account</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px 0;
            border-bottom: 2px solid #4945ff;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #4945ff;
            margin-bottom: 10px;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background: #4945ff;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">NodeWave Blog</div>
          <p>Welcome to the Author Community</p>
        </div>

        <div class="content">
          <h2>🎉 Welcome to NodeWave!</h2>

          <p>Hi <strong>${user.username || user.email}</strong>,</p>

          <p>Thank you for joining NodeWave Blog! We're excited to have you as part of our author community.</p>

          <p>To get started and verify your email address, please click the button below:</p>

          <div style="text-align: center;">
            <a href="${confirmationUrl}" class="button">Confirm Your Account</a>
          </div>

          <p>Once your account is confirmed, you'll be able to:</p>
          <ul>
            <li>✍️ Create and publish blog posts</li>
            <li>📝 Manage your author profile</li>
            <li>💬 Interact with the community</li>
            <li>📊 Track your content performance</li>
          </ul>

          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 4px; font-family: monospace;">${confirmationUrl}</p>
        </div>

        <div class="footer">
          <p>This confirmation link will expire in 24 hours.</p>
          <p>If you didn't create an account with NodeWave, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} NodeWave Blog. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

		// Send email using Strapi's configured email service
		await strapi.plugin('email').service('email').send({
			to: user.email,
			from: process.env.EMAIL_DEFAULT_FROM || 'noreply@nodewave.blog',
			replyTo: process.env.EMAIL_DEFAULT_REPLY_TO || 'support@nodewave.blog',
			subject: 'Confirm Your NodeWave Account',
			html: emailHTML,
		});

		console.log('✅ Custom confirmation email sent successfully to:', user.email);

	} catch (error) {
		console.error('❌ Error sending custom confirmation email:', error);
		throw error;
	}
}
