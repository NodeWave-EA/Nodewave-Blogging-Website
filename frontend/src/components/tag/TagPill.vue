<template>
	<router-link :to="to || `/tags/${tag.slug}`"
		class="inline-flex items-center px-4 py-2 rounded-full font-semibold text-sm transition-all" :class="[
			tag.trending ? 'border-2' : 'border',
			tag.trending ? 'ring-amber-400/40 dark:ring-amber-400/30' : '',
			'hover:bg-black/5 dark:hover:bg-white/5'
		]" :style="pillStyle">
		<span class="truncate">#{{ tag.name }}</span>
		<span v-if="showCount" class="ml-2 text-sm opacity-75">({{ displayCount }})</span>
	</router-link>
</template>

<script setup lang="ts">
	import type { Tag } from '@/types';
	import { computed } from 'vue';

	const props = withDefaults(defineProps<{
		tag: Tag
		to?: string
		showCount?: boolean
	}>(), {
		showCount: true,
	})

	const { tag, to, showCount } = props

	const displayCount = computed(() => {
		// Prefer numeric post_count when available, otherwise show 0
		return (tag.post_count ?? 0)
	})

	const pillStyle = computed(() => {
		// If a color is set on the tag (hex, rgb, or CSS color) use it for border and subtle background
		if (!tag.color) return {}

		// Create a very subtle translucent background if a hex value is provided
		// We avoid complex color parsing here; use CSS variables so consumers can override if needed
		return {
			borderColor: tag.color,
			color: tag.color,
			backgroundColor: `${tag.color}20`, // best-effort translucent (works for hex like #rrggbb)
		}
	})
</script>

<style scoped>
	/* Ensure the pill looks consistent when a color is present */
	/* no extra rules needed */
</style>
