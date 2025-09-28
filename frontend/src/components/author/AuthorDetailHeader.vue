<template>
	<div class="bg-transparent rounded-xl p-6 md:p-8 shadow-none">
		<div class="flex flex-col md:flex-row items-start md:items-center gap-6">
			<div class="flex-shrink-0">
				<img :src="avatarUrl" :alt="author.name" class="w-36 h-36 rounded-full object-cover ring-4" />
			</div>

			<div class="flex-1">
				<h1 class="text-3xl md:text-4xl font-extrabold leading-tight text-black dark:text-white">{{ author.name }}</h1>
				<p v-if="author.job_title" class="text-lg text-blue-600 dark:text-blue-400 font-semibold mt-2">
					{{ author.job_title }}</p>

				<div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-700 dark:text-zinc-300">
					<div v-if="author.follower_count" class="flex items-center gap-2">
						<UsersIcon class="w-5 h-5" />
						<span>{{ formatNumber(author.follower_count) }} followers</span>
					</div>

					<div v-if="author.createdAt" class="flex items-center gap-2">
						<CalendarIcon class="w-5 h-5" />
						<span>Writing since {{ formattedSince }}</span>
					</div>

					<div v-if="postsCount > 0" class="flex items-center gap-2">
						<DocumentTextIcon class="w-5 h-5" />
						<span class="font-medium">{{ postsCount }} {{ postsCount === 1 ? 'post' : 'posts' }}</span>
					</div>
				</div>

				<div class="mt-4 flex items-center gap-3">
					<SocialLink v-for="(link, idx) in author.social_links || []" :key="link.url ?? link.platform ?? idx"
						:link="link" size="w-5 h-5" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { Author } from '@/types';
	import { getStrapiImageUrl } from '@/utils/strapi';
	import { CalendarIcon, DocumentTextIcon, UsersIcon } from '@heroicons/vue/24/outline';
	import { computed } from 'vue';
	import SocialLink from './SocialLink.vue';

	const props = defineProps<{ author: Author }>()
	const author = props.author

	const avatarUrl = computed(() => getStrapiImageUrl(author.avatar) ?? '')
	const postsCount = computed(() => author.blog_posts?.length ?? 0)

	const formattedSince = computed(() => {
		if (!author.createdAt) return ''
		return new Date(author.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
	})

	const formatNumber = (num: number) => {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
		return num.toString()
	}
</script>

<style scoped></style>
