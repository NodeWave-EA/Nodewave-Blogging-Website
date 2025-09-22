/**
 * Admin registration control middleware
 * Blocks register-admin route when super admin already exists
 */

module.exports = (config, { strapi }) => {
	return async (ctx, next) => {
		// Only apply to register-admin route
		if (!ctx.request.url.includes('/admin/auth/register-admin')) {
			return await next();
		}

		try {
			const { checkSuperUserExists } = require('../admin/bootstrap/roles.js');
			const hasSuperUser = await checkSuperUserExists(strapi);

			if (hasSuperUser) {
				console.log('🚫 Blocking register-admin route - Super Admin already exists');

				if (ctx.request.method === 'GET') {
					// Redirect GET requests to regular registration
					return ctx.redirect('/admin/auth/register');
				} else {
					// Block API calls to register-admin
					ctx.status = 403;
					ctx.body = {
						error: 'Admin registration is disabled. Super Admin already exists.',
						message: 'Use the regular registration form to create an Author account.',
						statusCode: 403
					};
					return;
				}
			}

			// Allow if no super admin exists
			await next();
		} catch (error) {
			console.error('❌ Error in admin registration middleware:', error);
			await next();
		}
	};
};
