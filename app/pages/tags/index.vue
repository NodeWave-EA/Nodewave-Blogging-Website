<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";

import RssSubscribeButton from "~/components/ui/rss-subscribe-button.vue";
import { useContent } from "~/composables/content";
import { useMatrixDecrypt } from "~/composables/use-matrix-decrypt";

definePageMeta({
  title: "Browse by Tags",
});

const { getAllTags } = useContent();

const itemsPerPage = 12;
const displayLimit = ref(itemsPerPage);

const { data: rawTags, pending: tagsPending } = await getAllTags(displayLimit);

const enrichedTags = computed(() => rawTags.value || []);

const hasMoreContent = computed(() => {
  if (!rawTags.value)
    return false;
  return rawTags.value.length >= displayLimit.value;
});

useInfiniteScroll(
  typeof window !== "undefined"
    ? window
    : null,
  () => {
    if (hasMoreContent.value && !tagsPending.value) {
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
  startDecryption("Explore Tags", "tags-badge");
});

const config = useRuntimeConfig().public;

const PAGE_TITLE = computed(() => `Browse by Tags — Technical Index & Keywords`);
const PAGE_DESCRIPTION = computed(
  () => "Filter and explore technical articles, system architecture notes, and development guides by specific technologies, concepts, and keywords on Nodewave.",
);
const PAGE_CANONICAL_URL = computed(() => `${config.siteUrl}/tags`);
const TAGS_INDEX_RSS_URL = computed(() => `/tags/rss.xml`);

// Meta & Social Sharing Tags
useSeoMeta({
  title: () => PAGE_TITLE.value,
  description: () => PAGE_DESCRIPTION.value,
  keywords: "nodewave, tags, keywords, taxonomy, software engineering, framework, languages, tutorials, engineering insights",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",

  // Open Graph / Facebook
  ogType: "website",
  ogTitle: () => PAGE_TITLE.value,
  ogDescription: () => PAGE_DESCRIPTION.value,
  ogUrl: () => PAGE_CANONICAL_URL.value,
  ogImageAlt: () => `${config.siteName || "Nodewave"} Tags Directory`,
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
      title: "NodeWave — Tags Directory RSS Feed",
      href: () => `${PAGE_CANONICAL_URL.value}/rss.xml`,
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon.png",
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
  // Google Search Breadcrumb Hierarchy
  defineBreadcrumb({
    itemListElement: [
      { name: "Home", item: "/" },
      { name: "Tags", item: PAGE_CANONICAL_URL.value },
    ],
  }),

  // CollectionPage Schema for Tags Index
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
  <UContainer>
    <UPage class="py-10">
      <UPageHeader class="mb-12">
        <template #headline>
          <div class="flex items-center justify-between gap-4">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 dark:bg-sky-400/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <UIcon
                name="i-lucide-tags"
                class="h-3.5 w-3.5"
                aria-hidden="true"
              />
              <span class="font-mono text-[9px] font-bold uppercase tracking-[0.15em]">
                {{ activeHoverText["tags-badge"] || "Explore Tags" }}
              </span>
            </div>

            <!-- Tags Directory RSS Subscribe Button -->
            <RssSubscribeButton
              title="Tags Directory"
              :feed-path="TAGS_INDEX_RSS_URL"
            />
          </div>
        </template>

        <template #title>
          <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
            Filter content by <span class="bg-linear-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">technology</span>, protocol, or keyword.
          </h1>
        </template>

        <template #description>
          <p class="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            Granular technical index allowing you to quickly cross-reference specific tools, programming languages, and design patterns.
          </p>
        </template>
      </UPageHeader>

      <UPageBody>
        <div class="my-6">
          <!-- Initial Skeleton Loading State -->
          <div
            v-if="tagsPending && displayLimit === itemsPerPage"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#e8e3d8] dark:border-[#26231f] rounded-xs overflow-hidden shadow-xs"
            aria-label="Loading tags directory"
          >
            <div
              v-for="n in 6"
              :key="`tag-skeleton-${n}`"
              class="h-44 p-5 bg-[#faf7f2] dark:bg-[#141311] border-b border-r border-[#e8e3d8] dark:border-[#26231f] flex flex-col justify-between animate-pulse select-none"
            >
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <USkeleton class="w-9 h-9 rounded-xs bg-[#e8e3d8]/80 dark:bg-[#2a2722]/70" />
                  <USkeleton class="w-16 h-4 rounded-xs bg-[#e8e3d8]/80 dark:bg-[#2a2722]/70" />
                </div>
                <USkeleton class="w-2/3 h-4 bg-[#e8e3d8]/90 dark:bg-[#2a2722]/80 rounded-xs" />
                <USkeleton class="w-full h-3 bg-[#e8e3d8]/50 dark:bg-[#2a2722]/40 rounded-xs" />
              </div>
              <USkeleton class="w-24 h-3 bg-[#e8e3d8]/60 dark:bg-[#2a2722]/50 rounded-xs mt-auto" />
            </div>
          </div>

          <!-- Populated Contiguous Bento Matrix Grid -->
          <section
            v-else-if="enrichedTags.length > 0"
            aria-label="Tags directory list"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#e8e3d8] dark:border-[#26231f] rounded-xs overflow-hidden shadow-xs">
              <BaseTaxonomyCard
                v-for="tag in enrichedTags"
                :key="tag.slug"
                :item="tag"
                fallback-icon="i-lucide-hash"
                type-label="tag"
              />
            </div>
          </section>

          <!-- Empty Fallback View -->
          <div
            v-else
            class="text-center py-24 border border-dashed border-[#e8e3d8] dark:border-[#26231f] rounded-xs bg-[#faf7f2]/50 dark:bg-[#141311]/50"
            role="status"
          >
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xs bg-[#f2eee5] dark:bg-[#1c1a17] mb-3 text-neutral-400">
              <UIcon
                name="i-lucide-tags"
                class="w-5 h-5 text-neutral-400"
                aria-hidden="true"
              />
            </div>
            <h2 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No tags indexed
            </h2>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed">
              There are currently no tag entries or keyword fragments found in the system. Please check back later or explore categories instead.
            </p>
          </div>

          <!-- Appending Skeleton Loaders for Infinite Scroll -->
          <div
            v-if="tagsPending && displayLimit > itemsPerPage"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#e8e3d8] dark:border-[#26231f] rounded-xs overflow-hidden shadow-xs mt-6"
            aria-label="Loading more tags"
          >
            <div
              v-for="n in 3"
              :key="`append-tag-${n}`"
              class="h-44 p-5 bg-[#faf7f2] dark:bg-[#141311] border-b border-r border-[#e8e3d8] dark:border-[#26231f] animate-pulse"
            />
          </div>

          <!-- Completion Signifier -->
          <div
            v-if="!hasMoreContent && enrichedTags.length > 0"
            class="text-center pt-10 pb-4 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-widest select-none border-t border-neutral-200/60 dark:border-neutral-800/60"
          >
            You've reached the end of the keyword index.
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';
</style>
