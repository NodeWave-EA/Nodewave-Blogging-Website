import type { BlogPost } from './blogPost'

export interface Comment {
  id: number
  documentId?: string
  content: string
  author_name?: string
  author_email?: string
  author_website?: string
  approved?: boolean
  spam?: boolean
  ip_address?: string
  user_agent?: string
  like_count?: number
  reported?: boolean
  reported_reason?: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  blog_post: BlogPost
  parent_comment?: Comment | null
  replies?: Comment[] | null
}
