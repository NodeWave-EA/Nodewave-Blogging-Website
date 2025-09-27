export interface SEO {
	id: number
	meta_title?: string | null
	meta_description?: string | null
	meta_keywords?: string | null
	canonical_url?: string | null
	og_title?: string | null
	og_description?: string | null
	twitter_card?: string | null
	twitter_title?: string | null
	twitter_description?: string | null
	robots?: string | null
	structured_data?: Record<string, unknown> | null
}
