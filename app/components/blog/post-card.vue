<script setup lang="ts">
import { computed } from "vue";

import type { BlogAuthor, BlogCategory, BlogTag, BlogType } from "~/types";

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

const isFeatured = computed(() => props.variant === "featured");

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
  return typeof props.post.author === "object" ? (props.post.author as BlogAuthor) : null;
});

const categories = computed<BlogCategory[]>(() => {
  if (!Array.isArray(props.post.categories))
    return [];
  return props.post.categories.filter((cat): cat is BlogCategory =>
    cat !== null && typeof cat === "object",
  );
});

const tags = computed<BlogTag[]>(() => {
  if (!Array.isArray(props.post.tags))
    return [];
  return props.post.tags.filter((tag): tag is BlogTag =>
    tag !== null && typeof tag === "object",
  );
});

const primaryCategory = computed<BlogCategory | null>(() => {
  return categories.value[0] || null;
});

const primaryBadgeLabel = computed(() => {
  if (props.post.featured)
    return "Featured Pick";
  if (primaryCategory.value) {
    return primaryCategory.value.name;
  }
  return "Insight";
});

function formatDate(dateString: string | Date) {
  if (!dateString)
    return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
</script>

<template>
  <div
    ref="cardRef"
    class="group relative rounded-xl transition-all duration-300 bg-neutral-100/80 dark:bg-neutral-900/30 p-px flex flex-col overflow-hidden select-none"
    :class="[
      isFeatured ? 'ring-1 ring-primary-500/10 shadow-xs' : 'hover:shadow-xs',
    ]"
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
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
      style="background: radial-gradient(240px circle at var(--mouse-x) var(--mouse-y), rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.05), transparent 60%);"
    />

    <div
      class="relative z-10 rounded-[11px] overflow-hidden bg-white dark:bg-neutral-950 grid grid-cols-1 w-full h-full"
      :class="[
        meta.class === 'hero-grid-layout-variant'
          ? '[@media(min-width:740px)]:grid-cols-12 [@media(min-width:740px)]:items-stretch'
          : 'grid-cols-1',
        meta.class,
      ]"
    >
      <div
        v-if="post.coverImage"
        class="relative overflow-hidden bg-neutral-100 dark:bg-neutral-900/50 w-full aspect-video"
        :class="[
          meta.class === 'hero-grid-layout-variant'
            ? '[@media(min-width:740px)]:col-span-5 [@media(min-width:740px)]:h-full [@media(min-width:740px)]:aspect-auto max-h-35 [@media(min-width:740px)]:max-h-none'
            : 'max-h-33.75',
        ]"
      >
        <NuxtImg
          v-if="post.coverImage"
          :src="post.coverImage.src"
          :alt="post.title"
          class="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div class="absolute inset-0 pointer-events-none bg-linear-to-t from-neutral-950/10 via-transparent to-transparent" />

        <div v-if="post.featured" class="absolute left-2.5 top-2.5 z-20">
          <div class="flex items-center gap-1 rounded-full border border-white/10 bg-neutral-950/70 px-2 py-0.5 backdrop-blur-xs">
            <UIcon name="i-lucide-sparkles" class="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
            <span class="font-mono text-[8px] font-bold uppercase tracking-wider text-neutral-200">Featured</span>
          </div>
        </div>
      </div>

      <div
        class="p-3.5 flex flex-col justify-between items-start min-w-0 gap-3.5"
        :class="[
          meta.class === 'hero-grid-layout-variant' ? '[@media(min-width:740px)]:col-span-7' : 'w-full',
        ]"
      >
        <div class="w-full space-y-1.5">
          <div class="flex flex-wrap items-center gap-1.5 text-[9px] font-mono tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
            <UBadge
              variant="subtle"
              :color="post.featured ? 'primary' : 'neutral'"
              size="xs"
              class="font-mono text-[8px] font-semibold uppercase tracking-wider rounded-md px-1.5 py-0 flex items-center gap-1"
              :style="(!post.featured && primaryCategory?.color) ? {
                color: primaryCategory.color,
                backgroundColor: `${primaryCategory.color}15`,
                borderColor: `${primaryCategory.color}25`,
              } : {}"
            >
              <UIcon
                v-if="!post.featured && primaryCategory?.icon"
                :name="primaryCategory.icon"
                class="w-2.5 h-2.5"
              />
              <UIcon
                v-else-if="!post.featured && primaryCategory"
                name="i-lucide-folder-open"
                class="w-2.5 h-2.5"
              />
              <span>{{ primaryBadgeLabel }}</span>
            </UBadge>

            <span v-if="post.date" class="flex items-center gap-1">
              <time :datetime="String(post.date)">{{ formatDate(post.date) }}</time>
            </span>
          </div>

          <h3
            class="text-neutral-900 dark:text-neutral-50 font-semibold group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2"
            :class="[
              meta.ui?.title ? meta.ui.title : 'text-xs sm:text-sm tracking-tight',
            ]"
          >
            <NuxtLink :to="post.path" class="focus:outline-none">
              <span class="absolute inset-0 z-20 rounded-xl" aria-hidden="true" />
              {{ post.title }}
            </NuxtLink>
          </h3>

          <p class="text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal text-[11px] line-clamp-2">
            {{ post.description }}
          </p>
        </div>

        <div class="w-full space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-900">
          <div v-if="categories.length > 0" class="flex flex-wrap items-center gap-1 relative z-30">
            <NuxtLink
              v-for="category in categories"
              :key="category.slug"
              :to="`/${category.stem}`"
              class="transition-transform hover:scale-[1.02]"
            >
              <span
                class="inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[8px] font-medium rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-primary-500 transition-all duration-200"
                :style="{
                  color: category.color || '',
                  backgroundColor: category.color ? `${category.color}10` : '',
                  borderColor: category.color ? `${category.color}25` : '',
                }"
              >
                <UIcon :name="category.icon || 'i-lucide-folder-open'" class="w-2.5 h-2.5 shrink-0" />
                {{ category.name }}
              </span>
            </NuxtLink>
          </div>

          <div v-if="author" class="flex items-center justify-between gap-4 relative z-30 w-full text-xs">
            <NuxtLink :to="`/${author.stem}`" class="group/author flex items-center gap-1.5">
              <div class="flex items-center gap-1.5">
                <UAvatar
                  v-if="author.avatar"
                  :src="author.avatar.src"
                  :alt="author.avatar.alt || author.name"
                  size="3xs"
                  :aria-label="`Read more posts by ${author.name}`"
                  class="ring-1 ring-neutral-200 dark:ring-neutral-800"
                />
                <span class="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 group-hover/author:text-primary-500 transition-colors line-clamp-1">
                  {{ author.name }}
                </span>
              </div>
            </NuxtLink>

            <div v-if="tags.length > 0" class="hidden sm:flex items-center gap-1 max-w-[50%] overflow-hidden">
              <NuxtLink
                v-for="tag in tags.slice(0, 1)"
                :key="tag.slug"
                :to="`/${tag.stem}`"
                class="transition-transform hover:scale-[1.02]"
              >
                <span
                  class="inline-flex items-center gap-0.5 px-1.5 py-0.5 font-mono text-[8px] font-medium rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 text-neutral-400 hover:text-primary-500 transition-all duration-200"
                  :style="{
                    color: tag.color || '',
                    backgroundColor: tag.color ? `${tag.color}10` : '',
                    borderColor: tag.color ? `${tag.color}25` : '',
                  }"
                >
                  <UIcon :name="tag.icon || 'i-lucide-hash'" class="w-2.5 h-2.5 shrink-0" />
                  {{ tag.name }}
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
