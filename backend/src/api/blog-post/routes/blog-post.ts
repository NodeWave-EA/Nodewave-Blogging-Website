/**
 * blog-post router
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreRouter('api::blog-post.blog-post', {
  config: {
    find: {
      middlewares: ['api::blog-post.populate-defaults'],
    },
    findOne: {
      middlewares: ['api::blog-post.populate-defaults'],
    },
    // Allow public (unauthenticated) PUT requests to the collection update route
    // but the controller's `update` delegates to `updatePublic` and sanitizes fields.
    update: {
      auth: false,
    },
  },
})
