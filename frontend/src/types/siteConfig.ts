import type { StrapiImage } from './strapiImage'

export interface SiteConfig {
  name: string
  description: string
  url: string
  logo?: StrapiImage
  favicon?: StrapiImage
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
    facebook?: string
    instagram?: string
  }
  analytics?: {
    googleAnalyticsId?: string
    facebookPixelId?: string
  }
  seo?: {
    defaultMetaTitle?: string
    defaultMetaDescription?: string
    defaultMetaImage?: StrapiImage
  }
}
