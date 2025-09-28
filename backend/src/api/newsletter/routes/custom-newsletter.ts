/**
 * Custom routes for newsletter API
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/newsletters/unsubscribe',
      handler: 'api::newsletter.newsletter.unsubscribe',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/newsletters/confirm',
      handler: 'api::newsletter.newsletter.confirm',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}
