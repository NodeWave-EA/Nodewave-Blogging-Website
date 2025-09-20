/**
 * Custom author routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/authors/slug/:slug',
      handler: 'author.findBySlug',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/authors/featured',
      handler: 'author.findFeatured',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}
