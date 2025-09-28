export interface Category {
  id: number
  documentId: string
  name: string
  slug: string
  description: string | null
  color: string | null
  icon?: string
  featured?: boolean
  post_count?: number
  order?: number
  meta_title?: string | null
  meta_description?: string | null
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: string | null
}
