<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import { useContent } from "~/composables/content";

const route = useRoute();
const slug = route.params.slug as string;

const { getAuthorBySlug, getAuthorBlogs } = useContent();

const itemsPerPage = 12;
const displayLimit = ref(itemsPerPage);

const authorSlug = computed(() => slug);

const { data: author, pending: authorPending, error: authorError } = await getAuthorBySlug(authorSlug);
const { data: rawBlogs, pending: blogsPending } = await getAuthorBlogs(authorSlug, displayLimit);

useSeoMeta({
  title: () => author.value?.name ? `${author.value.name} — Author Profile` : "Contributor Profile",
  description: () => author.value?.description || "Browse technical articles and engineering entries contributed by this team member.",
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
    <div v-if="authorPending && !author" class="py-16 text-center animate-pulse">
      <div class="w-24 h-24 rounded-full bg-neutral-200 dark:bg-neutral-800 mx-auto mb-4" />
      <div class="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4 mx-auto mb-2" />
      <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2 mx-auto" />
    </div>

    <UPage v-else-if="author && !authorError" class="py-10">
      <div class="mb-6">
        <NuxtLink
          to="/authors"
          class="text-xs font-mono font-bold text-neutral-400 dark:text-neutral-500 hover:text-primary-500 items-center gap-1 transition-colors group inline-flex"
        >
          <UIcon name="i-lucide-chevron-left" class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Editorial Roster
        </NuxtLink>
      </div>

      <header class="mb-12 pb-8 border-b border-neutral-100 dark:border-neutral-900">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
          <UAvatar
            v-if="author.avatar?.src"
            :src="author.avatar.src"
            :alt="author.avatar.alt || author.name"
            size="xl"
            class="w-20 h-20 rounded-full object-cover border-2 border-neutral-200 dark:border-neutral-800 ring-4 ring-neutral-50 dark:ring-neutral-900/50"
          />
          <div class="flex-1 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
                {{ author.name }}
              </h1>
              <UBadge
                v-if="author.role"
                color="neutral"
                variant="subtle"
                size="sm"
                class="font-mono uppercase text-[10px] tracking-wider rounded-md"
              >
                {{ author.role }}
              </UBadge>
            </div>

            <p v-if="author.title" class="text-sm font-medium text-primary-600 dark:text-primary-400 font-mono">
              {{ author.title }} <span v-if="author.company" class="text-neutral-400 dark:text-neutral-500">@ {{ author.company }}</span>
            </p>

            <p v-if="author.description" class="text-sm text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
              {{ author.description }}
            </p>

            <div v-if="author.socialLinks?.length > 0" class="flex items-center gap-3 pt-2">
              <UButton
                v-for="link in author.socialLinks"
                :key="link.url"
                :to="link.url"
                target="_blank"
                variant="ghost"
                color="neutral"
                size="sm"
                class="rounded-lg"
                :icon="link.platform === 'github' ? 'i-simple-icons-github' : link.platform === 'twitter' ? 'i-simple-icons-x' : link.platform === 'linkedin' ? 'i-simple-icons-linkedin' : 'i-lucide-link'"
              />
            </div>
          </div>
        </div>
      </header>

      <UPageBody>
        <div class="space-y-12">
          <div class="flex items-center justify-between border-b border-dashed border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 class="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Published Contributions:
              {{ blogs.length }} {{ blogs.length === 1 ? "Article" : "Articles" }}
            </h2>
          </div>

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
              <UIcon name="i-lucide-pen-tool" class="w-5 h-5" />
            </div>
            <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No contributions found
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed">
              {{ author.name }} hasn't contributed any articles or documentation fragments yet. We couldn't locate any published entries associated with this contributor's profile.
            </p>
          </div>

          <div
            v-if="blogsPending"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
          >
            <BlogPostCardSkeleton v-for="n in 3" :key="`append-auth-blog-${n}`" />
          </div>

          <div
            v-if="!hasMoreContent && blogs.length > 0"
            class="text-center pt-10 pb-4 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-widest select-none border-t border-neutral-200/60 dark:border-neutral-800/60"
          >
            You've reached the end of the author's contributions.
          </div>
        </div>
      </UPageBody>
    </UPage>

    <div v-else class="text-center py-24">
      <UIcon name="i-lucide-octagon-alert" class="w-12 h-12 text-error-500 mx-auto mb-4" />
      <h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">
        Author Not Found
      </h2>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto mb-6">
        The requested author profile could not be located. It may have been removed, renamed, or never existed. Please verify the URL or explore other sections of the site.
      </p>
      <UButton
        to="/authors"
        label="Return to Authors"
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
