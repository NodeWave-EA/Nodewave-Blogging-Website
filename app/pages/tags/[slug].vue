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

useSeoMeta({
  title: () => tag.value?.name ? `#${tag.value.name} — Topic Archive` : "Tag Archive",
  description: () => tag.value?.meta?.description || "Browse engineering entries cataloged under this technical topic taxonomy.",
});

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
</script>

<template>
  <UContainer>
    <div v-if="tagPending && !tag" class="py-16 text-center animate-pulse">
      <div class="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4 mx-auto mb-4" />
      <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2 mx-auto" />
    </div>

    <UPage v-else-if="tag && !tagError" class="py-10">
      <header class="mb-10 pb-6 border-b border-neutral-100 dark:border-neutral-900">
        <div class="flex items-center gap-2 mb-3">
          <NuxtLink
            to="/tags"
            class="text-xs font-mono font-bold text-neutral-400 dark:text-neutral-500 hover:text-primary-500 flex items-center gap-1 transition-colors group"
          >
            <UIcon name="i-lucide-chevron-left" class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Tags
          </NuxtLink>
          <span class="text-neutral-300 dark:text-neutral-700 font-mono text-xs">/</span>
          <span
            class="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/50 text-neutral-600 dark:text-neutral-400"
          >
            <UIcon name="i-lucide-hash" class="w-3 h-3 inline-block mr-1" />
            {{ tag.name }}
          </span>
        </div>

        <h1 class="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight sm:text-4xl">
          <span class="text-primary-500 dark:text-primary-400 font-light">#</span>{{ tag.name }}
        </h1>

        <p v-if="tag.meta?.description" class="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-2xl leading-relaxed">
          {{ tag.meta.description }}
        </p>
      </header>

      <UPageBody>
        <div class="space-y-12">
          <div v-if="blogs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <BlogPostCard
              v-for="blog in blogs"
              :key="blog.path"
              :post="blog"
              class="h-full transition-all duration-300"
            />
          </div>

          <div v-else-if="!blogsPending" class="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/20 dark:bg-neutral-900/10">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-900 mb-3 text-neutral-400">
              <UIcon name="i-lucide-hash" class="w-5 h-5" />
            </div>
            <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No Articles Found
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed">
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
            class="text-center pt-10 pb-4 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-widest select-none border-t border-neutral-200/60 dark:border-neutral-800/60"
          >
            You've reached the end of the blogs archive for <span class="font-semibold text-neutral-700 dark:text-neutral-300">#{{ tag.name }}</span>.
          </div>
        </div>
      </UPageBody>
    </UPage>

    <div v-else class="text-center py-24">
      <UIcon name="i-lucide-octagon-alert" class="w-12 h-12 text-error-500 mx-auto mb-4" />
      <h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">
        Tag Not Found
      </h2>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto mb-6">
        We couldn't locate any published articles or documentation fragments associated with the <span class="font-semibold text-neutral-700 dark:text-neutral-300">#{{ tagSlug }}</span> topic. Please check the URL or return to the taxonomy hub to explore other topics.
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
