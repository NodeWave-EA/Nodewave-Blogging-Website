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

const carousel = useTemplateRef("carousel");
const activeIndex = ref(0);

const route = useRoute();
const { scrollProgress } = useReadingProgress();

const { getBlogBySlug, getSurroundingBlogs } = useContent();

const slug = computed(() => route.params.slug as string);
logger.debug("Current route slug parameter identified:", {
  slug: toValue(slug),
});

const blogPath = computed(() => route.path);
logger.debug("Current route path identified:", {
  blogPath: toValue(blogPath),
});

const { data: blogQueryResult, pending: blogLoading, error: blogError } = await getBlogBySlug(slug);
const { data: surroundQueryResult, pending: surroundLoading, error: surroundError } = await getSurroundingBlogs(blogPath);

const isLoading = computed(() => blogLoading.value || surroundLoading.value);
const fetchError = computed(() => blogError.value || surroundError.value);

const currentBlog = computed(() => blogQueryResult.value as unknown as BlogType);
const surroundingBlog = computed(() => surroundQueryResult.value as unknown as ContentSurroundLink[]);
const blogAuthor = computed(() => currentBlog.value?.author as unknown as BlogAuthor);
const blogTags = computed(() => (currentBlog.value?.tags || []) as unknown as BlogTag[]);

function onSelect(index: number) {
  activeIndex.value = index;
}

function select(index: number) {
  activeIndex.value = index;
  carousel.value?.emblaApi?.scrollTo(index);
}

if (!currentBlog.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Blog not found",
    message: `The blog with slug "${slug.value}" could not be found.`,
  });
}

const runtimeConfig = useRuntimeConfig().public;
const BLOG_TITLE = computed(() => currentBlog.value?.seo?.title || currentBlog.value?.title || "Article Detail");
const BLOG_DESCRIPTION = computed(() => currentBlog.value?.seo?.description || currentBlog.value?.description || "");
const BLOG_CANONICAL_URL = computed(() => `${runtimeConfig.siteUrl}${toValue(blogPath)}`);

const coverImageUrl = computed(() => {
  const src = currentBlog.value?.coverImage?.src;
  if (!src)
    return `${runtimeConfig.siteUrl}/preview.png`;
  return src.startsWith("http")
    ? src
    : `${runtimeConfig.siteUrl}${src}`;
});

const publishedIsoDate = computed(() => {
  if (currentBlog.value?.date instanceof Date) {
    return currentBlog.value.date.toISOString();
  }
  return currentBlog.value?.date
    ? new Date(currentBlog.value.date).toISOString()
    : "";
});

const formattedPublishDate = computed(() => {
  if (!currentBlog.value?.date)
    return "";
  const parsed = currentBlog.value.date instanceof Date
    ? currentBlog.value.date
    : new Date(currentBlog.value.date);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
});

const modifiedIsoDate = computed(() => {
  if (currentBlog.value?.updatedAt instanceof Date) {
    return currentBlog.value.updatedAt.toISOString();
  }
  return currentBlog.value?.updatedAt
    ? new Date(currentBlog.value.updatedAt).toISOString()
    : publishedIsoDate.value;
});

// Meta & Social Sharing Tags
useSeoMeta({
  title: () => BLOG_TITLE.value,
  description: () => BLOG_DESCRIPTION.value,
  creator: () => blogAuthor.value?.name || runtimeConfig.siteName || "Nodewave",

  // Open Graph / Facebook
  ogType: "article",
  ogTitle: () => currentBlog.value?.seo?.ogTitle || BLOG_TITLE.value,
  ogDescription: () => currentBlog.value?.seo?.ogDescription || BLOG_DESCRIPTION.value,
  ogUrl: () => BLOG_CANONICAL_URL.value,
  ogImageAlt: currentBlog.value?.coverImage?.alt || BLOG_TITLE.value,
  ogSiteName: runtimeConfig.siteName || "Nodewave",

  // Twitter
  twitterCard: "summary_large_image",
  twitterTitle: () => currentBlog.value?.seo?.twitterTitle || BLOG_TITLE.value,
  twitterDescription: () => currentBlog.value?.seo?.twitterDescription || BLOG_DESCRIPTION.value,

  // Indexing directives
  robots: () => (currentBlog.value?.seo?.noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"),

  // Article Metadata
  articleAuthor: () => [blogAuthor.value?.name || runtimeConfig.siteName || "Nodewave"],
  articlePublishedTime: publishedIsoDate.value,
  articleModifiedTime: modifiedIsoDate.value,
  articleSection: () => currentBlog.value?.category || "General",
  articleTag: () => blogTags.value?.map(tag => tag.name) ?? [],
  author: () => blogAuthor.value?.name || runtimeConfig.siteName || "Nodewave",
  publisher: () => runtimeConfig.siteName || "Nodewave",
});

useHead({
  link: [
    {
      rel: "canonical",
      href: () => BLOG_CANONICAL_URL.value,
    },
    { rel: "icon", type: "image/png", href: "/favicon.png" },
  ],
});

// Nuxt Schema.org Structured Data
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
    "image": coverImageUrl.value,
    "datePublished": publishedIsoDate.value,
    "dateModified": modifiedIsoDate.value,
    "wordCount": currentBlog.value?.meta?.readingTime?.words,
    "keywords": blogTags.value?.map(t => t.name) ?? [],
    "about": currentBlog.value?.description || BLOG_DESCRIPTION.value,
    "author": {
      "@type": "Person",
      "name": blogAuthor.value?.name || runtimeConfig.siteName || "Nodewave",
      "url": blogAuthor.value?.stem
        ? `${runtimeConfig.siteUrl}/${blogAuthor.value.stem}`
        : undefined,
    },
    "publisher": {
      "@type": "Organization",
      "name": runtimeConfig.siteName || "Nodewave",
      "logo": {
        "@type": "ImageObject",
        "url": runtimeConfig.siteLogo || undefined,
      },
    },
  }),
]);

defineOgImage("BlogPost.takumi", {
  colorMode: "light",
  title: () => BLOG_TITLE.value,
  author: blogAuthor.value?.name,
  date: currentBlog.value.date instanceof Date
    ? currentBlog.value.date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : String(currentBlog.value.date || ""),
  category: currentBlog.value?.category || "General",
  avatar: blogAuthor.value?.avatar?.src,
  backgroundImage: currentBlog.value?.coverImage?.src,
  readingTime: currentBlog.value?.meta?.readingTime?.text,
});

logger.log("All tags:", { blogTags: blogTags.value });
</script>

<template>
  <UContainer>
    <ClientOnly>
      <div
        v-if="scrollProgress > 0"
        class="fixed top-0 left-0 h-1 bg-linear-to-r from-primary-500 via-sky-400 to-indigo-600 z-50 transition-all duration-75 ease-out"
        :style="{ width: `${scrollProgress}%` }"
      />
    </ClientOnly>

    <div v-if="fetchError" class="flex flex-col items-center justify-center py-24 gap-4">
      <UIcon name="i-lucide-octagon-alert" class="w-12 h-12 text-error-500" />
      <p class="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-xs">
        The designated markdown document file stream could not be safely pulled or extracted.
      </p>
      <UButton
        label="Return to blog feed"
        to="/blogs"
        color="neutral"
        variant="subtle"
        size="sm"
        class="rounded-xs"
      />
    </div>

    <div v-else-if="isLoading" class="space-y-6 max-w-3xl mx-auto animate-pulse py-10">
      <USkeleton class="h-6 w-24 rounded-xs" />
      <USkeleton class="h-12 w-3/4 rounded-xs" />
      <div class="flex items-center gap-3">
        <USkeleton class="h-8 w-8 rounded-full" />
        <div class="space-y-2">
          <USkeleton class="h-4 w-32 rounded-xs" />
          <USkeleton class="h-3 w-20 rounded-xs" />
        </div>
      </div>
      <USkeleton class="mt-8 h-80 w-full rounded-xs" />
    </div>

    <UPage v-else-if="currentBlog" class="py-8">
      <!-- NodeWave Matrix Bento Hero Header -->
      <UPageHeader
        :title="currentBlog.title"
        :description="currentBlog.description"
        class="mb-8 border-b border-[#e8e3d8] dark:border-[#26231f] pb-8 bg-transparent"
        :ui="{
          title: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15]',
          description: 'text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-300 max-w-4xl leading-relaxed font-normal mt-3',
        }"
      >
        <template #headline>
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <!-- Navigation Breadcrumb -->
            <NuxtLink
              to="/blogs"
              class="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 hover:text-primary-500 flex items-center gap-1.5 transition-colors group focus-visible:ring-1 focus-visible:ring-primary-500 rounded-xs"
              aria-label="Return to all blogs"
            >
              <UIcon
                name="i-lucide-arrow-left"
                class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
              <span>Back to blogs</span>
            </NuxtLink>

            <!-- Category Badge -->
            <NuxtLink
              :to="`/categories/${currentBlog.category || 'general'}`"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-primary-500/20 transition-colors"
            >
              <UIcon
                name="i-lucide-folder"
                class="w-3 h-3"
                aria-hidden="true"
              />
              <span>{{ currentBlog.category || 'General' }}</span>
            </NuxtLink>
          </div>
        </template>

        <!-- Technical Meta Bar -->
        <div class="flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs font-mono text-neutral-500 dark:text-neutral-400 pt-6 mt-6 border-t border-[#e8e3d8] dark:border-[#26231f]">
          <div class="flex flex-wrap items-center gap-y-2 gap-x-4">
            <!-- Author Pill Badge -->
            <NuxtLink
              v-if="blogAuthor"
              :to="`/${blogAuthor.stem}`"
              class="group inline-flex items-center gap-2 pr-2.5 py-0.5 rounded-xs bg-[#f2eee5] dark:bg-[#1c1a17] border border-[#e0dad0]/80 dark:border-[#2a2722] hover:border-primary-500/50 transition-colors"
            >
              <UAvatar
                :src="blogAuthor.avatar?.src"
                :alt="blogAuthor.name"
                size="2xs"
                class="ring-1 ring-[#e0dad0] dark:ring-[#2d2a24] shrink-0"
              />
              <span class="font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors">
                {{ blogAuthor.name }}
              </span>
            </NuxtLink>

            <!-- Publication Date -->
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-calendar"
                class="w-3.5 h-3.5 text-primary-500"
                aria-hidden="true"
              />
              <time v-if="currentBlog.date" :datetime="publishedIsoDate">
                {{ formattedPublishDate }}
              </time>
            </div>

            <!-- Reading Time -->
            <div v-if="currentBlog.meta?.readingTime" class="flex items-center gap-1.5">
              <span class="text-neutral-300 dark:text-neutral-700" aria-hidden="true">•</span>
              <UIcon
                name="i-lucide-clock"
                class="w-3.5 h-3.5 text-primary-500"
                aria-hidden="true"
              />
              <span>{{ currentBlog.meta.readingTime.text }}</span>
            </div>
          </div>

          <!-- Share Article Actions -->
          <BlogPostShare :title="currentBlog.title" />
        </div>

        <!-- Crisp Bento Cover Feature Banner -->
        <div
          v-if="currentBlog.coverImage?.src"
          class="mt-8 overflow-hidden rounded-xs border border-[#e8e3d8] dark:border-[#26231f] bg-[#f2eee5] dark:bg-[#1c1a17] aspect-16/9 w-full shadow-2xs relative"
        >
          <NuxtImg
            :src="currentBlog.coverImage.src"
            :alt="currentBlog.coverImage?.alt || currentBlog.title"
            class="w-full h-full object-cover"
          />
        </div>
      </UPageHeader>

      <template #right>
        <UContentToc
          v-if="currentBlog.body?.toc?.links?.length"
          :links="currentBlog.body.toc.links"
          title="On this page"
          highlight
          highlight-color="secondary"
          highlight-variant="circuit"
        />
      </template>

      <UPageBody>
        <article class="prose dark:prose-invert max-w-none markdown-body selection:bg-primary-500/10">
          <ContentRenderer :value="currentBlog" />
        </article>

        <!-- Gallery Section -->
        <div
          v-if="currentBlog.gallery?.length"
          class="mt-12 pt-8 border-t border-[#e8e3d8] dark:border-[#26231f]"
        >
          <div class="flex items-center gap-2 text-xs font-mono text-neutral-400 select-none mb-4 uppercase tracking-widest font-bold">
            <UIcon name="i-lucide-images" class="size-4 text-neutral-400" />
            <span>Gallery</span>
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
                item: 'basis-full md:basis-1/2 transition-opacity [&:not(.is-snapped)]:opacity-30',
                container: 'rounded-xs',
              }"
              @select="onSelect"
            >
              <div class="p-2 w-full">
                <div
                  class="group overflow-hidden rounded-xs border border-[#e8e3d8] dark:border-[#26231f] bg-[#faf7f2] dark:bg-[#141311]"
                >
                  <NuxtImg
                    :src="item.src"
                    :alt="item.alt || 'Gallery image'"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
            </UCarousel>

            <div class="flex gap-2 justify-center mt-8">
              <div
                v-for="(item, index) in currentBlog.gallery"
                :key="index"
                class="size-16 cursor-pointer overflow-hidden rounded-xs border transition-all"
                :class="activeIndex === index ? 'border-primary-500 opacity-100' : 'border-[#e8e3d8] dark:border-[#26231f] opacity-40 hover:opacity-100'"
                @click="select(index)"
              >
                <NuxtImg
                  :alt="item.alt || 'Gallery thumbnail'"
                  :src="item.src"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </ClientOnly>
        </div>

        <!-- Transparent Footer Author Bio Card -->
        <div
          v-if="blogAuthor"
          class="my-10 p-5 rounded-xs border border-[#e8e3d8] dark:border-[#26231f] bg-transparent select-none space-y-4"
        >
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e8e3d8] dark:border-[#26231f]">
            <div class="flex items-center gap-3.5">
              <NuxtLink :to="`/${blogAuthor.stem}`" class="shrink-0">
                <UAvatar
                  :src="blogAuthor.avatar?.src"
                  :alt="blogAuthor.name"
                  size="md"
                  class="ring-1 ring-[#e0dad0] dark:ring-[#2d2a24]"
                />
              </NuxtLink>
              <div>
                <span class="text-[10px] font-mono uppercase tracking-widest text-primary-500 font-bold block">
                  Written By
                </span>
                <NuxtLink
                  :to="`/${blogAuthor.stem}`"
                  class="text-sm font-bold text-neutral-900 dark:text-neutral-100 hover:text-primary-500 transition-colors"
                >
                  {{ blogAuthor.name }}
                </NuxtLink>
                <p v-if="blogAuthor.title" class="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {{ blogAuthor.title }}
                </p>
              </div>
            </div>

            <!-- Company & Social Links -->
            <div class="flex items-center gap-1.5">
              <UTooltip v-if="blogAuthor.company" :text="blogAuthor.company.name">
                <NuxtLink
                  :to="blogAuthor.company.website"
                  target="_blank"
                  class="p-1.5 rounded-xs border border-[#e0dad0]/60 dark:border-[#2a2722] bg-transparent text-neutral-500 hover:text-primary-500 transition-colors"
                >
                  <NuxtImg
                    v-if="blogAuthor.company.icon?.startsWith('http')"
                    :src="blogAuthor.company.icon"
                    :alt="blogAuthor.company.name"
                    class="w-4 h-4 rounded-xs shrink-0"
                  />
                  <UIcon
                    v-else
                    :name="blogAuthor.company.icon || 'i-lucide-globe'"
                    class="w-4 h-4 shrink-0"
                  />
                </NuxtLink>
              </UTooltip>

              <NuxtLink
                v-for="social in blogAuthor.socialLinks"
                :key="social.url"
                :to="social.url"
                target="_blank"
                class="p-1.5 rounded-xs border border-[#e0dad0]/60 dark:border-[#2a2722] bg-transparent text-neutral-500 hover:text-primary-500 transition-colors"
              >
                <UIcon :name="social.icon" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>

          <p v-if="blogAuthor.description" class="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
            {{ blogAuthor.description }}
          </p>

          <div class="pt-2 flex justify-end">
            <NuxtLink
              :to="`/${blogAuthor.stem}`"
              class="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary-500 hover:text-primary-600 transition-colors"
            >
              <span>View Author Profile & Articles</span>
              <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5" />
            </NuxtLink>
          </div>
        </div>

        <!-- Categories & Tags Section -->
        <div
          class="mt-8 pt-6 border-t border-[#e8e3d8] dark:border-[#26231f] flex flex-col sm:flex-row gap-8 sm:gap-16"
        >
          <!-- Category section -->
          <div class="flex flex-col gap-2 min-w-35">
            <div class="flex items-center gap-2 text-xs font-mono text-neutral-400 select-none">
              <UIcon name="i-lucide-folder" class="size-3.5 text-neutral-400 dark:text-neutral-500" />
              <NuxtLink :to="`/categories/${currentBlog.category || 'general'}`">
                <span class="bg-linear-to-r from-primary-500 to-primary-600 text-transparent bg-clip-text font-bold uppercase tracking-wider text-[10px]">
                  Category
                </span>
              </NuxtLink>
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                :to="`/categories/${currentBlog.category || 'general'}`"
                variant="subtle"
                size="xs"
                class="font-mono text-xs rounded-xs border border-[#e0dad0]/60 dark:border-[#2a2722] hover:border-primary-500/40 text-neutral-900 dark:text-neutral-100 hover:text-primary-500 transition-colors"
              >
                <UIcon name="i-lucide-folder" class="size-3 text-primary-500" />
                {{ currentBlog.category || "General" }}
              </UButton>
            </div>
          </div>

          <!-- Tags Section -->
          <div v-if="blogTags.length > 0" class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-xs font-mono text-neutral-400 select-none">
              <UIcon name="i-lucide-tags" class="size-3.5 text-neutral-400 dark:text-neutral-500" />
              <NuxtLink to="/tags">
                <span class="bg-linear-to-r from-primary-500 to-primary-600 text-transparent bg-clip-text font-bold uppercase tracking-wider text-[10px]">
                  Tags
                </span>
              </NuxtLink>
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="tag in blogTags"
                :key="tag.stem"
                :to="`/${tag.stem}`"
                variant="subtle"
                size="xs"
                class="font-mono text-xs rounded-xs border border-[#e0dad0]/60 dark:border-[#2a2722] hover:border-primary-500/40 text-neutral-900 dark:text-neutral-100 hover:text-primary-500 transition-colors"
                :style="{
                  '--tag-color': tag.color || 'var(--ui-primary)',
                }"
              >
                <UIcon :name="tag.icon || 'i-lucide-hash'" class="size-3 text-(--tag-color)" />
                {{ tag.name }}
              </UButton>
            </div>
          </div>
        </div>

        <UPageAnchors
          v-if="currentBlog.anchors?.length"
          title="External Anchors"
          :links="currentBlog.anchors"
        />

        <UContentSurround
          v-if="surroundingBlog && surroundingBlog.length > 0"
          :surround="surroundingBlog"
          class="mt-6 border border-[#e8e3d8] dark:border-[#26231f] rounded-xs overflow-hidden shadow-2xs"
        />
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
@reference '~/assets/css/main.css';

:deep(.markdown-body p) {
  @apply leading-relaxed text-sm text-neutral-600 dark:text-neutral-300 font-normal mb-5;
}

:deep(.markdown-body h2) {
  @apply text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mt-10 mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-900;
}

:deep(.markdown-body h3) {
  @apply text-base font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight mt-6 mb-3;
}
</style>
