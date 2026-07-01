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

// SEO
const config = useRuntimeConfig().public;

const PAGE_TITLE = computed(() => `${author.value?.name || "Author"} Profile`);
const PAGE_DESCRIPTION = computed(() => author.value?.description || `Explore the profile of ${author.value?.name || "this author"} and discover their contributions to our platform.`);
const PAGE_CANONICAL_URL = computed(() => `${config.siteUrl}/authors/${author.value?.slug}`);

useSeoMeta({
  title: toValue(PAGE_TITLE),
  description: toValue(PAGE_DESCRIPTION),
  ogType: "profile",
  ogTitle: toValue(PAGE_TITLE),
  ogDescription: toValue(PAGE_DESCRIPTION),
  twitterCard: "summary_large_image",
  twitterTitle: toValue(PAGE_TITLE),
  twitterDescription: toValue(PAGE_DESCRIPTION),
  robots: "index, follow",
  keywords: `nodewave, author profile, ${author.value?.name || ""}, contributions, articles, tutorials`,
  author: author.value?.name || "",
  twitterSite: author.value?.socialLinks?.find(link => link.platform.toLowerCase() === "twitter")?.url || "",
  twitterCreator: author.value?.socialLinks?.find(link => link.platform.toLowerCase() === "twitter")?.url || "",

  profileFirstName: author.value?.name?.split(" ")[0] || "",
  profileLastName: author.value?.name?.split(" ").slice(1).join(" ") || "",
  profileUsername: author.value?.slug || "",
  profileGender: author.value?.gender || "unknown",
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

defineOgImage("Author.takumi", {
  name: author.value?.name,
  role: author.value?.title,
  avatar: author.value?.avatar?.src,
  articleCount: blogs.value.length,
});
</script>

<template>
  <UContainer>
    <div v-if="authorPending && !author" class="py-16 text-center animate-pulse">
      <div class="w-24 h-24 rounded-full bg-neutral-200 dark:bg-neutral-800 mx-auto mb-4" />
      <div class="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4 mx-auto mb-2" />
      <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2 mx-auto" />
    </div>

    <UPage v-else-if="author && !authorError" class="py-10">
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/authors"
          class="text-xs font-mono font-bold text-neutral-400 dark:text-neutral-500 hover:text-primary-500 flex items-center gap-1 transition-colors group"
        >
          <UIcon name="i-lucide-chevron-left" class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Authors
        </NuxtLink>
        <span class="text-neutral-300 dark:text-neutral-700 font-mono text-xs">/</span>

        <!-- use icon or  -->
        <UBadge
          size="sm"
          class="rounded-full shrink-0"
          variant="subtle"
        >
          <template #leading>
            <UAvatar
              v-if="author.avatar?.src"
              :src="author.avatar.src"
              :alt="`Avatar of ${author.name}`"
              class="w-3 h-3 inline-block mr-1 align-text-top rounded-full object-cover"
            />
          </template>
          <span
            class="text-xs font-mono font-bold uppercase tracking-wider"
            :style="{ color: author.color || 'var(--ui-primary)' }"
          >
            {{ author.name }}
          </span>
        </UBadge>
      </div>

      <header class="mb-16 pt-8 pb-10 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
        <!-- Avatar -->
        <div class="shrink-0">
          <NuxtImg
            v-if="author.avatar?.src"
            :src="author.avatar.src"
            :alt="`Avatar of ${author.name}`"
            class="w-32 h-32 rounded-full object-cover border border-neutral-200 dark:border-neutral-800"
          />
          <div v-else class="w-32 h-32 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
            <UIcon name="i-lucide-user" class="w-12 h-12" />
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 space-y-4 max-w-2xl">
          <div>
            <h1 class="text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight mb-2 text-center md:text-left">
              {{ author.name }}
            </h1>

            <!-- Wrapped Title and Company link for better flow -->
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2 text-lg font-medium text-neutral-600 dark:text-neutral-400 font-mono">
              <span>{{ activeHoverText['author-title'] || author.title }}</span>

              <template v-if="author.company">
                <span class="text-neutral-300 dark:text-neutral-700 hidden md:inline">|</span>
                <div
                  class="inline-flex items-center gap-1.5 hover:text-primary-500 transition-colors"
                >
                  <NuxtImg
                    v-if="author.company.icon?.startsWith('http')"
                    :src="author.company.icon"
                    class="w-4 h-4 rounded-xs shrink-0"
                  />
                  <UIcon
                    v-else
                    :name="author.company.icon || 'i-lucide-globe-check'"
                    class="w-4 h-4 shrink-0"
                  />
                  <NuxtLink
                    :to="author.company.website"
                    target="_blank"
                    class="truncate"
                  >
                    {{ author.company.name }}
                  </NuxtLink>
                </div>

                <!-- Role Badge -->
                <UBadge
                  v-if="author.company.role"
                  :avatar="{
                    src: author.avatar?.src || author.company.icon,
                    loading: 'lazy',
                  }"
                  size="sm"
                  class="rounded-full shrink-0"
                  variant="subtle"
                >
                  {{ author.company.role }}
                </UBadge>
              </template>
            </div>
          </div>

          <p v-if="author.description" class="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed text-center md:text-left">
            {{ author.description }}
          </p>

          <!-- Social Links -->
          <div v-if="author.socialLinks && author.socialLinks.length > 0" class="flex items-center justify-center md:justify-start gap-4">
            <UTooltip
              v-for="link in author.socialLinks"
              :key="link.url"
              :text="`Visit ${author.name}'s ${link.platform} profile`"
              placement="top"
            >
              <UButton
                :to="link.url"
                target="_blank"
                variant="ghost"
                size="md"
                class="social-brand-btn rounded-xl p-2.5 transition-all duration-300 border border-neutral-100 dark:border-neutral-900 hover:border-transparent bg-neutral-50/50 dark:bg-neutral-900/30 text-neutral-500 dark:text-neutral-400"
                :style="getSocialPlatformMeta(link.platform).style"
                :icon="getSocialPlatformMeta(link.platform).icon"
              />
            </UTooltip>

            <!-- company link -->
            <UTooltip
              v-if="author.company && author.company.website"
              :text="`Visit ${author.company.name}'s website`"
              placement="top"
            >
              <UButton
                :to="author.company.website"
                target="_blank"
                variant="ghost"
                size="md"

                class="social-brand-btn rounded-xl p-2.5 transition-all duration-300 border border-neutral-100 dark:border-neutral-900 hover:border-transparent bg-neutral-50/50 dark:bg-neutral-900/30 text-neutral-500 dark:text-neutral-400"
              >
                <!-- use image or icon -->
                <NuxtImg
                  v-if="author.company.icon?.startsWith('http')"
                  :src="author.company.icon"
                  class="w-5 h-5 rounded-xs shrink-0"
                />
                <UIcon
                  v-else
                  :name="author.company.icon || 'i-lucide-globe-check'"
                  class="w-5 h-5 shrink-0"
                />
              </UButton>
            </UTooltip>
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
