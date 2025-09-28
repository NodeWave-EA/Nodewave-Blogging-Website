/**
 * Blog post lifecycle hooks
 */

interface LifecycleEvent {
  params: {
    data: Record<string, unknown>
  }
}

// Small helper to resolve upload file to absolute url when given an id or object

export default {
  async beforeCreate(event: LifecycleEvent) {
    const { data } = event.params

    // Initialize seo and social_sharing components so admin panel shows them by default
    data.seo = { ...((data.seo as Record<string, unknown>) || {}) }
    data.social_sharing = { ...((data.social_sharing as Record<string, unknown>) || {}) }

    // Calculate reading time if content is provided
    if (data.content) {
      const readingTime = await strapi
        .service('api::blog-post.blog-post')
        .calculateReadingTime(data.content as string)
      data.reading_time = readingTime
    }

    // Populate basic SEO defaults from post fields when empty
    if (!data.seo) data.seo = {}
    const seo = data.seo as any
    seo.meta_title = seo.meta_title || (data.title as string) || ''
    seo.meta_description = seo.meta_description || (data.excerpt as string) || ''
    seo.meta_keywords = seo.meta_keywords || (data.meta_keywords as string) || ''
    seo.canonical_url = seo.canonical_url || (data.canonical_url as string) || null

    // Map og/twitter images from featured_image if not set
    if (!seo.og_image && data.featured_image) {
      seo.og_image = data.featured_image
    }
    if (!seo.twitter_image && data.featured_image) {
      seo.twitter_image = data.featured_image
    }

    // Ensure social sharing defaults
    const ss = data.social_sharing as any
    ss.enable_sharing = ss.enable_sharing !== undefined ? ss.enable_sharing : true
    ss.platforms = ss.platforms || [
      'twitter',
      'facebook',
      'linkedin',
      'pinterest',
      'whatsapp',
      'telegram',
      'reddit',
    ]

    // Ensure status reflects publish state: when creating, default to 'published' if publishedAt present, otherwise 'draft'
    if (data.publishedAt) {
      data.status = 'published'
    } else {
      data.status = (data.status as string) || 'draft'
    }
  },

  async beforeUpdate(event: LifecycleEvent) {
    const { data } = event.params

    // Ensure seo/social_sharing exist
    data.seo = { ...((data.seo as Record<string, unknown>) || {}) }
    data.social_sharing = { ...((data.social_sharing as Record<string, unknown>) || {}) }

    // Calculate reading time if content is updated
    if (data.content) {
      const readingTime = await strapi
        .service('api::blog-post.blog-post')
        .calculateReadingTime(data.content as string)
      data.reading_time = readingTime
    }

    // Populate SEO defaults on update if empty
    const seo = data.seo as any
    seo.meta_title = seo.meta_title || (data.title as string) || ''
    seo.meta_description = seo.meta_description || (data.excerpt as string) || ''
    seo.meta_keywords = seo.meta_keywords || (data.meta_keywords as string) || ''

    if (!seo.og_image && data.featured_image) {
      seo.og_image = data.featured_image
    }
    if (!seo.twitter_image && data.featured_image) {
      seo.twitter_image = data.featured_image
    }

    const ss = data.social_sharing as any
    ss.enable_sharing = ss.enable_sharing !== undefined ? ss.enable_sharing : true
    ss.platforms = ss.platforms || [
      'twitter',
      'facebook',
      'linkedin',
      'pinterest',
      'whatsapp',
      'telegram',
      'reddit',
    ]

    // If the update payload explicitly changes publishedAt (publish/unpublish action), update status accordingly.
    if (Object.prototype.hasOwnProperty.call(data, 'publishedAt')) {
      if (data.publishedAt) {
        data.status = 'published'
      } else {
        data.status = 'draft'
      }
    }
  },

  async afterCreate() {
    // Update post counts for categories and tags
    await strapi.service('api::blog-post.blog-post').updatePostCounts()
  },

  async afterUpdate() {
    // Update post counts for categories and tags
    await strapi.service('api::blog-post.blog-post').updatePostCounts()
  },

  async afterDelete() {
    // Update post counts for categories and tags
    await strapi.service('api::blog-post.blog-post').updatePostCounts()
  },
}
