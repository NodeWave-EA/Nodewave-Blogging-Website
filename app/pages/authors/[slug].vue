<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import RssSubscribeButton from "~/components/ui/rss-subscribe-button.vue";
import { useContent } from "~/composables/content";
import { useMatrixDecrypt } from "~/composables/use-matrix-decrypt";

definePageMeta({
  title: "Contributor Profile",
});

const route = useRoute();
const authorSlug = computed(() => route.params.slug as string);

const { getAuthorBySlug, getAuthorBlogs } = useContent();

const itemsPerPage = 12;
const displayLimit = ref(itemsPerPage);

const { data: author, pending: authorPending, error: authorError } = await getAuthorBySlug(authorSlug);
const { data: rawBlogs, pending: blogsPending } = await getAuthorBlogs(authorSlug, displayLimit);

const blogs = computed(() => rawBlogs.value || []);

const hasMoreContent = computed(() => {
  if (!rawBlogs.value || rawBlogs.value.length === 0)
    return false;
  return rawBlogs.value.length >= displayLimit.value;
});

useInfiniteScroll(
  typeof window !== "undefined"
    ? window
    : null,
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
      style: { "--social-hover-color": "currentColor", "--social-bg": "rgba(128, 128, 128, 0.14)" },
    },
    twitter: {
      icon: "i-simple-icons-x",
      style: { "--social-hover-color": "currentColor", "--social-bg": "rgba(128, 128, 128, 0.14)" },
    },
    x: {
      icon: "i-simple-icons-x",
      style: { "--social-hover-color": "currentColor", "--social-bg": "rgba(128, 128, 128, 0.14)" },
    },
    linkedin: {
      icon: "i-simple-icons-linkedin",
      style: { "--social-hover-color": "#0077b5", "--social-bg": "rgba(0, 119, 181, 0.12)" },
    },
  };

  return platforms[platform.toLowerCase()] || {
    icon: "i-lucide-link",
    style: { "--social-hover-color": "var(--ui-primary)", "--social-bg": "color-mix(in srgb, var(--ui-primary) 12%, transparent)" },
  };
}

const config = useRuntimeConfig().public;

const PAGE_TITLE = computed(() => `${author.value?.name || "Author"} Profile`);
const PAGE_DESCRIPTION = computed(
  () => author.value?.description || `Explore the profile of ${author.value?.name || "this author"} and discover their contributions to our platform.`,
);
const PAGE_CANONICAL_URL = computed(() => `${config.siteUrl}/authors/${author.value?.slug || authorSlug.value}`);
const AUTHOR_RSS_URL = computed(() => `/authors/${author.value?.slug || authorSlug.value}/rss.xml`);

const authorAvatarUrl = computed(() => {
  const src = author.value?.avatar?.src;
  if (!src)
    return `${config.siteUrl}/avatar.png`;
  return src.startsWith("http")
    ? src
    : `${config.siteUrl}${src}`;
});

const socialUrls = computed(() => {
  const urls: string[] = [];
  if (author.value?.website)
    urls.push(author.value.website);
  if (author.value?.company?.website)
    urls.push(author.value.company.website);
  if (author.value?.socialLinks) {
    author.value.socialLinks.forEach((link) => {
      if (link.url)
        urls.push(link.url);
    });
  }
  return urls;
});

// Meta & Social Sharing Tags
useSeoMeta({
  title: () => PAGE_TITLE.value,
  description: () => PAGE_DESCRIPTION.value,
  keywords: () => `nodewave, author profile, ${author.value?.name || ""}, contributions, articles, tutorials`,
  robots: "index, follow, max-image-preview:large",

  ogType: "profile",
  ogTitle: () => PAGE_TITLE.value,
  ogDescription: () => PAGE_DESCRIPTION.value,
  ogUrl: () => PAGE_CANONICAL_URL.value,
  ogImageAlt: () => author.value?.name || "Author Avatar",
  ogSiteName: () => config.siteName || "Nodewave",

  profileFirstName: () => author.value?.name?.split(" ")[0] || "",
  profileLastName: () => author.value?.name?.split(" ").slice(1).join(" ") || "",
  profileUsername: () => author.value?.slug || authorSlug.value,

  twitterCard: "summary_large_image",
  twitterTitle: () => PAGE_TITLE.value,
  twitterDescription: () => PAGE_DESCRIPTION.value,
  twitterSite: () => author.value?.socialLinks?.find(l => l.platform.toLowerCase() === "twitter" || l.platform.toLowerCase() === "x")?.url || "",
  twitterCreator: () => author.value?.socialLinks?.find(l => l.platform.toLowerCase() === "twitter" || l.platform.toLowerCase() === "x")?.url || "",

  author: () => author.value?.name || "",
});

useHead({
  link: [
    {
      rel: "canonical",
      href: () => PAGE_CANONICAL_URL.value,
    },
    {
      rel: "alternate",
      type: "application/rss+xml",
      title: () => `NodeWave — ${author.value?.name || "Author"} RSS Feed`,
      href: () => `${PAGE_CANONICAL_URL.value}/rss.xml`,
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon.png",
    },
  ],
});

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: "Home", item: "/" },
      { name: "Authors", item: "/authors" },
      {
        name: () => author.value?.name || "Author Profile",
        item: () => PAGE_CANONICAL_URL.value,
      },
    ],
  }),

  {
    "@type": "ProfilePage",
    "@id": `${PAGE_CANONICAL_URL.value}/#profilepage`,
    "url": PAGE_CANONICAL_URL.value,
    "name": PAGE_TITLE.value,
    "description": PAGE_DESCRIPTION.value,
    "mainEntity": { "@id": `${PAGE_CANONICAL_URL.value}/#author` },
  },

  definePerson({
    "@id": `${PAGE_CANONICAL_URL.value}/#author`,
    "name": author.value?.name || "Contributor",
    "jobTitle": author.value?.title,
    "description": author.value?.description,
    "image": authorAvatarUrl.value,
    "url": PAGE_CANONICAL_URL.value,
    "sameAs": socialUrls.value,
    "worksFor": author.value?.company
      ? {
          "@type": "Organization",
          "name": author.value.company.name,
          "url": author.value.company.website,
        }
      : undefined,
  }),
]);

defineOgImage("Author.takumi", {
  colorMode: "light",
  name: () => author.value?.name,
  role: () => author.value?.title,
  avatar: () => author.value?.avatar?.src,
  articleCount: () => blogs.value.length,
});
</script>

<template>
  <UContainer class="py-4 sm:py-6">
    <!-- Author Profile Initial Skeleton -->
    <div
      v-if="authorPending && !author"
      class="py-12 text-center animate-pulse"
      aria-label="Loading author profile"
    >
      <USkeleton class="w-24 h-24 rounded-full bg-(--app-surface-subtle) mx-auto mb-4" />
      <USkeleton class="h-8 rounded-xs w-48 bg-(--app-surface-subtle) mx-auto mb-2" />
      <USkeleton class="h-4 rounded-xs w-80 max-w-full bg-(--app-surface-subtle) mx-auto" />
    </div>

    <UPage v-else-if="author && !authorError" class="py-6">
      <!-- Top Breadcrumb & RSS Bar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <nav aria-label="Breadcrumb" class="flex items-center gap-2">
          <NuxtLink
            to="/authors"
            class="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 hover:text-primary-500 flex items-center gap-1 transition-colors group focus-visible:ring-1 focus-visible:ring-primary-500 rounded-xs"
          >
            <UIcon
              name="i-lucide-chevron-left"
              class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
            Back to Authors
          </NuxtLink>
          <span class="text-neutral-400 dark:text-neutral-600 font-mono text-xs" aria-hidden="true">/</span>

          <UBadge
            size="sm"
            class="rounded-xs shrink-0 bg-(--app-surface-subtle)/80 border border-(--app-border)"
            variant="subtle"
          >
            <template #leading>
              <UAvatar
                v-if="author.avatar?.src"
                :src="author.avatar.src"
                :alt="`Avatar of ${author.name}`"
                class="w-3.5 h-3.5 inline-block mr-1 align-text-top rounded-full object-cover"
              />
            </template>
            <span
              class="text-xs font-mono font-bold uppercase tracking-wider"
              :style="{ color: author.color || 'var(--ui-primary)' }"
            >
              {{ author.name }}
            </span>
          </UBadge>
        </nav>

        <!-- Author RSS Subscribe Button -->
        <RssSubscribeButton
          :title="author.name"
          :feed-path="AUTHOR_RSS_URL"
        />
      </div>

      <header class="mb-10 py-4 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8 bg-transparent border-0 relative overflow-hidden">
        <!-- Avatar Block -->
        <div class="shrink-0">
          <NuxtImg
            v-if="author.avatar?.src"
            :src="author.avatar.src"
            :alt="author.avatar.alt || `Portrait of ${author.name}`"
            width="128"
            height="128"
            class="w-32 h-32 rounded-full object-cover border border-(--app-border) bg-(--app-surface-subtle) shadow-sm"
          />
          <div
            v-else
            class="w-32 h-32 rounded-full bg-(--app-surface-subtle) border border-(--app-border) flex items-center justify-center text-neutral-500 dark:text-neutral-400 font-mono text-3xl font-bold shadow-sm"
            aria-hidden="true"
          >
            {{ author.name.charAt(0) }}
          </div>
        </div>

        <!-- Info Block -->
        <div class="flex-1 space-y-4 max-w-2xl">
          <div>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight mb-2 text-center md:text-left">
              {{ author.name }}
            </h1>

            <div class="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2 text-base sm:text-lg font-medium text-neutral-600 dark:text-neutral-400 font-mono">
              <span>{{ activeHoverText["author-title"] || author.title }}</span>

              <template v-if="author.company">
                <span class="text-neutral-300 dark:text-neutral-700 hidden md:inline" aria-hidden="true">|</span>
                <div class="inline-flex items-center gap-1.5 hover:text-primary-500 transition-colors">
                  <NuxtImg
                    v-if="author.company.icon?.startsWith('http')"
                    :src="author.company.icon"
                    :alt="`${author.company.name} logo`"
                    class="w-4 h-4 rounded-xs shrink-0"
                  />
                  <UIcon
                    v-else
                    :name="author.company.icon || 'i-lucide-building-2'"
                    class="w-4 h-4 shrink-0"
                    aria-hidden="true"
                  />
                  <NuxtLink
                    v-if="author.company.website"
                    :to="author.company.website"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="truncate focus-visible:ring-1 focus-visible:ring-primary-500 rounded-xs"
                    :aria-label="`Visit ${author.company.name} website (opens in a new tab)`"
                  >
                    {{ author.company.name }}
                  </NuxtLink>
                  <span v-else class="truncate">{{ author.company.name }}</span>
                </div>

                <UBadge
                  v-if="author.company.role"
                  :avatar="author.company.icon?.startsWith('http') ? { src: author.company.icon, alt: `${author.company.name} logo`, loading: 'lazy' } : undefined"
                  :icon="!author.company.icon?.startsWith('http') ? (author.company.icon || 'i-lucide-briefcase') : undefined"
                  size="sm"
                  class="rounded-xs shrink-0 bg-(--app-surface-subtle)/80 border border-(--app-border)"
                  variant="subtle"
                >
                  {{ author.company.role }}
                </UBadge>
              </template>
            </div>
          </div>

          <p v-if="author.description" class="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed text-center md:text-left">
            {{ author.description }}
          </p>

          <!-- Social & Website Links -->
          <div
            v-if="(author.socialLinks && author.socialLinks.length > 0) || author.website || author.company?.website"
            class="flex items-center justify-center md:justify-start gap-2.5"
          >
            <UTooltip
              v-for="link in author.socialLinks"
              :key="link.url"
              :text="`Visit ${author.name}'s ${link.platform} profile`"
              placement="top"
            >
              <UButton
                :to="link.url"
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="md"
                class="social-brand-btn rounded-xs p-2 transition-all duration-200 border border-(--app-border) hover:border-transparent bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 text-neutral-600 dark:text-neutral-300"
                :style="getSocialPlatformMeta(link.platform).style"
                :icon="getSocialPlatformMeta(link.platform).icon"
                :aria-label="`Visit ${author.name}'s ${link.platform} profile (opens in a new tab)`"
              />
            </UTooltip>

            <UTooltip
              v-if="author.website"
              :text="`Visit ${author.name}'s personal website`"
              placement="top"
            >
              <UButton
                :to="author.website"
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="md"
                class="social-brand-btn rounded-xs p-2 transition-all duration-200 border border-(--app-border) hover:border-transparent bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 text-neutral-600 dark:text-neutral-300"
                :style="{ '--social-hover-color': 'var(--ui-primary)', '--social-bg': 'color-mix(in srgb, var(--ui-primary) 12%, transparent)' }"
                :aria-label="`Visit ${author.name}'s personal website (opens in a new tab)`"
              >
                <UAvatar
                  v-if="author.avatar?.src"
                  :src="author.avatar.src"
                  :alt="author.name"
                  size="2xs"
                  class="rounded-full shrink-0"
                />
                <UIcon
                  v-else
                  name="i-lucide-globe"
                  class="w-4 h-4 shrink-0"
                  aria-hidden="true"
                />
              </UButton>
            </UTooltip>

            <UTooltip
              v-if="author.company && author.company.website"
              :text="`Visit ${author.company.name}'s website`"
              placement="top"
            >
              <UButton
                :to="author.company.website"
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="md"
                class="social-brand-btn rounded-xs p-2 transition-all duration-200 border border-(--app-border) hover:border-transparent bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 text-neutral-600 dark:text-neutral-300"
                :style="{ '--social-hover-color': 'var(--ui-primary)', '--social-bg': 'color-mix(in srgb, var(--ui-primary) 12%, transparent)' }"
                :aria-label="`Visit ${author.company.name}'s company website (opens in a new tab)`"
              >
                <NuxtImg
                  v-if="author.company.icon?.startsWith('http')"
                  :src="author.company.icon"
                  :alt="`${author.company.name} logo`"
                  class="w-4 h-4 rounded-xs shrink-0"
                />
                <UIcon
                  v-else
                  :name="author.company.icon || 'i-lucide-building-2'"
                  class="w-4 h-4 shrink-0"
                  aria-hidden="true"
                />
              </UButton>
            </UTooltip>
          </div>
        </div>
      </header>

      <UPageBody>
        <div class="space-y-8 my-6">
          <div class="flex items-center justify-between border-b border-(--app-border) pb-3">
            <h2 class="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Published Contributions:
              {{ blogs.length }} {{ blogs.length === 1 ? "Article" : "Articles" }}
            </h2>
          </div>

          <!-- Initial Loading Skeletons -->
          <div
            v-if="blogsPending && displayLimit === itemsPerPage"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            aria-label="Loading author articles"
          >
            <LazyBlogPostCardSkeleton v-for="n in 6" :key="`init-auth-blog-${n}`" />
          </div>

          <section
            v-else-if="blogs.length > 0"
            aria-label="Author's published articles"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <BlogPostCard
                v-for="blog in blogs"
                :key="blog.path"
                :post="blog"
              />
            </div>
          </section>

          <!-- Empty Fallback State -->
          <div
            v-else
            class="text-center py-20 border border-dashed border-(--app-border) rounded-xs bg-(--app-surface-subtle)/40"
            role="status"
          >
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xs bg-(--app-surface-subtle) border border-(--app-border) mb-3 text-neutral-400">
              <UIcon
                name="i-lucide-pen-tool"
                class="w-5 h-5"
                aria-hidden="true"
              />
            </div>
            <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No contributions found
            </h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              {{ author.name }} hasn't contributed any articles or documentation fragments yet. We couldn't locate any published entries associated with this contributor's profile.
            </p>
          </div>

          <!-- Infinite Scroll Appending Skeletons -->
          <div
            v-if="blogsPending && displayLimit > itemsPerPage"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-5"
            aria-label="Loading additional articles"
          >
            <LazyBlogPostCardSkeleton v-for="n in 3" :key="`append-auth-blog-${n}`" />
          </div>

          <!-- End of List Indicator -->
          <div
            v-if="!hasMoreContent && blogs.length > 0"
            class="text-center pt-10 pb-4 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-widest select-none border-t border-(--app-border)"
          >
            You've reached the end of the author's contributions.
          </div>
        </div>
      </UPageBody>
    </UPage>

    <!-- Error State -->
    <div
      v-else
      class="text-center py-24 border border-dashed border-red-300/60 dark:border-red-900/50 rounded-xs bg-red-500/5 my-10"
      role="alert"
    >
      <UIcon
        name="i-lucide-octagon-alert"
        class="w-12 h-12 text-error-500 mx-auto mb-4"
        aria-hidden="true"
      />
      <h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">
        Author Not Found
      </h2>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto mb-6 leading-relaxed">
        The requested author profile could not be located. It may have been removed, renamed, or never existed. Please verify the URL or explore other sections of the site.
      </p>
      <UButton
        to="/authors"
        label="Return to Authors"
        color="neutral"
        variant="subtle"
        size="sm"
        class="rounded-xs"
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
