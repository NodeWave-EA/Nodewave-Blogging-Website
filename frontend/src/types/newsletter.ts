import type { Category } from './category'

export interface Preferences {
  id: number
  frequency: 'daily' | 'weekly' | 'monthly' | string
  digest_format: 'html' | 'text' | string
  include_featured: boolean
  include_new_posts: boolean
  include_trending: boolean
  language: string
}

export interface Newsletter {
  id: number
  documentId: string
  email: string
  name: string
  subscribed: boolean
  subscription_date: string
  source: string
  confirmed: boolean
  confirmation_token: string | null
  createdAt: string
  updatedAt: string
  publishedAt: string

  preferences: Preferences
  categories: Category[]
}
