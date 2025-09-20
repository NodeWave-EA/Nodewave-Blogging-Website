/**
 * Robots.txt Controller
 */

interface StrapiContext {
  request: {
    origin: string
  }
  set: (header: string, value: string) => void
  body: string
  throw: (status: number, message: string) => void
}

export default {
  async generateRobotsTxt(ctx: StrapiContext) {
    try {
      const settings = await strapi.entityService.findOne('api::blog-setting.blog-setting', 1)
      const siteUrl = settings?.site_url ?? ctx.request.origin

      const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${siteUrl}/api/sitemap.xml

# Disallow admin and API paths
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /uploads/

# Allow specific API endpoints
Allow: /api/rss
Allow: /api/sitemap.xml
Allow: /api/robots.txt

# Crawl-delay
Crawl-delay: 1`

      ctx.set('Content-Type', 'text/plain; charset=utf-8')
      ctx.body = robotsTxt
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      ctx.throw(500, `Robots.txt generation failed: ${errorMessage}`)
    }
  },
}
