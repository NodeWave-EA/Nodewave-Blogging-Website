// StrapiImage interface

import type { StrapiImageFormats } from "./strapiImageFormats"

export interface StrapiImage {
	id: number
	documentId?: string
	name: string
	alternativeText: string | null
	caption: string | null
	width: number
	height: number
	formats: StrapiImageFormats | null
	hash: string
	ext: string
	mime: string
	size: number
	url: string
	previewUrl: string | null
	provider: string
	provider_metadata: Record<string, unknown> | null
	createdAt: string
	updatedAt: string
	publishedAt?: string | null
}
