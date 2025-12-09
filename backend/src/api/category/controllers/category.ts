/**
 * category controller
 */

import { factories } from '@strapi/strapi'
import type { Context } from 'koa'

export default factories.createCoreController('api::category.category', ({ strapi }) => ({
  async find(ctx: Context) {
    const { query } = ctx.request
    const entities = await strapi.entityService.findMany('api::category.category', {
      ...query,
      populate: query?.populate ?? '*',
    })

    // If post_count missing or zero, compute per-category counts
    if (Array.isArray(entities)) {
      await Promise.all(
        entities.map(async (cat: any) => {
          if (!cat.post_count || cat.post_count === 0) {
            try {
              const count = await strapi.entityService.count('api::blog-post.blog-post', {
                filters: { categories: { id: cat.id }, publishedAt: { $notNull: true } },
              })
              cat.post_count = count
            } catch (e) {
              // ignore
              strapi.log.error('Failed to compute post_count for category id=' + cat.id, e)
            }
          }
        })
      )
    }

    return { data: entities }
  },

  async findOne(ctx: Context) {
    const { id } = ctx.params
    const entity = await strapi.entityService.findOne('api::category.category', id as string, {
      populate: ctx.request.query?.populate ?? '*',
    })

    if (!entity) return ctx.notFound()

    const category = entity as any
    if (!category.post_count || category.post_count === 0) {
      try {
        const count = await strapi.entityService.count('api::blog-post.blog-post', {
          filters: { categories: { id: category.id }, publishedAt: { $notNull: true } },
        })
        category.post_count = count
      } catch (e) {
        strapi.log.error('Failed to compute post_count for category id=' + category.id, e)
      }
    }

    return { data: category }
  },
}))
