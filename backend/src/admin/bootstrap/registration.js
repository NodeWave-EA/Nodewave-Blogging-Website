/**
 * Custom registration hook to manage user roles and prevent multiple superusers
 */

async function handleUserRegistration(strapi) {
	// Hook into user creation to assign appropriate roles
	strapi.db.lifecycles.subscribe({
		models: ['admin::user'],

		async beforeCreate(event) {
			const { data } = event.params;

			try {
				const { checkSuperUserExists } = require('../bootstrap/roles.js');
				const roleService = strapi.service('admin::role');

				// Check if this is the first user (should be Super Admin)
				const hasSuperUser = await checkSuperUserExists(strapi);

				if (!hasSuperUser) {
					console.log('🔐 Creating first user as Super Admin');

					// Get Super Admin role
					const roles = await roleService.findMany();
					const superAdminRole = roles.find(role => role.code === 'strapi-super-admin');

					if (superAdminRole) {
						data.roles = [superAdminRole.id];
						console.log('✅ First user will have Super Admin role');
					}
				} else {
					console.log('👤 Creating user with Author role');

					// Get Author role for subsequent users
					const roles = await roleService.findMany();
					const authorRole = roles.find(role => role.name === 'Author');

					if (authorRole) {
						data.roles = [authorRole.id];
						console.log('✅ User will have Author role');
					} else {
						console.warn('⚠️ Author role not found, checking available roles...');
						console.log('Available roles:', roles.map(r => r.name));

						// Fallback to any available non-super-admin role
						const fallbackRole = roles.find(role =>
							role.code !== 'strapi-super-admin' &&
							role.name !== 'Super Admin'
						);

						if (fallbackRole) {
							data.roles = [fallbackRole.id];
							console.log(`✅ User assigned fallback role: ${fallbackRole.name}`);
						} else {
							console.error('❌ No suitable role found for user');
						}
					}
				}
			} catch (error) {
				console.error('❌ Error in registration hook:', error);
			}
		},

		async afterCreate(event) {
			const { result } = event;
			console.log(`🎉 User created successfully: ${result.email} with roles:`, result.roles?.map(r => r.name || r.id));
		}
	});
}

module.exports = {
	handleUserRegistration,
};
