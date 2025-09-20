/**
 * Custom blog-post routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/blog-posts/slug/:slug',
      handler: 'blog-post.findBySlug',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/blog-posts/featured',
      handler: 'blog-post.findFeatured',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/blog-posts/category/:categorySlug',
      handler: 'blog-post.findByCategory',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/blog-posts/tag/:tagSlug',
      handler: 'blog-post.findByTag',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/blog-posts/search',
      handler: 'blog-post.search',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}
