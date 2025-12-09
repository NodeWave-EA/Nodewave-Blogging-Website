import type { BlogPost } from './blogPost'

export interface Tag {
  id: number
  documentId: string
  name: string
  slug: string
  description?: string
  color?: string
  trending: boolean
  post_count?: number
  blog_posts?: BlogPost[]
  meta_description?: string | null
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: string | null
  localizations?: []
}
