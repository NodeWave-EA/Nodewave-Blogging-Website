<script setup lang="ts">
import { computed, onMounted } from "vue";

import { siteConfig } from "~/app.meta";

import type { BlogType } from "~/types";

definePageMeta({
  layout: "default",
});

const config = useRuntimeConfig().public;
const { getFeaturedBlogs } = useContent();
const { logger } = useLogger({ context: "pages/index.vue" });

const numberOfFeaturedBlogs = 8;

const { data, pending: isLoading, error: fetchError } = await getFeaturedBlogs(numberOfFeaturedBlogs);

const featuredBlogs = computed<BlogType[]>(() => (data.value || []) as BlogType[]);
logger.log(`Fetched ${featuredBlogs.value.length} featured blogs for the homepage.`);

const { activeHoverText, startDecryption } = useMatrixDecrypt({
  speed: 25,
  revealStep: 0.35,
});

onMounted(() => {
  startDecryption("Curated Posts & Insights", "home-badge");
});

const HOME_TITLE = computed(() => `${config.siteName || "Nodewave"} — Curated Posts & Engineering Insights`);
const HOME_DESCRIPTION = computed(
  () => "Explore the latest curated posts, technical articles, and engineering insights from nodewave. Stay ahead in web development, software architecture, and modern technology.",
);
const HOME_CANONICAL_URL = computed(() => `${config.siteUrl}`);
const HOME_OG_IMAGE = computed(() => `${config.siteUrl}/og-banner.png`);

// Meta & Social Sharing Tags
useSeoMeta({
  title: () => HOME_TITLE.value,
  description: () => HOME_DESCRIPTION.value,
  keywords: "nodewave, curated posts, insights, technology, software engineering, web development, blog, articles, tutorials",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",

  // Open Graph / Facebook
  ogType: "website",
  ogTitle: () => HOME_TITLE.value,
  ogDescription: () => HOME_DESCRIPTION.value,
  ogUrl: () => HOME_CANONICAL_URL.value,
  ogImage: () => HOME_OG_IMAGE.value,
  ogImageAlt: () => `${config.siteName || "Nodewave Blogs"} Homepage`,
  ogSiteName: () => config.siteName || "Nodewave",

  // Twitter
  twitterCard: "summary_large_image",
  twitterTitle: () => HOME_TITLE.value,
  twitterDescription: () => HOME_DESCRIPTION.value,
  twitterImage: () => HOME_OG_IMAGE.value,
});

useHead({
  link: [
    {
      rel: "canonical",
      href: () => HOME_CANONICAL_URL.value,
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon.png",
    },
  ],
});

defineOgImage("NuxtSeo.takumi", {
  title: HOME_TITLE.value,
  description: HOME_DESCRIPTION.value,
  brand: config.siteName,
  colorMode: "dark",
  isPro: true,
});

// Nuxt Schema.org Structured Data
useSchemaOrg([
  // WebSite Schema with Site Search Integration
  defineWebSite({
    name: config.siteName || "Nodewave",
    url: config.siteUrl,
    description: HOME_DESCRIPTION.value,
    potentialAction: [
      {
        "@type": "SearchAction",
        "target": `${config.siteUrl}/blogs?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    ],
  }),

  // WebPage Document Entity
  defineWebPage({
    "@id": `${config.siteUrl}/#webpage`,
    "name": HOME_TITLE.value,
    "description": HOME_DESCRIPTION.value,
    "url": HOME_CANONICAL_URL.value,
  }),

  // Featured Posts ItemList Schema
  computed(() => ({
    "@type": "ItemList",
    "@id": `${config.siteUrl}/#featured-posts`,
    "name": "Featured Insights & Articles",
    "description": "Curated technical articles and featured publications on Nodewave",
    "numberOfItems": featuredBlogs.value.length,
    "itemListElement": featuredBlogs.value.map((blog, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${config.siteUrl}${blog.path}`,
      "name": blog.title,
    })),
  })),
]);
</script>

<template>
  <UContainer class="py-4 sm:py-8">
    <UPage>
      <!-- Hero Header Section -->
      <UPageHeader>
        <template #headline>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-500/10 dark:bg-primary-400/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
            <UIcon name="i-lucide-sparkle" class="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
            <ClientOnly>
              <span class="font-mono text-[9px] font-bold uppercase tracking-[0.15em]">
                {{ activeHoverText["home-badge"] || "Curated Posts & Insights" }}
              </span>
              <template #fallback>
                <span class="font-mono text-[9px] font-bold uppercase tracking-[0.15em]">
                  Curated Posts & Insights
                </span>
              </template>
            </ClientOnly>
          </div>
        </template>

        <template #title>
          <h1 id="featured-heading" class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
            Explore the <span class="bg-linear-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">latest curated posts</span> and insights from <span class="bg-linear-to-r from-indigo-500 to-emerald-400 bg-clip-text text-transparent">nodewave</span>.
          </h1>
        </template>

        <template #description>
          <p class="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            Discover a wealth of knowledge and inspiration through our curated collection of posts and insights. Stay informed, gain valuable perspectives, and fuel your passion for technology and development with our carefully selected content.
          </p>
        </template>

        <template #links>
          <div class="flex flex-wrap gap-2 mt-2" aria-label="Social connections">
            <UButton
              v-for="socialLink in siteConfig.socialLinks"
              :key="socialLink.url"
              :href="socialLink.url"
              target="_blank"
              rel="noopener noreferrer me"
              variant="subtle"
              color="neutral"
              size="sm"
              class="flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800"
              :aria-label="`Visit Nodewave on ${socialLink.platform}`"
            >
              <UIcon :name="socialLink.icon" class="h-4 w-4 text-neutral-500" aria-hidden="true" />
              {{ socialLink.platform.charAt(0).toUpperCase() + socialLink.platform.slice(1) }}
            </UButton>
          </div>
        </template>

        <template #default>
          <div class="pt-4 flex flex-wrap items-center gap-3">
            <NuxtLink
              to="/blogs"
              class="group inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-50 px-5 py-2.5 text-xs font-semibold tracking-wide text-white dark:text-neutral-950 shadow-xs transition-all hover:-translate-y-0.5"
              aria-label="Navigate to all blog articles"
            >
              View All Blogs
              <UIcon
                name="i-line-md-arrow-right"
                class="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
            </NuxtLink>

            <NuxtLink
              to="/categories"
              class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 py-2.5 text-xs font-medium tracking-wide text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 dark:hover:text-black transition-all shadow-2xs"
              aria-label="Explore blog article categories"
            >
              <UIcon name="i-line-md-grid-3-filled" class="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
              Explore Categories
            </NuxtLink>
          </div>
        </template>
      </UPageHeader>

      <!-- Main App Body Context -->
      <UPageBody>
        <!-- Loading State -->
        <div v-if="isLoading" class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 my-6">
          <LazyBlogPostCardSkeleton
            v-for="n in numberOfFeaturedBlogs"
            :key="`home-skeleton-${n}`"
          />
        </div>

        <!-- Error State -->
        <div v-else-if="fetchError" class="text-center py-16 text-red-500 flex flex-col items-center gap-2" role="alert">
          <UIcon name="i-lucide-alert-circle" class="w-8 h-8" aria-hidden="true" />
          <p class="font-medium">
            Failed to retrieve posts. Please check your connection or refresh the page.
          </p>
        </div>

        <!-- Empty State -->
        <div v-else-if="featuredBlogs.length === 0" class="text-center py-16 text-neutral-500 dark:text-neutral-400">
          <UIcon name="i-lucide-book-open" class="w-8 h-8 mx-auto mb-2 opacity-40" aria-hidden="true" />
          <p>No curated insights available right now.</p>
        </div>

        <!-- Loaded Content States -->
        <section v-else class="my-6" aria-labelledby="featured-posts-heading">
          <h2 id="featured-posts-heading" class="sr-only">
            Featured Articles and Insights
          </h2>
          <UPageGrid class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <BlogPostCard
              v-for="blog in featuredBlogs"
              :key="blog.path"
              :post="blog"
            />
          </UPageGrid>
        </section>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';
</style>
