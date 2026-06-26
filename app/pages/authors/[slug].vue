<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { useContent } from "~/composables/content";
import { useMatrixDecrypt } from "~/composables/use-matrix-decrypt";

definePageMeta({
  title: "Contributor Profile",
});

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

const blogs = computed(() => rawBlogs.value || []);

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

const { activeHoverText, startDecryption } = useMatrixDecrypt({
  speed: 25,
  revealStep: 0.35,
});

onMounted(() => {
  if (author.value?.title) {
    startDecryption(author.value.title, "author-title");
  }
});

function getSocialPlatformMeta(platform: string) {
  const platforms: Record<string, { icon: string; style: Record<string, string> }> = {
    github: {
      icon: "i-simple-icons-github",
      style: { "--social-hover-color": "#24292e", "--social-bg": "rgba(36, 41, 46, 0.1)" },
    },
    twitter: {
      icon: "i-simple-icons-x",
      style: { "--social-hover-color": "#1da1f2", "--social-bg": "rgba(29, 161, 242, 0.1)" },
    },
    x: {
      icon: "i-simple-icons-x",
      style: { "--social-hover-color": "#000000", "--social-bg": "rgba(0, 0, 0, 0.1)" },
    },
    linkedin: {
      icon: "i-simple-icons-linkedin",
      style: { "--social-hover-color": "#0077b5", "--social-bg": "rgba(0, 119, 181, 0.1)" },
    },
  };

  return platforms[platform.toLowerCase()] || {
    icon: "i-lucide-link",
    style: { "--social-hover-color": "var(--ui-primary)", "--social-bg": "rgba(var(--color-primary-500-rgb), 0.1)" },
  };
}
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

      <header class="relative mb-12 p-6 md:p-8 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/80 bg-white/50 dark:bg-neutral-950/40 backdrop-blur-md overflow-hidden shadow-xs">
        <div
          class="pointer-events-none absolute -right-24 -top-24 w-72 h-72 rounded-full blur-3xl opacity-10 dark:opacity-20 bg-primary-500"
        />
        <div
          class="pointer-events-none absolute -left-24 -bottom-24 w-72 h-72 rounded-full blur-3xl opacity-5 dark:opacity-10 bg-emerald-500"
        />

        <div class="relative z-10 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-8">
          <div class="relative group">
            <div class="absolute inset-0 rounded-full bg-linear-to-tr from-primary-500 via-neutral-200 to-emerald-500 dark:to-neutral-800 opacity-40 blur-xs group-hover:opacity-70 transition-opacity duration-500" />
            <UAvatar
              v-if="author.avatar?.src"
              :src="author.avatar.src"
              :alt="author.avatar.alt || author.name"
              size="xl"
              class="relative w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white dark:border-neutral-950 shadow-md"
            />
          </div>

          <div class="flex-1 space-y-3 w-full">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex flex-wrap items-center justify-center md:justify-flex-start gap-2.5">
                  <h1 class="text-3xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">
                    {{ author.name }}
                  </h1>
                  <UBadge
                    v-if="author.role"
                    variant="subtle"
                    size="sm"
                    class="font-mono uppercase text-[9px] tracking-widest rounded-md bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20"
                  >
                    {{ author.role }}
                  </UBadge>
                </div>

                <p v-if="author.title" class="text-sm font-semibold text-neutral-700 dark:text-neutral-300 font-mono min-h-5">
                  {{ activeHoverText['author-title'] || author.title }}
                  <span v-if="author.company" class="text-neutral-400 dark:text-neutral-500 font-normal">
                    @ {{ author.company }}
                  </span>
                </p>
              </div>

              <div v-if="author.socialLinks && author.socialLinks.length > 0" class="flex items-center justify-center gap-2">
                <UButton
                  v-for="link in author.socialLinks"
                  :key="link.url"
                  :to="link.url"
                  target="_blank"
                  variant="ghost"
                  size="md"
                  class="social-brand-btn rounded-xl p-2.5 transition-all duration-300 border border-neutral-100 dark:border-neutral-900 hover:border-transparent bg-neutral-50/50 dark:bg-neutral-900/30 text-neutral-500 dark:text-neutral-400"
                  :style="getSocialPlatformMeta(link.platform).style"
                  :icon="getSocialPlatformMeta(link.platform).icon"
                />
              </div>
            </div>

            <p v-if="author.description" class="text-sm text-neutral-600 dark:text-neutral-400 max-w-4xl leading-relaxed">
              {{ author.description }}
            </p>
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

          <div v-if="blogsPending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
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

.social-brand-btn:hover {
  background-color: var(--social-bg) !important;
  color: var(--social-hover-color) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px -2px var(--social-bg);
}
</style>
