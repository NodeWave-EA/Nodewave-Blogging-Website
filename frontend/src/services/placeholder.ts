import type { StrapiImage } from '@/types'
import { dbg } from '@/utils/debug'
import { apiService } from './api'
import { axiosClient } from './axiosClient'
import { buildStrapiQuery } from './queryBuilder'

// Searches Strapi media library for a file whose name contains "placeholder-image" (case-insensitive)
export async function findPlaceholderImageUrl(): Promise<string | null> {
	try {
		const params: Record<string, unknown> = {
			'filters[name][$containsi]': 'placeholder-image',
			'pagination[pageSize]': 1,
			'sort[0]': 'createdAt:desc',
		}

		const query = buildStrapiQuery(params)
		dbg('placeholder.ts', 'searching for placeholder image', { query })

		// Note: Strapi upload plugin returns a plain array of file objects
		const files = await apiService.get<StrapiImage[]>(`/upload/files?${query}`)

		if (!files || files.length === 0) {
			dbg('placeholder.ts', 'no placeholder image found')
			return null
		}

		const file = files[0]

		// If Strapi returned a relative URL (starts with '/'), make it absolute by deriving the host
		const absoluteUrl = toAbsoluteUrl(file.url)
		dbg('placeholder.ts', 'found placeholder image', { id: file.id, url: absoluteUrl })
		return absoluteUrl
	} catch (error) {
		dbg('placeholder.ts', 'error while searching for placeholder', { error })
		return null
	}
}

function toAbsoluteUrl(url: string): string {
	if (!url) return url
	if (url.startsWith('http://') || url.startsWith('https://')) return url

	// Attempt to derive host from axiosClient baseURL (remove trailing '/api' if present)
	const base = (axiosClient.defaults.baseURL || '') as string
	const host = base.replace(/\/api\/?$/, '')
	if (host) {
		return `${host}${url.startsWith('/') ? '' : '/'}${url}`
	}

	// Fallback to window origin
	return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`
}
