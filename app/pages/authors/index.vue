<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";

import RssSubscribeButton from "~/components/ui/rss-subscribe-button.vue";
import { useContent } from "~/composables/content";
import { useMatrixDecrypt } from "~/composables/use-matrix-decrypt";

definePageMeta({
  title: "Meet Our Contributors",
});

const { getAllAuthors } = useContent();

const itemsPerPage = 8;
const displayLimit = ref(itemsPerPage);

const { data: rawAuthors, pending: authorsPending } = await getAllAuthors(displayLimit);

const { logger } = useLogger({ context: "Authors Page" });
logger.log("Fetched authors data:", { rawAuthors: rawAuthors.value, authorsPending: authorsPending.value });

const enrichedAuthors = computed(() => {
  return rawAuthors.value || [];
});

const hasMoreContent = computed(() => {
  if (!rawAuthors.value)
    return false;
  return rawAuthors.value.length >= displayLimit.value;
});

useInfiniteScroll(
  typeof window !== "undefined"
    ? window
    : null,
  () => {
    if (hasMoreContent.value && !authorsPending.value) {
      displayLimit.value += itemsPerPage;
    }
  },
  {
    distance: 250,
    canLoadMore: () => hasMoreContent.value,
  },
);

const { activeHoverText, startDecryption, clearDecryption } = useMatrixDecrypt({
  speed: 25,
  revealStep: 0.35,
});

onMounted(() => {
  startDecryption("Editorial Roster", "authors-badge");
});

const config = useRuntimeConfig().public;
const PAGE_TITLE = computed(() => `Meet Our Contributors — Editorial Roster & Engineering Team`);
const PAGE_DESCRIPTION = computed(
  () => "Discover the dedicated developers, tech enthusiasts, and systems architects building our knowledge database. Explore their profiles and dive into their engineering insights.",
);
const PAGE_CANONICAL_URL = computed(() => `${config.siteUrl}/authors`);
const AUTHORS_INDEX_RSS_URL = computed(() => `/authors/rss.xml`);

// Meta & Social Sharing Tags
useSeoMeta({
  title: () => PAGE_TITLE.value,
  description: () => PAGE_DESCRIPTION.value,
  keywords: "nodewave, authors, contributors, developers, tech enthusiasts, systems architects, profiles, insights, engineering team",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",

  // Open Graph / Facebook
  ogType: "website",
  ogTitle: () => PAGE_TITLE.value,
  ogDescription: () => PAGE_DESCRIPTION.value,
  ogUrl: () => PAGE_CANONICAL_URL.value,
  ogImageAlt: () => `${config.siteName || "Nodewave"} Contributors & Authors`,
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
      title: "NodeWave — Authors Directory RSS Feed",
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
  defineBreadcrumb({
    itemListElement: [
      { name: "Home", item: "/" },
      { name: "Authors", item: PAGE_CANONICAL_URL.value },
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
  <UContainer class="py-4 sm:py-6 min-w-0">
    <UPage
      class="min-w-0"
      :ui="{
        root: 'min-w-0',
        center: 'min-w-0',
      }"
    >
      <UPageHeader
        class="mb-12 min-w-0"
        :ui="{
          title: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1] break-words',
          description: 'text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed',
        }"
      >
        <template #headline>
          <div class="flex flex-wrap items-center justify-between gap-3 min-w-0">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-500/10 dark:bg-primary-400/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 max-w-full">
              <UIcon
                name="i-lucide-users"
                class="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              <ClientOnly>
                <span class="font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
                  {{ activeHoverText["authors-badge"] || "Editorial Roster" }}
                </span>
                <template #fallback>
                  <span class="font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
                    Editorial Roster
                  </span>
                </template>
              </ClientOnly>
            </div>

            <!-- Authors Directory RSS Subscribe Button -->
            <RssSubscribeButton
              title="Authors Directory"
              :feed-path="AUTHORS_INDEX_RSS_URL"
            />
          </div>
        </template>

        <template #title>
          Meet the <span class="bg-linear-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent font-extrabold">core contributors</span> and architects driving <span class="bg-linear-to-r from-indigo-500 to-emerald-400 bg-clip-text text-transparent font-extrabold">nodewave</span>.
        </template>

        <template #description>
          Discover the dedicated developers, tech enthusiasts, and systems architects building our knowledge database. Explore their profiles and dive into their engineering insights.
        </template>

        <template #default>
          <div class="pt-4 flex flex-wrap items-center gap-3">
            <!-- Primary Link: Read Their Articles -->
            <NuxtLink
              to="/blogs"
              class="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xs bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-primary-700 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:bg-primary-500 dark:text-neutral-950 dark:hover:bg-primary-400 dark:focus-visible:outline-primary-400"
            >
              <span>Read Their Articles</span>
              <UIcon
                name="i-line-md-arrow-right"
                class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
                aria-hidden="true"
              />
            </NuxtLink>

            <!-- Secondary Link: Explore Topics -->
            <NuxtLink
              to="/categories"
              class="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/80 px-5 py-2.5 text-sm font-medium text-neutral-800 shadow-xs transition-colors hover:bg-(--app-surface-hover) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:text-neutral-200"
            >
              <UIcon
                name="i-line-md-grid-3-filled"
                class="h-4 w-4 text-neutral-500 transition-colors duration-200 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200"
                aria-hidden="true"
              />
              <span>Explore Topics</span>
            </NuxtLink>
          </div>
        </template>
      </UPageHeader>

      <UPageBody class="min-w-0">
        <!-- Initial Loading State -->
        <div
          v-if="authorsPending && displayLimit === itemsPerPage"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 my-6 min-w-0"
          aria-label="Loading authors roster"
        >
          <div
            v-for="n in 8"
            :key="`init-auth-skeleton-${n}`"
            class="relative overflow-hidden rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 backdrop-blur-xs ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.4)] p-5 flex flex-col items-center justify-between select-none animate-pulse min-w-0"
            aria-hidden="true"
          >
            <div class="flex flex-col items-center w-full min-w-0">
              <USkeleton class="w-20 h-20 rounded-full bg-(--app-bg) opacity-85" />
              <USkeleton class="h-4 w-28 rounded-xs bg-(--app-bg) opacity-95 mt-4" />
              <USkeleton class="h-3 w-20 rounded-xs bg-(--app-bg) opacity-70 mt-2" />
              <USkeleton class="h-3 w-full rounded-xs bg-(--app-bg) opacity-60 mt-4" />
              <USkeleton class="h-3 w-3/4 rounded-xs bg-(--app-bg) opacity-60 mt-1.5" />
            </div>
            <div class="pt-4 flex items-center justify-between border-t border-(--app-border) w-full mt-6">
              <USkeleton class="h-3.5 w-20 rounded-xs bg-(--app-bg) opacity-70" />
              <USkeleton class="h-4 w-12 rounded-xs bg-(--app-bg) opacity-85" />
            </div>
          </div>
        </div>

        <div v-else class="my-6 space-y-12 min-w-0">
          <!-- Loaded Authors -->
          <section
            v-if="enrichedAuthors.length > 0"
            aria-labelledby="editorial-roster-heading"
            class="min-w-0"
          >
            <h2 id="editorial-roster-heading" class="sr-only">
              Editorial Roster and Authors List
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 min-w-0">
              <AuthorContributorCard
                v-for="author in enrichedAuthors"
                :key="author.slug || author.stem"
                :author="author"
                :active-hover-text="activeHoverText"
                @start-decrypt="startDecryption"
                @clear-decrypt="clearDecryption"
              />
            </div>
          </section>

          <!-- Empty Fallback State -->
          <div
            v-else
            class="text-center py-20 px-4 border border-dashed border-(--app-border) rounded-xs bg-(--app-surface-subtle)/40"
            role="status"
          >
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-xs bg-(--app-surface-subtle) border border-(--app-border) mb-4">
              <UIcon
                name="i-lucide-users"
                class="w-6 h-6 text-neutral-400"
                aria-hidden="true"
              />
            </div>
            <h2 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No Authors Available
            </h2>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              We couldn't locate any contributor profiles or editorial entries in the system at this time. Please check back later or explore other sections of the site.
            </p>
          </div>

          <!-- Infinite Scroll Appending Skeletons -->
          <div
            v-if="authorsPending && displayLimit > itemsPerPage"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-5 min-w-0"
            aria-label="Loading additional authors"
          >
            <div
              v-for="n in 4"
              :key="`append-auth-${n}`"
              class="relative overflow-hidden rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 backdrop-blur-xs ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.4)] p-5 flex flex-col items-center justify-between select-none animate-pulse min-w-0"
              aria-hidden="true"
            >
              <div class="flex flex-col items-center w-full min-w-0">
                <USkeleton class="w-20 h-20 rounded-full bg-(--app-bg) opacity-85" />
                <USkeleton class="h-4 w-28 rounded-xs bg-(--app-bg) opacity-95 mt-4" />
                <USkeleton class="h-3 w-20 rounded-xs bg-(--app-bg) opacity-70 mt-2" />
                <USkeleton class="h-3 w-full rounded-xs bg-(--app-bg) opacity-60 mt-4" />
                <USkeleton class="h-3 w-3/4 rounded-xs bg-(--app-bg) opacity-60 mt-1.5" />
              </div>
              <div class="pt-4 flex items-center justify-between border-t border-(--app-border) w-full mt-6">
                <USkeleton class="h-3.5 w-20 rounded-xs bg-(--app-bg) opacity-70" />
                <USkeleton class="h-4 w-12 rounded-xs bg-(--app-bg) opacity-85" />
              </div>
            </div>
          </div>

          <!-- End of List Indicator -->
          <div
            v-if="!hasMoreContent && enrichedAuthors.length > 0"
            class="text-center pt-10 pb-4 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-widest select-none border-t border-(--app-border)"
          >
            You've reached the end of the editorial roster.
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';
</style>
