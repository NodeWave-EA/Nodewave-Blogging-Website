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

const enrichedCategories = computed(() => rawCategories.value || []);

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
  { distance: 250, canLoadMore: () => hasMoreContent.value },
);

const { activeHoverText, startDecryption } = useMatrixDecrypt({
  speed: 25,
  revealStep: 0.35,
});

onMounted(() => {
  startDecryption("Explore Categories", "categories-badge");
});
</script>

<template>
  <UContainer>
    <UPage class="py-10">
      <UPageHeader class="mb-12 mx-2">
        <template #headline>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <UIcon name="i-lucide-grid-3x3" class="h-3.5 w-3.5" />
            <span class="font-mono text-[9px] font-bold uppercase tracking-[0.15em]">
              {{ activeHoverText["categories-badge"] || "Explore Categories" }}
            </span>
          </div>
        </template>

        <template #title>
          <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
            Navigate by <span class="bg-linear-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">category</span> or subject area.
          </h1>
        </template>

        <template #description>
          <p class="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            Organized collections to help you find specific technical content faster. Explore domains ranging from architecture to core development.
          </p>
        </template>
      </UPageHeader>

      <UPageBody>
        <!-- Skeleton Loading State -->
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
          <!-- Populated Taxonomy Grid -->
          <div v-if="enrichedCategories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <BaseTaxonomyCard
              v-for="category in enrichedCategories"
              :key="category.slug"
              :item="category"
              fallback-icon="i-lucide-folder-open"
              type-label="category"
            />
          </div>

          <!-- Empty Fallback View -->
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

          <!-- Appending Skeleton Loaders -->
          <div v-if="categoriesPending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-800">
            <div
              v-for="n in 3"
              :key="`append-cat-${n}`"
              class="h-44 rounded-2xl bg-neutral-50 dark:bg-neutral-900/30 p-5 animate-pulse border border-transparent"
            />
          </div>

          <!-- Completion Signifier -->
          <div v-if="!hasMoreContent && enrichedCategories.length > 0" class="text-center pt-10 pb-6 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-widest select-none border-t border-neutral-200/60 dark:border-neutral-800/60">
            You've reached the end of the category index.
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';
</style>
