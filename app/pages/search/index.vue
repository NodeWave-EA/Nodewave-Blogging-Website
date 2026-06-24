<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { useContent } from "~/composables/content";

import type { BlogAuthor, BlogCategory, BlogTag } from "~/types";

definePageMeta({
  title: "Global Hub Search",
});

const { searchMetadataCollections } = useContent();

// Initialize the SQLite FTS5 index for pages
const { status: blogSearchStatus, search: searchBlogs } = useSearchCollection("blogs");

const searchQuery = ref("");
const blogResults = ref<any[]>([]);

const metaResults = ref<{
  authors: BlogAuthor[];
  categories: BlogCategory[];
  tags: BlogTag[];
}>({
  authors: [],
  categories: [],
  tags: [],
});

const isSearchingMeta = ref(false);

// Handle queries concurrently
watch(searchQuery, async (newQuery) => {
  const cleanQuery = newQuery.trim();
  if (!cleanQuery) {
    blogResults.value = [];
    metaResults.value = {
      authors: [] as BlogAuthor[],
      categories: [] as BlogCategory[],
      tags: [] as BlogTag[],
    };
    return;
  }

  isSearchingMeta.value = true;

  try {
    const [blogs, data] = await Promise.all([
      searchBlogs(cleanQuery, {
        limit: 12,
        snippet: { columns: ["content", "title"], around: 25, tag: "mark" },
      }),
      searchMetadataCollections(cleanQuery),
    ]);

    const metadata = data as {
      authors: BlogAuthor[];
      categories: BlogCategory[];
      tags: BlogTag[];
    };

    blogResults.value = blogs;
    metaResults.value = metadata;
  }
  catch (err) {
    console.error("Search failure:", err);
  }
  finally {
    isSearchingMeta.value = false;
  }
});

// Structural computes for conditional status display
const hasResults = computed(() => {
  return (
    blogResults.value.length > 0
    || metaResults.value.authors.length > 0
    || metaResults.value.categories.length > 0
    || metaResults.value.tags.length > 0
  );
});

const totalResultsCount = computed(() => {
  return (
    blogResults.value.length
    + metaResults.value.authors.length
    + metaResults.value.categories.length
    + metaResults.value.tags.length
  );
});

const activeTabIndex = ref(0);

const tabs = computed(() => [
  { slot: "all", label: "All Results", icon: "i-lucide-layers" },
  { slot: "blogs", label: `Articles (${blogResults.value.length})`, icon: "i-lucide-book-open" },
  { slot: "authors", label: `Authors (${metaResults.value.authors.length})`, icon: "i-lucide-users" },
  { slot: "categories", label: `Categories (${metaResults.value.categories.length})`, icon: "i-lucide-folder" },
  { slot: "tags", label: `Tags (${metaResults.value.tags.length})`, icon: "i-lucide-hash" },
]);

const currentTabSlot = computed(() => tabs.value[activeTabIndex.value]?.slot || "all");

function clearSearch() {
  searchQuery.value = "";
}
</script>

<template>
  <UContainer>
    <UPage>
      <UPageBody class="mt-0">
        <div class="sticky top-(--ui-header-height,3.5rem) z-40 -mx-4 px-4 py-3 backdrop-blur-xs border-b border-neutral-200/50 dark:border-neutral-800/60 shadow-xs space-y-4">
          <div class="max-w-5xl mx-auto w-full">
            <UInput
              v-model="searchQuery"
              icon="i-lucide-search"
              size="xl"
              color="primary"
              variant="outline"
              placeholder="Search keywords, authors, tags or categories..."
              class="w-full"
              :ui="{
                base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none rounded-xl sm:text-sm font-medium transition-all duration-200',
              }"
              :loading="blogSearchStatus === 'loading' || isSearchingMeta"
              autofocus
            >
              <template #trailing>
                <UButton
                  v-if="searchQuery"
                  color="neutral"
                  variant="link"
                  icon="i-lucide-x"
                  size="xs"
                  class="hover:text-primary-500"
                  @click="clearSearch"
                />
                <UKbd
                  v-else
                  size="sm"
                  class="hidden sm:inline-flex select-none"
                >
                  /
                </UKbd>
              </template>
            </UInput>
          </div>

          <div v-if="searchQuery && hasResults" class="max-w-5xl mx-auto w-full overflow-x-auto no-scrollbar">
            <LazyUTabs
              v-model="activeTabIndex"
              :items="tabs"
              class="w-full"
              :ui="{
                list: 'relative flex p-1 rounded-xl bg-neutral-100/80 dark:bg-neutral-900/70',
                label: 'whitespace-nowrap flex items-center justify-center gap-2 text-xs font-semibold',
              }"
            />
          </div>
        </div>

        <div class="mt-6 mx-1">
          <div v-if="!searchQuery" class="text-center py-24 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/20 dark:bg-neutral-900/10">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-900 mb-4 shadow-2xs">
              <UIcon name="i-lucide-command" class="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
            </div>
            <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Start a Cross-Collection Search
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Enter keywords, author names, tags, or categories to search across all indexed content collections. Use the tabs to filter results by type.
            </p>
          </div>

          <div v-else-if="!hasResults && !isSearchingMeta" class="text-center py-20">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/20 mb-4">
              <UIcon name="i-lucide-search-code" class="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
            <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No Matches Found
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              We couldn't find any results matching your search query:
              "<span class="font-mono font-bold text-neutral-900 dark:text-white">{{ searchQuery }}</span>".
            </p>
          </div>

          <div v-else class="space-y-8">
            <div class="flex items-center justify-between text-xs font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase px-1">
              <span>
                Query Results for
                "<span class="font-bold text-neutral-900 dark:text-white">{{ searchQuery }}</span>"
              </span>
              <span>{{ totalResultsCount }} matches found</span>
            </div>

            <div class="space-y-10">
              <section v-if="(currentTabSlot === 'all' || currentTabSlot === 'authors') && metaResults.authors.length > 0" class="space-y-4">
                <h2 class="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-2 font-mono">
                  <UIcon name="i-lucide-users" class="w-4 h-4 text-primary-500" /> Team Contributors
                </h2>
                <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <NuxtLink
                    v-for="author in metaResults.authors"
                    :key="author.slug"
                    :to="`/${author.stem}`"
                    class="group flex items-center gap-3.5 p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 hover:border-primary-500/40 hover:shadow-xs transition-all duration-200"
                  >
                    <LazyUAvatar
                      :src="author.avatar?.src"
                      :alt="author.name"
                      size="md"
                      class="ring-2 ring-neutral-100 dark:ring-neutral-900 shrink-0"
                    />
                    <div class="min-w-0 flex-1">
                      <h4 class="text-xs font-bold text-neutral-900 dark:text-neutral-50 group-hover:text-primary-500 transition-colors truncate">
                        {{ author.name }}
                      </h4>
                      <p class="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5 flex items-center gap-1">
                        View profile <UIcon name="i-lucide-arrow-right" class="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                    </div>
                  </NuxtLink>
                </div>
              </section>

              <section v-if="(currentTabSlot === 'all' || currentTabSlot === 'categories') && metaResults.categories.length > 0" class="space-y-4">
                <h2 class="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-2 font-mono">
                  <UIcon name="i-lucide-folder" class="w-4 h-4 text-emerald-500" /> Content Categories
                </h2>
                <div class="flex flex-wrap gap-2.5">
                  <NuxtLink
                    v-for="category in metaResults.categories"
                    :key="category.slug"
                    :to="`/${category.stem}`"
                    class="px-3.5 py-2 rounded-xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-mono text-xs font-semibold hover:border-primary-500/40 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all shadow-3xs"
                    :style="{ color: category.color }"
                  >
                    <span class="opacity-40 mr-1.5">#</span>{{ category.name }}
                  </NuxtLink>
                </div>
              </section>

              <section v-if="(currentTabSlot === 'all' || currentTabSlot === 'tags') && metaResults.tags.length > 0" class="space-y-4">
                <h2 class="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-2 font-mono">
                  <UIcon name="i-lucide-hash" class="w-4 h-4 text-amber-500" /> Indexed Tags
                </h2>
                <div class="flex flex-wrap gap-2">
                  <NuxtLink
                    v-for="tag in metaResults.tags"
                    :key="tag.slug"
                    :to="`/${tag.stem}`"
                    class="px-3 py-1.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-900/50 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 font-mono text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
                    :style="{ color: tag.color }"
                  >
                    {{ tag.name }}
                  </NuxtLink>
                </div>
              </section>

              <section v-if="(currentTabSlot === 'all' || currentTabSlot === 'blogs') && blogResults.length > 0" class="space-y-4">
                <h2 class="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-2 font-mono">
                  <UIcon name="i-lucide-book-open" class="w-4 h-4 text-indigo-500" /> Matching Documentation & Articles
                </h2>
                <div class="grid gap-4 grid-cols-1">
                  <div
                    v-for="blog in blogResults"
                    :key="blog.id"
                    class="group relative p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 hover:border-primary-500/40 transition-all duration-200 flex flex-col gap-2 shadow-3xs hover:shadow-2xs"
                  >
                    <div class="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                      <span class="uppercase font-bold text-primary-500 bg-primary-500/5 dark:bg-primary-500/10 px-1.5 py-0.5 rounded-md">Article</span>
                      <UIcon name="i-lucide-chevron-right" class="w-2.5 h-2.5 text-neutral-300 dark:text-neutral-700" />
                      <span
                        v-for="(titleSeg, idx) in blog.titles"
                        :key="idx"
                        class="flex items-center gap-1"
                      >
                        <span class="line-clamp-1 max-w-35 sm:max-w-50">{{ titleSeg }}</span>
                        <UIcon
                          v-if="idx < blog.titles.length - 1"
                          name="i-lucide-chevron-right"
                          class="w-2.5 h-2.5 text-neutral-300 dark:text-neutral-700"
                        />
                      </span>
                    </div>

                    <h3 class="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-50 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-200 leading-snug">
                      <NuxtLink :to="blog.id" class="focus:outline-none">
                        <span class="absolute inset-0 z-20 rounded-2xl" aria-hidden="true" />
                        <span v-if="blog.snippets?.title" v-html="blog.snippets.title" />
                        <span v-else>{{ blog.title }}</span>
                      </NuxtLink>
                    </h3>

                    <p
                      v-if="blog.snippets?.content"
                      class="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2 markdown-snippet font-normal"
                      v-html="blog.snippets.content"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style>
@reference "~/assets/css/main.css";

/* Utility class to hide ugly native horizontal scrollbars on multi-tab sliders */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Enhanced Highlight Markers styling for FTS Matches */
.markdown-snippet mark,
h3 mark {
  @apply bg-primary-500/15 text-primary-600 dark:text-primary-400 rounded-md px-1 py-0.5 font-semibold mx-0.5 border border-primary-500/10;
}
</style>
