import type { Author } from './author'
import type { Category } from './category'
import type { SEO } from './seo'
import type { SocialSharing } from './socialSharing'
import type { StrapiImage } from './strapiImage'
import type { Tag } from './tag'

export interface BlogPost {
	id: number
	documentId: string
	title: string
	slug: string
	excerpt: string | null
	content: string
	meta_title?: string | null
	meta_description?: string | null
	meta_keywords?: string | null
	canonical_url?: string | null
	reading_time?: number
	view_count?: number
	like_count?: number
	featured?: boolean
	allow_comments?: boolean
	status?: 'draft' | 'published'
	priority?: 'low' | 'normal' | 'high'
	createdAt: string
	updatedAt: string
	publishedAt: string
	locale: string | null
	seo?: SEO | null
	featured_image?: StrapiImage | null
	author?: Author | null
	categories?: Category[] | null
	tags?: Tag[] | null
	socialSharing?: SocialSharing | null
}
