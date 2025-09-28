import type { SEO } from './seo'
import type { SocialLink } from './socialLink'
import type { StrapiImage } from './strapiImage'
import type { Author } from './author'

export interface BlogSetting {
  id: number
  documentId: string

  // Basic site info
  site_name: string
  site_description: string
  site_url: string

  // Blog configuration
  posts_per_page: number
  allow_comments: boolean
  moderate_comments: boolean

  // Analytics & tracking
  analytics_code: string | null
  tracking_scripts: string | null

  // Customizations
  custom_css: string | null
  custom_js: string | null

  // Footer / contact
  footer_text: string | null
  contact_email: string | null

  // Maintenance mode
  maintenance_mode: boolean
  maintenance_message: string | null

  // Features toggles
  newsletter_enabled: boolean
  rss_enabled: boolean
  sitemap_enabled: boolean
  search_enabled: boolean

  // Theme & formatting
  theme: string
  timezone: string
  date_format: string
  time_format: string

  // Timestamps
  createdAt: string
  updatedAt: string
  publishedAt: string

  // Locale
  locale: string

  // Relations
  site_logo: StrapiImage | null
  site_favicon: StrapiImage | null
  default_author: Author | null
  social_links: SocialLink[]
  seo?: SEO
  localizations?: BlogSetting[]
}
