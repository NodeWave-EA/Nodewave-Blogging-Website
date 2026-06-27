<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, ref } from "vue";

import { useContent } from "~/composables/content";
import { useMatrixDecrypt } from "~/composables/use-matrix-decrypt";

definePageMeta({
  title: "Meet Our Contributors",
});

const { getAllAuthors } = useContent();

const itemsPerPage = 8;
const displayLimit = ref(itemsPerPage);

const { data: rawAuthors, pending: authorsPending } = await getAllAuthors(displayLimit);

const enrichedAuthors = computed(() => {
  return rawAuthors.value || [];
});

const hasMoreContent = computed(() => {
  if (!rawAuthors.value)
    return false;
  return rawAuthors.value.length >= displayLimit.value;
});

useInfiniteScroll(
  typeof window !== "undefined" ? window : null,
  () => {
    if (hasMoreContent.value && !authorsPending.value) {
      displayLimit.value += itemsPerPage;
    }
  },
  {
    distance: 250,
    canLoadMore: () => hasMoreContent.value,
  },
);

function getRoleColor(role: string): "error" | "warning" | "neutral" | "primary" {
  switch (role) {
    case "admin":
      return "error";
    case "editor":
      return "warning";
    case "guest":
      return "neutral";
    default:
      return "primary";
  }
}

const { activeHoverText, startDecryption, clearDecryption } = useMatrixDecrypt({
  speed: 25,
  revealStep: 0.35,
});

onMounted(() => {
  startDecryption("Editorial Roster", "authors-badge");
});
</script>

<template>
  <UContainer>
    <UPage class="py-10">
      <UPageHeader class="mb-12 mx-2">
        <template #headline>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-500/10 dark:bg-primary-400/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
            <UIcon name="i-lucide-users" class="h-3.5 w-3.5 animate-pulse" />
            <ClientOnly>
              <span class="font-mono text-[9px] font-bold uppercase tracking-[0.15em]">
                {{ activeHoverText["authors-badge"] || "Editorial Roster" }}
              </span>
              <template #fallback>
                <span class="font-mono text-[9px] font-bold uppercase tracking-[0.15em]">
                  Editorial Roster
                </span>
              </template>
            </ClientOnly>
          </div>
        </template>

        <template #title>
          <div class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
            Meet the <span class="bg-linear-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">core contributors</span> and architects driving <span class="bg-linear-to-r from-indigo-500 to-emerald-400 bg-clip-text text-transparent">nodewave</span>.
          </div>
        </template>

        <template #description>
          <p class="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            Discover the dedicated developers, tech enthusiasts, and systems architects building our knowledge database. Explore their profiles and dive into their engineering insights.
          </p>
        </template>

        <template #default>
          <div class="pt-4 flex flex-wrap items-center gap-3">
            <NuxtLink
              to="/blogs"
              class="group inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-50 px-5 py-2.5 text-xs font-semibold tracking-wide text-white dark:text-neutral-950 shadow-xs transition-all hover:-translate-y-0.5"
            >
              Read Their Articles
              <UIcon
                name="i-line-md-arrow-right"
                class="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 group-hover:translate-x-0.5 transition-transform"
              />
            </NuxtLink>

            <NuxtLink
              to="/categories"
              class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 py-2.5 text-xs font-medium tracking-wide text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 dark:hover:text-black transition-all shadow-2xs"
            >
              <UIcon name="i-line-md-grid-3-filled" class="h-3.5 w-3.5 text-neutral-400" />
              Explore Topics
            </NuxtLink>
          </div>
        </template>
      </UPageHeader>

      <UPageBody>
        <div>
          <div v-if="enrichedAuthors.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
            <AuthorContributorCard
              v-for="author in enrichedAuthors"
              :key="author.slug"
              :author="author"
              :active-hover-text="activeHoverText"
              @start-decrypt="startDecryption"
              @clear-decrypt="clearDecryption"
              @get-role-color="getRoleColor"
            />
          </div>

          <div v-else-if="!authorsPending" class="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/30 dark:bg-neutral-900/10">
            <UIcon name="i-lucide-users" class="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <h3 class="text-sm font-bold mt-3 text-neutral-800 dark:text-neutral-200">
              No Authors Available
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
              We couldn't locate any contributor profiles or editorial entries in the system at this time. Please check back later or explore other sections of the site.
            </p>
          </div>

          <div v-if="authorsPending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-800">
            <div
              v-for="n in 4"
              :key="`loader-auth-${n}`"
              class="h-68 rounded-2xl bg-neutral-50 dark:bg-neutral-900/20 p-6 animate-pulse border border-transparent"
            />
          </div>

          <div
            v-if="!hasMoreContent && enrichedAuthors.length > 0"
            class="text-center pt-10 pb-4 text-neutral-400 dark:text-neutral-500 font-mono text-[9px] uppercase tracking-widest select-none border-t border-neutral-200/60 dark:border-neutral-800/60"
          >
            You've reached the end of the editorial roster.
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';
</style>
