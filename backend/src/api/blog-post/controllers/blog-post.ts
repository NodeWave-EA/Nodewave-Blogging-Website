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

    // Increment view count
    await strapi.entityService.update('api::blog-post.blog-post', id as string, {
      data: {
        view_count: ((entity.view_count as number) ?? 0) + 1,
      },
    })

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

    // Increment view count
    await strapi.entityService.update('api::blog-post.blog-post', post.id, {
      data: {
        view_count: ((post.view_count as number) ?? 0) + 1,
      },
    })

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
}))
