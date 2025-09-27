/**
 * SEO and meta tag utilities
 */
import type { BlogPost, BlogSetting, Category } from '@/types'
import { getStrapiImageUrl } from './strapi'

const strapiBaseUrl = import.meta.env.VITE_STRAPI_BASE_URL || 'http://localhost:1337'
const placeholderImageUrl = strapiBaseUrl + import.meta.env.VITE_PLACEHOLDER_IMAGE_PATH || '/uploads/placeholder-image.jpg'
const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5173'

export interface SEOData {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  siteName?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  locale?: string
  robots?: string
  canonical?: string
  section?: string
  tags?: string[]
}

export interface MetaTags {
  title: string
  description?: string
  keywords?: string
  image?: string
  logoUrl?: string
  url?: string
  type?: string
  siteName?: string
  locale?: string
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  robots?: string
  canonical?: string
}

/**
 * Generate meta tags for a blog post
 */
export function generatePostMetaTags(post: BlogPost, baseUrl: string = ''): MetaTags {
  const title = post.seo?.meta_title || post.title
  const description = post.seo?.meta_description || post.excerpt || ''
  const imageUrl = getStrapiImageUrl(post.featured_image) || placeholderImageUrl
  const image = imageUrl
  const url = `${siteUrl}/blog/${post.slug}`
  const publishedTime = post.publishedAt
  const modifiedTime = post.updatedAt
  const author = 'NodeWave Team'
  const keywords = post.seo?.meta_keywords

  return {
    title: `${title} | NodeWave Blog`,
    description,
    keywords: keywords || undefined,
    image,
    url,
    type: 'article',
    siteName: 'NodeWave Blog',
    locale: 'en_US',
    publishedTime,
    modifiedTime,
    author,
    robots: post.seo?.robots || 'index, follow',
    canonical: post.seo?.canonical_url || url,
  }
}

/**
 * Generate meta tags for category pages
 */
export function generateCategoryMetaTags(category: Category): MetaTags {

  const title = category.name
  const description = category.description || `Posts in the ${category.name} category`
  const url = `${siteUrl}/categories/${category.slug}`

  return {
    title,
    description,
    url,
    type: 'website',
    siteName: 'NodeWave Blog',
    locale: 'en_US',
    robots: 'index, follow',
    canonical: url,
  }
}

/**
 * Generate meta tags for the homepage
 */
export function generateHomepageMetaTags(
  blogSettings?: BlogSetting,
): MetaTags {
  const title = blogSettings?.site_name || 'NodeWave Blog'
  const description =
    blogSettings?.site_description ||
    'Latest insights, tutorials, and updates from NodeWave - your trusted technology partner.'
  const logoUrl = getStrapiImageUrl(blogSettings?.site_logo) ?? undefined

  return {
    title,
    description,
    logoUrl,
    url: siteUrl,
    type: 'website',
    siteName: title,
    locale: 'en_US',
    robots: 'index, follow',
    canonical: siteUrl,
  }
}

/**
 * Update document title
 */
export function updateTitle(title: string, siteName?: string): void {
  document.title = siteName ? `${title} | ${siteName}` : title
}

/**
 * Create or update meta tag
 */
function setMetaTag(name: string, content: string, property = false): void {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
  let meta = document.querySelector(selector) as HTMLMetaElement

  if (!meta) {
    meta = document.createElement('meta')
    if (property) {
      meta.setAttribute('property', name)
    } else {
      meta.setAttribute('name', name)
    }
    document.head.appendChild(meta)
  }

  meta.setAttribute('content', content)
}

/**
 * Update meta tags for SEO
 */
export function updateSEO(seoData: SEOData): void {
  const {
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    siteName,
    author,
    publishedTime,
    modifiedTime,
    locale = 'en_US',
    robots = 'index, follow',
    canonical,
    section,
    tags,
  } = seoData

  // Basic meta tags
  if (title) {
    updateTitle(title, siteName)
    setMetaTag('og:title', title, true)
    setMetaTag('twitter:title', title)
  }

  if (description) {
    setMetaTag('description', description)
    setMetaTag('og:description', description, true)
    setMetaTag('twitter:description', description)
  }

  if (keywords) {
    setMetaTag('keywords', keywords)
  }

  // Robots meta tag
  setMetaTag('robots', robots)

  // Open Graph tags
  if (url) {
    setMetaTag('og:url', url, true)
  }

  if (image) {
    setMetaTag('og:image', image, true)
    setMetaTag('twitter:image', image)
  }

  if (siteName) {
    setMetaTag('og:site_name', siteName, true)
  }

  setMetaTag('og:type', type, true)
  setMetaTag('og:locale', locale, true)

  // Twitter Card
  setMetaTag('twitter:card', image ? 'summary_large_image' : 'summary')

  // Article specific tags
  if (type === 'article') {
    if (author) {
      setMetaTag('article:author', author, true)
    }

    if (publishedTime) {
      setMetaTag('article:published_time', publishedTime, true)
    }

    if (modifiedTime) {
      setMetaTag('article:modified_time', modifiedTime, true)
    }

    if (section) {
      setMetaTag('article:section', section, true)
    }

    // Handle multiple tags
    if (tags && tags.length > 0) {
      // Remove existing article:tag meta tags
      const existingTags = document.querySelectorAll('meta[property="article:tag"]')
      existingTags.forEach((tag) => tag.remove())

      // Add new tags
      tags.forEach((tag) => {
        setMetaTag('article:tag', tag, true)
      })
    }
  }

  // Update canonical URL
  if (canonical) {
    updateCanonicalUrl(canonical)
  }
}

/**
 * Update meta tags using MetaTags interface
 */
export function updateMetaTags(metaTags: MetaTags) {
  // Update title
  if (metaTags.title) {
    document.title = metaTags.title
  }

  // Helper function to update or create meta tag
  const updateMeta = (property: string, content?: string, isProperty = false) => {
    if (!content) return

    const attribute = isProperty ? 'property' : 'name'
    let meta = document.querySelector(`meta[${attribute}="${property}"]`)

    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute(attribute, property)
      document.head.appendChild(meta)
    }

    meta.setAttribute('content', content)
  }

  // Update basic meta tags
  updateMeta('description', metaTags.description)
  updateMeta('keywords', metaTags.keywords)
  updateMeta('robots', metaTags.robots)

  // Update Open Graph tags
  updateMeta('og:title', metaTags.title, true)
  updateMeta('og:description', metaTags.description, true)
  updateMeta('og:image', metaTags.image, true)
  updateMeta('og:url', metaTags.url, true)
  updateMeta('og:type', metaTags.type, true)
  updateMeta('og:site_name', metaTags.siteName, true)
  updateMeta('og:locale', metaTags.locale, true)

  // Update Twitter Card tags
  updateMeta('twitter:card', metaTags.image ? 'summary_large_image' : 'summary')
  updateMeta('twitter:title', metaTags.title)
  updateMeta('twitter:description', metaTags.description)
  updateMeta('twitter:image', metaTags.image)

  // Update article-specific tags
  if (metaTags.publishedTime) {
    updateMeta('article:published_time', metaTags.publishedTime, true)
  }
  if (metaTags.modifiedTime) {
    updateMeta('article:modified_time', metaTags.modifiedTime, true)
  }
  if (metaTags.author) {
    updateMeta('article:author', metaTags.author, true)
  }
  if (metaTags.section) {
    updateMeta('article:section', metaTags.section, true)
  }
  if (metaTags.tags && metaTags.tags.length > 0) {
    // Remove existing article:tag meta tags
    const existingTags = document.querySelectorAll('meta[property="article:tag"]')
    existingTags.forEach((tag) => tag.remove())

    // Add new tags
    metaTags.tags.forEach((tag) => {
      updateMeta('article:tag', tag, true)
    })
  }

  // Update canonical link
  if (metaTags.canonical) {
    updateCanonicalUrl(metaTags.canonical)
  }
}

/**
 * Generate canonical URL
 */
export function updateCanonicalUrl(url: string): void {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement

  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }

  canonical.href = url
}

/**
 * Generate structured data for articles
 */
export function generateArticleStructuredData(article: {
  title: string
  description: string
  url: string
  image?: string
  author: {
    name: string
    url?: string
  }
  publishedTime: string
  modifiedTime?: string
  siteName: string
}): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: article.url,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: article.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: article.siteName,
    },
    image: article.image,
  }

  return JSON.stringify(structuredData, null, 2)
}

/**
 * Generate structured data for a blog post (JSON-LD)
 */
export function generatePostStructuredData(post: BlogPost, baseUrl: string = '') {
  const url = `${baseUrl}/blog/${post.slug}`
  const imageUrl = getStrapiImageUrl(post.featured_image)
  const fullImageUrl = imageUrl ? `${baseUrl}${imageUrl}` : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    image: fullImageUrl,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: 'NodeWave Team',
      url: `${baseUrl}/authors/nodewave-team`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'NodeWave',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }
}

/**
 * Update structured data script tag
 */
export function updateStructuredData(data: string | object, id = 'structured-data'): void {
  // Remove existing structured data
  const existing = document.getElementById(id)
  if (existing) {
    existing.remove()
  }

  // Add new structured data
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  document.head.appendChild(script)
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url?: string }>,
  baseUrl: string = '',
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: `${baseUrl}${item.url}` }),
    })),
  }
}

/**
 * Clean up meta tags when leaving a page
 */
export function cleanupSEO(): void {
  const metaTags = [
    'description',
    'keywords',
    'robots',
    'og:title',
    'og:description',
    'og:image',
    'og:url',
    'og:type',
    'og:locale',
    'twitter:title',
    'twitter:description',
    'twitter:image',
    'twitter:card',
    'article:author',
    'article:published_time',
    'article:modified_time',
    'article:section',
    'article:tag',
  ]

  metaTags.forEach((tag) => {
    const isProperty = tag.startsWith('og:') || tag.startsWith('article:')
    const selector = isProperty ? `meta[property="${tag}"]` : `meta[name="${tag}"]`
    const metas = document.querySelectorAll(selector)
    metas.forEach((meta) => meta.remove())
  })

  // Remove structured data
  const structuredData = document.getElementById('structured-data')
  if (structuredData) {
    structuredData.remove()
  }
}
