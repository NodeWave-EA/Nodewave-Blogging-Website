import type { BlogPost } from './blogPost'
import type { SocialLink } from './socialLink'
import type { StrapiImage } from './strapiImage'
import type { Tag } from './tag'

export interface Author {
  id: number
  documentId: string
  name: string
  slug: string
  email: string
  bio: string
  job_title: string
  company?: string
  location?: string
  website?: string
  featured?: boolean
  follower_count?: number
  meta_description?: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: string | null
  avatar?: StrapiImage | null
  cover_image?: StrapiImage | null
  social_links?: SocialLink[] | null
  blog_posts?: BlogPost[] | null
  expertise_areas?: Tag[] | null
  localizations?: string[] | null
}
