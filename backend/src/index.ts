import type { Core } from '@strapi/strapi'
import { seedDatabase } from '../data/seeds/blog-data'

/**
 * Bootstrap script for users-permissions
 * Creates the Author role if it doesn't exist
 */
async function bootstrapUsersPermissions(strapi: Core.Strapi) {
  try {
    // Wait for database connection
    await strapi.db.connection.raw('SELECT 1')

    // Check if Author role exists
    let authorRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { type: 'author' },
    })

    if (!authorRole) {
      console.log('📝 Creating Author role for users-permissions...')

      // Create the Author role
      authorRole = await strapi.query('plugin::users-permissions.role').create({
        data: {
          name: 'Author',
          type: 'author',
          description: 'Default role for blog authors',
        },
      })

      console.log('✅ Author role created successfully')
    } else {
      console.log('📝 Author role already exists')
    }

    // Set up basic permissions for Author role
    if (authorRole) {
      await setupAuthorPermissions(strapi, authorRole.id)
    }
  } catch (error) {
    console.error('❌ Error in users-permissions bootstrap:', error)
  }
}

/**
 * Set up basic permissions for the Author role
 */
async function setupAuthorPermissions(strapi: Core.Strapi, roleId: number) {
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
    ]

    for (const permission of authorPermissions) {
      // Check if permission already exists
      const existingPermission = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({
          where: {
            action: permission.action,
            role: roleId,
          },
        })

      if (!existingPermission) {
        // Create the permission
        await strapi.query('plugin::users-permissions.permission').create({
          data: {
            action: permission.action,
            enabled: permission.enabled,
            policy: '',
            role: roleId,
          },
        })
      }
    }

    console.log('✅ Author role permissions configured')
  } catch (error) {
    console.error('❌ Error setting up author permissions:', error)
  }
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }: { strapi: Core.Strapi }*/) {
    // Register function - currently no custom registration needed
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Bootstrap users-permissions Author role
    await bootstrapUsersPermissions(strapi)

    // Check if we should seed the database
    const shouldSeed = process.env.SEED_DATABASE === 'true'

    if (shouldSeed) {
      try {
        // Check if data already exists
        const existingPosts = await strapi.entityService.count('api::blog-post.blog-post')

        if (existingPosts === 0) {
          console.log('🚀 No existing data found. Starting database seeding...')
          await seedDatabase(strapi)
        } else {
          console.log('📊 Database already contains data. Skipping seeding.')
        }
      } catch (error) {
        console.error('❌ Error during bootstrap seeding:', error)
      }
    }

    // Set up GraphQL Schema customizations (if needed)
    if (strapi.plugin('graphql')) {
      const extensionService = strapi.plugin('graphql').service('extension')
      extensionService.use(({ strapi }: { strapi: Core.Strapi }) => ({
        typeDefs: `
          type Query {
            blogSettings: BlogSettingEntityResponse!
          }
        `,
        resolvers: {
          Query: {
            blogSettings: {
              resolve: async () => {
                // blog-setting is a single type, so we don't need to access by ID
                const data = await strapi.entityService.findMany('api::blog-setting.blog-setting', {
                  populate: {
                    site_favicon: true,
                    site_logo: true,
                  },
                })

                return {
                  data: Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data,
                }
              },
            },
          },
        },
      }))
    }

    // Register permissions for custom controllers if needed
    await strapi.admin.services.permission.actionProvider.registerMany([
      {
        section: 'settings',
        displayName: 'Access the Documentation Plugin',
        uid: 'documentation',
        pluginName: 'documentation',
        category: 'custom',
      },
    ])

    console.log('🎉 Blog application bootstrap completed!')
  },
}
