<template>
	<section class="min-h-screen bg-transparent">
		<!-- INDEX skeleton -->
		<div v-if="mode === 'index'" class="py-8">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<!-- Header skeleton (matches PageHeader regular) -->
				<div class="relative backdrop-blur-xl overflow-hidden py-12 animate-pulse">
					<div class="relative z-10 container mx-auto px-4 text-center">
						<div class="max-w-4xl mx-auto">
							<div class="mb-4">
								<div class="inline-block mx-auto h-8 bg-zinc-300 dark:bg-zinc-700 rounded-full w-32"></div>
							</div>

							<div class="mb-6">
								<div class="mx-auto bg-zinc-300 dark:bg-zinc-700 rounded w-3/4 h-12 md:h-16"></div>
							</div>

							<div class="mb-6">
								<div class="mx-auto bg-zinc-300 dark:bg-zinc-700 rounded w-1/2 h-4 md:h-6"></div>
							</div>

							<div class="mt-6 flex justify-center">
								<div class="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 rounded-full w-20 opacity-80">
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Categories grid: reuse CategorySkeleton so item dimensions match exactly -->
				<div class="container mx-auto px-4 max-w-6xl mt-10">
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						<CategorySkeleton v-for="i in 9" :key="i" />
					</div>
				</div>

				<!-- Popular categories skeleton (matches Popular Categories section) -->
				<div class="container mx-auto px-4 max-w-6xl mt-16">
					<div class="text-center mb-8">
						<div class="h-6 w-48 bg-zinc-300 dark:bg-zinc-700 rounded mx-auto animate-pulse"></div>
					</div>
					<div class="flex flex-wrap justify-center gap-3">
						<div v-for="i in 8" :key="i"
							class="w-40 h-12 rounded-full border border-black/10 dark:border-white/10 bg-transparent animate-pulse">
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- DETAIL skeleton (preserve previous Category detail skeleton) -->
		<div v-else class="py-8">
			<div class="container mx-auto px-4 max-w-6xl">
				<!-- Header + stats skeleton -->
				<div class="max-w-4xl mx-auto text-center mb-8">
					<div class="w-24 h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-700 mx-auto mb-6 animate-pulse"></div>
					<div class="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded mb-4 animate-pulse"></div>
					<div class="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded mb-2 animate-pulse"></div>
					<div class="flex items-center justify-center gap-6 mt-4">
						<div class="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
						<div class="h-4 w-32 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
					</div>
				</div>

				<!-- Posts Grid skeleton -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					<BlogPostSkeleton v-for="i in 6" :key="i" />
				</div>

				<!-- Load More skeleton -->
				<div class="text-center mt-12">
					<div
						class="inline-flex items-center px-8 py-3 rounded-lg border border-black/10 dark:border-white/10 bg-transparent opacity-60 animate-pulse">
						<div class="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
					</div>
				</div>

				<!-- Related Categories skeleton -->
				<div class="mt-16">
					<div class="text-center mb-8">
						<div class="h-6 w-48 bg-zinc-200 dark:bg-zinc-700 rounded mx-auto animate-pulse"></div>
					</div>
					<div class="flex flex-wrap justify-center gap-3">
						<div v-for="i in 6" :key="i"
							class="w-40 h-12 rounded-full border border-black/10 dark:border-white/10 bg-transparent animate-pulse">
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	import BlogPostSkeleton from '@/components/blog/BlogPostSkeleton.vue';
	import CategorySkeleton from './CategorySkeleton.vue';

	const props = withDefaults(defineProps<{ mode?: 'index' | 'detail' }>(), { mode: 'detail' })
	const mode = props.mode
</script>

<style scoped></style>
