/**
 * author controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::author.author', ({ strapi }) => ({
  async findBySlug(ctx) {
    const { slug } = ctx.params

    const entity = await strapi.entityService.findMany('api::author.author', {
      filters: { slug },
      populate: {
        avatar: true,
        cover_image: true,
        social_links: true,
        blog_posts: {
          populate: {
            categories: true,
            tags: true,
            featured_image: true,
          },
          filters: {
            publishedAt: { $notNull: true },
          },
          sort: { publishedAt: 'desc' },
        },
        expertise_areas: true,
      },
    })

    if (!entity || entity.length === 0) {
      return ctx.notFound()
    }

    return { data: entity[0] }
  },

  async findFeatured(ctx) {
    const entity = await strapi.entityService.findMany('api::author.author', {
      filters: {
        featured: true,
        publishedAt: { $notNull: true },
      },
      populate: {
        avatar: true,
        social_links: true,
        blog_posts: {
          populate: ['featured_image'],
          filters: {
            publishedAt: { $notNull: true },
          },
          sort: { publishedAt: 'desc' },
          limit: 3,
        },
      },
      sort: { follower_count: 'desc' },
      ...ctx.query,
    })

    return { data: entity }
  },
}))
