<script lang="ts" setup>
import { useDateFormat } from "@vueuse/core";

import type { ContentSurroundLink } from "@nuxt/ui";
import type { BlogAuthor, BlogCategory, BlogTag, BlogType } from "~/types";

defineOptions({
  name: "BlogDetailPage",
});
const carousel = useTemplateRef("carousel");
const activeIndex = ref(0);

definePageMeta({
  layout: "reading",
});

const route = useRoute();
const { scrollProgress } = useReadingProgress();
const logger = new Logger("BlogSlugDetailPage component");

const { getBlogBySlug, getSurroundingBlogs } = useContent();

const slug = route.params.slug as string;
logger.debug("Current route slug parameter identified:", { slug });

const blogPath = computed(() => `/blogs/${slug}`);

const { data: blogQueryResult, pending: blogLoading, error: blogError } = await getBlogBySlug(slug);
const { data: surroundQueryResult, pending: surroundLoading, error: surroundError } = await getSurroundingBlogs(blogPath);

const isLoading = computed(() => blogLoading.value || surroundLoading.value);
const fetchError = computed(() => blogError.value || surroundError.value);

const currentBlog = computed(() => blogQueryResult.value as unknown as BlogType);
const surroundingBlog = computed(() => surroundQueryResult.value as unknown as ContentSurroundLink[]);
const blogAuthor = computed(() => currentBlog.value?.author as unknown as BlogAuthor);
const blogCategories = computed(() => (currentBlog.value?.categories || []) as unknown as BlogCategory[]);
const blogTags = computed(() => (currentBlog.value?.tags || []) as unknown as BlogTag[]);

useSeoMeta({
  title: () => currentBlog.value?.seo?.title || currentBlog.value?.title || "Article Detail",
  description: () => currentBlog.value?.seo?.description || currentBlog.value?.description,
  keywords: () => currentBlog.value?.seo?.keywords?.join(", ") || "",
  ogTitle: () => currentBlog.value?.seo?.ogTitle || currentBlog.value?.title,
  ogDescription: () => currentBlog.value?.seo?.ogDescription || currentBlog.value?.description,
  ogImage: () => currentBlog.value?.seo?.ogImage || currentBlog.value?.coverImage?.src || "/preview.png",
  twitterTitle: () => currentBlog.value?.seo?.twitterTitle || currentBlog.value?.title,
  twitterDescription: () => currentBlog.value?.seo?.twitterDescription || currentBlog.value?.description,
  robots: () => currentBlog.value?.seo?.noIndex ? "noindex, nofollow" : "index, follow",
});

function onSelect(index: number) {
  activeIndex.value = index;
}

function select(index: number) {
  activeIndex.value = index;
  carousel.value?.emblaApi?.scrollTo(index);
}
</script>

<template>
  <UContainer>
    <div
      v-if="scrollProgress > 0"
      class="fixed top-0 left-0 h-1 bg-linear-to-r from-primary-500 via-sky-400 to-indigo-600 z-50 transition-all duration-75 ease-out"
      :style="{ width: `${scrollProgress}%` }"
    />

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
        class="rounded-lg"
      />
    </div>

    <div v-else-if="isLoading" class="space-y-6 max-w-3xl mx-auto animate-pulse">
      <USkeleton class="h-6 w-24 rounded-md" />
      <USkeleton class="h-12 w-3/4 rounded-xl" />
      <div class="flex items-center gap-3">
        <USkeleton class="h-10 w-10 rounded-full" />
        <div class="space-y-2">
          <USkeleton class="h-4 w-32" />
          <USkeleton class="h-3 w-20" />
        </div>
      </div>
      <USkeleton class="mt-8 h-96 w-full rounded-2xl" />
    </div>

    <UPage v-else-if="currentBlog">
      <UPageHeader class="relative overflow-hidden bg-neutral-900 border border-neutral-200/20 dark:border-neutral-800/40 rounded-2xl py-12 px-6 md:px-12">
        <div v-if="currentBlog.coverImage?.src" class="absolute inset-0 z-0">
          <NuxtImg
            :src="currentBlog.coverImage.src"
            alt="currentBlog.coverImage?.alt || 'Blog cover image'"
            class="w-full h-full object-cover scale-105 filter blur-xs opacity-25 dark:opacity-20"
          />
          <div class="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-900/80 to-neutral-950/40" />
        </div>

        <div class="relative z-10 text-white select-none flex flex-col gap-4">
          <div class="flex items-center gap-2 text-xs font-mono text-neutral-300">
            <UButton
              icon="i-lucide-arrow-left"
              variant="ghost"
              label="Back to blogs"
              class="text-xs font-mono p-0 text-neutral-300 hover:text-primary-400 transition-colors"
              to="/blogs"
            />
            <USeparator orientation="vertical" class="h-3 border-neutral-700 mx-1" />
          </div>

          <h1 class="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] max-w-4xl">
            {{ currentBlog.title }}
          </h1>

          <p class="text-sm md:text-base text-neutral-300 max-w-3xl leading-relaxed font-normal">
            {{ currentBlog.description }}
          </p>

          <div class="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono text-neutral-400 mt-1">
            <div class="flex items-center gap-1.5">
              <UIcon name="i-lucide-calendar" class="size-4 text-primary-400" />
              <time v-if="currentBlog.date" :datetime="String(currentBlog.date)">
                {{ useDateFormat(currentBlog.date, 'MMMM DD, YYYY').value }}
              </time>
            </div>

            <div v-if="currentBlog.meta?.readingTime" class="flex items-center gap-1.5">
              <USeparator orientation="vertical" class="h-3 border-neutral-700" />
              <UIcon name="i-lucide-clock" class="size-4 text-primary-400" />
              <span>{{ currentBlog.meta.readingTime.text }}</span>
            </div>
          </div>
        </div>
      </UPageHeader>

      <template #left>
        <div class="hidden lg:block sticky space-y-6">
          <div v-if="blogAuthor" class="p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/30">
            <NuxtLink :to="`/${blogAuthor.stem}`" class="block group mb-3 w-fit">
              <UAvatar
                :src="blogAuthor.avatar?.src"
                :alt="blogAuthor.avatar?.alt || blogAuthor.name"
                size="lg"
                :aria-label="`View profile of ${blogAuthor.name}`"
                class="rounded-full border border-neutral-200 dark:border-neutral-800 group-hover:border-primary-500/60 transition-colors duration-200"
              />
            </NuxtLink>

            <NuxtLink :to="`/${blogAuthor.stem}`" class="inline-block group">
              <h4 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-snug group-hover:text-primary-500 transition-colors duration-200">
                {{ blogAuthor.name }}
              </h4>
            </NuxtLink>

            <p v-if="blogAuthor.title" class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 mb-3 leading-tight">
              {{ blogAuthor.title }} <span v-if="blogAuthor.company" class="block text-neutral-400 text-[11px]">@ {{ blogAuthor.company }}</span>
            </p>

            <div v-if="blogAuthor.socialLinks?.length" class="flex items-center gap-1">
              <UButton
                v-for="social in blogAuthor.socialLinks"
                :key="social.url"
                :to="social.url"
                target="_blank"
                color="neutral"
                variant="ghost"
                size="xs"
                class="rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                :aria-label="social.platform"
                :icon="social.platform.toLowerCase() === 'github' ? 'i-simple-icons-github' : 'i-lucide-link'"
              />
            </div>
          </div>
        </div>
      </template>

      <template #right>
        <div class="space-y-6 sticky top-24 lg:block">
          <UContentToc
            v-if="currentBlog.body?.toc?.links?.length"
            :links="currentBlog.body.toc.links"
            title="Table of Contents"
            highlight
            highlight-color="primary"
            highlight-variant="circuit"
          />

          <UPageAnchors
            v-if="currentBlog.anchors?.length"
            title="External Anchors"
            :links="currentBlog.anchors"
          />
        </div>
      </template>

      <UPageBody>
        <div v-if="blogAuthor" class="lg:hidden flex items-center gap-3 mb-8 p-3 rounded-xl border border-neutral-200/40 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/20">
          <NuxtLink
            :to="`/${blogAuthor.stem}`"
            class="block shrink-0"
            :aria-label="`View profile of ${blogAuthor.name}`"
          >
            <UAvatar
              :src="blogAuthor.avatar?.src"
              :alt="blogAuthor.avatar?.alt || blogAuthor.name"
              size="md"
              class="rounded-full border border-neutral-200 dark:border-neutral-800"
            />
          </NuxtLink>
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
              Written by
            </p>
            <NuxtLink
              :to="`/${blogAuthor.stem}`"
              class="inline-block max-w-full"
              :aria-label="`View profile of ${blogAuthor.name}`"
            >
              <h4 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate hover:text-primary-500 transition-colors">
                {{ blogAuthor.name }}
              </h4>
            </NuxtLink>
          </div>
          <div v-if="blogAuthor.socialLinks?.length" class="flex items-center gap-1">
            <UButton
              v-for="social in blogAuthor.socialLinks"
              :key="social.url"
              :to="social.url"
              target="_blank"
              color="neutral"
              variant="ghost"
              size="xs"
              class="rounded-lg text-neutral-400"
              :icon="social.platform.toLowerCase() === 'github' ? 'i-simple-icons-github' : 'i-lucide-link'"
            />
          </div>
        </div>

        <article class="prose dark:prose-invert max-w-none markdown-body selection:bg-primary-500/10">
          <ContentRenderer :value="currentBlog" />
        </article>

        <div v-if="currentBlog.gallery?.length" class="mt-12 pt-8 border-t border-neutral-200/40 dark:border-neutral-800/60">
          <div class="flex items-center gap-2 text-xs font-mono text-neutral-400 select-none mb-4">
            <UIcon name="i-lucide-images" class="size-4 text-neutral-400" />
            <span>Project Media Gallery</span>
          </div>

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
              container: 'rounded-xl',
            }"
            @select="onSelect"
          >
            <div class="p-2 w-full">
              <div class="group overflow-hidden rounded-xl border border-neutral-200/40 dark:border-neutral-800/60 bg-neutral-50 dark:bg-neutral-900">
                <NuxtImg
                  :src="item.src"
                  :alt="item.alt || 'Gallery image'"
                  class="w-full h-64 object-cover"
                />
              </div>
            </div>
          </UCarousel>

          <div class="flex gap-2 justify-center mt-10">
            <div
              v-for="(item, index) in currentBlog.gallery"
              :key="index"
              class="size-16 cursor-pointer overflow-hidden rounded-lg border-2 transition-all"
              :class="activeIndex === index ? 'border-primary-500 opacity-100' : 'border-transparent opacity-40 hover:opacity-100'"
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
        </div>

        <div class="mt-12 pt-6 border-t border-neutral-200/40 dark:border-neutral-800/60 flex flex-col sm:flex-row gap-8 sm:gap-16">
          <div v-if="blogCategories.length > 0" class="flex flex-col gap-2 min-w-35">
            <div class="flex items-center gap-2 text-xs font-mono text-neutral-400 select-none">
              <UIcon name="i-lucide-folder" class="size-3.5 text-neutral-400 dark:text-neutral-500" />
              <span>Categories</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="category in blogCategories"
                :key="category.stem"
                :label="category.name"
                color="neutral"
                variant="subtle"
                size="xs"
                class="font-mono text-xs rounded-md border border-neutral-200/30 dark:border-neutral-800/50 hover:border-primary-500/40"
                :to="`/${category.stem}`"
              />
            </div>
          </div>

          <div v-if="blogTags.length > 0" class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-xs font-mono text-neutral-400 select-none">
              <UIcon name="i-lucide-tag" class="size-3.5 text-neutral-400 dark:text-neutral-500" />
              <span>Tags Matrix</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="tag in blogTags"
                :key="tag.stem"
                :label="`#${tag.name}`"
                color="neutral"
                variant="subtle"
                size="xs"
                class="font-mono text-xs rounded-md border border-neutral-200/30 dark:border-neutral-800/50 hover:border-primary-500/40"
                :to="`/${tag.stem}`"
              />
            </div>
          </div>
        </div>

        <USeparator class="my-8 border-neutral-200/40 dark:border-neutral-800/60" />

        <UContentSurround
          v-if="surroundingBlog && surroundingBlog.length > 0"
          :surround="surroundingBlog"
          class="mt-6 border border-neutral-200/30 dark:border-neutral-800/30 rounded-xl overflow-hidden shadow-xs"
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
