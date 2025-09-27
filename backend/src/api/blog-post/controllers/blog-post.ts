/**
 * blog-post controller
 */

import { factories } from '@strapi/strapi'

// Simple in-memory rate limit caches (module-scoped)
const viewRateLimit = new Map<string, number>() // key: `${ip}:${id}` -> timestamp
const likeRateLimit = new Map<string, number>()

// Helper: build absolute URL for media or paths (module-scoped helper)
const buildAbsoluteUrl = (maybeUrl: unknown, siteUrl: string, ctx: any) => {
  if (!maybeUrl) return null
  const url = String(maybeUrl)
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = siteUrl || (ctx?.request?.origin ?? '')
  if (!base) return url
  return base.replace(/\/$/, '') + '/' + url.replace(/^\//, '')
}

// Helper: extract media url from Strapi file object or string
const resolveMediaUrl = (media: any, siteUrl: string, ctx: any) => {
  if (!media) return null
  if (typeof media === 'string') return buildAbsoluteUrl(media, siteUrl, ctx)
  const url = media.url ?? media?.data?.attributes?.url ?? media?.data?.url ?? media?.attributes?.url
  return buildAbsoluteUrl(url, siteUrl, ctx)
}

// Default shapes for SEO and Social Sharing components so API always returns them
const seoDefaults = {
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  canonical_url: null,
  og_title: '',
  og_description: '',
  og_image: null,
  og_type: 'article',
  twitter_card: 'summary_large_image',
  twitter_title: '',
  twitter_description: '',
  twitter_image: null,
  robots: 'index,follow',
  structured_data: null,
}

const socialDefaults = {
  enable_sharing: true,
  platforms: ['twitter', 'facebook', 'linkedin', 'pinterest', 'whatsapp', 'telegram', 'reddit'],
  custom_message: null,
  hashtags: null,
  via_username: null,
}

// Build JSON-LD structured data for a blog post entity
const buildStructuredData = async (post: any, ctx: any) => {
  try {
    if (!post) return null

    // Derive a stable absolute base URL for generating absolute links in structured data.
    // Prefer an explicit public URL env var, otherwise use request origin, finally fallback to localhost.
    const envBase = (process.env.STRAPI_PUBLIC_URL as string) || (process.env.VITE_STRAPI_BASE_URL as string) || ''
    const reqOrigin = ctx?.request?.origin ?? ''
    const baseUrl = envBase || reqOrigin || 'http://localhost:1337'

    // Normalize canonical values. Use the Strapi base (baseUrl) for media links, but prefer a FRONTEND site URL
    // for the page identity (mainEntityOfPage.@id). The frontend site URL can be provided via
    // process.env.VITE_SITE_URL or process.env.FRONTEND_SITE_URL. Fallbacks: request origin or empty.
    const candidateCanonical = (post?.seo?.canonical_url as string) || (post?.canonical_url as string) || ''

    // Frontend base (for canonical page URL in structured data)
    const frontendEnv = (process.env.VITE_SITE_URL as string) || (process.env.FRONTEND_SITE_URL as string) || ''
    const frontendOrigin = (ctx?.request?.headers?.origin as string) || (ctx?.request?.origin ?? '')
    const frontendBase = frontendEnv || frontendOrigin || ''

    // canonical URL for media/strapi vs canonical URL for the public page

    const canonicalForFrontend = candidateCanonical
      ? candidateCanonical.startsWith('http://') || candidateCanonical.startsWith('https://')
        ? candidateCanonical
        : frontendBase
          ? `${frontendBase.replace(/\/$/, '')}/${candidateCanonical.replace(/^\//, '')}`
          : `${baseUrl.replace(/\/$/, '')}/${candidateCanonical.replace(/^\//, '')}`
      : frontendBase
        ? `${frontendBase.replace(/\/$/, '')}/blog/${String(post.slug ?? post.id).replace(/^\//, '')}`
        : `${baseUrl.replace(/\/$/, '')}/blog/${String(post.slug ?? post.id).replace(/^\//, '')}`

    // Resolve featured/og images to absolute URLs using baseUrl
    const featuredImageUrl = resolveMediaUrl(post.seo?.og_image || post.featured_image, baseUrl, ctx)

    const author = post.author || null
    const authorName = author?.name ?? 'Unknown'
    const authorWebsite = author?.website ?? null

    // Keywords: prefer SEO keywords, else tags names
    const keywords = post?.seo?.meta_keywords || (post.tags || []).map((t: any) => t.name).filter(Boolean).join(',')

    // Article section: categories names
    const articleSection = (post.categories || []).map((c: any) => c.name).filter(Boolean).join(',')

    // Word count: crude HTML-stripping word count from content/excerpt
    const contentStr = String(post.content || post.excerpt || '')
    const plain = contentStr.replace(/<[^>]+>/g, ' ')
    const words = plain.split(/\s+/).filter(Boolean)
    const wordCount = words.length

    // Reading time fallback: use post.reading_time or derive from word count (200 wpm)
    const readingTime = post.reading_time ?? Math.max(1, Math.round(wordCount / 200))

    // publisher.logo
    const publisherLogo = resolveMediaUrl(post.author?.avatar || post.featured_image, baseUrl, ctx) ?? (featuredImageUrl ? { '@type': 'ImageObject', url: featuredImageUrl } : undefined)

    const sd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title ?? undefined,
      alternativeHeadline: post.excerpt ?? undefined,
      description: post?.seo?.meta_description ?? post.excerpt ?? undefined,
      image: featuredImageUrl ? [featuredImageUrl] : undefined,
      author: author
        ? [
          {
            '@type': 'Person',
            name: authorName,
            url: authorWebsite ?? undefined,
          },
        ]
        : undefined,
      publisher: {
        '@type': 'Organization',
        // Prefer explicit publisher information in the post's social_sharing component if provided
        name: (post.social_sharing && (post.social_sharing.publisher_name || post.social_sharing.publisher)) || (post.author?.company as any) || authorName,
        logo: publisherLogo,
      },
      datePublished: post.publishedAt ?? post.createdAt ?? undefined,
      dateModified: post.updatedAt ?? undefined,
      mainEntityOfPage: {
        '@type': 'WebPage',
        // Use the frontend canonical URL when available so structured data points to the public page
        '@id': canonicalForFrontend,
      },
      keywords: (post.seo?.meta_keywords || post.meta_keywords || keywords) || undefined,
      articleSection: articleSection || undefined,
      inLanguage: post?.locale ?? 'en',
      isFamilyFriendly: true,
      wordCount: wordCount,
      timeRequired: 'PT' + String(readingTime) + 'M',
    }

    // Clean undefined values from the object so JSON-LD stays compact
    const cleaned: Record<string, unknown> = {}
    Object.keys(sd).forEach((k) => {
      const v = (sd as any)[k]
      if (v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)) cleaned[k] = v
    })

    return cleaned
  } catch (err) {
    // Fail silently; structured data is optional
    strapi.log.error('structuredData generation failed', err)
    return null
  }
}

// Ensure SEO and social_sharing components exist on a post (mutates and returns the post)
const ensureSeoSocial = (post: any) => {
  if (!post) return post
  post.seo = { ...(seoDefaults as any), ...(post.seo || {}) }
  post.social_sharing = { ...(socialDefaults as any), ...(post.social_sharing || {}) }
  return post
}

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  // Override the default find method to include populate
  async find(ctx) {
    const { query } = ctx.request
    const entity = await strapi.entityService.findMany('api::blog-post.blog-post', {
      ...query,
      populate: {
        seo: { populate: ['og_image', 'twitter_image'] },
        social_sharing: true,
        featured_image: true,
        author: {
          populate: ['avatar', 'social_links'],
        },
        categories: true,
        tags: true,
      },
    })

    // Ensure defaults for each returned post
    const normalized = Array.isArray(entity) ? entity.map((p) => ensureSeoSocial(p as any)) : entity

    // Generate structured_data for each post in the list (non-persistent, response only)
    if (Array.isArray(normalized)) {
      await Promise.all(
        normalized.map(async (p: any) => {
          try {
            p.seo.structured_data = await buildStructuredData(p, ctx)
          } catch (e) {
            // ignore per-post structured data errors
          }
        }),
      )
    }

    return { data: normalized }
  },

  // Override the default findOne method to include populate
  async findOne(ctx) {
    const { id } = ctx.params

    // Get the blog post
    const entity = await strapi.entityService.findOne('api::blog-post.blog-post', id as string, {
      populate: {
        seo: { populate: ['og_image', 'twitter_image'] },
        social_sharing: true,
        featured_image: true,
        author: {
          populate: ['avatar', 'social_links'],
        },
        categories: true,
        tags: true,
        gallery: true,
        related_posts: { populate: ['author', 'featured_image', 'categories'] },
      },
    })

    if (!entity) {
      return ctx.notFound()
    }

    // Normalize and return the entity with defaulted SEO and social_sharing
    const normalizedEntity = ensureSeoSocial(entity as any)
    const structuredData = await buildStructuredData(normalizedEntity, ctx)
      // Attach generated structured data into the seo object for API consumers
      ; (normalizedEntity as any).seo = { ...(normalizedEntity as any).seo, structured_data: structuredData }
    return { data: normalizedEntity }
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
    const normalizedPost = ensureSeoSocial(post as any)
    const structuredData = await buildStructuredData(normalizedPost, ctx)
      ; (normalizedPost as any).seo = { ...(normalizedPost as any).seo, structured_data: structuredData }
    return { data: normalizedPost }
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

    const normalized = Array.isArray(entity) ? entity.map((p) => ensureSeoSocial(p as any)) : entity
    if (Array.isArray(normalized)) {
      await Promise.all(
        normalized.map(async (p: any) => {
          try {
            p.seo.structured_data = await buildStructuredData(p, ctx)
          } catch (e) {
            // ignore
          }
        }),
      )
    }

    return { data: normalized }
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
    const posts = (categoryData.blog_posts ?? []) as any[]
    const normalized = posts.map((p) => ensureSeoSocial(p))
    await Promise.all(
      normalized.map(async (p: any) => {
        try {
          p.seo.structured_data = await buildStructuredData(p, ctx)
        } catch (e) {
          // ignore
        }
      }),
    )
    return { data: normalized }
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
    const posts = (tagData.blog_posts ?? []) as any[]
    const normalized = posts.map((p) => ensureSeoSocial(p))
    await Promise.all(
      normalized.map(async (p: any) => {
        try {
          p.seo.structured_data = await buildStructuredData(p, ctx)
        } catch (e) {
          // ignore
        }
      }),
    )
    return { data: normalized }
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

    // Determine client IP for basic rate limiting (best-effort)
    const ip = (ctx.request && (ctx.request.ip || ctx.request.headers?.['x-forwarded-for'])) || ctx.ip || 'unknown'

    // Build per-field allowed-update object after enforcing rate limits
    const toUpdate: Record<string, unknown> = {}

    // 24-hour window for view increments per IP+post
    if (sanitized.view_count !== undefined) {
      const key = `${ip}:${id}`
      const last = viewRateLimit.get(key) || 0
      const now = Date.now()
      const WINDOW_MS = 24 * 60 * 60 * 1000
      if (now - last >= WINDOW_MS) {
        toUpdate.view_count = sanitized.view_count
        viewRateLimit.set(key, now)
      } else {
        // Skip view update due to 24h rate limit
        // Continue without throwing error — callers expect an idempotent behavior
      }
    }

    // Small debounce window for like toggles to avoid rapid spamming (5 seconds)
    if (sanitized.like_count !== undefined) {
      const key = `${ip}:${id}`
      const last = likeRateLimit.get(key) || 0
      const now = Date.now()
      const LIKE_WINDOW_MS = 5 * 1000
      if (now - last >= LIKE_WINDOW_MS) {
        toUpdate.like_count = sanitized.like_count
        likeRateLimit.set(key, now)
      } else {
        // Reject rapid like toggles
        ctx.status = 429
        return ctx.send({ error: 'Like toggled too quickly. Please wait a few seconds.' })
      }
    }

    // If no fields survive rate-limit checks, return the full entity so UI can stay in sync
    if (Object.keys(toUpdate).length === 0) {
      const fullNoUpdate = await strapi.entityService.findOne('api::blog-post.blog-post', id as string, {
        populate: {
          seo: true,
          featured_image: true,
          author: { populate: { avatar: true } },
          categories: true,
          tags: true,
        },
      })
      return { data: fullNoUpdate }
    }

    const updated = await strapi.entityService.update('api::blog-post.blog-post', id as string, { data: toUpdate })

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
