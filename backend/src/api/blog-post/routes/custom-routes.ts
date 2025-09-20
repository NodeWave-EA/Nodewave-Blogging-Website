/**
 * RSS and Sitemap routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/rss',
      handler: 'rss.generateRssFeed',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/sitemap.xml',
      handler: 'sitemap.generateSitemap',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/robots.txt',
      handler: 'robots.generateRobotsTxt',
      config: {
        auth: false,
      },
    },
  ],
}
