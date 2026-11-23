<script setup lang="ts">
import { computed, onMounted } from "vue";

import { siteConfig } from "~/app.meta";
import RssSubscribeButton from "~/components/ui/rss-subscribe-button.vue";

import type { BlogType } from "~/types";

definePageMeta({
  layout: "default",
});

const config = useRuntimeConfig().public;
const { getFeaturedBlogs, getAllBlogs } = useContent();
const { logger } = useLogger({ context: "pages/index.vue" });

const numberOfFeaturedBlogs = 12;

const [
  { data: featuredData, pending: featuredPending, error: featuredError },
  { data: recentData, pending: recentPending, error: recentError },
] = await Promise.all([
  getFeaturedBlogs(numberOfFeaturedBlogs),
  getAllBlogs(numberOfFeaturedBlogs * 2),
]);

const featuredBlogs = computed<BlogType[]>(() => {
  const featured = (featuredData.value || []) as BlogType[];
  const recent = (recentData.value || []) as BlogType[];

  // Deduplicate recent blogs that are already in the featured list
  const featuredPaths = new Set(featured.map(blog => blog.path || blog.id || blog.slug));
  const fallbackRecent = recent.filter(blog => !featuredPaths.has(blog.path || blog.id || blog.slug));

  // Combine featured posts with recent fallback posts to hit the exact limit
  return [
    ...featured,
    ...fallbackRecent,
  ].slice(0, numberOfFeaturedBlogs);
});

const isLoading = computed(() => (featuredPending.value || recentPending.value) && featuredBlogs.value.length === 0);
const fetchError = computed(() => Boolean(featuredError.value && recentError.value));

logger.log(`Fetched ${featuredBlogs.value.length} blogs for the homepage preview.`);

const { activeHoverText, startDecryption } = useMatrixDecrypt({
  speed: 25,
  revealStep: 0.35,
});

onMounted(() => {
  startDecryption("Curated Posts & Insights", "home-badge");
});

const siteUrl = computed(() =>
  (config.siteUrl || "https://nodewaveblog.vercel.app").replace(/\/$/, ""),
);
const siteName = computed(() => config.siteName || siteConfig.name || "NodeWave");

const PAGE_TITLE = computed(() => `${siteName.value} — Curated Posts & Engineering Insights`);
const PAGE_DESCRIPTION = computed(
  () => "Explore the latest curated posts, technical articles, and engineering insights from NodeWave. Stay ahead in web development, IoT systems, software architecture, and modern technology.",
);
const PAGE_RSS_URL = "/rss.xml";

// Page-Specific Meta & Social Sharing Overrides (site-wide defaults handled by SiteOpenGraph.vue)
useSeoMeta({
  title: () => PAGE_TITLE.value,
  description: () => PAGE_DESCRIPTION.value,
  ogTitle: () => PAGE_TITLE.value,
  ogDescription: () => PAGE_DESCRIPTION.value,
  ogImageAlt: () => `${siteName.value} — Curated Posts & Engineering Insights`,
  twitterTitle: () => PAGE_TITLE.value,
  twitterDescription: () => PAGE_DESCRIPTION.value,
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
  tagline: "Smart IoT Solutions",
  badge: "Curated Posts & Insights",
  siteUrl: siteUrl.value,
  title: PAGE_TITLE.value,
  description: PAGE_DESCRIPTION.value,
});

// Connected Schema.org Structured Data (Linked to global #website and #organization)
useSchemaOrg([
  defineWebPage({
    "@id": `${siteUrl.value}/#webpage`,
    "url": `${siteUrl.value}/`,
    "name": () => PAGE_TITLE.value,
    "description": () => PAGE_DESCRIPTION.value,
    "isPartOf": { "@id": `${siteUrl.value}/#website` },
    "about": { "@id": `${siteUrl.value}/#organization` },
    "mainEntity": { "@id": `${siteUrl.value}/#featured-posts` },
    "inLanguage": "en-US",
  }),

  computed(() => ({
    "@type": "ItemList" as const,
    "@id": `${siteUrl.value}/#featured-posts`,
    "name": "Featured Insights & Articles",
    "description": "Curated technical articles and featured publications on NodeWave",
    "numberOfItems": featuredBlogs.value.length,
    "itemListElement": featuredBlogs.value.map((blog, index) => ({
      "@type": "ListItem" as const,
      "position": index + 1,
      "url": `${siteUrl.value}${blog.path}`,
      "name": blog.title,
    })),
  })),
]);
</script>

<template>
  <UContainer class="py-4 sm:py-6">
    <UPage>
      <!-- Hero Header Section -->
      <UPageHeader
        class="mb-12"
        :ui="{
          title: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1]',
          description: 'text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed',
        }"
      >
        <template #headline>
          <div class="flex items-center justify-between gap-4">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-500/10 dark:bg-primary-400/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
              <UIcon
                name="i-lucide-sparkle"
                class="h-3.5 w-3.5 animate-pulse"
                aria-hidden="true"
              />
              <ClientOnly>
                <span class="font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
                  {{ activeHoverText["home-badge"] || "Curated Posts & Insights" }}
                </span>
                <template #fallback>
                  <span class="font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
                    Curated Posts & Insights
                  </span>
                </template>
              </ClientOnly>
            </div>

            <!-- RSS Subscribe Button -->
            <RssSubscribeButton
              title="Main Feed"
              :feed-path="PAGE_RSS_URL"
            />
          </div>
        </template>

        <template #title>
          Explore the <span class="bg-linear-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent font-extrabold">latest curated posts</span> and insights from <span class="bg-linear-to-r from-indigo-500 to-emerald-400 bg-clip-text text-transparent font-extrabold">nodewave</span>.
        </template>

        <template #description>
          Discover a wealth of knowledge and inspiration through our curated collection of posts, guides, and insights. Stay informed, gain valuable perspectives, and fuel your passion for technology and development with our carefully selected content.
        </template>

        <template #links>
          <div class="flex flex-wrap items-center gap-2 mt-2" aria-label="Social connections">
            <UButton
              v-for="socialLink in siteConfig.socialLinks"
              :key="socialLink.url"
              :href="socialLink.url"
              target="_blank"
              rel="noopener noreferrer me"
              variant="subtle"
              color="neutral"
              size="sm"
              class="group inline-flex items-center gap-1.5 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/80 hover:bg-(--app-surface-hover) hover:border-primary-500/40 font-mono text-xs text-neutral-700 dark:text-neutral-200 shadow-2xs transition-colors"
              :aria-label="`Visit Nodewave on ${socialLink.platform}`"
            >
              <UIcon
                :name="socialLink.icon"
                class="h-4 w-4 text-neutral-500 dark:text-neutral-400 group-hover:text-primary-500 transition-colors"
                aria-hidden="true"
              />
              <span>{{ socialLink.platform.charAt(0).toUpperCase() + socialLink.platform.slice(1) }}</span>
              <UIcon
                name="i-lucide-arrow-up-right"
                class="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                aria-hidden="true"
              />
            </UButton>
          </div>
        </template>

        <template #default>
          <div class="pt-4 flex flex-wrap items-center gap-3">
            <!-- Primary Link: View All Blogs -->
            <NuxtLink
              to="/blogs"
              class="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xs bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-primary-700 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:bg-primary-500 dark:text-neutral-950 dark:hover:bg-primary-400 dark:focus-visible:outline-primary-400"
            >
              <span>View All Blogs</span>
              <UIcon
                name="i-line-md-arrow-right"
                class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
                aria-hidden="true"
              />
            </NuxtLink>

            <!-- Secondary Link: Explore Categories -->
            <NuxtLink
              to="/categories"
              class="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/80 px-5 py-2.5 text-sm font-medium text-neutral-800 shadow-xs transition-colors hover:bg-(--app-surface-hover) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:text-neutral-200"
            >
              <UIcon
                name="i-line-md-grid-3-filled"
                class="h-4 w-4 text-neutral-500 transition-colors duration-200 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200"
                aria-hidden="true"
              />
              <span>Explore Categories</span>
            </NuxtLink>
          </div>
        </template>
      </UPageHeader>

      <UPageBody>
        <!-- Loading State -->
        <div
          v-if="isLoading"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 my-6"
          aria-label="Loading curated articles"
        >
          <LazyBlogPostCardSkeleton
            v-for="n in numberOfFeaturedBlogs"
            :key="`home-skeleton-${n}`"
          />
        </div>

        <!-- Error State -->
        <div
          v-else-if="fetchError"
          class="text-center py-20 px-4 border border-dashed border-red-300/60 dark:border-red-900/50 rounded-xs bg-red-500/5 my-6"
          role="alert"
        >
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xs bg-red-500/10 border border-red-500/20 mb-4 text-error-500">
            <UIcon
              name="i-lucide-alert-circle"
              class="w-6 h-6"
              aria-hidden="true"
            />
          </div>
          <h2 class="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Unable to Load Articles
          </h2>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Failed to retrieve curated posts. Please check your connection or refresh the page to try again.
          </p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="featuredBlogs.length === 0"
          class="text-center py-20 px-4 border border-dashed border-(--app-border) rounded-xs bg-(--app-surface-subtle)/40 my-6"
          role="status"
        >
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xs bg-(--app-surface-subtle) border border-(--app-border) mb-3 text-neutral-400">
            <UIcon
              name="i-lucide-book-open"
              class="w-5 h-5"
              aria-hidden="true"
            />
          </div>
          <h2 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            No Curated Posts Available
          </h2>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Currently, there are no curated posts to display. Please check back later for updates and new content.
          </p>
        </div>

        <section
          v-else
          class="my-6 space-y-8"
          aria-labelledby="featured-posts-heading"
        >
          <div class="flex items-center justify-between gap-4 border-b border-(--app-border) pb-3">
            <h2
              id="featured-posts-heading"
              class="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400"
            >
              Featured &amp; Latest Publications ({{ featuredBlogs.length }})
            </h2>

            <NuxtLink
              to="/blogs"
              class="group inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xs"
            >
              <span>All Articles</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </NuxtLink>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <BlogPostCard
              v-for="blog in featuredBlogs"
              :key="blog.path"
              :post="blog"
            />
          </div>

          <div class="pt-8 border-t border-(--app-border) flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="font-mono text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Showing {{ featuredBlogs.length }} curated &amp; latest posts from Nodewave.
            </p>

            <div class="flex flex-wrap items-center gap-2">
              <NuxtLink
                to="/blogs"
                class="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/80 hover:bg-(--app-surface-hover) hover:border-primary-500/40 font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span>Browse All Articles</span>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="w-3.5 h-3.5 text-primary-500 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </NuxtLink>

              <NuxtLink
                to="/tags"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/80 hover:bg-(--app-surface-hover) hover:border-primary-500/40 font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <UIcon
                  name="i-lucide-tags"
                  class="w-3.5 h-3.5 text-sky-500"
                  aria-hidden="true"
                />
                <span>Browse Tags</span>
              </NuxtLink>
            </div>
          </div>
        </section>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';
</style>
