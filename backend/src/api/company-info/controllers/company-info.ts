/**
 * company-info controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::company-info.company-info', ({ strapi }) => ({
  async find(ctx) {
    const { query } = ctx
    const entity = await strapi.entityService.findMany('api::company-info.company-info', {
      ...query,
      populate: {
        logo: true,
        logo_dark: true,
        favicon: true,
        social_links: true,
        og_image: true,
        seo: {
          populate: {
            og_image: true,
            twitter_image: true,
          },
        },
      },
    })

    return entity
  },

  async findOne(ctx) {
    const { query } = ctx
    const entity = await strapi.entityService.findOne(
      'api::company-info.company-info',
      ctx.params.id,
      {
        ...query,
        populate: {
          logo: true,
          logo_dark: true,
          favicon: true,
          social_links: true,
          og_image: true,
          seo: {
            populate: {
              og_image: true,
              twitter_image: true,
            },
          },
        },
      }
    )

    return entity
  },
}))
