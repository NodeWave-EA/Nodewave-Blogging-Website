export interface Tag {
	id: number
	documentId: string
	name: string
	slug: string
	description?: string
	color?: string
	post_count?: number
	trending?: boolean
	meta_description?: string | null
	createdAt: string
	updatedAt: string
	publishedAt: string
	locale: string | null
}
