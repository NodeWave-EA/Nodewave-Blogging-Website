<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, ref } from "vue";

import { useContent } from "~/composables/content";

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
  typeof window !== "undefined" ? window : null,
  () => {
    if (hasMoreContent.value && !tagsPending.value) {
      displayLimit.value += itemsPerPage;
    }
  },
  { distance: 250, canLoadMore: () => hasMoreContent.value },
);

// Add micro-interaction text decryption for the archive badge
const { activeHoverText, startDecryption } = useMatrixDecrypt({
  speed: 25,
  revealStep: 0.35,
});

onMounted(() => {
  startDecryption("Explore Tags", "tags-badge");
});

// SEO
const config = useRuntimeConfig().public;

const PAGE_TITLE = "Browse by Tags";
const PAGE_DESCRIPTION = "Explore all articles, tutorials, and news organized by tags and subject areas.";
const PAGE_CANONICAL_URL = `${config.siteUrl}/tags`;

useSeoMeta({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  ogType: "website",
  ogTitle: PAGE_TITLE,
  ogDescription: PAGE_DESCRIPTION,
  twitterCard: "summary_large_image",
  twitterTitle: PAGE_TITLE,
  twitterDescription: PAGE_DESCRIPTION,
});

useHead({
  link: [
    {
      rel: "canonical",
      href: PAGE_CANONICAL_URL,
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon.png",
    },
  ],
});

defineOgImage("NuxtSeo.takumi", {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  brand: config.siteName,
  colorMode: "dark",
  isPro: true,
});
</script>

<template>
  <UContainer>
    <UPage class="py-10">
      <UPageHeader class="mb-12 mx-2">
        <template #headline>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <UIcon name="i-lucide-hash" class="h-3.5 w-3.5" />
            <span class="font-mono text-[9px] font-bold uppercase tracking-[0.15em]">
              {{ activeHoverText["tags-badge"] || "Explore Tags" }}
            </span>
          </div>
        </template>

        <template #title>
          <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
            Filter insights by <span class="bg-linear-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">specific tags</span>.
          </h1>
        </template>

        <template #description>
          <p class="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            Quickly discover articles associated with unique keywords, technologies, and specific development challenges.
          </p>
        </template>
      </UPageHeader>

      <UPageBody>
        <!-- Skeleton Loading State -->
        <div v-if="tagsPending && displayLimit === itemsPerPage" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-1">
          <div
            v-for="n in 6"
            :key="n"
            class="h-44 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 p-5 border border-neutral-100 dark:border-neutral-900 flex flex-col justify-between animate-pulse"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                <div class="w-12 h-5 rounded-md bg-neutral-100 dark:bg-neutral-800" />
              </div>
              <div class="w-2/3 h-5 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
              <div class="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-md" />
            </div>
            <div class="w-24 h-3 bg-neutral-100 dark:bg-neutral-800 rounded-md" />
          </div>
        </div>

        <div v-else class="space-y-12 mx-1">
          <!-- Populated Taxonomy Grid -->
          <div v-if="enrichedTags.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <BaseTaxonomyCard
              v-for="tag in enrichedTags"
              :key="tag.slug"
              :item="tag"
              fallback-icon="i-lucide-hash"
              type-label="tag"
            />
          </div>

          <!-- Empty Fallback View -->
          <div v-else class="text-center py-24 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/20 dark:bg-neutral-900/10">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-900 mb-4">
              <UIcon name="i-lucide-hash" class="w-6 h-6 text-neutral-400" />
            </div>
            <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No tags indexed
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              There are currently no tags indexed.
            </p>
          </div>

          <!-- Appending Skeleton Loaders -->
          <div v-if="tagsPending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-800">
            <div
              v-for="n in 3"
              :key="`append-tag-${n}`"
              class="h-44 rounded-2xl bg-neutral-50 dark:bg-neutral-900/30 p-5 animate-pulse border border-transparent"
            />
          </div>

          <!-- Completion Signifier -->
          <div v-if="!hasMoreContent && enrichedTags.length > 0" class="text-center pt-10 pb-6 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-widest select-none border-t border-neutral-200/60 dark:border-neutral-800/60">
            You've reached the end of the tag index.
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';
</style>
