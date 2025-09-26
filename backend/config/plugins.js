/**
 * Plugins configuration for NodeWave Blog
 * Supports both SMTP and Gmail API OAuth2 email providers
 */

module.exports = ({ env }) => {
	// Determine which email provider to use based on environment variables
	const emailProvider = env('EMAIL_PROVIDER', 'smtp'); // 'smtp' or 'gmail-api'

	// Base email configuration
	const emailConfig = {
		config: {
			provider: emailProvider,
			providerOptions: {},
			settings: {
				defaultFrom: env('EMAIL_DEFAULT_FROM', 'noreply@nodewave.blog'),
				defaultReplyTo: env('EMAIL_DEFAULT_REPLY_TO', 'support@nodewave.blog'),
				testAddress: env('EMAIL_TEST_ADDRESS', 'test@example.com'),
			},
		},
	};

	// Configure provider-specific options
	if (emailProvider === 'smtp') {
		emailConfig.config.providerOptions = {
			host: env('SMTP_HOST', 'localhost'),
			port: env.int('SMTP_PORT', 587),
			auth: {
				user: env('SMTP_USERNAME'),
				pass: env('SMTP_PASSWORD'),
			},
			secure: env.bool('SMTP_SECURE', false), // true for 465, false for other ports
			requireTLS: env.bool('SMTP_REQUIRE_TLS', true),
			connectionTimeout: env.int('SMTP_CONNECTION_TIMEOUT', 60000),
			greetingTimeout: env.int('SMTP_GREETING_TIMEOUT', 30000),
			socketTimeout: env.int('SMTP_SOCKET_TIMEOUT', 60000),
		};
	} else if (emailProvider === 'gmail-api') {
		emailConfig.config.provider = 'nodemailer';
		emailConfig.config.providerOptions = {
			service: 'gmail',
			auth: {
				type: 'OAuth2',
				user: env('GMAIL_USER'),
				clientId: env('GMAIL_CLIENT_ID'),
				clientSecret: env('GMAIL_CLIENT_SECRET'),
				refreshToken: env('GMAIL_REFRESH_TOKEN'),
				accessToken: env('GMAIL_ACCESS_TOKEN'), // Optional, will be auto-generated
			},
		};
	}

	return {
		// Email Plugin Configuration
		email: emailConfig,

		// Users & Permissions Plugin Configuration
		'users-permissions': {
			config: {
				register: {
					allowedFields: ['username', 'email', 'password'],
				},
				jwt: {
					expiresIn: '7d',
				},
			},
		},

		// Upload Plugin Configuration (if using Cloudinary)
		...(env('CLOUDINARY_NAME') && {
			upload: {
				config: {
					provider: 'cloudinary',
					providerOptions: {
						cloud_name: env('CLOUDINARY_NAME'),
						api_key: env('CLOUDINARY_KEY'),
						api_secret: env('CLOUDINARY_SECRET'),
					},
					actionOptions: {
						upload: {},
						uploadStream: {},
						delete: {},
					},
				},
			},
		}),

		// Documentation Plugin Configuration
		documentation: {
			config: {
				restrictedAccess: true,
				password: env('DOCS_PASSWORD', 'nodewave-docs'),
				'x-forwarded-proto': 'https',
			},
		},

		// GraphQL Plugin Configuration
		graphql: {
			config: {
				endpoint: '/graphql',
				shadowCRUD: true,
				playgroundAlways: env.bool('GRAPHQL_PLAYGROUND', false),
				depthLimit: 10,
				amountLimit: 100,
				apolloServer: {
					tracing: env('NODE_ENV') === 'development',
				},
			},
		},
	};
};
