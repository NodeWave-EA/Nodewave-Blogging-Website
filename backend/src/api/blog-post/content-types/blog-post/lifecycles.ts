/**
 * Blog post lifecycle hooks
 */

interface LifecycleEvent {
  params: {
    data: Record<string, unknown>
  }
}

export default {
  async beforeCreate(event: LifecycleEvent) {
    const { data } = event.params

    // Calculate reading time if content is provided
    if (data.content) {
      const readingTime = await strapi
        .service('api::blog-post.blog-post')
        .calculateReadingTime(data.content as string)
      data.reading_time = readingTime
    }

    // Set published_at_custom if not provided
    if (!data.published_at_custom && data.publishedAt) {
      data.published_at_custom = data.publishedAt
    }
  },

  async beforeUpdate(event: LifecycleEvent) {
    const { data } = event.params

    // Calculate reading time if content is updated
    if (data.content) {
      const readingTime = await strapi
        .service('api::blog-post.blog-post')
        .calculateReadingTime(data.content as string)
      data.reading_time = readingTime
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
