<script lang="ts" setup>
import type { ContentSurroundLink } from "@nuxt/ui";
import type { BlogAuthor, BlogTag, BlogType } from "~/types";

defineOptions({
  name: "BlogDetailPage",
});

definePageMeta({
  layout: "blog",
});

const { logger } = useLogger({ context: "BlogDetailPage" });
const route = useRoute();
const runtimeConfig = useRuntimeConfig().public;

const { scrollProgress } = useReadingProgress();
const { getBlogBySlug, getSurroundingBlogs } = useContent();

const slug = computed(() => String(route.params.slug || ""));
const blogPath = computed(() => route.path);

// Content Fetching & 404 Guard
const [
  { data: blogQueryResult, pending: blogLoading, error: blogError },
  { data: surroundQueryResult, pending: surroundLoading, error: surroundError },
] = await Promise.all([
  getBlogBySlug(slug),
  getSurroundingBlogs(blogPath),
]);

const isLoading = computed(() => blogLoading.value || surroundLoading.value);
const fetchError = computed(() => blogError.value || surroundError.value);

const currentBlog = computed(() => blogQueryResult.value as unknown as BlogType | null);
const surroundingBlog = computed(() => (surroundQueryResult.value || []) as unknown as ContentSurroundLink[]);

if (!currentBlog.value && !blogError.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Blog not found",
    message: `The blog with slug "${slug.value}" could not be found.`,
    fatal: true,
  });
}

// Derived Content, Dates & Editorial Helpers
const blogAuthor = computed(() => (currentBlog.value?.author || null) as unknown as BlogAuthor | null);
const blogTags = computed(() => (currentBlog.value?.tags || []) as unknown as BlogTag[]);
const categorySlug = computed(() => currentBlog.value?.category || "general");

const tocLinks = computed(() => currentBlog.value?.body?.toc?.links || []);
const hasToc = computed(() => tocLinks.value.length > 0);

// Mobile TOC disclosure state: auto-closes when a user selects an anchor link
const isTocOpen = ref(false);

function handleTocClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  if (target?.closest("a")) {
    isTocOpen.value = false;
  }
}

watch(
  () => route.hash,
  () => {
    isTocOpen.value = false;
  },
);

function parseDateSafe(value?: string | Date | null): Date | null {
  if (!value)
    return null;
  const parsed = value instanceof Date
    ? value
    : new Date(value);
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed;
}

const utcDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const shortUtcDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const publishedDateObj = computed(() => parseDateSafe(currentBlog.value?.date));
const updatedDateObj = computed(() => parseDateSafe(currentBlog.value?.updatedAt));

const publishedIsoDate = computed(() => publishedDateObj.value?.toISOString() || "");
const modifiedIsoDate = computed(() => updatedDateObj.value?.toISOString() || publishedIsoDate.value);

const formattedPublishDate = computed(() =>
  publishedDateObj.value
    ? utcDateFormatter.format(publishedDateObj.value)
    : "",
);

const formattedUpdatedDate = computed(() =>
  updatedDateObj.value
    ? shortUtcDateFormatter.format(updatedDateObj.value)
    : "",
);

const hasBeenUpdated = computed(() => {
  if (!publishedDateObj.value || !updatedDateObj.value)
    return false;
  return updatedDateObj.value.getTime() - publishedDateObj.value.getTime() >= 86_400_000;
});

const readingTimeText = computed(() => currentBlog.value?.meta?.readingTime?.text || "");
const wordCountFormatted = computed(() => {
  const words = currentBlog.value?.meta?.readingTime?.words;
  if (!words || typeof words !== "number")
    return "";
  return `${new Intl.NumberFormat("en-US").format(words)} words`;
});

function hasEditorialCaption(caption?: string | null): boolean {
  if (!caption)
    return false;
  const trimmed = caption.trim();
  return trimmed.length > 0 && trimmed !== "Article caption text";
}

const carousel = useTemplateRef("carousel");
const activeIndex = ref(0);

function onSelect(index: number) {
  activeIndex.value = index;
}

function selectSlide(index: number) {
  activeIndex.value = index;
  carousel.value?.emblaApi?.scrollTo(index);
}

// SEO, Social Meta, Schema.org & OG Image
const siteName = computed(() => runtimeConfig.siteName || "Nodewave");
const siteUrl = computed(() => (runtimeConfig.siteUrl || "").replace(/\/$/, ""));

const BLOG_TITLE = computed(() => currentBlog.value?.seo?.title || currentBlog.value?.title || "Article Detail");
const BLOG_DESCRIPTION = computed(() => currentBlog.value?.seo?.description || currentBlog.value?.description || "");
const BLOG_CANONICAL_URL = computed(() => `${siteUrl.value}${toValue(blogPath)}`);

const coverImageUrl = computed(() => {
  const src = currentBlog.value?.coverImage?.src;
  if (!src)
    return `${siteUrl.value}/preview.png`;
  return src.startsWith("http")
    ? src
    : `${siteUrl.value}${src}`;
});

useSeoMeta({
  title: () => BLOG_TITLE.value,
  description: () => BLOG_DESCRIPTION.value,
  keywords: () => currentBlog.value?.seo?.keywords?.join(", ") || undefined,
  creator: () => blogAuthor.value?.name || siteName.value,
  author: () => blogAuthor.value?.name || siteName.value,
  publisher: () => siteName.value,

  // Open Graph / Facebook
  ogType: "article",
  ogTitle: () => currentBlog.value?.seo?.ogTitle || BLOG_TITLE.value,
  ogDescription: () => currentBlog.value?.seo?.ogDescription || BLOG_DESCRIPTION.value,
  ogUrl: () => BLOG_CANONICAL_URL.value,
  ogImageAlt: () => currentBlog.value?.coverImage?.alt || BLOG_TITLE.value,
  ogSiteName: () => siteName.value,

  // Twitter
  twitterCard: "summary_large_image",
  twitterTitle: () => currentBlog.value?.seo?.twitterTitle || BLOG_TITLE.value,
  twitterDescription: () => currentBlog.value?.seo?.twitterDescription || BLOG_DESCRIPTION.value,

  // Indexing Directives
  robots: () =>
    currentBlog.value?.seo?.noIndex
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",

  // Article Metadata
  articleAuthor: () => [blogAuthor.value?.name || siteName.value],
  articlePublishedTime: () => publishedIsoDate.value,
  articleModifiedTime: () => modifiedIsoDate.value,
  articleSection: () => categorySlug.value,
  articleTag: () => blogTags.value.map(tag => tag.name),
});

useHead({
  link: [
    {
      rel: "canonical",
      href: () => BLOG_CANONICAL_URL.value,
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
      { name: "Blogs", item: "/blogs" },
      ...(currentBlog.value?.category
        ? [
            { name: currentBlog.value.category, item: `/categories/${currentBlog.value.category}` },
          ]
        : []),
      {
        name: () => BLOG_TITLE.value,
        item: () => BLOG_CANONICAL_URL.value,
      },
    ],
  }),

  defineArticle({
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": () => BLOG_CANONICAL_URL.value,
    "headline": () => BLOG_TITLE.value,
    "description": () => BLOG_DESCRIPTION.value,
    "image": () => coverImageUrl.value,
    "datePublished": () => publishedIsoDate.value,
    "dateModified": () => modifiedIsoDate.value,
    "wordCount": () => currentBlog.value?.meta?.readingTime?.words,
    "keywords": () => blogTags.value.map(t => t.name),
    "about": () => currentBlog.value?.description || BLOG_DESCRIPTION.value,
    "author": {
      "@type": "Person",
      "name": blogAuthor.value?.name || siteName.value,
      "url": blogAuthor.value?.stem
        ? `${siteUrl.value}/${blogAuthor.value.stem}`
        : undefined,
    },
    "publisher": {
      "@type": "Organization",
      "name": siteName.value,
      "logo": {
        "@type": "ImageObject",
        "url": runtimeConfig.siteLogo || undefined,
      },
    },
  }),
]);

if (currentBlog.value) {
  defineOgImage("BlogPost.takumi", {
    colorMode: "light",
    title: () => BLOG_TITLE.value,
    author: blogAuthor.value?.name,
    date: publishedDateObj.value
      ? shortUtcDateFormatter.format(publishedDateObj.value)
      : String(currentBlog.value.date || ""),
    category: categorySlug.value,
    avatar: blogAuthor.value?.avatar?.src,
    backgroundImage: currentBlog.value?.coverImage?.src,
    readingTime: readingTimeText.value,
  });
}

logger.debug("Loaded blog detail page", { slug: slug.value, tagsCount: blogTags.value.length });
</script>

<template>
  <UContainer class="py-4 sm:py-6">
    <ClientOnly>
      <div
        v-if="scrollProgress > 0"
        role="progressbar"
        aria-label="Article reading progress"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="Math.min(100, Math.max(0, Math.round(scrollProgress)))"
        class="fixed top-0 left-0 right-0 h-0.75 z-50 pointer-events-none bg-transparent"
      >
        <div
          class="h-full bg-linear-to-r from-primary-500 via-teal-400 to-sky-400 transition-[width] duration-100 ease-out"
          :style="{ width: `${Math.min(100, Math.max(0, scrollProgress))}%` }"
        />
      </div>
    </ClientOnly>

    <!-- Error Fallback State -->
    <div
      v-if="fetchError"
      role="alert"
      class="flex flex-col items-center justify-center py-24 px-6 my-8 gap-4 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/40 text-center"
    >
      <div class="inline-flex items-center justify-center size-12 rounded-xs border border-error-500/20 bg-error-500/10 text-error-500">
        <UIcon
          name="i-lucide-octagon-alert"
          class="size-6"
          aria-hidden="true"
        />
      </div>
      <div class="space-y-1 max-w-md">
        <h1 class="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Unable to Load Article
        </h1>
        <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          The requested article document could not be retrieved at this time. Please try again or return to the archive.
        </p>
      </div>
      <UButton
        label="Return to blog archive"
        icon="i-lucide-arrow-left"
        to="/blogs"
        color="neutral"
        variant="subtle"
        size="sm"
        class="rounded-xs font-mono text-xs border border-(--app-border)"
      />
    </div>

    <!-- Loading Skeleton State -->
    <div
      v-else-if="isLoading"
      aria-busy="true"
      aria-label="Loading article content"
      class="space-y-8 max-w-4xl py-8 animate-pulse"
    >
      <div class="flex items-center justify-between gap-4">
        <USkeleton class="h-5 w-28 rounded-xs bg-(--app-surface-subtle)" />
        <USkeleton class="h-6 w-32 rounded-xs bg-(--app-surface-subtle)" />
      </div>
      <div class="space-y-3">
        <USkeleton class="h-10 sm:h-12 w-11/12 rounded-xs bg-(--app-surface-subtle)" />
        <USkeleton class="h-10 sm:h-12 w-3/4 rounded-xs bg-(--app-surface-subtle)" />
      </div>
      <div class="space-y-2">
        <USkeleton class="h-4 w-full max-w-2xl rounded-xs bg-(--app-surface-subtle)" />
        <USkeleton class="h-4 w-4/5 max-w-xl rounded-xs bg-(--app-surface-subtle)" />
      </div>
      <div class="flex items-center gap-4 pt-4 border-t border-(--app-border)">
        <USkeleton class="h-8 w-36 rounded-xs bg-(--app-surface-subtle)" />
        <USkeleton class="h-4 w-28 rounded-xs bg-(--app-surface-subtle)" />
        <USkeleton class="h-4 w-24 rounded-xs bg-(--app-surface-subtle)" />
      </div>
      <USkeleton class="h-56 sm:h-68 w-full rounded-xs bg-(--app-surface-subtle)" />
    </div>

    <!-- Main Article Layout -->
    <UPage
      v-else-if="currentBlog"
      class="py-4 sm:py-6"
      :ui="{
        root: 'flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-10 min-w-0',
        center: hasToc ? 'lg:col-span-8 xl:col-span-9 min-w-0' : 'lg:col-span-12 min-w-0',
        right: 'lg:col-span-4 xl:col-span-3 min-w-0',
      }"
    >
      <!-- Editorial Hero Header -->
      <UPageHeader
        :title="currentBlog.title"
        :description="currentBlog.description"
        class="mb-6 lg:mb-8 border-b border-(--app-border) pb-6 bg-transparent min-w-0"
        :ui="{
          title: 'text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15] text-balance break-words',
          description: 'text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl leading-relaxed font-normal mt-3 text-pretty',
        }"
      >
        <template #headline>
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4 min-w-0">
            <!-- Semantic Breadcrumb Navigation -->
            <nav aria-label="Breadcrumb" class="flex items-center flex-wrap gap-1.5 text-xs font-mono min-w-0">
              <NuxtLink
                to="/blogs"
                class="inline-flex items-center gap-1.5 font-semibold text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group rounded-xs py-0.5"
              >
                <UIcon
                  name="i-lucide-arrow-left"
                  class="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
                <span>Blogs</span>
              </NuxtLink>

              <span class="text-neutral-400 dark:text-neutral-600 select-none" aria-hidden="true">/</span>

              <NuxtLink
                :to="`/categories/${categorySlug}`"
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-500/20 text-[10px] font-bold uppercase tracking-wider hover:bg-primary-500/15 transition-colors"
              >
                <UIcon
                  name="i-lucide-folder"
                  class="size-3"
                  aria-hidden="true"
                />
                <span>{{ categorySlug }}</span>
              </NuxtLink>
            </nav>

            <!-- Featured Indicator Badge -->
            <div
              v-if="currentBlog.featured"
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider select-none"
            >
              <UIcon
                name="i-lucide-sparkles"
                class="size-3 text-amber-500"
                aria-hidden="true"
              />
              <span>Featured Article</span>
            </div>
          </div>
        </template>

        <!-- Article Metadata & Action Strip -->
        <div class="flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs font-mono text-neutral-600 dark:text-neutral-400 pt-5 mt-5 border-t border-(--app-border) min-w-0">
          <div class="flex flex-wrap items-center gap-y-2.5 gap-x-4 min-w-0">
            <!-- Author Pill -->
            <NuxtLink
              v-if="blogAuthor"
              :to="`/${blogAuthor.stem}`"
              :aria-label="`View profile of author ${blogAuthor.name}`"
              class="group inline-flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xs bg-(--app-surface-subtle) border border-(--app-border) hover:border-primary-500/50 hover:bg-(--app-surface-hover) transition-colors max-w-full"
            >
              <UAvatar
                :src="blogAuthor.avatar?.src"
                :alt="blogAuthor.avatar?.alt || blogAuthor.name"
                size="2xs"
                class="ring-1 ring-(--app-border) shrink-0"
              />
              <span class="font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                {{ blogAuthor.name }}
              </span>
            </NuxtLink>

            <!-- Publication Date -->
            <div v-if="publishedIsoDate" class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-calendar"
                class="size-3.5 text-primary-500 shrink-0"
                aria-hidden="true"
              />
              <time :datetime="publishedIsoDate">
                {{ formattedPublishDate }}
              </time>
            </div>

            <!-- Last Updated Timestamp -->
            <div
              v-if="hasBeenUpdated && modifiedIsoDate"
              class="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400"
            >
              <span class="text-neutral-300 dark:text-neutral-700" aria-hidden="true">•</span>
              <UIcon
                name="i-lucide-refresh-cw"
                class="size-3 text-primary-500 shrink-0"
                aria-hidden="true"
              />
              <span>
                Updated
                <time :datetime="modifiedIsoDate">{{ formattedUpdatedDate }}</time>
              </span>
            </div>

            <!-- Reading Time & Word Count -->
            <div v-if="readingTimeText" class="flex items-center gap-1.5">
              <span class="text-neutral-300 dark:text-neutral-700" aria-hidden="true">•</span>
              <UIcon
                name="i-lucide-clock"
                class="size-3.5 text-primary-500 shrink-0"
                aria-hidden="true"
              />
              <span>{{ readingTimeText }}</span>
              <span v-if="wordCountFormatted" class="hidden sm:inline text-neutral-500 dark:text-neutral-500">
                ({{ wordCountFormatted }})
              </span>
            </div>
          </div>

          <!-- Share Controls -->
          <div class="flex items-center gap-2 shrink-0">
            <BlogPostShare :title="currentBlog.title" />
          </div>
        </div>
      </UPageHeader>

      <!-- Sticky Desktop & Auto-Closing Mobile Table of Contents -->
      <template v-if="hasToc" #right>
        <UContentToc
          v-model:open="isTocOpen"
          :links="tocLinks"
          title="On this page"
          highlight
          highlight-color="primary"
          highlight-variant="circuit"
          class="lg:pt-1"
          @click="handleTocClick"
        />
      </template>

      <!-- Main Article Column -->
      <UPageBody class="mt-0 space-y-9 min-w-0 w-full">
        <figure
          v-if="currentBlog.coverImage?.src"
          class="overflow-hidden rounded-xs border border-(--app-border) bg-(--app-surface-subtle) shadow-2xs"
        >
          <div class="relative aspect-16/9 sm:aspect-21/9 max-h-52 sm:max-h-68 lg:max-h-80 w-full overflow-hidden bg-(--app-surface-subtle)">
            <NuxtImg
              :src="currentBlog.coverImage.src"
              :alt="currentBlog.coverImage.alt || currentBlog.title"
              sizes="sm:100vw md:90vw lg:896px"
              preload
              fetchpriority="high"
              decoding="async"
              class="size-full object-cover object-center"
            />
          </div>
          <figcaption
            v-if="hasEditorialCaption(currentBlog.coverImage.caption)"
            class="px-3.5 py-2 border-t border-(--app-border) bg-(--app-bg) font-mono text-[11px] text-neutral-600 dark:text-neutral-400 flex items-center gap-2"
          >
            <UIcon
              name="i-lucide-image"
              class="size-3.5 text-primary-500 shrink-0"
              aria-hidden="true"
            />
            <span>{{ currentBlog.coverImage.caption }}</span>
          </figcaption>
        </figure>

        <article
          :aria-label="currentBlog.title"
          class="prose dark:prose-invert max-w-none w-full min-w-0 markdown-body selection:bg-primary-500/15"
        >
          <ContentRenderer :value="currentBlog" />
        </article>

        <!-- Interactive Image Gallery -->
        <section
          v-if="currentBlog.gallery?.length"
          aria-labelledby="article-gallery-heading"
          class="pt-8 border-t border-(--app-border) min-w-0"
        >
          <div class="flex items-center justify-between gap-2 mb-4 select-none">
            <div class="flex items-center gap-2 text-xs font-mono text-neutral-600 dark:text-neutral-400 uppercase tracking-widest font-bold">
              <UIcon
                name="i-lucide-images"
                class="size-4 text-primary-500"
                aria-hidden="true"
              />
              <h2 id="article-gallery-heading" class="font-mono text-xs font-bold uppercase tracking-widest">
                Article Gallery
              </h2>
            </div>
            <span class="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              {{ activeIndex + 1 }} / {{ currentBlog.gallery.length }}
            </span>
          </div>

          <ClientOnly>
            <UCarousel
              ref="carousel"
              v-slot="{ item }"
              :items="currentBlog.gallery"
              class-names
              arrows
              dots
              loop
              :ui="{
                root: 'relative overflow-hidden',
                item: 'basis-full md:basis-1/2 transition-opacity duration-300 [&:not(.is-snapped)]:opacity-40',
                container: 'rounded-xs',
                prev: 'start-2 sm:start-3',
                next: 'end-2 sm:end-3',
              }"
              @select="onSelect"
            >
              <div class="p-1.5 w-full">
                <figure class="group overflow-hidden rounded-xs border border-(--app-border) bg-(--app-surface-subtle)">
                  <div class="aspect-video max-h-56 w-full overflow-hidden">
                    <NuxtImg
                      :src="item.src"
                      :alt="item.alt || 'Article gallery illustration'"
                      loading="lazy"
                      decoding="async"
                      class="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <figcaption
                    v-if="hasEditorialCaption(item.caption)"
                    class="px-3 py-2 border-t border-(--app-border) bg-(--app-bg) font-mono text-[10px] text-neutral-600 dark:text-neutral-400 line-clamp-2"
                  >
                    {{ item.caption }}
                  </figcaption>
                </figure>
              </div>
            </UCarousel>

            <!-- Accessible Thumbnail Selector Strip -->
            <div
              v-if="currentBlog.gallery.length > 1"
              role="group"
              aria-label="Gallery slide thumbnails"
              class="flex flex-wrap gap-2 justify-center mt-6"
            >
              <button
                v-for="(item, index) in currentBlog.gallery"
                :key="`${item.src}-${index}`"
                type="button"
                :aria-label="`Show gallery image ${index + 1}${item.alt ? `: ${item.alt}` : ''}`"
                :aria-pressed="activeIndex === index"
                class="size-16 cursor-pointer overflow-hidden rounded-xs border transition-all focus-visible:ring-2 focus-visible:ring-primary-500"
                :class="
                  activeIndex === index
                    ? 'border-primary-500 ring-1 ring-primary-500/40 opacity-100'
                    : 'border-(--app-border) opacity-45 hover:opacity-90'
                "
                @click="selectSlide(index)"
              >
                <NuxtImg
                  :src="item.src"
                  :alt="item.alt || `Gallery thumbnail ${index + 1}`"
                  loading="lazy"
                  decoding="async"
                  class="size-full object-cover"
                />
              </button>
            </div>
          </ClientOnly>
        </section>

        <!-- Category, Tags & External Reference Anchors -->
        <section
          aria-label="Article taxonomy and references"
          class="p-4 sm:p-5 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/40 flex flex-col sm:flex-row flex-wrap gap-6 sm:gap-12 justify-between min-w-0"
        >
          <!-- Category -->
          <div class="flex flex-col gap-2 min-w-0">
            <div class="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 select-none">
              <UIcon
                name="i-lucide-folder"
                class="size-3.5 text-primary-500"
                aria-hidden="true"
              />
              <span>Category</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                :to="`/categories/${categorySlug}`"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-xs font-medium rounded-xs bg-(--app-bg) border border-(--app-border) text-neutral-900 dark:text-neutral-100 hover:border-primary-500/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <UIcon
                  name="i-lucide-folder-open"
                  class="size-3.5 text-primary-500"
                  aria-hidden="true"
                />
                <span>{{ categorySlug }}</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="blogTags.length > 0" class="flex flex-col gap-2 flex-1 min-w-0">
            <div class="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 select-none">
              <UIcon
                name="i-lucide-tags"
                class="size-3.5 text-primary-500"
                aria-hidden="true"
              />
              <span>Tagged Topics</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="tag in blogTags"
                :key="tag.stem"
                :to="`/${tag.stem}`"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-xs font-medium rounded-xs bg-(--app-bg) border border-(--app-border) text-neutral-800 dark:text-neutral-200 hover:border-primary-500/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                :style="{
                  '--tag-color': tag.color || 'var(--ui-primary)',
                }"
              >
                <UIcon
                  :name="tag.icon || 'i-lucide-hash'"
                  class="size-3.5 text-(--tag-color)"
                  aria-hidden="true"
                />
                <span>{{ tag.name }}</span>
              </NuxtLink>
            </div>
          </div>
        </section>

        <!-- External Anchors / Quick Reference Links -->
        <UPageAnchors
          v-if="currentBlog.anchors?.length"
          title="Related Resources & References"
          :links="currentBlog.anchors"
        />

        <!-- Author Bio Spotlight Card -->
        <aside
          v-if="blogAuthor"
          aria-labelledby="article-author-heading"
          class="p-5 sm:p-6 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/50 space-y-4 min-w-0"
        >
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-(--app-border) min-w-0">
            <div class="flex items-center gap-3.5 min-w-0">
              <NuxtLink
                :to="`/${blogAuthor.stem}`"
                :aria-label="`Visit ${blogAuthor.name}'s author page`"
                class="shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <UAvatar
                  :src="blogAuthor.avatar?.src"
                  :alt="blogAuthor.avatar?.alt || blogAuthor.name"
                  size="lg"
                  class="ring-1 ring-(--app-border)"
                />
              </NuxtLink>

              <div class="min-w-0">
                <span
                  id="article-author-heading"
                  class="text-[10px] font-mono uppercase tracking-widest text-primary-600 dark:text-primary-400 font-bold block"
                >
                  Written By
                </span>
                <NuxtLink
                  :to="`/${blogAuthor.stem}`"
                  class="text-base font-bold text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {{ blogAuthor.name }}
                </NuxtLink>
                <p v-if="blogAuthor.title" class="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-0.5 break-words">
                  {{ blogAuthor.title }}
                  <template v-if="blogAuthor.company?.name">
                    <span class="text-neutral-400 dark:text-neutral-600"> · </span>
                    <NuxtLink
                      :to="blogAuthor.company.website"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="underline decoration-(--app-border) underline-offset-4 hover:text-primary-500 transition-colors"
                    >
                      {{ blogAuthor.company.name }}
                    </NuxtLink>
                  </template>
                </p>
              </div>
            </div>

            <!-- Author Social & Web Links -->
            <div class="flex flex-wrap items-center gap-1.5 shrink-0">
              <UTooltip
                v-if="blogAuthor.company"
                :text="`${blogAuthor.company.role} at ${blogAuthor.company.name}`"
              >
                <NuxtLink
                  :to="blogAuthor.company.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="`${blogAuthor.company.name} website`"
                  class="inline-flex items-center justify-center size-8 rounded-xs border border-(--app-border) bg-(--app-bg) text-neutral-600 dark:text-neutral-400 hover:border-primary-500/50 hover:text-primary-500 transition-colors"
                >
                  <NuxtImg
                    v-if="blogAuthor.company.icon?.startsWith('http')"
                    :src="blogAuthor.company.icon"
                    :alt="blogAuthor.company.name"
                    class="size-4 rounded-xs shrink-0"
                  />
                  <UIcon
                    v-else
                    :name="blogAuthor.company.icon || 'i-lucide-building-2'"
                    class="size-4 shrink-0"
                    aria-hidden="true"
                  />
                </NuxtLink>
              </UTooltip>

              <UTooltip
                v-if="blogAuthor.website"
                text="Personal Website"
              >
                <NuxtLink
                  :to="blogAuthor.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="`Visit ${blogAuthor.name}'s personal website`"
                  class="inline-flex items-center justify-center size-8 rounded-xs border border-(--app-border) bg-(--app-bg) text-neutral-600 dark:text-neutral-400 hover:border-primary-500/50 hover:text-primary-500 transition-colors"
                >
                  <UIcon
                    name="i-lucide-globe"
                    class="size-4"
                    aria-hidden="true"
                  />
                </NuxtLink>
              </UTooltip>

              <UTooltip
                v-for="social in blogAuthor.socialLinks"
                :key="social.url"
                :text="social.platform"
              >
                <NuxtLink
                  :to="social.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="`${blogAuthor.name} on ${social.platform}`"
                  class="inline-flex items-center justify-center size-8 rounded-xs border border-(--app-border) bg-(--app-bg) text-neutral-600 dark:text-neutral-400 hover:border-primary-500/50 hover:text-primary-500 transition-colors"
                >
                  <UIcon
                    :name="social.icon"
                    class="size-4"
                    aria-hidden="true"
                  />
                </NuxtLink>
              </UTooltip>
            </div>
          </div>

          <p
            v-if="blogAuthor.description"
            class="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal"
          >
            {{ blogAuthor.description }}
          </p>

          <div class="pt-1 flex flex-wrap items-center justify-between gap-4">
            <NuxtLink
              to="/blogs"
              class="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-primary-500 transition-colors"
            >
              <UIcon
                name="i-lucide-library"
                class="size-3.5"
                aria-hidden="true"
              />
              <span>All Articles</span>
            </NuxtLink>

            <NuxtLink
              :to="`/${blogAuthor.stem}`"
              class="group inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors"
            >
              <span>More by {{ blogAuthor.name }}</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </NuxtLink>
          </div>
        </aside>

        <!-- Previous / Next Article Surround Navigation -->
        <nav
          v-if="surroundingBlog.length > 0"
          aria-label="Adjacent articles"
          class="min-w-0"
        >
          <UContentSurround :surround="surroundingBlog" />
        </nav>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';

:deep(.markdown-body) {
  @apply text-neutral-700 dark:text-neutral-300 leading-[1.8] text-base sm:text-[1.0625rem] min-w-0 max-w-full break-words;
}

:deep(.markdown-body p) {
  @apply mb-5 leading-[1.8] text-neutral-700 dark:text-neutral-300;
}

:deep(.markdown-body h2) {
  @apply scroll-mt-28 lg:scroll-mt-24 text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mt-11 mb-4 pb-2.5 border-b border-(--app-border);
}

:deep(.markdown-body h3) {
  @apply scroll-mt-28 lg:scroll-mt-24 text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight mt-8 mb-3;
}

:deep(.markdown-body h4) {
  @apply scroll-mt-28 lg:scroll-mt-24 text-base font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight mt-6 mb-2.5;
}

:deep(.markdown-body a) {
  @apply text-primary-600 dark:text-primary-400 underline decoration-primary-500/40 underline-offset-4 hover:decoration-primary-500 transition-colors [overflow-wrap:anywhere];
}

:deep(.markdown-body blockquote) {
  @apply my-6 pl-4 py-2 pr-3 border-l-2 border-primary-500 bg-(--app-surface-subtle)/60 rounded-r-xs italic text-neutral-700 dark:text-neutral-300 overflow-x-auto;
}

:deep(.markdown-body :not(pre) > code) {
  @apply px-1.5 py-0.5 rounded-xs border border-(--app-border) bg-(--app-surface-subtle) font-mono text-[0.85em] text-neutral-900 dark:text-neutral-100 [overflow-wrap:anywhere];
}

:deep(.markdown-body pre) {
  @apply my-6 max-w-full overflow-x-auto rounded-xs border border-(--app-border);
}

:deep(.markdown-body img),
:deep(.markdown-body video),
:deep(.markdown-body iframe) {
  @apply max-w-full h-auto rounded-xs;
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  @apply my-5 pl-6 space-y-2;
}

:deep(.markdown-body li::marker) {
  @apply text-primary-500;
}

:deep(.markdown-body hr) {
  @apply my-10 border-(--app-border);
}

:deep(.markdown-body table) {
  @apply my-6 block w-full max-w-full overflow-x-auto border-collapse text-sm;
}

:deep(.markdown-body th) {
  @apply border border-(--app-border) bg-(--app-surface-subtle) px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-neutral-900 dark:text-neutral-100 whitespace-nowrap;
}

:deep(.markdown-body td) {
  @apply border border-(--app-border) px-3 py-2;
}
</style>
