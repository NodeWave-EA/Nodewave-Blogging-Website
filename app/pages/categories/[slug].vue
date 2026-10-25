<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import RssSubscribeButton from "~/components/ui/rss-subscribe-button.vue";
import { useContent } from "~/composables/content";

const route = useRoute();
const slug = route.params.slug as string;

const { getCategoryBySlug, getCategoryBlogs } = useContent();

const itemsPerPage = 12;
const displayLimit = ref(itemsPerPage);

const categorySlug = computed(() => slug);

const { data: category, pending: categoryPending, error: categoryError } = await getCategoryBySlug(categorySlug);
const { data: rawBlogs, pending: blogsPending } = await getCategoryBlogs(categorySlug, displayLimit);

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
const PAGE_TITLE = computed(() => `Browse ${category.value?.name || "Category"} Articles`);
const PAGE_DESCRIPTION = computed(
  () => category.value?.description || category.value?.meta?.description || `Explore articles and tutorials classified under the ${category.value?.name || "category"} topic.`,
);
const PAGE_CANONICAL_URL = computed(() => `${config.siteUrl}/categories/${category.value?.slug || slug}`);
const CATEGORY_RSS_URL = computed(() => `/categories/${category.value?.slug || slug}/rss.xml`);

// Meta & Social Sharing Tags
useSeoMeta({
  title: () => PAGE_TITLE.value,
  description: () => PAGE_DESCRIPTION.value,
  keywords: () => `nodewave, category, ${category.value?.name || ""}, articles, tutorials, documentation`,
  robots: "index, follow, max-image-preview:large",

  // Open Graph / Facebook
  ogType: "website",
  ogTitle: () => PAGE_TITLE.value,
  ogDescription: () => PAGE_DESCRIPTION.value,
  ogUrl: () => PAGE_CANONICAL_URL.value,
  ogImageAlt: () => category.value?.name || "Category Archive",
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
      title: () => `NodeWave — ${category.value?.name || "Category"} RSS Feed`,
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
  // Google Search Breadcrumb
  defineBreadcrumb({
    itemListElement: [
      { name: "Home", item: "/" },
      { name: "Categories", item: "/categories" },
      { name: category.value?.name || "Category Archive", item: PAGE_CANONICAL_URL.value },
    ],
  }),

  // CollectionPage Schema for Topic Category
  {
    "@type": "CollectionPage",
    "@id": `${PAGE_CANONICAL_URL.value}/#collectionpage`,
    "url": PAGE_CANONICAL_URL.value,
    "name": PAGE_TITLE.value,
    "description": PAGE_DESCRIPTION.value,
    "about": {
      "@type": "Thing",
      "name": category.value?.name,
      "description": category.value?.description,
    },
  },
]);

defineOgImage("Taxonomy.takumi", {
  colorMode: "light",
  title: toValue(PAGE_TITLE),
  description: toValue(PAGE_DESCRIPTION),
  type: "Category",
  articleCount: blogs.value.length,
});
</script>

<template>
  <UContainer>
    <div
      v-if="categoryPending && !category"
      class="py-24 text-center animate-pulse"
      aria-hidden="true"
    >
      <div class="h-4 bg-[#e8e3d8]/80 dark:bg-[#2a2722]/70 rounded-xs w-32 mx-auto mb-4" />
      <div class="h-8 bg-[#e8e3d8]/80 dark:bg-[#2a2722]/70 rounded-xs w-48 mx-auto mb-3" />
      <div class="h-4 bg-[#e8e3d8]/50 dark:bg-[#2a2722]/40 rounded-xs w-96 mx-auto" />
    </div>

    <UPage v-else-if="category && !categoryError" class="py-10">
      <!-- Transparent & Borderless Category Hero Header -->
      <header class="mb-10 py-4 bg-transparent border-0 relative overflow-hidden">
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <NuxtLink
                to="/categories"
                class="text-xs font-mono font-bold text-neutral-400 dark:text-neutral-500 hover:text-primary-500 flex items-center gap-1 transition-colors group focus-visible:ring-1 focus-visible:ring-primary-500 rounded-xs"
                aria-label="Return to all categories"
              >
                <UIcon
                  name="i-lucide-chevron-left"
                  class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
                Back to Categories
              </NuxtLink>
              <span class="text-neutral-300 dark:text-neutral-700 font-mono text-xs" aria-hidden="true">/</span>
              <span
                class="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs bg-[#f2eee5] dark:bg-[#1c1a17] border border-[#e0dad0]/60 dark:border-[#2a2722]"
                :style="{ color: category.color || 'var(--ui-primary)' }"
              >
                <UIcon
                  :name="category.icon || 'i-lucide-folder-open'"
                  class="w-3 h-3 inline-block mr-1 align-text-top"
                  aria-hidden="true"
                />
                {{ category.name }}
              </span>
            </div>

            <!-- Category RSS Subscribe Button -->
            <RssSubscribeButton
              :title="category.name"
              :feed-path="CATEGORY_RSS_URL"
            />
          </div>

          <h1 class="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight flex items-center gap-2.5">
            <UIcon
              :name="category.icon || 'i-lucide-folder-open'"
              class="w-8 h-8 shrink-0"
              :style="{ color: category.color || 'var(--ui-primary)' }"
              aria-hidden="true"
            />
            {{ category.name }}
          </h1>

          <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            {{ category.description || category.meta?.description || "Explore structured documentation tracks and publications under this classification." }}
          </p>
        </div>
      </header>

      <UPageBody>
        <div class="space-y-8 my-6">
          <div class="flex items-center justify-between border-b border-[#e8e3d8] dark:border-[#26231f] pb-3">
            <h2 class="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Published Track Articles:
              {{ blogs.length }} {{ blogs.length === 1 ? "Article" : "Articles" }}
            </h2>
          </div>

          <!-- Contiguous Bento Matrix Grid for Category Articles -->
          <section
            v-if="blogs.length > 0"
            :aria-label="`Articles published under ${category.name}`"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#e8e3d8] dark:border-[#26231f] rounded-xs overflow-hidden shadow-xs">
              <BlogPostCard
                v-for="blog in blogs"
                :key="blog.path"
                :post="blog"
              />
            </div>
          </section>

          <!-- Empty Fallback View -->
          <div
            v-else-if="!blogsPending"
            class="text-center py-20 border border-dashed border-[#e8e3d8] dark:border-[#26231f] rounded-xs bg-[#faf7f2]/50 dark:bg-[#141311]/50"
            role="status"
          >
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xs bg-[#f2eee5] dark:bg-[#1c1a17] mb-3 text-neutral-400">
              <UIcon
                :name="category.icon || 'i-lucide-folder-open'"
                class="w-5 h-5"
                aria-hidden="true"
              />
            </div>
            <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No Entries Found
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed">
              There are currently no published articles associated with the <span class="font-semibold text-neutral-700 dark:text-neutral-300">{{ category.name }}</span> classification track. Please check back later or explore other sections of the site.
            </p>
          </div>

          <!-- Infinite Scroll Appending Skeletons -->
          <div
            v-if="blogsPending"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#e8e3d8] dark:border-[#26231f] rounded-xs overflow-hidden shadow-xs mt-6"
            aria-label="Loading additional articles"
          >
            <LazyBlogPostCardSkeleton v-for="n in 3" :key="`append-cat-blog-${n}`" />
          </div>

          <!-- End of Archive Signifier -->
          <div
            v-if="!hasMoreContent && blogs.length > 0"
            class="text-center pt-10 pb-4 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-widest select-none border-t border-neutral-200/60 dark:border-neutral-800/60"
          >
            You've reached the end of the category archive for <span class="font-semibold text-neutral-700 dark:text-neutral-300">{{ category.name }}</span>.
          </div>
        </div>
      </UPageBody>
    </UPage>

    <!-- Error State -->
    <div
      v-else
      class="text-center py-24 border border-dashed border-red-200 dark:border-red-900/50 rounded-xs bg-red-50/20 dark:bg-red-950/10 my-10"
      role="alert"
    >
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-xs bg-red-100 dark:bg-red-900/30 mb-4 text-error-500">
        <UIcon
          name="i-lucide-octagon-alert"
          class="w-6 h-6"
          aria-hidden="true"
        />
      </div>
      <h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">
        Category Not Found
      </h2>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto mb-6 leading-relaxed">
        The requested category track could not be located. It may have been removed, renamed, or never existed. Please verify the URL or explore other areas of the system.
      </p>
      <UButton
        to="/categories"
        label="Return to Categories"
        color="neutral"
        size="sm"
        class="rounded-xs"
      />
    </div>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';
</style>
