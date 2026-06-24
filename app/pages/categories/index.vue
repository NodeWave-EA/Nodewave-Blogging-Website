<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, ref } from "vue";

import { useContent } from "~/composables/content";

definePageMeta({
  title: "Browse by Categories",
});

const { getAllCategories } = useContent();

const itemsPerPage = 12;
const displayLimit = ref(itemsPerPage);

const { data: rawCategories, pending: categoriesPending } = await getAllCategories(displayLimit);

const enrichedCategories = computed(() => {
  return rawCategories.value || [];
});

const hasMoreContent = computed(() => {
  if (!rawCategories.value)
    return false;
  return rawCategories.value.length >= displayLimit.value;
});

useInfiniteScroll(
  typeof window !== "undefined" ? window : null,
  () => {
    if (hasMoreContent.value && !categoriesPending.value) {
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
      <UPageHeader
        title="Browse by Categories"
        description="Explore our curated taxonomy of content categories, each representing a unique area of focus within our knowledge base."
        class="mb-12 border-b border-neutral-100 dark:border-neutral-900 pb-8 mx-1"
      />

      <UPageBody>
        <div v-if="categoriesPending && displayLimit === itemsPerPage" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-1">
          <div
            v-for="n in 6"
            :key="n"
            class="h-44 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 p-5 border border-neutral-100 dark:border-neutral-900 flex flex-col justify-between animate-pulse"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                <div class="w-12 h-5 rounded-md bg-neutral-100 dark:bg-neutral-800" />
              </div>
              <div class="w-2/3 h-5 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
              <div class="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-md" />
            </div>
            <div class="w-24 h-3 bg-neutral-100 dark:bg-neutral-800 rounded-md" />
          </div>
        </div>

        <div v-else class="space-y-12 mx-1">
          <div v-if="enrichedCategories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <NuxtLink
              v-for="category in enrichedCategories"
              :key="category.slug"
              :to="`/${category.stem}`"
              class="group relative p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 hover:border-primary-500/40 hover:shadow-xs transition-all duration-300 flex flex-col justify-between gap-6 overflow-hidden"
            >
              <div
                class="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-500"
                :style="{ backgroundColor: category.color || 'var(--ui-primary)' }"
              />

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-300"
                    :style="{
                      backgroundColor: `${category.color}10` || 'rgba(var(--ui-primary-rgb), 0.05)',
                      borderColor: `${category.color}30` || 'rgba(var(--ui-primary-rgb), 0.15)',
                    }"
                  >
                    <UIcon
                      name="i-lucide-folder-open"
                      class="w-5 h-5"
                      :style="{ color: category.color || 'var(--ui-primary)' }"
                    />
                  </div>

                  <span class="px-2.5 py-1 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 font-mono text-[10px] font-bold text-neutral-500 dark:text-neutral-400 group-hover:border-primary-500/20 group-hover:bg-primary-500/5 transition-all">
                    {{ category.count || 0 }} {{ category.count === 1 ? 'Article' : 'Articles' }}
                  </span>
                </div>

                <div class="space-y-1.5">
                  <h3 class="text-base font-bold text-neutral-900 dark:text-neutral-50 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {{ category.name }}
                  </h3>
                  <p v-if="category.description" class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">
                    {{ category.description }}
                  </p>
                  <p v-else class="text-xs text-neutral-400 dark:text-neutral-600 italic">
                    No description available for this category.
                  </p>
                </div>
              </div>

              <div class="pt-4 border-t border-neutral-100 dark:border-neutral-900/60 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                <span>View Stream Matrix</span>
                <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </NuxtLink>
          </div>

          <div v-else class="text-center py-24 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/20 dark:bg-neutral-900/10">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-900 mb-4">
              <UIcon name="i-lucide-grid-2x2" class="w-6 h-6 text-neutral-400" />
            </div>
            <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No categories indexed
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              There are currently no structured content categories available for browsing. Please check back later or explore other sections of the site.
            </p>
          </div>

          <div
            v-if="categoriesPending"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-800"
          >
            <div
              v-for="n in 3"
              :key="`append-cat-${n}`"
              class="h-44 rounded-2xl bg-neutral-50 dark:bg-neutral-900/30 p-5 animate-pulse border border-transparent"
            />
          </div>

          <div
            v-if="!hasMoreContent && enrichedCategories.length > 0"
            class="text-center pt-10 pb-6 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-widest select-none border-t border-neutral-200/60 dark:border-neutral-800/60"
          >
            You've reached the end of the category index.
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
