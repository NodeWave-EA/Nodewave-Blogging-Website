import type { Author } from './author'
import type { Category } from './category'
import type { Tag } from './tag'

export interface CreateAuthor {
	name: string
	slug: string
	email: string
	bio?: string
	avatar?: File | null
	socialLinks?: {
		twitter?: string
		linkedin?: string
		github?: string
		website?: string
	}
}

export interface UpdateAuthor extends Partial<CreateAuthor> {
	id: number
}

export interface CreateCategory {
	name: string
	slug: string
	description?: string
	color?: string
}

export interface UpdateCategory extends Partial<CreateCategory> {
	id: number
}

export interface CreateTag {
	name: string
	slug: string
}

export interface UpdateTag extends Partial<CreateTag> {
	id: number
}

export interface CreateBlogPost {
	title: string
	slug: string
	excerpt?: string
	content: string
	featuredImage?: File | null
	author: Author
	categories?: Category[]
	tags?: Tag[]
	seo?: any
	socialSharing?: any
	status: 'draft' | 'published' | 'archived'
	featured?: boolean
}

export interface UpdateBlogPost extends Partial<CreateBlogPost> {
	id: number
}
