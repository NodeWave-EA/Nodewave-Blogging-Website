/**
 * Search controller
 */

import { factories } from '@strapi/strapi'

interface SearchResult {
  type: 'post' | 'author' | 'category' | 'tag'
  id: number
  title: string
  slug: string
  excerpt?: string
  url: string
  relevanceScore?: number
}

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  async globalSearch(ctx) {
    const { q, limit = 20 } = ctx.query as { q?: string; limit?: number }

    if (!q || typeof q !== 'string') {
      return ctx.badRequest('Search query is required')
    }

    const startTime = Date.now()

    try {
      // Use the blog-utils extension globalSearch function
      let searchData

      // Check if we can access blog-utils through strapi services or extensions
      try {
        // Use our own fallback search implementation
        searchData = await performGlobalSearch(q, limit, strapi)
      } catch (error) {
        strapi.log.error('Global search fallback error:', error)
        throw error
      }

      // Transform results to SearchResult format
      const results: SearchResult[] = []

      // Add posts
      if (searchData.posts && Array.isArray(searchData.posts)) {
        searchData.posts.forEach((post: any) => {
          results.push({
            type: 'post',
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            url: `/blog/${post.slug}`,
            relevanceScore: calculateRelevance(q, post.title, post.excerpt, post.content),
          })
        })
      }

      // Add authors
      if (searchData.authors && Array.isArray(searchData.authors)) {
        searchData.authors.forEach((author: any) => {
          results.push({
            type: 'author',
            id: author.id,
            title: author.name,
            slug: author.slug,
            excerpt: author.bio ? stripHtml(author.bio) : author.job_title,
            url: `/authors/${author.slug}`,
            relevanceScore: calculateRelevance(q, author.name, author.bio, author.job_title),
          })
        })
      }

      // Add categories
      if (searchData.categories && Array.isArray(searchData.categories)) {
        searchData.categories.forEach((category: any) => {
          results.push({
            type: 'category',
            id: category.id,
            title: category.name,
            slug: category.slug,
            excerpt: category.description,
            url: `/blog?category=${category.slug}`,
            relevanceScore: calculateRelevance(q, category.name, category.description),
          })
        })
      }

      // Add tags
      if (searchData.tags && Array.isArray(searchData.tags)) {
        searchData.tags.forEach((tag: any) => {
          results.push({
            type: 'tag',
            id: tag.id,
            title: tag.name,
            slug: tag.slug,
            excerpt: tag.description,
            url: `/blog?tag=${tag.slug}`,
            relevanceScore: calculateRelevance(q, tag.name, tag.description),
          })
        })
      }

      // Pages removed — skip page results

      // Sort by relevance score
      results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))

      const endTime = Date.now()

      return {
        query: q,
        results: results.slice(0, limit),
        total: searchData.total || results.length,
        took: endTime - startTime,
      }
    } catch (error) {
      strapi.log.error('Search error:', error)
      return ctx.internalServerError('Search failed')
    }
  },

  async quickSearch(ctx) {
    const {
      q,
      type,
      limit = 5,
    } = ctx.query as {
      q?: string
      type?: 'post' | 'author' | 'category' | 'tag'
      limit?: number
    }

    if (!q || typeof q !== 'string') {
      return ctx.badRequest('Search query is required')
    }

    let results: any[] = []

    try {
      switch (type) {
        case 'post':
          results = await strapi.entityService.findMany('api::blog-post.blog-post', {
            filters: {
              $or: [{ title: { $containsi: q } }, { excerpt: { $containsi: q } }],
              publishedAt: { $notNull: true },
            },
            populate: {
              author: { populate: ['avatar'] },
              featured_image: true,
              categories: true,
            },
            limit,
            sort: { publishedAt: 'desc' },
          })
          break

        case 'author':
          results = await strapi.entityService.findMany('api::author.author', {
            filters: {
              $or: [{ name: { $containsi: q } }, { job_title: { $containsi: q } }],
              publishedAt: { $notNull: true },
            },
            populate: ['avatar'],
            limit,
          })
          break

        case 'category':
          results = await strapi.entityService.findMany('api::category.category', {
            filters: {
              name: { $containsi: q },
              publishedAt: { $notNull: true },
            },
            limit,
          })
          break

        case 'tag':
          results = await strapi.entityService.findMany('api::tag.tag', {
            filters: {
              name: { $containsi: q },
              publishedAt: { $notNull: true },
            },
            limit,
          })
          break

        default:
          // Search all types with limited results
          const [posts, authors] = await Promise.all([
            strapi.entityService.findMany('api::blog-post.blog-post', {
              filters: {
                title: { $containsi: q },
                publishedAt: { $notNull: true },
              },
              populate: {
                author: { populate: ['avatar'] },
                featured_image: true,
              },
              limit: Math.floor(limit * 0.8),
            }),
            strapi.entityService.findMany('api::author.author', {
              filters: {
                name: { $containsi: q },
                publishedAt: { $notNull: true },
              },
              populate: ['avatar'],
              limit: Math.floor(limit * 0.2),
            }),
          ])

          results = [...posts, ...authors]
          break
      }

      return { data: results }
    } catch (error) {
      strapi.log.error('Quick search error:', error)
      return ctx.internalServerError('Quick search failed')
    }
  },

  async searchSuggestions(ctx) {
    const { q, limit = 10 } = ctx.query as { q?: string; limit?: number }

    if (!q || typeof q !== 'string' || q.length < 2) {
      return { suggestions: [] }
    }

    try {
      const [posts, categories, tags] = await Promise.all([
        strapi.entityService.findMany('api::blog-post.blog-post', {
          filters: {
            title: { $containsi: q },
            publishedAt: { $notNull: true },
          },
          fields: ['title'],
          limit: Math.floor(limit * 0.6),
        }),
        strapi.entityService.findMany('api::category.category', {
          filters: {
            name: { $containsi: q },
            publishedAt: { $notNull: true },
          },
          fields: ['name'],
          limit: Math.floor(limit * 0.2),
        }),
        strapi.entityService.findMany('api::tag.tag', {
          filters: {
            name: { $containsi: q },
            publishedAt: { $notNull: true },
          },
          fields: ['name'],
          limit: Math.floor(limit * 0.2),
        }),
      ])

      const suggestions = [
        ...posts.map((post: any) => ({ text: post.title, type: 'post' })),
        ...categories.map((category: any) => ({ text: category.name, type: 'category' })),
        ...tags.map((tag: any) => ({ text: tag.name, type: 'tag' })),
      ]

      return { suggestions: suggestions.slice(0, limit) }
    } catch (error) {
      strapi.log.error('Search suggestions error:', error)
      return { suggestions: [] }
    }
  },
}))

// Helper functions
async function performGlobalSearch(query: string, limit: number, strapi: any) {
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
}

function calculateRelevance(query: string, ...texts: (string | undefined)[]): number {
  const normalizedQuery = query.toLowerCase()
  let score = 0

  texts.forEach((text, index) => {
    if (!text) return

    const normalizedText = stripHtml(text).toLowerCase()

    // Exact match in title gets highest score
    if (index === 0 && normalizedText.includes(normalizedQuery)) {
      score += 100
    }

    // Word matches
    const queryWords = normalizedQuery.split(' ')
    queryWords.forEach(word => {
      if (word.length > 2 && normalizedText.includes(word)) {
        score += index === 0 ? 10 : 5 // Title matches score higher
      }
    })

    // Position bonus (earlier matches score higher)
    const position = normalizedText.indexOf(normalizedQuery)
    if (position !== -1) {
      score += Math.max(0, 20 - position / 10)
    }
  })

  return score
}

function stripHtml(html: string): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}
