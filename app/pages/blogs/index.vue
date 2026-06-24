<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, ref } from "vue";

import { useContent } from "~/composables/content";

definePageMeta({
  title: "Browse by Blogs",
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
</script>

<template>
  <UContainer>
    <UPage>
      <UPageBody>
        <div v-if="blogsPending && displayLimit === itemsPerPage" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-1 py-6">
          <BlogPostCardSkeleton v-for="n in 6" :key="n" />
        </div>

        <div v-else class="space-y-6 mx-1 py-6">
          <div class="space-y-12">
            <div v-if="blogs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              <BlogPostCard
                v-for="blog in blogs"
                :key="blog.path"
                :post="blog"
                class="h-full transition-all duration-300"
              />
            </div>

            <div v-else class="text-center py-24 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/20 dark:bg-neutral-900/10">
              <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-900 mb-4 shadow-3xs">
                <UIcon name="i-lucide-folder-open" class="w-6 h-6 text-neutral-400" />
              </div>
              <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                No Articles Found
              </h3>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                We couldn't locate any published articles or documentation fragments in the system at this time. Please check back later or explore other sections of the site.
              </p>
            </div>

            <div
              v-if="blogsPending"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-800"
            >
              <BlogPostCardSkeleton v-for="n in 3" :key="`append-${n}`" />
            </div>

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
