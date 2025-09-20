import type { Core } from '@strapi/strapi'
import { seedDatabase } from '../data/seeds/blog-data'

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
