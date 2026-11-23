<script setup lang="ts">
import { useAnimatedBorder } from "~/composables/use-animated-border";
import { useTiltCard } from "~/composables/use-tilt-card";

import type { BlogAuthor } from "~/types";

type AuthorCardItem = BlogAuthor & {
  slug?: string;
  color?: string;
  count?: number;
};

const props = defineProps<{
  author: AuthorCardItem;
  activeHoverText: Record<string, string>;
}>();

const emit = defineEmits<{
  startDecrypt: [text: string, key: string];
  clearDecrypt: [key: string];
}>();

const {
  elementRef: cardRef,
  transformStyles,
  handlePointerMove: tiltMove,
  handlePointerEnter: tiltEnter,
  handlePointerLeave: tiltLeave,
} = useTiltCard({
  strengthX: 2,
  strengthY: 3,
  perspective: 1000,
});

const { mouseX, mouseY, isHovered } = useAnimatedBorder(cardRef);

const authorKey = computed(() => props.author.slug || props.author.stem || props.author.name);

function onPointerEnter() {
  tiltEnter();
  emit("startDecrypt", props.author.name, authorKey.value);
}

function onPointerLeave() {
  tiltLeave();
  emit("clearDecrypt", authorKey.value);
}
</script>

<template>
  <article
    ref="cardRef"
    class="group relative flex flex-col justify-between overflow-hidden rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 backdrop-blur-xs ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-(--app-surface-hover)/90 dark:hover:bg-(--app-surface-hover) hover:border-primary-500/40 hover:shadow-[0_10px_24px_-4px_rgba(0,0,0,0.1),0_18px_36px_-8px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_14px_32px_-4px_rgba(0,0,0,0.65),0_22px_44px_-8px_rgba(0,0,0,0.5)] select-none h-full w-full min-w-0 p-5"
    :style="[
      transformStyles,
      {
        '--mouse-x': `${mouseX}px`,
        '--mouse-y': `${mouseY}px`,
        '--spotlight-opacity': isHovered ? '1' : '0',
        '--author-accent': author.color || 'var(--ui-primary)',
      },
    ]"
    @pointermove="tiltMove"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <!-- Spotlight Radial Glow -->
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
      style="background: radial-gradient(240px circle at var(--mouse-x) var(--mouse-y), rgba(var(--color-primary-500-rgb, 20, 184, 166), 0.08), transparent 60%);"
    />

    <!-- Decorative Corner Quote Watermark -->
    <div class="absolute top-0 right-0 p-3 opacity-10 dark:opacity-5 group-hover:scale-110 transition-all pointer-events-none select-none z-0">
      <UIcon
        name="i-lucide-quote"
        class="w-16 h-16 transform rotate-180 transition-colors"
        :style="{ color: author.color ? 'var(--author-accent)' : '' }"
        aria-hidden="true"
      />
    </div>

    <div class="relative z-10 flex flex-col items-center text-center flex-1 w-full min-w-0 justify-between">
      <div class="flex flex-col items-center w-full min-w-0">
        <!-- Author Avatar -->
        <div
          class="relative w-20 h-20 shrink-0 rounded-full p-1 border border-(--app-border) bg-(--app-bg)/80 shadow-2xs group-hover:scale-105 transition-all duration-300"
          :style="{ borderColor: author.color ? `${author.color}40` : '' }"
        >
          <NuxtImg
            v-if="author.avatar?.src"
            :src="author.avatar.src"
            :alt="author.avatar.alt || `Portrait of ${author.name}`"
            width="80"
            height="80"
            loading="lazy"
            format="webp"
            class="w-full h-full rounded-full object-cover bg-(--app-surface-subtle)"
          />
          <div
            v-else
            class="w-full h-full rounded-full flex items-center justify-center font-bold text-xl font-mono"
            :style="{
              backgroundColor: author.color ? `${author.color}15` : 'color-mix(in srgb, var(--ui-primary) 12%, transparent)',
              color: author.color || 'var(--ui-primary)',
            }"
            aria-hidden="true"
          >
            {{ author.name.charAt(0) }}
          </div>
        </div>

        <!-- Primary Stretched Link on Author Name -->
        <h3 class="w-full max-w-full text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-3 tracking-tight font-mono group-hover:text-(--author-accent) transition-colors min-h-5 break-words">
          <NuxtLink
            :to="`/${author.stem}`"
            class="focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 rounded-xs"
            :aria-label="`View profile and articles by ${author.name}`"
          >
            <span class="absolute inset-0 z-20" aria-hidden="true" />
            {{ activeHoverText[authorKey] || author.name }}
          </NuxtLink>
        </h3>

        <!-- Role & Company -->
        <div class="flex flex-wrap items-center justify-center gap-1.5 mt-1 w-full min-w-0">
          <span class="text-xs font-medium text-neutral-600 dark:text-neutral-400 break-words">
            {{ author.title || "Contributor" }}
          </span>
          <USeparator
            v-if="author.company?.name"
            orientation="vertical"
            class="w-px h-3 bg-(--app-border)"
          />
          <span v-if="author.company?.name" class="gradient-text text-xs font-medium transition-colors relative z-30 max-w-full min-w-0 break-words">
            <NuxtLink
              v-if="author.company?.website"
              :to="author.company.website"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center max-w-full min-w-0 hover:underline focus-visible:ring-1 focus-visible:ring-primary-500 rounded-xs"
              :aria-label="`Visit ${author.company.name} website (opens in a new tab)`"
            >
              <UIcon
                v-if="author.company?.icon?.startsWith('i-')"
                :name="author.company.icon"
                class="w-3.5 h-3.5 inline-block mr-1 shrink-0"
                aria-hidden="true"
              />
              <NuxtImg
                v-else-if="author.company?.icon?.startsWith('http')"
                :src="author.company.icon"
                :alt="`${author.company.name} logo`"
                width="14"
                height="14"
                class="inline-block mr-1 rounded-xs object-cover shrink-0"
              />
              <span class="truncate">{{ author.company.name }}</span>
            </NuxtLink>
            <span v-else class="truncate block">
              {{ author.company.name }}
            </span>
          </span>
        </div>

        <!-- Short Bio -->
        <p v-if="author.description" class="text-xs text-neutral-600 dark:text-neutral-300 mt-3 line-clamp-3 leading-relaxed break-words">
          {{ author.description }}
        </p>

        <!-- Social Links -->
        <div v-if="author.socialLinks?.length" class="flex flex-wrap items-center justify-center gap-2 mt-3 relative z-30 min-w-0">
          <NuxtLink
            v-for="(link, lIdx) in author.socialLinks"
            :key="`sl-${lIdx}`"
            :to="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="p-1.5 rounded-xs border border-(--app-border) bg-(--app-bg)/75 text-neutral-600 dark:text-neutral-300 hover:scale-110 transition-all duration-200 hover:text-(--hover-brand-color) hover:border-(--hover-brand-color) focus-visible:ring-1 focus-visible:ring-primary-500"
            :style="{
              '--hover-brand-color': link.color || 'var(--ui-primary)',
            }"
            :title="link.platform"
            :aria-label="`${author.name} on ${link.platform} (opens in a new tab)`"
          >
            <UIcon
              :name="link.icon"
              class="w-3.5 h-3.5 block"
              aria-hidden="true"
            />
          </NuxtLink>
        </div>
      </div>

      <!-- Footer Action & Post Count -->
      <div class="pt-3 flex items-center justify-between gap-2 border-t border-(--app-border) mt-4 w-full min-w-0">
        <span
          class="text-xs font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-(--author-accent) flex items-center gap-1 transition-colors"
          aria-hidden="true"
        >
          View Profile
          <UIcon
            name="i-lucide-arrow-right"
            class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200"
          />
        </span>

        <UBadge
          v-if="typeof author.count === 'number'"
          variant="subtle"
          size="xs"
          color="neutral"
          class="font-mono rounded-xs px-2 py-0.5 text-[10px] font-bold shrink-0 bg-(--app-bg)/85 border border-(--app-border) text-neutral-800 dark:text-neutral-200"
        >
          {{ author.count }} {{ author.count === 1 ? "Post" : "Posts" }}
        </UBadge>
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
    rgba(var(--color-primary-500-rgb, 20, 184, 166), 0.45),
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
