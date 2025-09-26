/**
 * Bootstrap script for users-permissions
 * Creates the Author role if it doesn't exist
 */

module.exports = async ({ strapi }) => {
	// Wait for database connection
	await strapi.db.connection.raw('SELECT 1');

	try {
		// Check if Author role exists
		let authorRole = await strapi.query('plugin::users-permissions.role').findOne({
			where: { type: 'author' },
		});

		if (!authorRole) {
			console.log('📝 Creating Author role for users-permissions...');

			// Create the Author role
			authorRole = await strapi.query('plugin::users-permissions.role').create({
				data: {
					name: 'Author',
					type: 'author',
					description: 'Default role for blog authors',
				},
			});

			console.log('✅ Author role created successfully');
		} else {
			console.log('📝 Author role already exists');
		}

		// Set up basic permissions for Author role
		if (authorRole) {
			await setupAuthorPermissions(strapi, authorRole.id);
		}

	} catch (error) {
		console.error('❌ Error in users-permissions bootstrap:', error);
	}
};

/**
 * Set up basic permissions for the Author role
 */
async function setupAuthorPermissions(strapi, roleId) {
	try {
		// Define basic permissions for authors
		const authorPermissions = [
			// Blog Post permissions
			{ action: 'api::blog-post.blog-post.find', enabled: true },
			{ action: 'api::blog-post.blog-post.findOne', enabled: true },
			{ action: 'api::blog-post.blog-post.create', enabled: true },
			{ action: 'api::blog-post.blog-post.update', enabled: true },

			// Category permissions
			{ action: 'api::category.category.find', enabled: true },
			{ action: 'api::category.category.findOne', enabled: true },

			// Tag permissions
			{ action: 'api::tag.tag.find', enabled: true },
			{ action: 'api::tag.tag.findOne', enabled: true },

			// Author permissions
			{ action: 'api::author.author.find', enabled: true },
			{ action: 'api::author.author.findOne', enabled: true },
			{ action: 'api::author.author.update', enabled: true },

			// Comment permissions
			{ action: 'api::comment.comment.find', enabled: true },
			{ action: 'api::comment.comment.findOne', enabled: true },
			{ action: 'api::comment.comment.create', enabled: true },
			{ action: 'api::comment.comment.update', enabled: true },
			{ action: 'api::comment.comment.delete', enabled: true },
		];

		for (const permission of authorPermissions) {
			// Check if permission already exists
			const existingPermission = await strapi.query('plugin::users-permissions.permission').findOne({
				where: {
					action: permission.action,
					role: roleId,
				},
			});

			if (!existingPermission) {
				// Create the permission
				await strapi.query('plugin::users-permissions.permission').create({
					data: {
						action: permission.action,
						enabled: permission.enabled,
						policy: '',
						role: roleId,
					},
				});
			}
		}

		console.log('✅ Author role permissions configured');
	} catch (error) {
		console.error('❌ Error setting up author permissions:', error);
	}
}
