<template>
	<div class="min-h-screen bg-transparent">
		<!-- Header skeleton matching AuthorDetailHeader -->
		<div class="py-8">
			<div class="container mx-auto px-4 max-w-4xl">
				<div class="flex flex-col md:flex-row items-start gap-6">
					<div class="flex-shrink-0 relative">
						<div class="w-36 h-36 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse"></div>
						<!-- post badge placeholder bottom-right -->
						<div class="absolute -bottom-2 right-2 w-8 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse">
						</div>
					</div>

					<div class="flex-1">
						<div class="animate-pulse">
							<div class="h-12 bg-zinc-200 dark:bg-zinc-700 rounded mb-3 w-3/4"></div>
							<div class="h-6 bg-zinc-200 dark:bg-zinc-700 rounded mb-4 w-1/2"></div>

							<!-- bio preview lines -->
							<div class="space-y-3 mb-4">
								<div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full"></div>
								<div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6"></div>
								<div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-4/6"></div>
							</div>

							<div class="flex items-center gap-4 mt-2">
								<div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-24"></div>
								<div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-36"></div>
							</div>
						</div>

						<div class="mt-4 flex items-center gap-3">
							<div class="flex items-center gap-3">
								<div class="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
								<div class="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
								<div class="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
							</div>
						</div>
					</div>
				</div>

				<!-- Specialties -->
				<div class="mt-8">
					<div class="h-6 w-40 bg-zinc-200 dark:bg-zinc-700 rounded mb-4 animate-pulse"></div>
					<div class="flex flex-wrap gap-2">
						<div v-for="i in 5" :key="i"
							class="px-3 py-1 rounded-full bg-transparent border border-black/10 dark:border-white/10 h-6 w-24"></div>
					</div>
				</div>
			</div>
		</div>

		<!-- Bio skeleton (larger, spaced from posts) -->
		<div class="container mx-auto px-4 max-w-4xl mt-12 mb-12">
			<div class="prose max-w-none">
				<div class="space-y-4 animate-pulse">
					<div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full"></div>
					<div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full"></div>
					<div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6"></div>
					<div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-4/6"></div>
				</div>
			</div>
		</div>

		<!-- Author's Posts skeleton -->
		<section class="container mx-auto px-4 max-w-6xl">
			<div class="mb-8 text-center animate-pulse">
				<div class="h-8 w-64 bg-zinc-200 dark:bg-zinc-700 rounded mb-2 mx-auto"></div>
				<div class="h-4 w-48 bg-zinc-200 dark:bg-zinc-700 rounded mx-auto"></div>
			</div>

			<div class="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
				<BlogPostSkeleton v-for="n in 6" :key="n" />
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
	import BlogPostSkeleton from '@/components/blog/BlogPostSkeleton.vue';
</script>
