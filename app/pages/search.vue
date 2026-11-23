<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";

import { siteConfig } from "~/app.meta";
import { useContent } from "~/composables/content";

import type { BlogAuthor, BlogCategory, BlogTag } from "~/types";

definePageMeta({
  title: "Global Search Engine",
});

type SearchTabSlot = "all" | "blogs" | "authors" | "categories" | "tags";

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig().public;

const siteUrl = computed(() =>
  (config.siteUrl || "https://nodewaveblog.vercel.app").replace(/\/$/, ""),
);
const siteName = computed(() => config.siteName || siteConfig.name || "NodeWave");

const { searchMetadataCollections } = useContent();

// Initialize full-text search collection (client-only FTS5 index)
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
const activeTabSlot = ref<SearchTabSlot>("all");

// Debouncing & Race-Condition Guard
let searchTimer: ReturnType<typeof setTimeout> | null = null;
let lastSearchRequestId = 0;

// Nav Bubble Indicator state (shallowRef avoids deep-proxying DOM nodes)
const tabRefs = shallowRef<(HTMLButtonElement | null)[]>([]);
const bubbleStyles = ref({
  transform: "translateX(0px)",
  width: "0px",
  opacity: "0",
});

function setTabRef(el: unknown, index: number) {
  const next = [...tabRefs.value];
  next[index] = el
    ? (((el as { $el?: HTMLButtonElement }).$el || el) as HTMLButtonElement)
    : null;
  tabRefs.value = next;
}

const searchPageTitle = computed(() => {
  const query = searchQuery.value.trim();
  return query
    ? `Search results for "${query}"`
    : "Search Articles, Authors & Topics";
});

const searchPageDescription = computed(() => {
  const query = searchQuery.value.trim();
  return query
    ? `Explore technical documentation, posts, authors, and tags matching "${query}" on ${siteName.value}.`
    : `Search across all engineering logs, articles, author rosters, categories, and technical topics on ${siteName.value}.`;
});

// Page-Specific Meta & Social Sharing Overrides (noindex enforced globally & locally)
useSeoMeta({
  title: () => searchPageTitle.value,
  description: () => searchPageDescription.value,
  ogTitle: () => `${searchPageTitle.value} · ${siteName.value}`,
  ogDescription: () => searchPageDescription.value,
  ogImageAlt: () => `${siteName.value} Knowledge Index Search`,
  twitterTitle: () => `${searchPageTitle.value} · ${siteName.value}`,
  twitterDescription: () => searchPageDescription.value,
  robots: "noindex, follow",
});

const colorMode = useColorMode();
const ogColorMode = computed<"light" | "dark">(() =>
  colorMode.value === "light"
    ? "light"
    : "dark",
);

defineOgImage("NuxtSeo.takumi", {
  colorMode: ogColorMode.value,
  brand: siteName.value,
  tagline: "Engineering & Insights",
  badge: "Knowledge Index",
  siteUrl: siteUrl.value,
  title: "Search Articles, Authors & Topics",
  description: `Query technical documentation, engineering logs, author profiles, categories, and tags across ${siteName.value}.`,
});

// Connected Schema.org Structured Data (SearchResultsPage + Breadcrumbs)
useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: "Home", item: "/" },
      { name: "Search", item: `${siteUrl.value}/search` },
    ],
  }),

  defineWebPage({
    "@type": "SearchResultsPage",
    "@id": `${siteUrl.value}/search/#webpage`,
    "name": () => searchPageTitle.value,
    "description": () => searchPageDescription.value,
    "url": `${siteUrl.value}/search`,
    "isPartOf": { "@id": `${siteUrl.value}/#website` },
    "about": { "@id": `${siteUrl.value}/#organization` },
    "inLanguage": "en-US",
  }),
]);

// Execute Search across Indexed Collections
async function executeSearch(query: string) {
  if (import.meta.server)
    return;

  const cleanQuery = query.trim();

  // Sync query parameter to URL (?q=...)
  const currentUrlQuery = typeof route.query.q === "string"
    ? route.query.q
    : "";
  if (cleanQuery !== currentUrlQuery) {
    await router.replace({
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
    if (import.meta.server)
      return;

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

// Global Keyboard Shortcuts ('/' to focus, 'Escape' to clear or blur)
function handleGlobalKeyDown(event: KeyboardEvent) {
  if (
    event.key === "/"
    && document.activeElement?.tagName !== "INPUT"
    && document.activeElement?.tagName !== "TEXTAREA"
    && !(document.activeElement as HTMLElement | null)?.isContentEditable
  ) {
    event.preventDefault();
    focusSearchInput();
  }
  else if (event.key === "Escape" && document.activeElement === searchInputRef.value) {
    if (searchQuery.value) {
      clearSearch();
    }
    else {
      searchInputRef.value?.blur();
    }
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

const tabs = computed<Array<{ slot: SearchTabSlot; label: string; icon: string; count: number }>>(() => [
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

function handleTabKeyDown(event: KeyboardEvent, currentIndex: number) {
  const totalTabs = tabs.value.length;
  let nextIndex: number | null = null;

  if (event.key === "ArrowRight") {
    nextIndex = (currentIndex + 1) % totalTabs;
  }
  else if (event.key === "ArrowLeft") {
    nextIndex = (currentIndex - 1 + totalTabs) % totalTabs;
  }
  else if (event.key === "Home") {
    nextIndex = 0;
  }
  else if (event.key === "End") {
    nextIndex = totalTabs - 1;
  }

  if (nextIndex !== null) {
    event.preventDefault();
    const targetTab = tabs.value[nextIndex];
    if (targetTab) {
      activeTabSlot.value = targetTab.slot;
      tabRefs.value[nextIndex]?.focus();
    }
  }
}

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
  if (searchTimer)
    clearTimeout(searchTimer);
  window.removeEventListener("keydown", handleGlobalKeyDown);
  window.removeEventListener("resize", updateBubblePosition);
});

function clearSearch() {
  searchQuery.value = "";
  activeTabSlot.value = "all";
  focusSearchInput();
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
        const prefersReducedMotion = typeof window !== "undefined"
          && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReducedMotion) {
          displayValue.value = newVal;
          return;
        }

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
    <!-- Search Header -->
    <UContainer class="pt-6 pb-2 sm:pt-8 sm:pb-3">
      <div class="max-w-4xl mx-auto space-y-2">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-500/10 dark:bg-primary-400/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
          <UIcon
            name="i-lucide-search-code"
            class="h-3.5 w-3.5"
            aria-hidden="true"
          />
          <span class="font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
            Knowledge Index
          </span>
        </div>

        <h1 class="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
          Search <span class="bg-linear-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent font-extrabold">articles</span>, authors, and topics.
        </h1>
      </div>
    </UContainer>

    <!-- Sticky Search Header Bar -->
    <div class="sticky top-(--ui-header-height,3.5rem) z-40 bg-transparent transition-colors">
      <UContainer class="py-3.5 space-y-3">
        <!-- Search Landmark & Input Container -->
        <div
          role="search"
          aria-label="Site-wide search"
          class="max-w-4xl mx-auto w-full relative"
        >
          <label for="global-search-input" class="sr-only">
            Search articles, technical documentation, authors, categories, and tags
          </label>
          <div
            class="relative flex items-center rounded-xs bg-(--app-surface-subtle)/90 dark:bg-(--app-surface-subtle)/90 backdrop-blur-md border border-(--app-border) shadow-xs focus-within:ring-2 focus-within:ring-primary-500/70 focus-within:border-primary-500 transition-all"
          >
            <UIcon
              name="i-lucide-search"
              class="w-4 h-4 ml-3.5 text-neutral-500 dark:text-neutral-400 shrink-0 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="global-search-input"
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              enterkeyhint="search"
              autocomplete="off"
              spellcheck="false"
              placeholder="Search articles, technical docs, authors, or tags..."
              class="search-input-field w-full bg-transparent border-0 outline-none outline-hidden ring-0 ring-offset-0 focus:border-0 focus:outline-none focus:outline-hidden focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 py-2.5 px-3 font-sans"
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
                class="rounded-xs hover:bg-(--app-surface-hover)"
                aria-label="Clear search query"
                @click="clearSearch"
              />
              <UKbd
                v-else
                size="sm"
                class="hidden sm:inline-flex rounded-xs bg-(--app-bg)/90 border border-(--app-border) text-neutral-500 dark:text-neutral-400 font-mono text-[10px]"
              >
                /
              </UKbd>
            </div>
          </div>
        </div>

        <!-- Category Tabs Navigation -->
        <div v-if="searchQuery && hasResults" class="max-w-4xl mx-auto w-full">
          <div
            role="tablist"
            aria-label="Filter search results by content type"
            class="relative flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5"
          >
            <!-- Sliding Indicator Bubble -->
            <div
              class="absolute top-0.5 bottom-0.5 rounded-xs bg-primary-600 dark:bg-primary-500 shadow-2xs transition-all duration-300 ease-out pointer-events-none"
              :style="bubbleStyles"
              aria-hidden="true"
            />

            <button
              v-for="(tab, index) in tabs"
              :id="`search-tab-${tab.slot}`"
              :key="tab.slot"
              :ref="(el) => setTabRef(el, index)"
              type="button"
              role="tab"
              :aria-selected="activeTabSlot === tab.slot"
              :tabindex="activeTabSlot === tab.slot ? 0 : -1"
              aria-controls="search-results-panel"
              class="relative z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs font-mono text-[11px] font-semibold whitespace-nowrap transition-colors duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              :class="[
                activeTabSlot === tab.slot
                  ? 'text-white dark:text-neutral-950'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white',
              ]"
              @click="activeTabSlot = tab.slot"
              @keydown="handleTabKeyDown($event, index)"
            >
              <UIcon
                :name="tab.icon"
                class="w-3.5 h-3.5"
                aria-hidden="true"
              />
              <span>{{ tab.label }}</span>
              <span
                class="px-1.5 py-0.2 text-[9px] rounded-xs font-mono font-bold transition-colors"
                :class="[
                  activeTabSlot === tab.slot
                    ? 'bg-white/20 text-white dark:bg-black/15 dark:text-neutral-950'
                    : 'bg-(--app-bg)/85 border border-(--app-border) text-neutral-600 dark:text-neutral-300',
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
          class="text-center py-16 px-4 rounded-xs border border-dashed border-(--app-border) bg-(--app-surface-subtle)/40 space-y-5"
          role="status"
        >
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-xs bg-(--app-surface-subtle) text-primary-500 border border-(--app-border) shadow-2xs">
            <UIcon
              name="i-lucide-search-code"
              class="w-6 h-6"
              aria-hidden="true"
            />
          </div>
          <div class="space-y-1.5 max-w-md mx-auto">
            <h2 class="text-xs font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Cross-Collection Technical Search
            </h2>
            <p class="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Type any keyword, author name, category, or tag to query our technical knowledge base. Press
              <UKbd size="sm" class="rounded-xs bg-(--app-bg) border border-(--app-border) font-mono text-[10px]">
                /
              </UKbd>
              anywhere to focus.
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-2 pt-1">
            <NuxtLink
              to="/blogs"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-semibold border border-(--app-border) bg-(--app-surface-subtle)/80 text-neutral-700 dark:text-neutral-200 hover:bg-(--app-surface-hover) hover:border-primary-500/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <UIcon
                name="i-lucide-book-open"
                class="w-3.5 h-3.5 text-primary-500"
                aria-hidden="true"
              />
              <span>All Articles</span>
            </NuxtLink>
            <NuxtLink
              to="/authors"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-semibold border border-(--app-border) bg-(--app-surface-subtle)/80 text-neutral-700 dark:text-neutral-200 hover:bg-(--app-surface-hover) hover:border-primary-500/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <UIcon
                name="i-lucide-users"
                class="w-3.5 h-3.5 text-primary-500"
                aria-hidden="true"
              />
              <span>Authors</span>
            </NuxtLink>
            <NuxtLink
              to="/categories"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-semibold border border-(--app-border) bg-(--app-surface-subtle)/80 text-neutral-700 dark:text-neutral-200 hover:bg-(--app-surface-hover) hover:border-primary-500/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <UIcon
                name="i-lucide-folder"
                class="w-3.5 h-3.5 text-emerald-500"
                aria-hidden="true"
              />
              <span>Categories</span>
            </NuxtLink>
            <NuxtLink
              to="/tags"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-semibold border border-(--app-border) bg-(--app-surface-subtle)/80 text-neutral-700 dark:text-neutral-200 hover:bg-(--app-surface-hover) hover:border-primary-500/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <UIcon
                name="i-lucide-hash"
                class="w-3.5 h-3.5 text-sky-500"
                aria-hidden="true"
              />
              <span>Tags</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Skeleton Loader -->
        <div
          v-else-if="!hasResults && (isSearchingMeta || blogSearchStatus === 'loading')"
          class="space-y-4 py-4"
          aria-label="Searching knowledge base"
        >
          <div class="flex items-center justify-between font-mono text-xs text-neutral-400 animate-pulse" aria-hidden="true">
            <USkeleton class="h-3 w-32 bg-(--app-surface-subtle) rounded-xs" />
            <USkeleton class="h-3 w-20 bg-(--app-surface-subtle) rounded-xs" />
          </div>
          <div
            v-for="i in 3"
            :key="i"
            class="p-4 sm:p-5 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 backdrop-blur-xs ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.4)] space-y-3 animate-pulse"
            aria-hidden="true"
          >
            <USkeleton class="h-3 w-24 bg-(--app-bg) opacity-85 rounded-xs" />
            <USkeleton class="h-4 w-3/4 bg-(--app-bg) opacity-95 rounded-xs" />
            <USkeleton class="h-3 w-full bg-(--app-bg) opacity-65 rounded-xs" />
          </div>
        </div>

        <!-- No Results Found -->
        <div
          v-else-if="!hasResults"
          class="text-center py-20 px-4 rounded-xs border border-dashed border-(--app-border) bg-(--app-surface-subtle)/40 space-y-4"
          role="status"
          aria-live="polite"
        >
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <UIcon
              name="i-lucide-file-x-2"
              class="w-6 h-6"
              aria-hidden="true"
            />
          </div>
          <div class="space-y-1.5 max-w-sm mx-auto">
            <h2 class="text-xs font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              No Matches Found
            </h2>
            <p class="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              We couldn't find anything matching "<span class="font-mono font-bold text-neutral-900 dark:text-white">{{ searchQuery }}</span>".
            </p>
          </div>
          <UButton
            label="Clear Search"
            color="neutral"
            variant="subtle"
            size="xs"
            class="rounded-xs"
            @click="clearSearch"
          />
        </div>

        <!-- Active Results Tab Panel -->
        <div
          v-else
          id="search-results-panel"
          role="tabpanel"
          :aria-labelledby="`search-tab-${activeTabSlot}`"
          class="space-y-8"
        >
          <!-- Result Counter Bar -->
          <div
            class="flex items-center justify-between text-[10px] font-mono tracking-wider text-neutral-500 dark:text-neutral-400 uppercase pb-2.5 border-b border-(--app-border)"
            aria-live="polite"
          >
            <span>
              Results for "<span class="font-bold text-neutral-900 dark:text-white">{{ searchQuery }}</span>"
            </span>
            <span><AnimatedNumber :value="totalResultsCount" /> {{ totalResultsCount === 1 ? "match" : "matches" }}</span>
          </div>

          <!-- Authors Section -->
          <section
            v-if="(activeTabSlot === 'all' || activeTabSlot === 'authors') && metaResults.authors.length > 0"
            aria-labelledby="search-authors-heading"
            class="space-y-3"
          >
            <h2 id="search-authors-heading" class="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest flex items-center gap-2 font-mono">
              <UIcon
                name="i-lucide-users"
                class="w-3.5 h-3.5 text-primary-500"
                aria-hidden="true"
              />
              Authors ({{ metaResults.authors.length }})
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <NuxtLink
                v-for="author in metaResults.authors"
                :key="author.slug || author.stem"
                :to="`/${author.stem}`"
                class="group relative flex flex-col justify-between p-4 sm:p-5 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 backdrop-blur-xs ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-(--app-surface-hover)/90 dark:hover:bg-(--app-surface-hover) hover:border-primary-500/40 hover:shadow-[0_10px_24px_-4px_rgba(0,0,0,0.1),0_18px_36px_-8px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_14px_32px_-4px_rgba(0,0,0,0.65),0_22px_44px_-8px_rgba(0,0,0,0.5)] select-none h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                :aria-label="`View author profile for ${author.name} (${author.count || 0} ${author.count === 1 ? 'article' : 'articles'})`"
              >
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <UAvatar
                      :src="author.avatar?.src"
                      :alt="`Portrait of ${author.name}`"
                      size="sm"
                      class="ring-1 ring-(--app-border) shrink-0"
                    />
                    <div class="min-w-0 flex-1">
                      <h3 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors truncate">
                        {{ author.name }}
                      </h3>
                      <p v-if="author.title" class="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {{ author.title }}
                      </p>
                    </div>
                  </div>

                  <p v-if="author.description" class="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2 font-normal">
                    {{ author.description }}
                  </p>
                </div>

                <div class="pt-3 border-t border-(--app-border) flex items-center justify-between text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 group-hover:text-primary-500 transition-colors mt-4">
                  <span>{{ author.count || 0 }} {{ author.count === 1 ? "Article" : "Articles" }}</span>
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200"
                    aria-hidden="true"
                  />
                </div>
              </NuxtLink>
            </div>
          </section>

          <!-- Categories Section -->
          <section
            v-if="(activeTabSlot === 'all' || activeTabSlot === 'categories') && metaResults.categories.length > 0"
            aria-labelledby="search-categories-heading"
            class="space-y-3"
          >
            <h2 id="search-categories-heading" class="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest flex items-center gap-2 font-mono">
              <UIcon
                name="i-lucide-folder"
                class="w-3.5 h-3.5 text-emerald-500"
                aria-hidden="true"
              />
              Categories ({{ metaResults.categories.length }})
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
            aria-labelledby="search-tags-heading"
            class="space-y-3"
          >
            <h2 id="search-tags-heading" class="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest flex items-center gap-2 font-mono">
              <UIcon
                name="i-lucide-hash"
                class="w-3.5 h-3.5 text-sky-500"
                aria-hidden="true"
              />
              Tags ({{ metaResults.tags.length }})
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
            aria-labelledby="search-articles-heading"
            class="space-y-3"
          >
            <h2 id="search-articles-heading" class="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest flex items-center gap-2 font-mono">
              <UIcon
                name="i-lucide-book-open"
                class="w-3.5 h-3.5 text-indigo-500"
                aria-hidden="true"
              />
              Articles & Posts ({{ blogResults.length }})
            </h2>
            <div class="grid grid-cols-1 gap-3.5 sm:gap-4">
              <article
                v-for="blog in blogResults"
                :key="blog.id"
                class="group relative p-4 sm:p-5 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 backdrop-blur-xs ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-(--app-surface-hover)/90 dark:hover:bg-(--app-surface-hover) hover:border-primary-500/40 hover:shadow-[0_10px_24px_-4px_rgba(0,0,0,0.1),0_18px_36px_-8px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_14px_32px_-4px_rgba(0,0,0,0.65),0_22px_44px_-8px_rgba(0,0,0,0.5)] flex flex-col gap-2"
              >
                <div class="flex flex-wrap items-center gap-1.5 text-[9px] font-mono text-neutral-500 dark:text-neutral-400">
                  <span class="uppercase font-bold text-primary-600 dark:text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded-xs border border-primary-500/20">
                    Article
                  </span>
                  <UIcon
                    v-if="blog.titles?.length"
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

                <h3 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors duration-200 leading-snug tracking-tight">
                  <NuxtLink
                    :to="blog.id"
                    class="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xs"
                    :aria-label="`Read article: ${blog.title}`"
                  >
                    <span class="absolute inset-0 z-20" aria-hidden="true" />
                    <span v-if="blog.snippets?.title" v-html="blog.snippets.title" />
                    <span v-else>{{ blog.title }}</span>
                  </NuxtLink>
                </h3>

                <p
                  v-if="blog.snippets?.content || blog.description"
                  class="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2 markdown-snippet font-normal"
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
h3 mark {
  background-color: color-mix(in srgb, var(--ui-primary) 16%, transparent);
  color: var(--ui-primary);
  border-radius: 2px;
  padding: 1px 3px;
  font-weight: 600;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 30%, transparent);
}
</style>
