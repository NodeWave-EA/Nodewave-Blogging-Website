<template>
	<div
		class="bg-transparent backdrop-blur-xl rounded-xl p-8 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-black dark:border-white">
		<!-- Avatar -->
		<div class="text-center mb-6 relative">
			<div class="inline-block">
				<router-link :to="authorLink" class="group inline-block">
					<img :src="avatarUrl" :alt="author.name"
						:class="['w-24 h-24 rounded-full object-cover shadow-lg transition-all duration-300', avatarRingClass]" />
				</router-link>
			</div>
			<!-- post badge positioned to match skeleton -->
			<span v-if="postsCount > 0" :class="postBadgeClass">{{ postsCount }}
				<span class="sr-only">posts</span>
			</span>
		</div>

		<!-- Info -->
		<div class="text-center">
			<h3 class="text-xl font-bold text-black dark:text-white mb-2 transition-colors">
				<router-link :to="authorLink" class="hover:underline">{{ author.name }}</router-link>
			</h3>

			<p v-if="author.job_title" class="text-blue-600 dark:text-blue-400 font-medium mb-3">{{ author.job_title }}</p>

			<!-- Social Links -->
			<div v-if="author.social_links && author.social_links.length" class="flex items-center justify-center gap-4 mb-4">
				<SocialLink v-for="(link, idx) in author.social_links" :key="link.url ?? link.platform ?? idx" :link="link"
					class="p-2" />
			</div>

			<!-- Expertise Areas (show up to 3, then "+X more" if applicable) -->
			<div v-if="author.expertise_areas && author.expertise_areas.length > 0"
				class="flex flex-wrap justify-center gap-2">
				<span v-for="tag in author.expertise_areas.slice(0, 3)" :key="tag.id"
					class="px-2 py-1 text-xs font-medium rounded-full bg-transparent text-black dark:text-white border border-black dark:border-white">
					{{ tag.name }}
				</span>
				<span v-if="author.expertise_areas.length > 3"
					class="px-2 py-1 text-xs font-medium rounded-full bg-transparent text-black dark:text-white border border-black dark:border-white">+{{ author.expertise_areas.length - 3 }}
					more</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { Author } from '@/types';
	import { getStrapiImageUrl } from '@/utils/strapi';
	import { computed } from 'vue';
	import SocialLink from './SocialLink.vue';

	const props = defineProps<{ author: Author; compact?: boolean }>()
	const author = props.author

	const authorLink = computed(() => `/authors/${author.slug || author.id}`)
	const avatarUrl = computed(() => getStrapiImageUrl(author.avatar) ?? '')

	// Avatar ring class
	const avatarRingClass = computed(() =>
		'ring-4 ring-white dark:ring-zinc-700 group-hover:ring-blue-200 dark:group-hover:ring-blue-800',
	)

	// Post badge styling: when featured, use a matching blue tone and border; otherwise use default dark/light badge.
	const postsCount = computed(() => author.blog_posts?.length ?? 0)

	const postBadgeClass = computed(() =>
		author.featured
			? 'absolute -bottom-2 right-6 w-8 h-6 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-600 text-white border border-blue-600 dark:bg-blue-800 dark:border-blue-800 z-20'
			: 'absolute -bottom-2 right-6 w-8 h-6 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white z-20',
	)
</script>

<style scoped></style>
