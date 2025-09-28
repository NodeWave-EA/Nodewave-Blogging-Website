import type { SEO } from './seo'
import type { StrapiImage } from './strapiImage'

export interface Page {
  id: number
  documentId: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: {
    data: StrapiImage | null
  } | null
  seo?: SEO
  status: 'draft' | 'published'
  publishedAt: string
  createdAt: string
  updatedAt: string
}
