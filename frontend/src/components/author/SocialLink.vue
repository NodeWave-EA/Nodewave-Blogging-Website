<template>
	<!-- Anchor when URL available, otherwise non-clickable span. Tooltip and padding are applied per-icon. -->
	<a v-if="link && url" :href="url" target="_blank" rel="noopener noreferrer" :class="wrapperClass" @click.stop
		:aria-label="tooltipText" :title="tooltipText">
		<FontAwesomeIcon :icon="icon" :color="color" :size="size" :class="iconWrapperClass">
			<template #default>
				<GlobeAltIcon :class="['text-current', size]" />
			</template>
		</FontAwesomeIcon>
		<!-- Tooltip attached to the icon (per-icon) -->
		<span v-if="tooltipText" :class="[
			'absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs bg-black text-white transition-opacity duration-150 z-50',
			'opacity-0 group-hover:opacity-100'
		]">{{ tooltipText }}</span>
	</a>
	<span v-else-if="link" :class="wrapperClass" :aria-label="tooltipText" :title="tooltipText">
		<FontAwesomeIcon :icon="icon" :color="color" :size="size" :class="iconWrapperClass">
			<template #default>
				<GlobeAltIcon :class="['text-current', size]" />
			</template>
		</FontAwesomeIcon>
		<!-- Tooltip for non-anchor -->
		<span v-if="tooltipText" :class="[
			'absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs bg-black text-white transition-opacity duration-150 z-50',
			'opacity-0 group-hover:opacity-100'
		]">{{ tooltipText }}</span>
	</span>
</template>

<script setup lang="ts">
	import FontAwesomeIcon from '@/components/ui/FontAwesomeIcon.vue';
	import type { SocialLink } from '@/types';
	import { GlobeAltIcon } from '@heroicons/vue/24/outline';
	import { computed } from 'vue';

	const props = withDefaults(defineProps<{ link: SocialLink; size?: string; class?: string }>(), {
		size: 'w-4 h-4',
		class: '',
	})

	const { link } = props

	// Keep values reactive by using computed wrappers
	const url = computed(() => link?.url ?? '')
	const username = computed(() => link?.username ?? link?.platform ?? '')
	const color = computed(() => link?.color ?? undefined)
	const icon = computed(() => link?.icon ?? undefined)

	const size = computed(() => props.size || 'w-4 h-4')
	// Build a wrapper class that ensures a comfortable click/touch target per icon.
	const defaultWrapper = 'inline-flex items-center justify-center relative group p-2 rounded-full'
	// Merge provided classes with the default wrapper so we always keep the required 'relative group'
	const wrapperClass = computed(() => `${defaultWrapper} ${props.class ?? ''}`.trim())

	// Optional extra class applied to the inner icon element for spacing/styling
	const iconWrapperClass = computed(() => `inline-flex items-center justify-center ${size.value}`)

	// Prepend '@' to username when present and not already prefixed
	const tooltipText = computed(() => {
		const u = username.value
		if (u) {
			return u.startsWith('@') ? u : `@${u}`
		}
		return link?.platform ?? link?.url ?? ''
	})
</script>
