/**
 * blog-post service
 */

import { factories } from '@strapi/strapi'

interface CategoryEntity {
  id: string | number
}

interface TagEntity {
  id: string | number
}

interface PostEntity {
  id: string | number
  slug: string
  updatedAt: string
  categories?: CategoryEntity[]
  tags?: TagEntity[]
}

export default factories.createCoreService('api::blog-post.blog-post', ({ strapi }) => ({
  // Custom service methods for blog posts

  async calculateReadingTime(content: string): Promise<number> {
    // Calculate reading time based on average reading speed (200 words per minute)
    const wordsPerMinute = 200
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  },

  async updatePostCounts(): Promise<void> {
    // Update post counts for categories and tags
    const categories = await strapi.entityService.findMany('api::category.category')
    const tags = await strapi.entityService.findMany('api::tag.tag')

    for (const category of categories as CategoryEntity[]) {
      const count = await strapi.entityService.count('api::blog-post.blog-post', {
        filters: {
          categories: { id: category.id },
          publishedAt: { $notNull: true },
        },
      })

      await strapi.entityService.update('api::category.category', category.id, {
        data: { post_count: count },
      })
    }

    for (const tag of tags as TagEntity[]) {
      const count = await strapi.entityService.count('api::blog-post.blog-post', {
        filters: {
          tags: { id: tag.id },
          publishedAt: { $notNull: true },
        },
      })

      await strapi.entityService.update('api::tag.tag', tag.id, {
        data: { post_count: count },
      })
    }
  },

  async findRelated(postId: string | number, limit = 5): Promise<unknown[]> {
    const post = await strapi.entityService.findOne('api::blog-post.blog-post', postId, {
      populate: ['categories', 'tags'],
    })

    if (!post) return []

    // Cast post to access populated relations
    const populatedPost = post as PostEntity
    const categoryIds = (populatedPost.categories ?? []).map((cat: CategoryEntity) => cat.id)
    const tagIds = (populatedPost.tags ?? []).map((tag: TagEntity) => tag.id)

    const relatedPosts = await strapi.entityService.findMany('api::blog-post.blog-post', {
      filters: {
        id: { $ne: postId },
        publishedAt: { $notNull: true },
        $or: [{ categories: { id: { $in: categoryIds } } }, { tags: { id: { $in: tagIds } } }],
      },
      populate: {
        author: { populate: ['avatar'] },
        categories: true,
        tags: true,
        featured_image: true,
      },
      sort: { publishedAt: 'desc' },
      limit,
    })

    return relatedPosts as unknown[]
  },

  async generateSitemap(): Promise<unknown[]> {
    const posts = await strapi.entityService.findMany('api::blog-post.blog-post', {
      filters: { publishedAt: { $notNull: true } },
      fields: ['slug', 'updatedAt'],
      sort: { updatedAt: 'desc' },
    })

    return (posts as PostEntity[]).map(post => ({
      url: `/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  },

  async generateRssFeed(): Promise<unknown[]> {
    const posts = await strapi.entityService.findMany('api::blog-post.blog-post', {
      filters: { publishedAt: { $notNull: true } },
      populate: {
        author: { populate: ['avatar'] },
        categories: true,
        featured_image: true,
      },
      sort: { publishedAt: 'desc' },
      limit: 20,
    })

    return posts as unknown[]
  },
}))
