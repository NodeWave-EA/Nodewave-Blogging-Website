<template>
	<div class="prose prose-lg max-w-none text-black dark:text-white">
		<div v-if="processed" v-html="processed"></div>
		<div v-else class="text-sm text-zinc-500">No biography available.</div>
	</div>
</template>

<script setup lang="ts">
	import { processContent } from '@/utils/contentRenderer';
	import { computed } from 'vue';

	const props = withDefaults(defineProps<{ content?: string | null }>(), { content: '' })

	const processed = computed(() => {
		if (!props.content) return ''
		return processContent(props.content, { renderMarkdown: true, makeResponsive: true, processLinks: true, sanitize: true })
	})

	// Optional: expose reading time if useful in the UI in future
</script>

<style scoped></style>
