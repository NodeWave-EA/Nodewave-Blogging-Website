import type { BlogPost } from '@/types'
import { dbg } from '@/utils/debug'
import { apiService } from './api'

export async function incrementView(postId: number, currentCount = 0): Promise<BlogPost | undefined> {
	try {
		dbg('postMetrics.ts', 'incrementView', { postId })
		const resp = await apiService.put<{ data: BlogPost }>(`/blog-posts/${postId}`, {
			data: { view_count: (currentCount ?? 0) + 1 },
		})
		// Strapi returns full response.data object when updating via /api/{collection}/{id}
		if (resp?.data) return resp.data
	} catch (err) {
		dbg('postMetrics.ts', 'incrementView error', { err })
	}
	return undefined
}

export async function toggleLikePost(postId: number, currentlyLiked: boolean, currentCount: number): Promise<BlogPost | undefined> {
	try {
		dbg('postMetrics.ts', 'toggleLikePost', { postId, currentlyLiked, currentCount })
		// If currentlyLiked is true, the user is unliking -> decrement; otherwise increment
		const newCount = Math.max(0, (currentCount || 0) + (currentlyLiked ? -1 : 1))
		const payload: Record<string, unknown> = { like_count: newCount }
		const resp = await apiService.put<{ data: BlogPost }>(`/blog-posts/${postId}`, { data: payload })
		if (resp?.data) return resp.data
	} catch (err) {
		dbg('postMetrics.ts', 'toggleLikePost error', { err })
		return undefined
	}
	return undefined
}
