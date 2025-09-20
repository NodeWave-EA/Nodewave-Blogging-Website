/**
 * RSS Controller
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
  async generateRssFeed(ctx: StrapiContext) {
    try {
      const posts = await strapi.service('api::blog-post.blog-post').generateRssFeed()
      const settings = await strapi.entityService.findOne('api::blog-setting.blog-setting', 1, {
        populate: ['site_logo', 'social_links'],
      })

      const siteUrl = settings?.site_url ?? ctx.request.origin
      const siteName = settings?.site_name ?? 'NodeWave Blog'
      const siteDescription = settings?.site_description ?? 'Professional Company Blogging Platform'

      let rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" xmlns:slash="http://purl.org/rss/1.0/modules/slash/">
  <channel>
    <title><![CDATA[${siteName}]]></title>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml" />
    <link>${siteUrl}</link>
    <description><![CDATA[${siteDescription}]]></description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <language>en-US</language>
    <sy:updatePeriod>hourly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <generator>Strapi CMS</generator>`

      for (const post of posts as Record<string, unknown>[]) {
        const postUrl = `${siteUrl}/blog/${post.slug}`
        const pubDate = new Date(
          (post.publishedAt as string) ?? (post.createdAt as string)
        ).toUTCString()
        const featuredImage = post.featured_image as Record<string, unknown>
        const categories = post.categories as Record<string, unknown>[]
        const imageUrl = featuredImage?.url as string

        rssXml += `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${(post.author as Record<string, unknown>)?.name ?? 'Anonymous'}]]></dc:creator>
      ${categories?.map((cat: Record<string, unknown>) => `<category><![CDATA[${cat.name}]]></category>`).join('') ?? ''}
      <guid isPermaLink="false">${post.id}</guid>
      <description><![CDATA[${post.excerpt ?? ''}]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      ${imageUrl ? `<enclosure url="${imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`}" type="image/jpeg"/>` : ''}
    </item>`
      }

      rssXml += `
  </channel>
</rss>`

      ctx.set('Content-Type', 'application/rss+xml; charset=utf-8')
      ctx.body = rssXml
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      ctx.throw(500, `RSS generation failed: ${errorMessage}`)
    }
  },
}
