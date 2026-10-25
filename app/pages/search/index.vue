<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

import { useContent } from "~/composables/content";

import type { BlogAuthor, BlogCategory, BlogTag } from "~/types";

definePageMeta({
  title: "Global Search Engine",
});

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const siteUrl = (config.public.siteUrl || "").replace(/\/$/, "");

const { searchMetadataCollections } = useContent();

// Initialize full-text search collection
const { status: blogSearchStatus, search: searchBlogs } = useSearchCollection("blogs");

// Search state
const searchQuery = ref(typeof route.query.q === "string"
  ? route.query.q
  : "");
const searchInputRef = ref<HTMLInputElement | null>(null);
const blogResults = ref<any[]>([]);

const metaResults = ref<{
  authors: Array<BlogAuthor & { count?: number }>;
  categories: Array<BlogCategory & { count?: number }>;
  tags: Array<BlogTag & { count?: number }>;
}>({
  authors: [],
  categories: [],
  tags: [],
});

const isSearchingMeta = ref(false);
const activeTabSlot = ref<"all" | "blogs" | "authors" | "categories" | "tags">("all");

// Debouncing & Race-Condition Guard
let searchTimer: ReturnType<typeof setTimeout> | null = null;
let lastSearchRequestId = 0;

// Nav Bubble Indicator state
const tabRefs = ref<(HTMLElement | null)[]>([]);
const bubbleStyles = ref({
  transform: "translateX(0px)",
  width: "0px",
  opacity: "0",
});

function setTabRef(el: any, index: number) {
  if (!el) {
    tabRefs.value[index] = null;
    return;
  }
  tabRefs.value[index] = el.$el || el;
}

const searchPageTitle = computed(() => {
  const query = searchQuery.value.trim();
  return query
    ? `Search results for "${query}" | NodeWave`
    : "Search Articles, Authors & Topics | NodeWave";
});

const searchPageDescription = computed(() => {
  const query = searchQuery.value.trim();
  return query
    ? `Explore technical documentation, posts, authors, and tags matching "${query}" on NodeWave.`
    : "Search across all engineering logs, articles, author rosters, categories, and technical topics on NodeWave.";
});

useSeoMeta({
  title: searchPageTitle,
  ogTitle: searchPageTitle,
  twitterTitle: searchPageTitle,
  description: searchPageDescription,
  ogDescription: searchPageDescription,
  twitterDescription: searchPageDescription,
  robots: "noindex, follow",
});

useHead({
  link: [
    {
      rel: "canonical",
      href: `${siteUrl}/search`,
    },
  ],
});

useSchemaOrg([
  defineWebPage({
    "@type": "SearchResultsPage",
    "name": searchPageTitle.value,
    "description": searchPageDescription.value,
    "url": `${siteUrl}/search`,
  }),
]);

// Execute Search across Indexed Collections
async function executeSearch(query: string) {
  const cleanQuery = query.trim();

  // Sync query parameter to URL (?q=...)
  const currentUrlQuery = typeof route.query.q === "string"
    ? route.query.q
    : "";
  if (cleanQuery !== currentUrlQuery) {
    router.replace({
      query: {
        ...route.query,
        q: cleanQuery || undefined,
      },
    });
  }

  if (!cleanQuery) {
    blogResults.value = [];
    metaResults.value = { authors: [], categories: [], tags: [] };
    isSearchingMeta.value = false;
    activeTabSlot.value = "all";
    return;
  }

  const requestId = ++lastSearchRequestId;
  isSearchingMeta.value = true;

  try {
    const [blogs, data] = await Promise.all([
      searchBlogs(cleanQuery, {
        limit: 20,
        snippet: {
          columns: ["content", "title"],
          around: 30,
          tag: "mark",
        },
      }),
      searchMetadataCollections(cleanQuery),
    ]);

    if (requestId !== lastSearchRequestId)
      return;

    blogResults.value = blogs || [];
    metaResults.value = (data as typeof metaResults.value) || {
      authors: [],
      categories: [],
      tags: [],
    };
  }
  catch (err) {
    if (requestId === lastSearchRequestId) {
      console.error("Search failure:", err);
    }
  }
  finally {
    if (requestId === lastSearchRequestId) {
      isSearchingMeta.value = false;
    }
  }
}

watch(
  [searchQuery, blogSearchStatus],
  ([newQuery, newStatus], [_, oldStatus]) => {
    if (searchTimer)
      clearTimeout(searchTimer);

    if (!newQuery.trim()) {
      executeSearch("");
      return;
    }

    const isStatusReadyTransition = oldStatus !== newStatus && newStatus !== "loading";
    const delay = isStatusReadyTransition ? 0 : 250;

    searchTimer = setTimeout(() => {
      executeSearch(newQuery);
    }, delay);
  },
  { immediate: true },
);

watch(
  () => route.query.q,
  (newUrlQuery) => {
    const queryStr = typeof newUrlQuery === "string"
      ? newUrlQuery
      : "";
    if (queryStr !== searchQuery.value) {
      searchQuery.value = queryStr;
    }
  },
);

// Global Keyboard Shortcuts ('/' to focus, 'Escape' to clear)
function handleGlobalKeyDown(event: KeyboardEvent) {
  if (
    event.key === "/"
    && document.activeElement?.tagName !== "INPUT"
    && document.activeElement?.tagName !== "TEXTAREA"
  ) {
    event.preventDefault();
    focusSearchInput();
  }
  else if (event.key === "Escape" && document.activeElement?.tagName === "INPUT") {
    clearSearch();
  }
}

function focusSearchInput() {
  searchInputRef.value?.focus();
}

const totalResultsCount = computed(() => {
  return (
    blogResults.value.length
    + metaResults.value.authors.length
    + metaResults.value.categories.length
    + metaResults.value.tags.length
  );
});

const hasResults = computed(() => totalResultsCount.value > 0);

const tabs = computed(() => [
  {
    slot: "all",
    label: "All Results",
    icon: "i-lucide-layers",
    count: totalResultsCount.value,
  },
  {
    slot: "blogs",
    label: "Articles",
    icon: "i-lucide-book-open",
    count: blogResults.value.length,
  },
  {
    slot: "authors",
    label: "Authors",
    icon: "i-lucide-users",
    count: metaResults.value.authors.length,
  },
  {
    slot: "categories",
    label: "Categories",
    icon: "i-lucide-folder",
    count: metaResults.value.categories.length,
  },
  {
    slot: "tags",
    label: "Tags",
    icon: "i-lucide-hash",
    count: metaResults.value.tags.length,
  },
]);

async function updateBubblePosition() {
  await nextTick();
  const activeIndex = tabs.value.findIndex(t => t.slot === activeTabSlot.value);
  if (activeIndex === -1 || !tabRefs.value[activeIndex]) {
    bubbleStyles.value.opacity = "0";
    return;
  }

  const activeEl = tabRefs.value[activeIndex]!;
  bubbleStyles.value = {
    transform: `translateX(${activeEl.offsetLeft}px)`,
    width: `${activeEl.offsetWidth}px`,
    opacity: "1",
  };
}

watch([activeTabSlot, totalResultsCount], () => {
  updateBubblePosition();
});

onMounted(() => {
  window.addEventListener("keydown", handleGlobalKeyDown);
  window.addEventListener("resize", updateBubblePosition);
  updateBubblePosition();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeyDown);
  window.removeEventListener("resize", updateBubblePosition);
});

function clearSearch() {
  searchQuery.value = "";
  activeTabSlot.value = "all";
}

const AnimatedNumber = defineComponent({
  props: {
    value: { type: Number, required: true },
  },
  setup(props) {
    const displayValue = ref(props.value);
    let animationFrameId: number | null = null;

    watch(
      () => props.value,
      (newVal) => {
        const startVal = displayValue.value;
        const diff = newVal - startVal;
        if (diff === 0)
          return;

        const duration = 400;
        const startTime = performance.now();

        if (animationFrameId !== null)
          cancelAnimationFrame(animationFrameId);

        const step = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - (1 - progress) ** 3;

          displayValue.value = Math.round(startVal + diff * easeOut);

          if (progress < 1) {
            animationFrameId = requestAnimationFrame(step);
          }
          else {
            animationFrameId = null;
          }
        };

        animationFrameId = requestAnimationFrame(step);
      },
      { immediate: true },
    );

    onUnmounted(() => {
      if (animationFrameId !== null)
        cancelAnimationFrame(animationFrameId);
    });

    return () => h("span", displayValue.value);
  },
});
</script>

<template>
  <div class="min-h-screen text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
    <!-- Sticky Search Header Bar -->
    <div class="sticky top-(--ui-header-height,3.5rem) z-40 bg-background/90 backdrop-blur-md border-b border-[#e8e3d8] dark:border-[#26231f] transition-colors">
      <UContainer class="py-3.5 space-y-3">
        <!-- Search Input Container -->
        <div class="max-w-4xl mx-auto w-full relative">
          <div
            class="relative flex items-center rounded-xs bg-[#f2eee5] dark:bg-[#1c1a17] border border-[#e0dad0]/80 dark:border-[#2a2722] shadow-2xs focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all"
          >
            <UIcon
              name="i-lucide-search"
              class="w-4 h-4 ml-3.5 text-neutral-400 shrink-0 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search articles, technical docs, authors, or tags..."
              class="search-input-field w-full bg-transparent border-0 outline-none outline-hidden ring-0 ring-offset-0 focus:border-0 focus:outline-none focus:outline-hidden focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 py-2.5 px-3 font-sans"
              autofocus
            >

            <div class="flex items-center gap-1.5 mr-3 shrink-0">
              <UIcon
                v-if="blogSearchStatus === 'loading' || isSearchingMeta"
                name="i-lucide-loader"
                class="w-4 h-4 text-primary-500 animate-spin"
                aria-hidden="true"
              />
              <UButton
                v-else-if="searchQuery"
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                size="xs"
                class="rounded-xs hover:bg-[#e8e3d8] dark:hover:bg-[#282520]"
                aria-label="Clear search query"
                @click="clearSearch"
              />
              <UKbd
                v-else
                size="sm"
                class="hidden sm:inline-flex rounded-xs bg-[#e8e3d8]/80 dark:bg-[#26231f] border-[#d8d2c4] dark:border-[#332f29] text-neutral-500 font-mono text-[10px]"
              >
                /
              </UKbd>
            </div>
          </div>
        </div>

        <!-- Category Tabs Navigation -->
        <div v-if="searchQuery && hasResults" class="max-w-4xl mx-auto w-full">
          <div class="relative flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <!-- Sliding Indicator Bubble -->
            <div
              class="absolute top-0.5 bottom-0.5 rounded-xs bg-primary-500 shadow-2xs transition-all duration-300 ease-out pointer-events-none"
              :style="bubbleStyles"
            />

            <button
              v-for="(tab, index) in tabs"
              :key="tab.slot"
              :ref="(el) => setTabRef(el, index)"
              class="relative z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs font-mono text-[11px] font-semibold whitespace-nowrap transition-colors duration-200 select-none cursor-pointer focus-visible:ring-1 focus-visible:ring-primary-500"
              :class="[
                activeTabSlot === tab.slot
                  ? 'text-white dark:text-neutral-950'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
              ]"
              @click="activeTabSlot = (tab.slot as any)"
            >
              <UIcon
                :name="tab.icon"
                class="w-3.5 h-3.5"
                aria-hidden="true"
              />
              <span>{{ tab.label }}</span>
              <span
                class="px-1 py-0.2 text-[9px] rounded-xs font-mono font-bold transition-colors"
                :class="[
                  activeTabSlot === tab.slot
                    ? 'bg-white/20 text-white dark:bg-black/15 dark:text-neutral-950'
                    : 'bg-[#e0dad0]/80 dark:bg-[#282520] text-neutral-600 dark:text-neutral-400',
                ]"
              >
                <AnimatedNumber :value="tab.count" />
              </span>
            </button>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Main Results Container -->
    <UContainer class="py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Empty Query State -->
        <div
          v-if="!searchQuery"
          class="text-center py-20 px-4 rounded-xs border border-dashed border-[#e8e3d8] dark:border-[#26231f] bg-[#faf7f2]/50 dark:bg-[#141311]/50 space-y-3"
          role="status"
        >
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xs bg-[#f2eee5] dark:bg-[#1c1a17] text-primary-500 border border-[#e0dad0]/60 dark:border-[#2a2722]">
            <UIcon
              name="i-lucide-search-code"
              class="w-5 h-5"
              aria-hidden="true"
            />
          </div>
          <div class="space-y-1 max-w-md mx-auto">
            <h2 class="text-xs font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Cross-Collection Technical Search
            </h2>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Type any keyword, author name, category, or tag to query our technical knowledge base. Press <UKbd size="sm" class="rounded-xs font-mono text-[10px]">
                /
              </UKbd> anywhere to focus.
            </p>
          </div>
        </div>

        <!-- Skeleton Loader -->
        <div v-else-if="!hasResults && (isSearchingMeta || blogSearchStatus === 'loading')" class="space-y-4 py-4">
          <div class="flex items-center justify-between font-mono text-xs text-neutral-400 animate-pulse">
            <div class="h-3 w-32 bg-[#e8e3d8] dark:bg-[#282520] rounded-xs" />
            <div class="h-3 w-20 bg-[#e8e3d8] dark:bg-[#282520] rounded-xs" />
          </div>
          <div
            v-for="i in 3"
            :key="i"
            class="p-4 rounded-xs border border-[#e8e3d8] dark:border-[#26231f] bg-[#faf7f2] dark:bg-[#141311] space-y-3 animate-pulse"
          >
            <div class="h-3 w-24 bg-[#e8e3d8] dark:bg-[#282520] rounded-xs" />
            <div class="h-4 w-3/4 bg-[#e8e3d8] dark:bg-[#282520] rounded-xs" />
            <div class="h-3 w-full bg-[#e8e3d8] dark:bg-[#282520] rounded-xs" />
          </div>
        </div>

        <!-- No Results Found -->
        <div
          v-else-if="!hasResults"
          class="text-center py-20 px-4 rounded-xs border border-dashed border-[#e8e3d8] dark:border-[#26231f] bg-[#faf7f2]/50 dark:bg-[#141311]/50 space-y-3"
          role="status"
        >
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xs bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <UIcon
              name="i-lucide-file-x-2"
              class="w-5 h-5"
              aria-hidden="true"
            />
          </div>
          <div class="space-y-1 max-w-sm mx-auto">
            <h3 class="text-xs font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              No Matches Found
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              We couldn't find anything matching "<span class="font-mono font-bold text-neutral-900 dark:text-white">{{ searchQuery }}</span>".
            </p>
          </div>
        </div>

        <!-- Active Results List -->
        <div v-else class="space-y-8">
          <!-- Result Counter Bar -->
          <div class="flex items-center justify-between text-[10px] font-mono tracking-wider text-neutral-500 dark:text-neutral-400 uppercase pb-2 border-b border-[#e8e3d8] dark:border-[#26231f]">
            <span>
              Results for "<span class="font-bold text-neutral-900 dark:text-white">{{ searchQuery }}</span>"
            </span>
            <span><AnimatedNumber :value="totalResultsCount" /> matches</span>
          </div>

          <!-- Authors Section -->
          <section
            v-if="(activeTabSlot === 'all' || activeTabSlot === 'authors') && metaResults.authors.length > 0"
            aria-label="Matched authors"
            class="space-y-3"
          >
            <h3 class="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest flex items-center gap-2 font-mono">
              <UIcon
                name="i-lucide-users"
                class="w-3.5 h-3.5 text-primary-500"
                aria-hidden="true"
              /> Authors ({{ metaResults.authors.length }})
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#e8e3d8] dark:border-[#26231f] rounded-xs overflow-hidden shadow-xs">
              <NuxtLink
                v-for="author in metaResults.authors"
                :key="author.slug"
                :to="`/${author.stem}`"
                class="group relative flex flex-col justify-between p-4 sm:p-5 border-b border-r border-[#e8e3d8] dark:border-[#26231f] bg-[#faf7f2] dark:bg-[#141311] hover:bg-[#f3eee4] dark:hover:bg-[#1a1816] transition-colors duration-200 select-none h-full w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500"
              >
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <UAvatar
                      :src="author.avatar?.src"
                      :alt="author.name"
                      size="sm"
                      class="ring-1 ring-[#e0dad0] dark:ring-[#2d2a24] shrink-0"
                    />
                    <div class="min-w-0 flex-1">
                      <h4 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors truncate">
                        {{ author.name }}
                      </h4>
                      <p v-if="author.title" class="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {{ author.title }}
                      </p>
                    </div>
                  </div>

                  <p v-if="author.description" class="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2 font-normal">
                    {{ author.description }}
                  </p>
                </div>

                <div class="pt-3 border-t border-[#e8e3d8] dark:border-[#26231f] flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 group-hover:text-primary-500 transition-colors mt-4">
                  <span>{{ author.count || 0 }} {{ author.count === 1 ? 'Article' : 'Articles' }}</span>
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </div>
              </NuxtLink>
            </div>
          </section>

          <!-- Categories Section -->
          <section
            v-if="(activeTabSlot === 'all' || activeTabSlot === 'categories') && metaResults.categories.length > 0"
            aria-label="Matched categories"
            class="space-y-3"
          >
            <h3 class="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest flex items-center gap-2 font-mono">
              <UIcon
                name="i-lucide-folder"
                class="w-3.5 h-3.5 text-emerald-500"
                aria-hidden="true"
              /> Categories ({{ metaResults.categories.length }})
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#e8e3d8] dark:border-[#26231f] rounded-xs overflow-hidden shadow-xs">
              <BaseTaxonomyCard
                v-for="category in metaResults.categories"
                :key="category.slug"
                :item="category"
                fallback-icon="i-lucide-folder-open"
                type-label="category"
              />
            </div>
          </section>

          <!-- Tags Section -->
          <section
            v-if="(activeTabSlot === 'all' || activeTabSlot === 'tags') && metaResults.tags.length > 0"
            aria-label="Matched tags"
            class="space-y-3"
          >
            <h3 class="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest flex items-center gap-2 font-mono">
              <UIcon
                name="i-lucide-hash"
                class="w-3.5 h-3.5 text-amber-500"
                aria-hidden="true"
              /> Tags ({{ metaResults.tags.length }})
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#e8e3d8] dark:border-[#26231f] rounded-xs overflow-hidden shadow-xs">
              <BaseTaxonomyCard
                v-for="tag in metaResults.tags"
                :key="tag.slug"
                :item="tag"
                fallback-icon="i-lucide-hash"
                type-label="tag"
              />
            </div>
          </section>

          <!-- Articles / Blogs Section -->
          <section
            v-if="(activeTabSlot === 'all' || activeTabSlot === 'blogs') && blogResults.length > 0"
            aria-label="Matched articles"
            class="space-y-3"
          >
            <h3 class="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest flex items-center gap-2 font-mono">
              <UIcon
                name="i-lucide-book-open"
                class="w-3.5 h-3.5 text-indigo-500"
                aria-hidden="true"
              /> Articles & Posts ({{ blogResults.length }})
            </h3>
            <div class="grid grid-cols-1 border-t border-l border-[#e8e3d8] dark:border-[#26231f] rounded-xs overflow-hidden shadow-xs">
              <article
                v-for="blog in blogResults"
                :key="blog.id"
                class="group relative p-4 sm:p-5 border-b border-r border-[#e8e3d8] dark:border-[#26231f] bg-[#faf7f2] dark:bg-[#141311] hover:bg-[#f3eee4] dark:hover:bg-[#1a1816] transition-colors duration-200 flex flex-col gap-2"
              >
                <div class="flex flex-wrap items-center gap-1.5 text-[9px] font-mono text-neutral-500 dark:text-neutral-400">
                  <span class="uppercase font-bold text-primary-500 bg-primary-500/10 px-1.5 py-0 rounded-xs border border-primary-500/20">
                    Article
                  </span>
                  <UIcon
                    name="i-lucide-chevron-right"
                    class="w-2.5 h-2.5 text-neutral-400"
                    aria-hidden="true"
                  />
                  <span
                    v-for="(titleSeg, idx) in blog.titles"
                    :key="idx"
                    class="flex items-center gap-1"
                  >
                    <span class="line-clamp-1 max-w-40 sm:max-w-60">{{ titleSeg }}</span>
                    <UIcon
                      v-if="+idx < blog.titles.length - 1"
                      name="i-lucide-chevron-right"
                      class="w-2.5 h-2.5 text-neutral-400"
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <h4 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors duration-200 leading-snug tracking-tight">
                  <NuxtLink :to="blog.id" class="focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 rounded-xs">
                    <span class="absolute inset-0 z-20" aria-hidden="true" />
                    <span v-if="blog.snippets?.title" v-html="blog.snippets.title" />
                    <span v-else>{{ blog.title }}</span>
                  </NuxtLink>
                </h4>

                <p
                  v-if="blog.snippets?.content || blog.description"
                  class="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2 markdown-snippet font-normal"
                  v-html="blog.snippets?.content || blog.description"
                />
              </article>
            </div>
          </section>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<style>
/* Hide scrollbars for pill navigation bar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Ensure inner search input never renders duplicate focus rings */
.search-input-field,
.search-input-field:focus,
.search-input-field:focus-visible,
.search-input-field:active {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

/* Highlight Markers for Search Matches */
.markdown-snippet mark,
h4 mark {
  background-color: rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.18);
  color: var(--ui-primary, #6366f1);
  border-radius: 2px;
  padding: 1px 3px;
  font-weight: 600;
  border: 1px solid rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.25);
}
</style>
