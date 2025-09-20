/**
 * Sitemap Controller
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
  async generateSitemap(ctx: StrapiContext) {
    try {
      const posts = await strapi.service('api::blog-post.blog-post').generateSitemap()
      const categories = await strapi.entityService.findMany('api::category.category', {
        filters: { publishedAt: { $notNull: true } },
        fields: ['slug', 'updatedAt'],
        sort: { updatedAt: 'desc' },
      })
      const authors = await strapi.entityService.findMany('api::author.author', {
        filters: { publishedAt: { $notNull: true } },
        fields: ['slug', 'updatedAt'],
        sort: { updatedAt: 'desc' },
      })
      const tags = await strapi.entityService.findMany('api::tag.tag', {
        filters: { publishedAt: { $notNull: true } },
        fields: ['slug', 'updatedAt'],
        sort: { updatedAt: 'desc' },
      })

      const settings = await strapi.entityService.findOne('api::blog-setting.blog-setting', 1)
      const siteUrl = settings?.site_url ?? ctx.request.origin

      let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${siteUrl}/contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`

      // Add blog posts
      for (const post of posts as { url: string; lastModified: string }[]) {
        sitemapXml += `
  <url>
    <loc>${siteUrl}${post.url}</loc>
    <lastmod>${new Date(post.lastModified).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      }

      // Add categories
      for (const category of categories as { slug: string; updatedAt: string }[]) {
        sitemapXml += `
  <url>
    <loc>${siteUrl}/category/${category.slug}</loc>
    <lastmod>${new Date(category.updatedAt ?? new Date()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
      }

      // Add authors
      for (const author of authors as { slug: string; updatedAt: string }[]) {
        sitemapXml += `
  <url>
    <loc>${siteUrl}/author/${author.slug}</loc>
    <lastmod>${new Date(author.updatedAt ?? new Date()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
      }

      // Add tags
      for (const tag of tags as { slug: string; updatedAt: string }[]) {
        sitemapXml += `
  <url>
    <loc>${siteUrl}/tag/${tag.slug}</loc>
    <lastmod>${new Date(tag.updatedAt ?? new Date()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`
      }

      sitemapXml += `
</urlset>`

      ctx.set('Content-Type', 'application/xml; charset=utf-8')
      ctx.body = sitemapXml
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      ctx.throw(500, `Sitemap generation failed: ${errorMessage}`)
    }
  },
}
