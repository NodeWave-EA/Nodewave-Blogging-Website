import type { BlogPost } from '@/types';
import { defineStore } from 'pinia';

export const usePostMetricsStore = defineStore('postMetrics', {
	state: () => ({
		metrics: {} as Record<number, { view_count?: number; like_count?: number; liked?: boolean }>,
	}),

	actions: {
		setMetricsFor(postId: number, payload: { view_count?: number; like_count?: number; liked?: boolean }) {
			this.metrics[postId] = { ...(this.metrics[postId] || {}), ...(payload || {}) }
		},

		setLikedFor(postId: number, liked: boolean) {
			this.metrics[postId] = { ...(this.metrics[postId] || {}), liked }
		},

		incrementLikeLocal(postId: number) {
			const m = this.metrics[postId] || {}
			m.like_count = (m.like_count || 0) + 1
			this.metrics[postId] = m
		},

		decrementLikeLocal(postId: number) {
			const m = this.metrics[postId] || {}
			m.like_count = Math.max(0, (m.like_count || 0) - 1)
			this.metrics[postId] = m
		},

		updateFromPost(post: BlogPost) {
			if (!post) return
			this.setMetricsFor(post.id, { view_count: post.view_count, like_count: post.like_count })
		},
	},

	getters: {
		getMetrics: (state) => {
			return (postId: number) => state.metrics[postId]
		},
	},
})
