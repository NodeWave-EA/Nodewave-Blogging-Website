<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, ref } from "vue";

import { useContent } from "~/composables/content";

definePageMeta({
  title: "Browse by Tags",
});

const { getAllTags } = useContent();

const itemsPerPage = 24;
const displayLimit = ref(itemsPerPage);

const { data: rawTags, pending: tagsPending } = await getAllTags(displayLimit);

const enrichedTags = computed(() => {
  return rawTags.value || [];
});

const hasMoreContent = computed(() => {
  if (!rawTags.value)
    return false;
  return rawTags.value.length >= displayLimit.value;
});

useInfiniteScroll(
  typeof window !== "undefined" ? window : null,
  () => {
    if (hasMoreContent.value && !tagsPending.value) {
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
    <UPage class="py-10">
      <UPageHeader
        title="Browse by Tags"
        description="Navigate deep into specific topics, micro-frameworks, and development tracks across our index."
      />

      <UPageBody>
        <div>
          <div v-if="enrichedTags.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-12">
            <NuxtLink
              v-for="tag in enrichedTags"
              :key="tag.slug"
              :to="`/${tag.stem}`"
              class="group relative flex flex-col justify-between p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800/50 bg-white dark:bg-neutral-950 hover:border-primary-500/40 dark:hover:border-primary-400/30 hover:shadow-sm transition-all duration-200 select-none"
            >
              <div class="space-y-1.5">
                <span
                  class="font-mono text-xs font-semibold tracking-wide group-hover:scale-105 transition-transform inline-block"
                  :style="{ color: tag.color || 'var(--color-primary-500)' }"
                >
                  #{{ tag.name }}
                </span>
                <p v-if="tag.meta?.description" class="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-normal">
                  {{ tag.meta.description }}
                </p>
              </div>

              <div class="pt-4 flex items-center justify-between border-t border-neutral-100/70 dark:border-neutral-900/40 mt-3">
                <span class="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Articles
                </span>
                <UBadge
                  size="xs"
                  variant="subtle"
                  class="font-mono px-1.5 rounded text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/40 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                >
                  {{ tag.count }}
                </UBadge>
              </div>
            </NuxtLink>
          </div>

          <div v-else-if="!tagsPending" class="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/30 dark:bg-neutral-900/10">
            <UIcon name="i-lucide-hash" class="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <h3 class="text-sm font-bold mt-3 text-neutral-800 dark:text-neutral-200">
              No tags indexed
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
              There are currently no tags indexed.
            </p>
          </div>

          <div v-if="tagsPending" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-800">
            <div
              v-for="n in 6"
              :key="`loader-${n}`"
              class="h-28 rounded-xl bg-neutral-50 dark:bg-neutral-900/30 p-4 animate-pulse border border-transparent"
            />
          </div>

          <div
            v-if="!hasMoreContent && enrichedTags.length > 0"
            class="text-center pt-10 pb-4 text-neutral-400 dark:text-neutral-500 font-mono text-[9px] uppercase tracking-widest select-none border-t border-neutral-200/60 dark:border-neutral-800/60"
          >
            You've reached the end of the tag index.
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';
</style>
