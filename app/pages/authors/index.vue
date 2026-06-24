<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, ref } from "vue";

import { useContent } from "~/composables/content";

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
</script>

<template>
  <UContainer>
    <UPage class="py-10">
      <UPageHeader
        title="Meet Our Contributors"
        description="Discover the core developers, tech enthusiasts, and architects driving our knowledge database forward."
      />

      <UPageBody>
        <div>
          <div v-if="enrichedAuthors.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
            <div
              v-for="author in enrichedAuthors"
              :key="author.slug"
              class="group relative flex flex-col justify-between p-6 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/60 bg-white dark:bg-neutral-900/40 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/80 hover:border-primary-500/30 dark:hover:border-primary-400/20 hover:shadow-xl hover:shadow-neutral-100 dark:hover:shadow-neutral-950/50 transition-all duration-300"
            >
              <div class="absolute top-0 right-0 p-3 opacity-10 dark:opacity-5 group-hover:scale-110 group-hover:text-primary-500 transition-all pointer-events-none select-none">
                <UIcon name="i-lucide-quote" class="w-16 h-16 transform rotate-180" />
              </div>

              <div class="flex flex-col items-center text-center">
                <div class="relative w-24 h-24 rounded-full p-1 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 group-hover:scale-105 group-hover:border-primary-500/40 dark:hover:border-primary-400/30 transition-all duration-300">
                  <NuxtImg
                    v-if="author.avatar?.src"
                    :src="author.avatar.src"
                    :alt="author.avatar.alt || author.name"
                    :aria-label="`Profile picture of ${author.name}`"
                    width="96"
                    height="96"
                    loading="lazy"
                    format="webp"
                    class="w-full h-full rounded-full object-cover bg-neutral-100 dark:bg-neutral-900"
                  />
                  <div v-else class="w-full h-full rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold text-2xl font-mono">
                    {{ author.name.charAt(0) }}
                  </div>
                </div>

                <h3 class="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-4 tracking-tight group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                  {{ author.name }}
                </h3>

                <div class="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                  <span class="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    {{ author.title || 'Contributor' }}
                  </span>
                  <span v-if="author.company" class="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                    @ {{ author.company }}
                  </span>
                </div>

                <UBadge
                  v-if="author.role && author.role !== 'author'"
                  size="xs"
                  variant="subtle"
                  :color="getRoleColor(author.role)"
                  class="font-mono uppercase tracking-wider text-[9px] mt-2 px-1.5 py-0"
                >
                  {{ author.role }}
                </UBadge>

                <p v-if="author.description" class="text-xs text-neutral-500 dark:text-neutral-400 mt-4 line-clamp-3 leading-relaxed">
                  {{ author.description }}
                </p>

                <div v-if="author.socialLinks?.length" class="flex items-center justify-center gap-3 mt-4 relative z-30">
                  <a
                    v-for="(link, lIdx) in author.socialLinks"
                    :key="`sl-${lIdx}`"
                    :href="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-neutral-400 dark:text-neutral-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                    :title="link.platform"
                  >
                    <UIcon
                      :name="link.platform.toLocaleLowerCase() === 'github' ? 'i-simple-icons-github' : link.platform.toLocaleLowerCase() === 'twitter' ? 'i-simple-icons-x' : 'i-lucide-link'"
                      class="w-4 h-4"
                    />
                  </a>
                </div>
              </div>

              <div class="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 mt-6">
                <NuxtLink
                  :to="`/${author.stem}`"
                  class="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-primary-500 dark:hover:text-primary-400 flex items-center gap-1 transition-colors relative z-20"
                >
                  View Profile
                  <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </NuxtLink>

                <UBadge
                  variant="solid"
                  size="xs"
                  color="neutral"
                  class="font-mono rounded px-2 py-0.5 text-[10px] font-bold dark:bg-white dark:text-neutral-950"
                >
                  {{ author.count }} {{ author.count === 1 ? 'Post' : 'Posts' }}
                </UBadge>
              </div>
            </div>
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
