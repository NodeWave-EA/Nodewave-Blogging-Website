<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";

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
  typeof window !== "undefined" ? window : null,
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

// SEO Meta Tags for the Blogs Page
const config = useRuntimeConfig().public;

const BLOGS_TITLE = "Browse All Blogs";
const BLOGS_DESCRIPTION = "Browse the entire collection of technical articles, architecture notes, and development logs.";
const BLOGS_CANONICAL_URL = `${config.siteUrl}/blogs`;

useSeoMeta({
  title: BLOGS_TITLE,
  description: BLOGS_DESCRIPTION,
  ogTitle: BLOGS_TITLE,
  ogDescription: BLOGS_DESCRIPTION,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: BLOGS_TITLE,
  twitterDescription: BLOGS_DESCRIPTION,
  robots: "index, follow",
  keywords: "nodewave, complete archive, technical articles, architecture notes, development logs, blog, articles, tutorials",
});

useHead({
  link: [
    {
      rel: "canonical",
      href: BLOGS_CANONICAL_URL,
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon.png",
    },
  ],
});

defineOgImage("NuxtSeo.takumi", {
  title: BLOGS_TITLE,
  description: BLOGS_DESCRIPTION,
  brand: config.siteName,
  colorMode: "dark",
  isPro: true,
});
</script>

<template>
  <UContainer class="py-4 sm:py-6">
    <UPage>
      <UPageHeader class="mb-12 mx-2">
        <template #headline>
          <div
            class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-500/10 dark:bg-primary-400/10 text-primary-600 dark:text-primary-400 border border-primary-500/20"
          >
            <UIcon name="i-lucide-library" class="h-3.5 w-3.5" />
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
        </template>

        <template #title>
          <div
            class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1]"
          >
            Explore our
            <span class="text-gradient font-extrabold">complete collection</span>
            of technical articles, architecture notes, and development logs.
          </div>
        </template>

        <template #description>
          <p class="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            A comprehensive archive of all technical articles, architecture notes, and development logs published on
            nodewave.
          </p>
        </template>

        <template #default>
          <div class="pt-4 flex flex-wrap items-center gap-3">
            <!-- categories -->
            <NuxtLink
              to="/categories"
              class="group inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-50 px-5 py-2.5 text-xs font-semibold tracking-wide text-white dark:text-neutral-950 shadow-xs transition-all hover:-translate-y-0.5"
            >
              Browse Categories
              <UIcon
                name="i-line-md-arrow-right"
                class="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 group-hover:translate-x-0.5 transition-transform"
              />
            </NuxtLink>
            <!-- tags -->
            <NuxtLink
              to="/tags"
              class="group inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-50 px-5 py-2.5 text-xs font-semibold tracking-wide text-white dark:text-neutral-950 shadow-xs transition-all hover:-translate-y-0.5"
            >
              Browse Tags
              <UIcon
                name="i-line-md-arrow-right"
                class="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 group-hover:translate-x-0.5 transition-transform"
              />
            </NuxtLink>
          </div>
        </template>
      </UPageHeader>

      <UPageBody>
        <!-- Initial Loading State -->
        <div
          v-if="blogsPending && displayLimit === itemsPerPage"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-1 py-2"
        >
          <LazyBlogPostCardSkeleton v-for="n in 6" :key="n" />
        </div>

        <div v-else class="space-y-6 mx-1 py-2">
          <div class="space-y-12">
            <!-- Content Grid Layout -->
            <div v-if="blogs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              <BlogPostCard
                v-for="blog in blogs"
                :key="blog.path"
                :post="blog"
                class="h-full transition-all duration-300"
              />
            </div>

            <!-- Empty Fallback State -->
            <div
              v-else
              class="text-center py-24 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/20 dark:bg-neutral-900/10"
            >
              <div
                class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-900 mb-4 shadow-3xs transition-transform hover:scale-105"
              >
                <UIcon name="i-lucide-folder-open" class="w-6 h-6 text-neutral-400" />
              </div>
              <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                No Articles Found
              </h3>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                We couldn't locate any published articles or documentation fragments in the system at this time.
              </p>
            </div>

            <!-- Infinite Scroll Appending Skeletons -->
            <div
              v-if="blogsPending"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-800/60"
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

.social-network-pill:hover {
  background-color: var(--brand-bg-opacity) !important;
  color: var(--brand-hover-color) !important;
  transform: translateY(-1px);
}
</style>
