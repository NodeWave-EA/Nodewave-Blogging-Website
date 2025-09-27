<template>
	<section class="mt-16 sm:mt-20">
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
			<div
				class="rounded-xl border border-black/10 dark:border-white/10 backdrop-blur-md p-8 flex flex-col items-center group transition hover:shadow-lg hover:-translate-y-1 bg-transparent">
				<div
					class="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition group-hover:scale-110">
					<BookOpenIcon class="w-6 h-6" />
				</div>
				<dt class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Posts</dt>
				<dd class="text-3xl font-bold text-black dark:text-white mt-1">{{ stats.totalPosts }}</dd>
			</div>
			<div
				class="rounded-xl border border-black/10 dark:border-white/10 backdrop-blur-md p-8 flex flex-col items-center group transition hover:shadow-lg hover:-translate-y-1 bg-transparent">
				<div
					class="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 transition group-hover:scale-110">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
					</svg>
				</div>
				<dt class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categories</dt>
				<dd class="text-3xl font-bold text-black dark:text-white mt-1">{{ stats.totalCategories }}</dd>
			</div>
			<div
				class="rounded-xl border border-black/10 dark:border-white/10 backdrop-blur-md p-8 flex flex-col items-center group transition hover:shadow-lg hover:-translate-y-1 bg-transparent">
				<div
					class="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 transition group-hover:scale-110">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
					</svg>
				</div>
				<dt class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Authors</dt>
				<dd class="text-3xl font-bold text-black dark:text-white mt-1">{{ stats.totalAuthors }}</dd>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	import { authorsApi, blogPostsApi, categoriesApi } from '@/services';
	import { BookOpenIcon } from '@heroicons/vue/24/outline';
	import { onMounted, ref } from 'vue';

	const stats = ref({ totalPosts: 0, totalCategories: 0, totalAuthors: 0 })

	const loadStats = async () => {
		try {
			const [postsResponse, categoriesResponse, authorsResponse] = await Promise.all([
				blogPostsApi.getAll(1, 1),
				categoriesApi.getAll(),
				authorsApi.getAll(),
			])

			const totalPosts = postsResponse.meta?.pagination?.total ?? postsResponse.data?.length ?? 0
			const totalCategories =
				categoriesResponse.meta?.pagination?.total ?? categoriesResponse.data?.length ?? 0
			const totalAuthors =
				authorsResponse.meta?.pagination?.total ?? authorsResponse.data?.length ?? 0

			stats.value = {
				totalPosts,
				totalCategories,
				totalAuthors,
			}
		} catch (error) {
			console.error('Failed to load stats:', error)
		}
	}

	onMounted(loadStats)
</script>
