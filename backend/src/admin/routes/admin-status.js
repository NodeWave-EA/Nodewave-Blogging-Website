/**
 * Custom admin API route to check if super admin exists
 * This provides a secure way to determine if admin registration should be allowed
 */

module.exports = {
	type: 'admin',
	routes: [
		{
			method: 'GET',
			path: '/super-admin-status',
			handler: 'admin-status.checkSuperAdminStatus',
			config: {
				auth: false, // Allow unauthenticated access for registration check
			},
		},
	],
};
