<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import RssSubscribeButton from "~/components/ui/rss-subscribe-button.vue";
import { useContent } from "~/composables/content";

const route = useRoute();
const tagSlug = computed(() => route.params.slug as string);

const { getTagBySlug, getTagBlogs } = useContent();

const itemsPerPage = 12;
const displayLimit = ref(itemsPerPage);

const { data: tag, pending: tagPending, error: tagError } = await getTagBySlug(tagSlug);
const { data: rawBlogs, pending: blogsPending } = await getTagBlogs(tagSlug, displayLimit);

const blogs = computed(() => {
  return rawBlogs.value || [];
});

const hasMoreContent = computed(() => {
  if (!rawBlogs.value || rawBlogs.value.length === 0)
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

const config = useRuntimeConfig().public;
const PAGE_TITLE = computed(() => `Browse ${tag.value?.name || "Tag"} Articles`);
const PAGE_DESCRIPTION = computed(
  () => tag.value?.description || tag.value?.meta?.description || `Explore technical posts, guides, and architectural notes tagged under ${tag.value?.name || "this topic"}.`,
);
const PAGE_CANONICAL_URL = computed(() => `${config.siteUrl}/tags/${tag.value?.slug || tagSlug.value}`);
const TAG_RSS_URL = computed(() => `/tags/${tag.value?.slug || tagSlug.value}/rss.xml`);

// Meta & Social Sharing Tags
useSeoMeta({
  title: () => PAGE_TITLE.value,
  description: () => PAGE_DESCRIPTION.value,
  keywords: () => `nodewave, tag, ${tag.value?.name || ""}, technical articles, tutorials, documentation`,
  robots: "index, follow, max-image-preview:large",

  // Open Graph / Facebook
  ogType: "website",
  ogTitle: () => PAGE_TITLE.value,
  ogDescription: () => PAGE_DESCRIPTION.value,
  ogUrl: () => PAGE_CANONICAL_URL.value,
  ogImageAlt: () => tag.value?.name || "Tag Archive",
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
      title: () => `NodeWave — ${tag.value?.name || "Tag"} RSS Feed`,
      href: () => `${PAGE_CANONICAL_URL.value}/rss.xml`,
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon.png",
    },
  ],
});

// Nuxt Schema.org Structured Data (Google CollectionPage & Breadcrumbs)
useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: "Home", item: "/" },
      { name: "Tags", item: "/tags" },
      {
        name: () => tag.value?.name || "Tag Archive",
        item: () => PAGE_CANONICAL_URL.value,
      },
    ],
  }),

  {
    "@type": "CollectionPage",
    "@id": `${PAGE_CANONICAL_URL.value}/#collectionpage`,
    "url": PAGE_CANONICAL_URL.value,
    "name": PAGE_TITLE.value,
    "description": PAGE_DESCRIPTION.value,
    "about": {
      "@type": "Thing",
      "name": tag.value?.name,
      "description": tag.value?.description,
    },
  },
]);

defineOgImage("Taxonomy.takumi", {
  colorMode: "light",
  title: () => toValue(PAGE_TITLE),
  description: () => toValue(PAGE_DESCRIPTION),
  type: "Tag",
  articleCount: () => blogs.value.length,
});
</script>

<template>
  <UContainer class="py-4 sm:py-6">
    <!-- Tag Initial Skeleton -->
    <div
      v-if="tagPending && !tag"
      class="py-12 text-center animate-pulse"
      aria-label="Loading tag"
    >
      <USkeleton class="h-4 bg-(--app-surface-subtle) rounded-xs w-32 mx-auto mb-4" />
      <USkeleton class="h-8 bg-(--app-surface-subtle) rounded-xs w-48 mx-auto mb-3" />
      <USkeleton class="h-4 bg-(--app-surface-subtle) rounded-xs w-96 max-w-full mx-auto" />
    </div>

    <UPage v-else-if="tag && !tagError" class="py-6">
      <!-- Transparent & Borderless Tag Hero Header -->
      <header class="mb-10 py-4 bg-transparent border-0 relative overflow-hidden">
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <nav aria-label="Breadcrumb" class="flex items-center gap-2">
              <NuxtLink
                to="/tags"
                class="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 hover:text-primary-500 flex items-center gap-1 transition-colors group focus-visible:ring-1 focus-visible:ring-primary-500 rounded-xs"
              >
                <UIcon
                  name="i-lucide-chevron-left"
                  class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
                Back to Tags
              </NuxtLink>
              <span class="text-neutral-400 dark:text-neutral-600 font-mono text-xs" aria-hidden="true">/</span>
              <span
                class="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs bg-(--app-surface-subtle)/80 border border-(--app-border)"
                :style="{ color: tag.color || 'var(--ui-primary)' }"
              >
                <UIcon
                  :name="tag.icon || 'i-lucide-hash'"
                  class="w-3 h-3 shrink-0"
                  aria-hidden="true"
                />
                {{ tag.name }}
              </span>
            </nav>

            <!-- Tag RSS Subscribe Button -->
            <RssSubscribeButton
              :title="tag.name"
              :feed-path="TAG_RSS_URL"
            />
          </div>

          <h1 class="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight flex items-center gap-2.5">
            <UIcon
              :name="tag.icon || 'i-lucide-hash'"
              class="w-8 h-8 shrink-0"
              :style="{ color: tag.color || 'var(--ui-primary)' }"
              aria-hidden="true"
            />
            {{ tag.name }}
          </h1>

          <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
            {{ tag.description || tag.meta?.description || "Explore technical articles and documentation fragments filtered under this keyword tag." }}
          </p>
        </div>
      </header>

      <UPageBody>
        <div class="space-y-8 my-6">
          <div class="flex items-center justify-between border-b border-(--app-border) pb-3">
            <h2 class="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Tagged Articles:
              {{ blogs.length }} {{ blogs.length === 1 ? "Article" : "Articles" }}
            </h2>
          </div>

          <!-- Initial Loading Skeletons -->
          <div
            v-if="blogsPending && displayLimit === itemsPerPage"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            aria-label="Loading tagged articles"
          >
            <LazyBlogPostCardSkeleton v-for="n in 6" :key="`init-tag-blog-${n}`" />
          </div>

          <section
            v-else-if="blogs.length > 0"
            :aria-label="`Articles tagged with ${tag.name}`"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <BlogPostCard
                v-for="blog in blogs"
                :key="blog.path"
                :post="blog"
              />
            </div>
          </section>

          <!-- Empty Fallback View -->
          <div
            v-else
            class="text-center py-20 border border-dashed border-(--app-border) rounded-xs bg-(--app-surface-subtle)/40"
            role="status"
          >
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xs bg-(--app-surface-subtle) border border-(--app-border) mb-3 text-neutral-400">
              <UIcon
                :name="tag.icon || 'i-lucide-hash'"
                class="w-5 h-5"
                aria-hidden="true"
              />
            </div>
            <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No Entries Found
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              There are currently no published articles tagged under <span class="font-semibold text-neutral-700 dark:text-neutral-300">#{{ tag.name }}</span>. Please check back later or explore other technical tags.
            </p>
          </div>

          <!-- Infinite Scroll Appending Skeletons -->
          <div
            v-if="blogsPending && displayLimit > itemsPerPage"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-5"
            aria-label="Loading additional articles"
          >
            <LazyBlogPostCardSkeleton v-for="n in 3" :key="`append-tag-blog-${n}`" />
          </div>

          <!-- End of Archive Signifier -->
          <div
            v-if="!hasMoreContent && blogs.length > 0"
            class="text-center pt-10 pb-4 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-widest select-none border-t border-(--app-border)"
          >
            You've reached the end of the tagged archive for <span class="font-semibold text-neutral-700 dark:text-neutral-300">#{{ tag.name }}</span>.
          </div>
        </div>
      </UPageBody>
    </UPage>

    <!-- Error State -->
    <div
      v-else
      class="text-center py-24 border border-dashed border-red-300/60 dark:border-red-900/50 rounded-xs bg-red-500/5 my-10"
      role="alert"
    >
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-xs bg-red-500/10 border border-red-500/20 mb-4 text-error-500">
        <UIcon
          name="i-lucide-octagon-alert"
          class="w-6 h-6"
          aria-hidden="true"
        />
      </div>
      <h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">
        Tag Not Found
      </h2>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto mb-6 leading-relaxed">
        The requested tag topic could not be located in the system directory. It may have been renamed or removed.
      </p>
      <UButton
        to="/tags"
        label="Return to Tags"
        color="neutral"
        variant="subtle"
        size="sm"
        class="rounded-xs"
      />
    </div>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';
</style>
