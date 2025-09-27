/**
 * blog-post controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  // Override the default find method to include populate
  async find(ctx) {
    const { query } = ctx.request
    const entity = await strapi.entityService.findMany('api::blog-post.blog-post', {
      ...query,
      populate: {
        seo: true,
        featured_image: true,
        author: {
          populate: {
            avatar: true,
          },
        },
        categories: true,
        tags: true,
      },
    })
    return { data: entity }
  },

  // Override the default findOne method to include populate
  async findOne(ctx) {
    const { id } = ctx.params

    // Get the blog post
    const entity = await strapi.entityService.findOne('api::blog-post.blog-post', id as string, {
      populate: {
        seo: true,
        featured_image: true,
        author: {
          populate: {
            avatar: true,
          },
        },
        categories: true,
        tags: true,
      },
    })

    if (!entity) {
      return ctx.notFound()
    }

    return { data: entity }
  },

  async findBySlug(ctx) {
    const { slug } = ctx.params

    const entity = await strapi.entityService.findMany('api::blog-post.blog-post', {
      filters: { slug: slug as string },
      populate: {
        author: {
          populate: ['avatar', 'social_links'],
        },
        categories: true,
        tags: true,
        featured_image: true,
        gallery: true,
        related_posts: {
          populate: ['author', 'featured_image', 'categories'],
        },
        social_sharing: true,
        seo: {
          populate: ['og_image', 'twitter_image'],
        },
      },
    })

    if (!entity || entity.length === 0) {
      return ctx.notFound()
    }

    const post = entity[0]

    return { data: post }
  },

  async findFeatured(ctx) {
    const entity = await strapi.entityService.findMany('api::blog-post.blog-post', {
      filters: {
        featured: true,
        publishedAt: { $notNull: true },
      },
      populate: {
        author: {
          populate: ['avatar'],
        },
        categories: true,
        tags: true,
        featured_image: true,
      },
      sort: { publishedAt: 'desc' },
      ...ctx.query,
    })

    return { data: entity }
  },

  async findByCategory(ctx) {
    const { categorySlug } = ctx.params

    const category = await strapi.entityService.findMany('api::category.category', {
      filters: { slug: categorySlug as string },
      populate: {
        blog_posts: {
          populate: {
            author: {
              populate: ['avatar'],
            },
            categories: true,
            tags: true,
            featured_image: true,
          },
        },
      },
    })

    if (!category || category.length === 0) {
      return ctx.notFound()
    }

    // Access the blog_posts property from the populated category
    const categoryData = category[0] as Record<string, unknown>
    return { data: categoryData.blog_posts ?? [] }
  },

  async findByTag(ctx) {
    const { tagSlug } = ctx.params

    const tag = await strapi.entityService.findMany('api::tag.tag', {
      filters: { slug: tagSlug as string },
      populate: {
        blog_posts: {
          populate: {
            author: {
              populate: ['avatar'],
            },
            categories: true,
            tags: true,
            featured_image: true,
          },
        },
      },
    })

    if (!tag || tag.length === 0) {
      return ctx.notFound()
    }

    // Access the blog_posts property from the populated tag
    const tagData = tag[0] as Record<string, unknown>
    return { data: tagData.blog_posts ?? [] }
  },

  async search(ctx) {
    const { q } = ctx.query as { q?: string }

    if (!q || typeof q !== 'string') {
      return ctx.badRequest('Search query is required')
    }

    const entity = await strapi.entityService.findMany('api::blog-post.blog-post', {
      filters: {
        $or: [
          { title: { $containsi: q } },
          { content: { $containsi: q } },
          { excerpt: { $containsi: q } },
        ],
        publishedAt: { $notNull: true },
      },
      populate: {
        author: {
          populate: ['avatar'],
        },
        categories: true,
        tags: true,
        featured_image: true,
      },
      sort: { publishedAt: 'desc' },
      ...ctx.query,
    })

    return { data: entity }
  },

  // Public update endpoint for simple updates from the frontend (PUT /api/blog-posts/:id)
  async update(ctx) {
    const { id } = ctx.params
    const payload = ctx.request.body?.data ?? ctx.request.body

    if (!payload || typeof payload !== 'object') {
      return ctx.badRequest('Invalid payload')
    }

    // Only allow whitelisted metric fields to be updated via this public endpoint
    const allowedFields: Record<string, boolean> = {
      view_count: true,
      like_count: true,
    }

    const sanitized: Record<string, unknown> = {}
    Object.keys(payload).forEach((k) => {
      if (allowedFields[k]) sanitized[k] = payload[k]
    })

    if (Object.keys(sanitized).length === 0) {
      return ctx.badRequest('No updatable fields provided')
    }

    const exists = await strapi.entityService.findOne('api::blog-post.blog-post', id as string, { fields: ['id'] })
    if (!exists) return ctx.notFound()

    // Perform the sanitized update on the entity
    const updated = await strapi.entityService.update('api::blog-post.blog-post', id as string, { data: sanitized })

    // If update failed, return notFound (defensive)
    if (!updated) return ctx.notFound()

    const full = await strapi.entityService.findOne('api::blog-post.blog-post', id as string, {
      populate: {
        seo: true,
        featured_image: true,
        author: { populate: { avatar: true } },
        categories: true,
        tags: true,
      },
    })

    return { data: full }
  },
}))
