/**
 * populate-defaults middleware for blog-post
 */

interface StrapiContext {
  query: {
    populate?: Record<string, unknown>
  }
}

export default () => {
  return async (ctx: StrapiContext, next: () => Promise<void>) => {
    // Default population for blog posts
    ctx.query.populate ??= {
      author: {
        populate: ['avatar', 'social_links'],
      },
      categories: true,
      tags: true,
      featured_image: true,
      gallery: true,
      social_sharing: true,
      seo: {
        populate: ['og_image', 'twitter_image'],
      },
    }

    await next()
  }
}
