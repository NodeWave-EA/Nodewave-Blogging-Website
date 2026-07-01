<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import { useContent } from "~/composables/content";

const route = useRoute();
const slug = route.params.slug as string;

const { getTagBySlug, getTagBlogs } = useContent();

const itemsPerPage = 12;
const displayLimit = ref(itemsPerPage);

const tagSlug = computed(() => slug);

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

// SEO
const config = useRuntimeConfig().public;

const PAGE_TITLE = computed(() => `Browse ${tag.value?.name} tag articles`);
const PAGE_DESCRIPTION = computed(() => tag.value?.description || tag.value?.meta?.description || `Explore articles under the ${tag.value?.name} classification.`);
const PAGE_CANONICAL_URL = computed(() => `${config.siteUrl}/tags/${tag.value?.slug}`);

useSeoMeta({
  title: toValue(PAGE_TITLE),
  description: toValue(PAGE_DESCRIPTION),
  ogType: "website",
  ogTitle: toValue(PAGE_TITLE),
  ogDescription: toValue(PAGE_DESCRIPTION),
  twitterCard: "summary_large_image",
  twitterTitle: toValue(PAGE_TITLE),
  twitterDescription: toValue(PAGE_DESCRIPTION),
});

useHead({
  link: [
    {
      rel: "canonical",
      href: toValue(PAGE_CANONICAL_URL),
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon.png",
    },
  ],
});

defineOgImage("Taxonomy.takumi", {
  title: toValue(PAGE_TITLE),
  description: toValue(PAGE_DESCRIPTION),
  type: "Tag",
  articleCount: blogs.value.length,
});
</script>

<template>
  <UContainer>
    <div v-if="tagPending && !tag" class="py-24 text-center animate-pulse">
      <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-32 mx-auto mb-4" />
      <div class="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-48 mx-auto mb-3" />
      <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-96 mx-auto" />
    </div>

    <UPage v-else-if="tag && !tagError" class="py-10">
      <UPageHeader class="mb-12 pb-8 border-b border-neutral-100 dark:border-neutral-900 mx-1">
        <template #title>
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <NuxtLink
                to="/tags"
                class="text-xs font-mono font-bold text-neutral-400 dark:text-neutral-500 hover:text-primary-500 flex items-center gap-1 transition-colors group"
              >
                <UIcon name="i-lucide-chevron-left" class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Back to Tags
              </NuxtLink>
              <span class="text-neutral-300 dark:text-neutral-700 font-mono text-xs">/</span>
              <span
                class="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/50"
                :style="{ color: tag.color || 'var(--ui-primary)' }"
              >
                <UIcon
                  :name="tag.icon || 'i-lucide-hash'"
                  class="w-3 h-3 inline-block mr-1 align-text-top"
                />
                {{ tag.name }}
              </span>
            </div>

            <h1 class="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight flex items-center gap-2.5">
              <UIcon
                :name="tag.icon || 'i-lucide-hash'"
                class="w-8 h-8 shrink-0"
                :style="{ color: tag.color || 'var(--ui-primary)' }"
              />
              {{ tag.name }}
            </h1>
          </div>
        </template>

        <template #description>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed mt-2">
            {{ tag.description || "Explore articles and documentation related to this technical topic." }}
          </p>
        </template>
      </UPageHeader>

      <UPageBody>
        <div class="space-y-12 mx-1">
          <div v-if="blogs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <BlogPostCard
              v-for="blog in blogs"
              :key="blog.path"
              :post="blog"
              class="h-full transition-all duration-300"
            />
          </div>

          <div v-else-if="!blogsPending" class="text-center py-24 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/20 dark:bg-neutral-900/10">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-900 mb-4 text-neutral-400">
              <UIcon :name="tag.icon || 'i-lucide-hash'" class="w-6 h-6" />
            </div>
            <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No Articles Found
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              There are currently no articles cataloged under <span class="font-semibold text-neutral-700 dark:text-neutral-300">#{{ tag.name }}</span>. Please check back later or explore other topics in the taxonomy.
            </p>
          </div>

          <div
            v-if="blogsPending"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
          >
            <BlogPostCardSkeleton v-for="n in 3" :key="`append-tag-blog-${n}`" />
          </div>

          <div
            v-if="!hasMoreContent && blogs.length > 0"
            class="text-center pt-10 pb-6 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-widest select-none border-t border-neutral-200/60 dark:border-neutral-800/60"
          >
            You've reached the end of the blogs archive for <span class="font-semibold text-neutral-700 dark:text-neutral-300">#{{ tag.name }}</span>.
          </div>
        </div>
      </UPageBody>
    </UPage>

    <div v-else class="text-center py-24">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-900 mb-4 text-error-500">
        <UIcon name="i-lucide-octagon-alert" class="w-6 h-6" />
      </div>
      <h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">
        Tag Not Found
      </h2>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto mb-6 leading-relaxed">
        We couldn't locate any published articles associated with the <span class="font-semibold text-neutral-700 dark:text-neutral-300">#{{ tagSlug }}</span> topic. Please check the URL or return to the taxonomy hub.
      </p>
      <UButton
        to="/tags"
        label="Return to Tags"
        color="neutral"
        size="sm"
        class="rounded-lg"
      />
    </div>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';
</style>
