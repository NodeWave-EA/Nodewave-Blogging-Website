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

function getRoleColor(role: string): "error" | "warning" | "neutral" | "primary" {
  switch (role) {
    case "admin":
      return "error";
    case "editor":
      return "warning";
    case "guest":
      return "neutral";
    default:
      return "primary";
  }
}

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
  // Google Search Breadcrumb Hierarchy
  defineBreadcrumb({
    itemListElement: [
      { name: "Home", item: "/" },
      { name: "Authors", item: PAGE_CANONICAL_URL.value },
    ],
  }),

  // CollectionPage Schema for Authors Index
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
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-500/10 dark:bg-primary-400/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
              <UIcon
                name="i-lucide-users"
                class="h-3.5 w-3.5 animate-pulse"
                aria-hidden="true"
              />
              <ClientOnly>
                <span class="font-mono text-[9px] font-bold uppercase tracking-[0.15em]">
                  {{ activeHoverText["authors-badge"] || "Editorial Roster" }}
                </span>
                <template #fallback>
                  <span class="font-mono text-[9px] font-bold uppercase tracking-[0.15em]">
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
          <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
            Meet the <span class="bg-linear-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">core contributors</span> and architects driving <span class="bg-linear-to-r from-indigo-500 to-emerald-400 bg-clip-text text-transparent">nodewave</span>.
          </h1>
        </template>

        <template #description>
          <p class="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            Discover the dedicated developers, tech enthusiasts, and systems architects building our knowledge database. Explore their profiles and dive into their engineering insights.
          </p>
        </template>

        <template #default>
          <div class="pt-4 flex flex-wrap items-center gap-3">
            <!-- Primary Link: Read Their Articles -->
            <NuxtLink
              to="/blogs"
              class="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xs bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white dark:focus-visible:outline-neutral-100"
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
              class="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xs border border-neutral-200 bg-neutral-100/80 px-5 py-2.5 text-sm font-medium text-neutral-800 shadow-xs transition-colors hover:bg-neutral-200/80 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-neutral-700/80 dark:focus-visible:outline-neutral-100"
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

      <UPageBody>
        <div class="my-6">
          <!-- Loaded Authors Contiguous Bento Matrix -->
          <section
            v-if="enrichedAuthors.length > 0"
            aria-labelledby="editorial-roster-heading"
          >
            <h2 id="editorial-roster-heading" class="sr-only">
              Editorial Roster and Authors List
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-[#e8e3d8] dark:border-[#26231f] rounded-xs overflow-hidden shadow-xs">
              <AuthorContributorCard
                v-for="author in enrichedAuthors"
                :key="author.slug"
                :author="author"
                :active-hover-text="activeHoverText"
                @start-decrypt="startDecryption"
                @clear-decrypt="clearDecryption"
                @get-role-color="getRoleColor"
              />
            </div>
          </section>

          <!-- Empty Fallback State -->
          <div
            v-else-if="!authorsPending"
            class="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xs bg-neutral-50/30 dark:bg-neutral-900/10"
            role="status"
          >
            <UIcon
              name="i-lucide-users"
              class="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto"
              aria-hidden="true"
            />
            <h2 class="text-sm font-bold mt-3 text-neutral-800 dark:text-neutral-200">
              No Authors Available
            </h2>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
              We couldn't locate any contributor profiles or editorial entries in the system at this time. Please check back later or explore other sections of the site.
            </p>
          </div>

          <!-- Loading State: Bento Grid Skeleton Matrix -->
          <div
            v-if="authorsPending"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-[#e8e3d8] dark:border-[#26231f] rounded-xs overflow-hidden shadow-xs my-6"
            aria-label="Loading authors roster"
          >
            <div
              v-for="n in (displayLimit === itemsPerPage ? 8 : 4)"
              :key="`loader-auth-${n}`"
              class="relative overflow-hidden bg-[#faf7f2] dark:bg-[#141311] p-5 flex flex-col items-center justify-between select-none animate-pulse rounded-none border-b border-r border-[#e8e3d8] dark:border-[#26231f]"
              aria-hidden="true"
            >
              <div class="flex flex-col items-center w-full">
                <USkeleton class="w-20 h-20 rounded-full bg-[#e8e3d8]/80 dark:bg-[#2a2722]/70" />
                <USkeleton class="h-4 w-28 rounded-xs bg-[#e8e3d8]/90 dark:bg-[#2a2722]/80 mt-4" />
                <USkeleton class="h-3 w-20 rounded-xs bg-[#e8e3d8]/60 dark:bg-[#2a2722]/50 mt-2" />
                <USkeleton class="h-3 w-full rounded-xs bg-[#e8e3d8]/50 dark:bg-[#2a2722]/40 mt-4" />
                <USkeleton class="h-3 w-3/4 rounded-xs bg-[#e8e3d8]/50 dark:bg-[#2a2722]/40 mt-1.5" />
              </div>
              <div class="pt-4 flex items-center justify-between border-t border-[#e8e3d8] dark:border-[#26231f] w-full mt-6">
                <USkeleton class="h-3.5 w-20 rounded-xs bg-[#e8e3d8]/60 dark:bg-[#2a2722]/50" />
                <USkeleton class="h-4 w-12 rounded-xs bg-[#e8e3d8]/80 dark:bg-[#2a2722]/70" />
              </div>
            </div>
          </div>

          <!-- End of List Indicator -->
          <div
            v-if="!hasMoreContent && enrichedAuthors.length > 0"
            class="text-center pt-10 pb-4 text-neutral-400 dark:text-neutral-500 font-mono text-[9px] uppercase tracking-widest select-none border-t border-neutral-200/60 dark:border-neutral-800/60"
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
