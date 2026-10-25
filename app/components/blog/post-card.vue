<script setup lang="ts">
import { computed } from "vue";

import type { BlogAuthor, BlogTag, BlogType } from "~/types";

defineOptions({
  name: "BlogPostCard",
});

const props = withDefaults(
  defineProps<{
    post: BlogType;
    meta?: MetaProps;
    variant?: "default" | "featured";
  }>(),
  {
    variant: "default",
    meta: () => ({
      class: "",
      ui: {},
    }),
  },
);

type MetaProps = {
  class?: string | Record<string, boolean> | string[];
  ui?: {
    title?: string;
    description?: string;
  };
};

const _isFeatured = computed(() => props.variant === "featured");

const {
  elementRef: cardRef,
  transformStyles,
  handlePointerMove,
  handlePointerEnter,
  handlePointerLeave,
} = useTiltCard({
  strengthX: 2,
  strengthY: 3,
  perspective: 1000,
});

const { mouseX, mouseY, isHovered } = useAnimatedBorder(cardRef);

const author = computed<BlogAuthor | null>(() => {
  return typeof props.post.author === "object"
    ? (props.post.author as BlogAuthor)
    : null;
});

const tags = computed<BlogTag[]>(() => {
  if (!Array.isArray(props.post.tags))
    return [];
  return props.post.tags.filter((tag): tag is BlogTag =>
    tag !== null && typeof tag === "object",
  );
});

const primaryBadgeLabel = computed(() => {
  if (props.post.featured)
    return "Featured Pick";
  return props.post.category || "General";
});

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(date: string | Date) {
  return formatter.format(new Date(date));
}
</script>

<template>
  <article
    ref="cardRef"
    class="group relative flex flex-col justify-between overflow-hidden bg-[#faf7f2] dark:bg-[#141311] transition-colors duration-200 hover:bg-[#f3eee4] dark:hover:bg-[#1a1816] select-none h-full w-full rounded-none border-b border-r border-[#e8e3d8] dark:border-[#26231f]"
    :style="[
      transformStyles,
      {
        '--mouse-x': `${mouseX}px`,
        '--mouse-y': `${mouseY}px`,
        '--spotlight-opacity': isHovered ? '1' : '0',
      },
    ]"
    @pointermove="handlePointerMove"
    @pointerenter="handlePointerEnter"
    @pointerleave="handlePointerLeave"
  >
    <!-- Bento Grid Tile Spotlight Radial Glow -->
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
      style="background: radial-gradient(240px circle at var(--mouse-x) var(--mouse-y), rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.06), transparent 60%);"
    />

    <div
      class="relative z-10 grid grid-cols-1 w-full h-full p-3.5 gap-3 flex-1"
      :class="[
        meta.class === 'hero-grid-layout-variant'
          ? '[@media(min-width:740px)]:grid-cols-12 [@media(min-width:740px)]:items-stretch'
          : 'grid-cols-1',
        meta.class,
      ]"
    >
      <!-- Cover Image Bento Block -->
      <div
        v-if="post.coverImage"
        class="relative overflow-hidden rounded-xs border border-[#e8e3d8]/80 dark:border-[#26231f] bg-[#f2eee5] dark:bg-[#1c1a17] w-full aspect-video"
        :class="[
          meta.class === 'hero-grid-layout-variant'
            ? '[@media(min-width:740px)]:col-span-5 [@media(min-width:740px)]:h-full [@media(min-width:740px)]:aspect-auto max-h-35 [@media(min-width:740px)]:max-h-none'
            : 'max-h-36',
        ]"
      >
        <NuxtImg
          v-if="post.coverImage"
          :src="post.coverImage.src"
          :alt="post.coverImage.alt || post.title"
          class="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div class="absolute inset-0 pointer-events-none bg-linear-to-t from-[#161513]/30 via-transparent to-transparent" />

        <div v-if="post.featured" class="absolute left-2 top-2 z-20">
          <div class="flex items-center gap-1 rounded-xs border border-white/20 bg-[#161513]/85 px-1.5 py-0.5 backdrop-blur-xs">
            <UIcon
              name="i-lucide-sparkles"
              class="h-2.5 w-2.5 text-amber-400 fill-amber-400"
              aria-hidden="true"
            />
            <span class="font-mono text-[8px] font-bold uppercase tracking-wider text-neutral-200">Featured</span>
          </div>
        </div>
      </div>

      <!-- Bento Tile Body Content -->
      <div
        class="flex flex-col justify-between items-start min-w-0 gap-3 flex-1"
        :class="[
          meta.class === 'hero-grid-layout-variant' ? '[@media(min-width:740px)]:col-span-7' : 'w-full',
        ]"
      >
        <div class="w-full space-y-1.5">
          <!-- Metadata Badge & Date Header -->
          <div class="flex flex-wrap items-center gap-1.5 text-[9px] font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            <UBadge
              variant="subtle"
              :color="post.featured ? 'primary' : 'neutral'"
              size="xs"
              class="font-mono text-[8px] font-semibold uppercase tracking-wider rounded-xs px-1.5 py-0 flex items-center gap-1"
              :style="!post.featured ? {
                color: 'var(--ui-primary)',
                backgroundColor: 'color-mix(in srgb, var(--ui-primary) 8%, transparent)',
                borderColor: 'color-mix(in srgb, var(--ui-primary) 16%, transparent)',
              } : {}"
            >
              <UIcon
                v-if="!post.featured"
                name="i-lucide-folder-open"
                class="w-2.5 h-2.5"
                aria-hidden="true"
              />
              <span>{{ primaryBadgeLabel }}</span>
            </UBadge>

            <span v-if="post.date" class="flex items-center gap-1">
              <time :datetime="String(post.date)">{{ formatDate(post.date) }}</time>
            </span>
          </div>

          <!-- Article Title -->
          <h3
            class="text-neutral-900 dark:text-neutral-100 font-semibold group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2"
            :class="[
              meta.ui?.title ? meta.ui.title : 'text-xs sm:text-sm tracking-tight',
            ]"
          >
            <NuxtLink
              :to="post.path"
              class="focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 rounded-xs"
              :aria-label="`Read article: ${post.title}`"
            >
              <span class="absolute inset-0 z-20" aria-hidden="true" />
              {{ post.title }}
            </NuxtLink>
          </h3>

          <!-- Article Summary / Description -->
          <p class="text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal text-[11px] line-clamp-2">
            {{ post.description }}
          </p>
        </div>

        <!-- Bento Footer Metadata (Author & Tags) -->
        <div class="w-full space-y-2 pt-2 border-t border-[#e8e3d8] dark:border-[#26231f] mt-auto">
          <div class="flex items-center gap-1 relative z-30">
            <NuxtLink
              :to="`/categories/${post.category || 'general'}`"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[8px] font-medium rounded-xs bg-[#f2eee5] dark:bg-[#1c1a17] border border-[#e0dad0]/60 dark:border-[#2a2722] hover:text-primary-500 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primary-500"
              :style="{ color: 'var(--ui-primary)' }"
              :aria-label="`Category: ${post.category || 'General'}`"
            >
              <UIcon
                name="i-lucide-folder-open"
                class="w-2.5 h-2.5 shrink-0"
                aria-hidden="true"
              />
              {{ post.category || "General" }}
            </NuxtLink>
          </div>

          <div v-if="author" class="flex items-center justify-between gap-4 relative z-30 w-full text-xs">
            <NuxtLink :to="`/${author.stem}`" class="group/author flex items-center gap-1.5 focus-visible:ring-1 focus-visible:ring-primary-500 rounded-xs">
              <div class="flex items-center gap-1.5">
                <UAvatar
                  v-if="author.avatar"
                  :src="author.avatar.src"
                  :alt="author.avatar.alt || author.name"
                  size="3xs"
                  :aria-label="`Read more posts by ${author.name}`"
                  class="ring-1 ring-[#e0dad0] dark:ring-[#2d2a24]"
                />
                <span class="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 group-hover/author:text-primary-500 transition-colors line-clamp-1">
                  {{ author.name }}
                </span>
              </div>
            </NuxtLink>

            <!-- Tag Badge -->
            <div v-if="tags.length > 0" class="flex items-center gap-1 max-w-[50%] overflow-hidden">
              <NuxtLink
                v-for="tag in tags.slice(0, 1)"
                :key="tag.slug"
                :to="`/${tag.stem}`"
                class="transition-transform hover:scale-[1.02] focus-visible:ring-1 focus-visible:ring-primary-500 rounded-xs"
                :aria-label="`Tag: ${tag.name}`"
              >
                <span
                  class="inline-flex items-center gap-0.5 px-1.5 py-0.5 font-mono text-[8px] font-medium rounded-xs bg-[#f2eee5] dark:bg-[#1c1a17] border border-[#e0dad0]/60 dark:border-[#2a2722] text-neutral-500 dark:text-neutral-400 hover:text-primary-500 transition-all duration-200"
                  :style="{
                    color: tag.color || '',
                    backgroundColor: tag.color ? `${tag.color}10` : '',
                    borderColor: tag.color ? `${tag.color}25` : '',
                  }"
                >
                  <UIcon
                    :name="tag.icon || 'i-lucide-hash'"
                    class="w-2.5 h-2.5 shrink-0"
                    aria-hidden="true"
                  />
                  {{ tag.name }}
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.group::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: radial-gradient(
    180px circle at var(--mouse-x) var(--mouse-y),
    rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.35),
    transparent 80%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: var(--spotlight-opacity, 0);
  transition: opacity 0.3s ease;
  z-index: 2;
}
</style>
