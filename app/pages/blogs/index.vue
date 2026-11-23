<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";

import RssSubscribeButton from "~/components/ui/rss-subscribe-button.vue";
import { useContent } from "~/composables/content";
import { useMatrixDecrypt } from "~/composables/use-matrix-decrypt";

definePageMeta({
  title: "Browse All Blogs",
});

const { getAllBlogs } = useContent();

const itemsPerPage = 12;
const displayLimit = ref(itemsPerPage);

const { data: rawBlogs, pending: blogsPending } = await getAllBlogs(displayLimit);

const blogs = computed(() => {
  return rawBlogs.value || [];
});

const hasMoreContent = computed(() => {
  if (!rawBlogs.value)
    return false;
  return rawBlogs.value.length >= displayLimit.value;
});

useInfiniteScroll(
  typeof window !== "undefined"
    ? window
    : null,
  () => {
    if (hasMoreContent.value && !blogsPending.value) {
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
  startDecryption("Complete Archive", "archive-badge");
});

const config = useRuntimeConfig().public;

const PAGE_TITLE = computed(() => `Browse All Blogs`);
const PAGE_DESCRIPTION = computed(
  () => "Browse the complete blogs archive of technical articles, software architecture notes, and guides published on Nodewave.",
);
const PAGE_CANONICAL_URL = computed(() => `${config.siteUrl}/blogs`);
const PAGE_RSS_URL = computed(() => `/rss.xml`);

// Meta & Social Sharing Tags
useSeoMeta({
  title: () => PAGE_TITLE.value,
  description: () => PAGE_DESCRIPTION.value,
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",

  // Open Graph / Facebook
  ogType: "website",
  ogTitle: () => PAGE_TITLE.value,
  ogDescription: () => PAGE_DESCRIPTION.value,
  ogUrl: () => PAGE_CANONICAL_URL.value,
  ogImageAlt: () => `${config.siteName || "Nodewave"} Blog Archive`,
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
      title: "Blogs RSS Feed",
      href: () => PAGE_RSS_URL.value,
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/icons/favicon.png",
    },
  ],
});

const colorMode = useColorMode();
const ogColorMode = computed<"light" | "dark">(() =>
  colorMode.value === "light"
    ? "light"
    : "dark",
);

defineOgImage("NuxtSeo.takumi", {
  title: PAGE_TITLE.value,
  description: PAGE_DESCRIPTION.value,
  badge: "All Blogs",
  colorMode: ogColorMode.value,
});

// Nuxt Schema.org Structured Data (Google CollectionPage & Breadcrumbs)
useSchemaOrg([
  // Google Search Breadcrumb
  defineBreadcrumb({
    itemListElement: [
      { name: "Home", item: "/" },
      { name: "Blogs", item: PAGE_CANONICAL_URL.value },
    ],
  }),

  // CollectionPage Schema for Complete Blog Archive
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
            <div
              class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-500/10 dark:bg-primary-400/10 text-primary-600 dark:text-primary-400 border border-primary-500/20"
            >
              <UIcon
                name="i-lucide-library"
                class="h-3.5 w-3.5"
                aria-hidden="true"
              />
              <ClientOnly>
                <span class="font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
                  {{ activeHoverText["archive-badge"] || "Complete Archive" }}
                </span>

                <template #fallback>
                  <span class="font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
                    Complete Archive
                  </span>
                </template>
              </ClientOnly>
            </div>

            <!-- RSS Subscribe Button -->
            <RssSubscribeButton
              title="Blog Archive"
              :feed-path="PAGE_RSS_URL"
            />
          </div>
        </template>

        <template #title>
          Explore our
          <span class="bg-linear-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent font-extrabold">complete collection</span>
          of technical articles, architecture notes, and development logs.
        </template>

        <template #description>
          A comprehensive archive of all technical articles, architecture notes, and development logs published on
          nodewave.
        </template>

        <template #default>
          <div class="pt-4 flex flex-wrap items-center gap-3">
            <!-- Primary Link: Categories -->
            <NuxtLink
              to="/categories"
              class="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xs bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-primary-700 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:bg-primary-500 dark:text-neutral-950 dark:hover:bg-primary-400 dark:focus-visible:outline-primary-400"
            >
              <span>Browse Categories</span>
              <UIcon
                name="i-line-md-arrow-right"
                class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
                aria-hidden="true"
              />
            </NuxtLink>

            <!-- Secondary Link: Tags -->
            <NuxtLink
              to="/tags"
              class="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xs border border-neutral-200 bg-neutral-100/80 px-5 py-2.5 text-sm font-medium text-neutral-800 shadow-xs transition-colors hover:bg-neutral-200/80 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-neutral-700/80 dark:focus-visible:outline-neutral-100"
            >
              <span>Browse Tags</span>
              <UIcon
                name="i-line-md-arrow-right"
                class="h-4 w-4 text-neutral-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-neutral-600 group-focus-visible:translate-x-0.5 dark:text-neutral-400 dark:group-hover:text-neutral-200"
                aria-hidden="true"
              />
            </NuxtLink>
          </div>
        </template>
      </UPageHeader>

      <UPageBody>
        <!-- Initial Loading State -->
        <div
          v-if="blogsPending && displayLimit === itemsPerPage"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 my-6"
        >
          <LazyBlogPostCardSkeleton v-for="n in 6" :key="`blog-skeleton-${n}`" />
        </div>

        <div v-else class="space-y-6 my-6">
          <div class="space-y-12">
            <!-- Content Grid Layout -->
            <section
              v-if="blogs.length > 0"
              aria-labelledby="archive-blogs-heading"
            >
              <h2 id="archive-blogs-heading" class="sr-only">
                Complete Blog Archive List
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <BlogPostCard
                  v-for="blog in blogs"
                  :key="blog.path"
                  :post="blog"
                />
              </div>
            </section>

            <!-- Empty Fallback State -->
            <div
              v-else
              class="text-center py-24 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xs bg-neutral-50/20 dark:bg-neutral-900/10"
              role="status"
            >
              <div
                class="inline-flex items-center justify-center w-14 h-14 rounded-xs bg-neutral-100 dark:bg-neutral-900 mb-4 shadow-3xs transition-transform hover:scale-105"
              >
                <UIcon
                  name="i-lucide-folder-open"
                  class="w-6 h-6 text-neutral-400"
                  aria-hidden="true"
                />
              </div>
              <h2 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                No Articles Found
              </h2>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                We couldn't locate any published articles or documentation fragments in the system at this time.
              </p>
            </div>

            <!-- Infinite Scroll Appending Skeletons -->
            <div
              v-if="blogsPending && displayLimit > itemsPerPage"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-5"
              aria-label="Loading additional articles"
            >
              <LazyBlogPostCardSkeleton v-for="n in 3" :key="`append-${n}`" />
            </div>

            <!-- Content Boundary / End of List Indicator -->
            <div
              v-if="!hasMoreContent && blogs.length > 0"
              class="text-center pt-10 pb-6 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-widest select-none border-t border-neutral-200/60 dark:border-neutral-800/60"
            >
              You've reached the end of the article archive.
            </div>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';
</style>
