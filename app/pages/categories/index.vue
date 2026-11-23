<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";

import RssSubscribeButton from "~/components/ui/rss-subscribe-button.vue";
import { useContent } from "~/composables/content";
import { useMatrixDecrypt } from "~/composables/use-matrix-decrypt";

definePageMeta({
  title: "Browse by Categories",
});

const { getAllCategories } = useContent();

const itemsPerPage = 12;
const displayLimit = ref(itemsPerPage);

const { data: rawCategories, pending: categoriesPending } = await getAllCategories(displayLimit);

const enrichedCategories = computed(() => rawCategories.value || []);

const hasMoreContent = computed(() => {
  if (!rawCategories.value)
    return false;
  return rawCategories.value.length >= displayLimit.value;
});

useInfiniteScroll(
  typeof window !== "undefined"
    ? window
    : null,
  () => {
    if (hasMoreContent.value && !categoriesPending.value) {
      displayLimit.value += itemsPerPage;
    }
  },
  {
    distance: 250,
    canLoadMore: () => hasMoreContent.value,
  },
);

const { activeHoverText, startDecryption } = useMatrixDecrypt({
  speed: 25,
  revealStep: 0.35,
});

onMounted(() => {
  startDecryption("Explore Categories", "categories-badge");
});

const config = useRuntimeConfig().public;

const PAGE_TITLE = computed(() => `Browse by Categories — Technical Topics & Domains`);
const PAGE_DESCRIPTION = computed(
  () => "Explore all technical articles, architecture notes, and software development guides organized by category and subject area on Nodewave.",
);
const PAGE_CANONICAL_URL = computed(() => `${config.siteUrl}/categories`);
const CATEGORIES_INDEX_RSS_URL = computed(() => `/categories/rss.xml`);

// Meta & Social Sharing Tags
useSeoMeta({
  title: () => PAGE_TITLE.value,
  description: () => PAGE_DESCRIPTION.value,
  keywords: "nodewave, categories, topics, taxonomy, software engineering, architecture, web development, articles, tutorials",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",

  // Open Graph / Facebook
  ogType: "website",
  ogTitle: () => PAGE_TITLE.value,
  ogDescription: () => PAGE_DESCRIPTION.value,
  ogUrl: () => PAGE_CANONICAL_URL.value,
  ogImageAlt: () => `${config.siteName || "Nodewave"} Categories Archive`,
  ogSiteName: () => config.siteName || "Nodewave",

  // Twitter
  twitterCard: "summary_large_image",
  twitterTitle: () => PAGE_TITLE.value,
  twitterDescription: () => PAGE_DESCRIPTION.value,
});

useHead({
  link: [
    {
      rel: "canonical",
      href: () => PAGE_CANONICAL_URL.value,
    },
    {
      rel: "alternate",
      type: "application/rss+xml",
      title: "NodeWave — Categories Directory RSS Feed",
      href: () => `${PAGE_CANONICAL_URL.value}/rss.xml`,
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/icons/favicon.png",
    },
  ],
});

defineOgImage("NuxtSeo.takumi", {
  title: PAGE_TITLE.value,
  description: PAGE_DESCRIPTION.value,
  brand: config.siteName,
  colorMode: "light",
  isPro: true,
});

// Nuxt Schema.org Structured Data (Google CollectionPage & Breadcrumbs)
useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: "Home", item: "/" },
      { name: "Categories", item: PAGE_CANONICAL_URL.value },
    ],
  }),

  {
    "@type": "CollectionPage",
    "@id": `${PAGE_CANONICAL_URL.value}/#collectionpage`,
    "url": PAGE_CANONICAL_URL.value,
    "name": PAGE_TITLE.value,
    "description": PAGE_DESCRIPTION.value,
  },
]);
</script>

<template>
  <UContainer class="py-4 sm:py-6">
    <UPage>
      <UPageHeader
        class="mb-12"
        :ui="{
          title: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1]',
          description: 'text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed',
        }"
      >
        <template #headline>
          <div class="flex items-center justify-between gap-4">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <UIcon
                name="i-lucide-grid-3x3"
                class="h-3.5 w-3.5"
                aria-hidden="true"
              />
              <ClientOnly>
                <span class="font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
                  {{ activeHoverText["categories-badge"] || "Explore Categories" }}
                </span>
                <template #fallback>
                  <span class="font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
                    Explore Categories
                  </span>
                </template>
              </ClientOnly>
            </div>

            <!-- Categories Directory RSS Subscribe Button -->
            <RssSubscribeButton
              title="Categories Directory"
              :feed-path="CATEGORIES_INDEX_RSS_URL"
            />
          </div>
        </template>

        <template #title>
          Navigate by <span class="bg-linear-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent font-extrabold">category</span> or subject area.
        </template>

        <template #description>
          Organized collections to help you find specific technical content faster. Explore domains ranging from architecture to core development.
        </template>

        <template #default>
          <div class="pt-4 flex flex-wrap items-center gap-3">
            <!-- Primary Link: Browse All Articles -->
            <NuxtLink
              to="/blogs"
              class="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xs bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-primary-700 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:bg-primary-500 dark:text-neutral-950 dark:hover:bg-primary-400 dark:focus-visible:outline-primary-400"
            >
              <span>Browse All Articles</span>
              <UIcon
                name="i-line-md-arrow-right"
                class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
                aria-hidden="true"
              />
            </NuxtLink>

            <!-- Secondary Link: Browse Tags -->
            <NuxtLink
              to="/tags"
              class="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/80 px-5 py-2.5 text-sm font-medium text-neutral-800 shadow-xs transition-colors hover:bg-(--app-surface-hover) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:text-neutral-200"
            >
              <span>Browse Tags</span>
              <UIcon
                name="i-line-md-arrow-right"
                class="h-4 w-4 text-neutral-500 transition-colors duration-200 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200"
                aria-hidden="true"
              />
            </NuxtLink>
          </div>
        </template>
      </UPageHeader>

      <UPageBody>
        <!-- Initial Skeleton Loading State -->
        <div
          v-if="categoriesPending && displayLimit === itemsPerPage"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 my-6"
          aria-label="Loading categories"
        >
          <div
            v-for="n in 6"
            :key="`cat-skeleton-${n}`"
            class="h-44 p-5 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 backdrop-blur-xs ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.4)] flex flex-col justify-between animate-pulse select-none"
            aria-hidden="true"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <USkeleton class="w-9 h-9 rounded-xs bg-(--app-bg) opacity-85" />
                <USkeleton class="w-16 h-4 rounded-xs bg-(--app-bg) opacity-85" />
              </div>
              <USkeleton class="w-2/3 h-4 bg-(--app-bg) opacity-95 rounded-xs" />
              <USkeleton class="w-full h-3 bg-(--app-bg) opacity-60 rounded-xs" />
            </div>
            <USkeleton class="w-24 h-3 bg-(--app-bg) opacity-70 rounded-xs mt-auto" />
          </div>
        </div>

        <div v-else class="my-6 space-y-12">
          <section
            v-if="enrichedCategories.length > 0"
            aria-labelledby="categories-directory-heading"
          >
            <h2 id="categories-directory-heading" class="sr-only">
              Categories Directory List
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <BaseTaxonomyCard
                v-for="category in enrichedCategories"
                :key="category.slug"
                :item="category"
                fallback-icon="i-lucide-folder-open"
                type-label="category"
              />
            </div>
          </section>

          <!-- Empty Fallback View -->
          <div
            v-else
            class="text-center py-24 border border-dashed border-(--app-border) rounded-xs bg-(--app-surface-subtle)/40"
            role="status"
          >
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-xs bg-(--app-surface-subtle) border border-(--app-border) mb-4">
              <UIcon
                name="i-lucide-grid-2x2"
                class="w-6 h-6 text-neutral-400"
                aria-hidden="true"
              />
            </div>
            <h2 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No categories indexed
            </h2>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              There are currently no published articles available for browsing. Please check back later or explore other sections of the site.
            </p>
          </div>

          <!-- Appending Skeleton Loaders for Infinite Scroll -->
          <div
            v-if="categoriesPending && displayLimit > itemsPerPage"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-5"
            aria-label="Loading more categories"
          >
            <div
              v-for="n in 3"
              :key="`append-cat-${n}`"
              class="h-44 p-5 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 backdrop-blur-xs ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.4)] flex flex-col justify-between animate-pulse select-none"
              aria-hidden="true"
            >
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <USkeleton class="w-9 h-9 rounded-xs bg-(--app-bg) opacity-85" />
                  <USkeleton class="w-16 h-4 rounded-xs bg-(--app-bg) opacity-85" />
                </div>
                <USkeleton class="w-2/3 h-4 bg-(--app-bg) opacity-95 rounded-xs" />
                <USkeleton class="w-full h-3 bg-(--app-bg) opacity-60 rounded-xs" />
              </div>
              <USkeleton class="w-24 h-3 bg-(--app-bg) opacity-70 rounded-xs mt-auto" />
            </div>
          </div>

          <!-- Completion Signifier -->
          <div
            v-if="!hasMoreContent && enrichedCategories.length > 0"
            class="text-center pt-10 pb-4 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-widest select-none border-t border-(--app-border)"
          >
            You've reached the end of the collection.
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';
</style>
