<template>
	<div class="p-4 h-full flex flex-col min-h-0">
		<SearchSkeleton v-if="loading" />

		<div v-else>
			<div v-if="!query">
				<!-- Suggestions: recent searches and popular categories -->

				<div v-if="popularCategories && popularCategories.length" class="mb-4">
					<h4 class="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-2">Popular categories</h4>
					<div class="flex flex-wrap gap-2">
						<button v-for="c in (popularCategories || [])" :key="c.id"
							@click="$emit('select-suggestion', { text: c.name, type: 'category', slug: c.slug })"
							class="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-full text-sm text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50">
							{{ c.name }}
						</button>
					</div>
				</div>

				<!-- When there are server-side suggestion objects, render them as immediate navigable suggestions -->
				<div v-if="results && results.length && results[0].url && results[0].type" class="mb-4">
					<h4 class="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-2">Suggestions</h4>
					<div class="flex flex-col gap-2">
						<button v-for="s in results" :key="'sugg-' + s.type + '-' + (s.slug || s.title)"
							@click="$emit('select-suggestion', { text: s.title, type: s.type, url: s.url, slug: s.slug })"
							class="text-left px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800">
							<div class="font-medium text-zinc-900 dark:text-white">{{ s.title }}</div>
							<div class="text-sm text-zinc-500 dark:text-zinc-400">{{ titleForType(s.type) }}</div>
						</button>
					</div>
				</div>

				<div v-if="!(popularCategories && popularCategories.length)" class="text-sm text-zinc-500">
					Start typing to search posts, authors, categories and tags.
				</div>
			</div>

			<div v-else>
				<!-- Filtered for banner (if any) -->
				<div v-if="filteredFor" class="px-3 mb-2">
					<div class="text-xs text-zinc-500 dark:text-zinc-400">Showing results for "<span
							class="font-medium text-zinc-900 dark:text-white">{{ filteredFor.text }}</span>"
						({{ titleForType(filteredFor.type) }}) • <kbd
							class="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs">Alt+Enter</kbd> to open top
						suggestion</div>
				</div>

				<!-- Suggestions block -->
				<div v-if="suggestions && suggestions.length" class="mb-4">
					<h4 class="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-2">Suggestions</h4>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
						<button v-for="(s, idx) in suggestions" :key="'sugg-' + idx"
							@click="$emit('select-suggestion', { text: s.title, type: s.type, url: s.url, slug: s.slug })"
							class="text-left p-3 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700 transition">
							<div class="font-medium text-zinc-900 dark:text-white">{{ s.title }}</div>
							<div class="text-sm text-zinc-500 dark:text-zinc-400">{{ titleForType(s.type) }}</div>
						</button>
					</div>
				</div>

				<!-- Results header -->
				<div>
					<div v-if="results.length === 0" class="p-6 text-center text-zinc-500">
						No results for "{{ query }}"
					</div>

					<div v-else>
						<!-- Grouped header shortcuts -->
						<div v-if="filteredFor" class="px-3 mb-2">
							<div class="text-xs text-zinc-500 dark:text-zinc-400">Showing filtered results for "<span
									class="font-medium text-zinc-900 dark:text-white">{{ filteredFor.text }}</span>"
								({{ titleForType(filteredFor.type) }}) • <kbd
									class="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs">Alt+Enter</kbd> to open top
								suggestion</div>
						</div>

						<div class="flex items-center gap-3 px-3 mb-3">
							<button v-for="(g) in groups" :key="g.type" @click="jumpToGroup(g.start)"
								class="px-3 py-1 rounded-full text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700">
								{{ titleForType(g.type) }} ({{ g.count }})
							</button>
						</div>

						<div class="mb-3 px-3 text-sm text-zinc-500">Showing <span
								class="font-medium text-zinc-900 dark:text-white">{{ results.length }}</span> of {{ total }} results
						</div>

						<ul
							class="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 max-h-[70vh] overflow-y-auto">
							<!-- If preview results are provided (mixed mode), render those first as top results -->
							<li
								v-for="(r, idx) in (mode === 'mixed' && previewResults && previewResults.length ? previewResults : results)"
								:key="r.type + '-' + r.id" :ref="el => setItemRef(el, idx)"
								:class="['p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer', selectedIndex === idx ? 'bg-zinc-100 dark:bg-zinc-800' : '']"
								@click="$emit('select-result', r)">
								<div class="flex items-start gap-3">
									<div class="w-12 flex-shrink-0">
										<template v-if="getResultImage(r)">
											<img :src="getResultImage(r) || undefined" :alt="r.title"
												class="w-12 h-8 object-cover rounded-md" />
										</template>
										<template v-else>
											<component :is="iconForType(r.type)" class="w-6 h-6 text-zinc-600 dark:text-zinc-300" />
										</template>
									</div>
									<div class="flex-1">
										<div class="flex items-center justify-between gap-4">
											<div>
												<div class="font-semibold text-zinc-900 dark:text-white text-sm md:text-base lg:text-lg">
													<span v-html="r.highlightedTitle || sanitize(r.title)"></span>
												</div>
												<div class="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
													<span v-html="r.highlightedExcerpt || sanitize(r.excerpt)"></span>
												</div>
											</div>
											<div class="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
												{{ titleForType(r.type) }}</div>
										</div>
									</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import SearchSkeleton from '@/components/ui/SearchSkeleton.vue';
	import { DocumentTextIcon, FolderIcon, TagIcon, UserIcon } from '@heroicons/vue/24/outline';
	import DOMPurify from 'dompurify';
	import { toRefs, watch } from 'vue';

	type ResultItem = {
		id?: number | string
		title?: string
		type?: string
		slug?: string
		url?: string
		excerpt?: string
		highlightedTitle?: string
		highlightedExcerpt?: string
		image?: { url?: string } | string | null
		thumbnail?: { url?: string } | string | null
		published_at?: string | number | Date
		created_at?: string | number | Date
		views?: number
		popularity?: number
	}

	type CategoryItem = { id?: number | string; name?: string; slug?: string }

	interface PropsType {
		results: ResultItem[]
		suggestions: ResultItem[]
		previewResults: ResultItem[]
		loading: boolean
		query: string
		selectedIndex: number
		total: number
		popularCategories?: CategoryItem[]
		groups?: { type: string; start: number; count: number }[]
		mode?: 'idle' | 'suggest' | 'results' | 'mixed'
		filteredFor?: { text: string; type: string } | null
	}

	const props = defineProps<PropsType>()
	// Use toRefs so each prop remains reactive when passed from parent
	const { results, suggestions, previewResults, loading, query, selectedIndex, total, popularCategories, groups, filteredFor } = toRefs(props)

	const emit = defineEmits(['select-result', 'view-all', 'select-suggestion', 'jump-to'])

	const iconForType = (type?: string) => {
		if (type === 'post') return DocumentTextIcon
		if (type === 'author') return UserIcon
		if (type === 'category') return FolderIcon
		if (type === 'tag') return TagIcon
		return DocumentTextIcon
	}

	// Refs for each rendered item to support scrolling into view when selected
	const itemRefs: Array<HTMLElement | null> = []

	const setItemRef = (el: any, idx: number) => {
		// If a Vue component instance was passed, get its root element
		if (!el) {
			itemRefs[idx] = null
			return
		}
		// If element exposes $el, it's a component instance
		if (el.$el) {
			itemRefs[idx] = el.$el as HTMLElement
			return
		}
		// Otherwise assume it's a DOM element
		itemRefs[idx] = el as HTMLElement
	}

	// Watch selectedIndex to scroll into view
	watch(
		selectedIndex,
		(newIndex: number | undefined) => {
			if (typeof newIndex !== 'number') return
			const el = itemRefs[newIndex]
			if (el && typeof (el as HTMLElement).scrollIntoView === 'function') {
				; (el as HTMLElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' })
			}
		},
	)

	const titleForType = (type?: string) => {
		if (type === 'post') return 'Posts'
		if (type === 'author') return 'Authors'
		if (type === 'category') return 'Categories'
		if (type === 'tag') return 'Tags'
		return type
	}

	const jumpToGroup = (start: number) => {
		// emit an event so parent can jump selection to the group's start index
		emit('jump-to', start)
	}

	// Try to find an image URL for a result: accepts various shapes returned by API
	const getResultImage = (r: any): string | null => {
		if (!r) return null
		// common direct thumbnail
		if (typeof r.thumbnail === 'string' && r.thumbnail) return r.thumbnail
		if (typeof r.image === 'string' && r.image) return r.image
		// nested Strapi image object
		const imgObj = r.image || r.thumbnail || r.avatar || r.cover
		if (imgObj && typeof imgObj === 'object') {
			// try url property
			if (imgObj.url) return imgObj.url
			if (imgObj.data && imgObj.data.attributes && imgObj.data.attributes.url) return imgObj.data.attributes.url
		}
		return null
	}

	const sanitize = (s: string | undefined | null) => DOMPurify.sanitize(s || '')
</script>

<style scoped></style>
