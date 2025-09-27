export interface SearchResult {
	type: 'post' | 'author' | 'category' | 'tag'
	id: number
	title: string
	slug: string
	excerpt?: string
	url: string
	relevanceScore?: number
}

export interface SearchResults {
	query: string
	results: SearchResult[]
	total: number
	took: number
}

export interface SearchFilters {
	query?: string
	category?: string
	tag?: string
	author?: string
	sortBy?: 'newest' | 'oldest' | 'popular' | 'title'
}
