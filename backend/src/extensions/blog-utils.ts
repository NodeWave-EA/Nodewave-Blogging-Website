/**
 * Global blog utilities and extensions
 */

import type { Core } from '@strapi/strapi'

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Generate SEO-friendly slug from title
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  },

  /**
   * Extract plain text from rich text content
   */
  extractPlainText(richText: string): string {
    return richText
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, ' ')
      .trim()
  },

  /**
   * Calculate reading time based on word count
   */
  calculateReadingTime(content: string, wordsPerMinute = 200): number {
    const plainText = this.extractPlainText(content)
    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length
    return Math.ceil(wordCount / wordsPerMinute)
  },

  /**
   * Generate excerpt from content
   */
  generateExcerpt(content: string, maxLength = 160): string {
    const plainText = this.extractPlainText(content)
    if (plainText.length <= maxLength) {
      return plainText
    }
    return plainText.substring(0, maxLength).trim() + '...'
  },

  /**
   * Get popular tags based on post count
   */
  async getPopularTags(limit = 10) {
    return await strapi.entityService.findMany('api::tag.tag', {
      sort: { post_count: 'desc' },
      limit,
    })
  },

  /**
   * Get popular categories based on post count
   */
  async getPopularCategories(limit = 10) {
    return await strapi.entityService.findMany('api::category.category', {
      sort: { post_count: 'desc' },
      limit,
      populate: ['featured_image'],
    })
  },

  /**
   * Get recent posts
   */
  async getRecentPosts(limit = 5) {
    return await strapi.entityService.findMany('api::blog-post.blog-post', {
      filters: { publishedAt: { $notNull: true } },
      sort: { publishedAt: 'desc' },
      limit,
      populate: {
        author: { populate: ['avatar'] },
        featured_image: true,
        categories: true,
      },
    })
  },

  /**
   * Get blog statistics
   */
  async getBlogStats() {
    const totalPosts = await strapi.entityService.count('api::blog-post.blog-post', {
      filters: { publishedAt: { $notNull: true } },
    })

    const totalAuthors = await strapi.entityService.count('api::author.author', {
      filters: { publishedAt: { $notNull: true } },
    })

    const totalCategories = await strapi.entityService.count('api::category.category', {
      filters: { publishedAt: { $notNull: true } },
    })

    const totalTags = await strapi.entityService.count('api::tag.tag', {
      filters: { publishedAt: { $notNull: true } },
    })

    const totalComments = await strapi.entityService.count('api::comment.comment', {
      filters: {
        publishedAt: { $notNull: true },
        approved: true,
      },
    })

    const totalSubscribers = await strapi.entityService.count('api::newsletter.newsletter', {
      filters: { subscribed: true },
    })

    return {
      totalPosts,
      totalAuthors,
      totalCategories,
      totalTags,
      totalComments,
      totalSubscribers,
    }
  },

  /**
   * Search content across multiple content types
   */
  async globalSearch(query: string, limit = 20) {
    const [posts, authors, categories, tags] = await Promise.all([
      strapi.entityService.findMany('api::blog-post.blog-post', {
        filters: {
          $or: [
            { title: { $containsi: query } },
            { content: { $containsi: query } },
            { excerpt: { $containsi: query } },
          ],
          publishedAt: { $notNull: true },
        },
        populate: {
          author: { populate: ['avatar'] },
          featured_image: true,
          categories: true,
        },
        limit: Math.floor(limit * 0.6),
      }),

      strapi.entityService.findMany('api::author.author', {
        filters: {
          $or: [
            { name: { $containsi: query } },
            { bio: { $containsi: query } },
            { job_title: { $containsi: query } },
          ],
          publishedAt: { $notNull: true },
        },
        populate: ['avatar'],
        limit: Math.floor(limit * 0.2),
      }),

      strapi.entityService.findMany('api::category.category', {
        filters: {
          $or: [{ name: { $containsi: query } }, { description: { $containsi: query } }],
          publishedAt: { $notNull: true },
        },
        populate: ['featured_image'],
        limit: Math.floor(limit * 0.1),
      }),

      strapi.entityService.findMany('api::tag.tag', {
        filters: {
          $or: [{ name: { $containsi: query } }, { description: { $containsi: query } }],
          publishedAt: { $notNull: true },
        },
        limit: Math.floor(limit * 0.05),
      }),
    ])

    return {
      posts,
      authors,
      categories,
      tags,
      total: posts.length + authors.length + categories.length + tags.length,
    }
  },
})
