<script setup lang="ts">
import { useAnimatedBorder } from "~/composables/use-animated-border";
import { useMatrixDecrypt } from "~/composables/use-matrix-decrypt";
import { useTiltCard } from "~/composables/use-tilt-card";

type TaxonomyItem = {
  name: string;
  slug: string;
  stem: string;
  count?: number;
  description?: string;
  icon?: string;
  color?: string;
};

const props = withDefaults(
  defineProps<{
    item: TaxonomyItem;
    fallbackIcon?: string;
    typeLabel?: string;
  }>(),
  {
    fallbackIcon: "i-lucide-hash",
    typeLabel: "tag",
  },
);

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

const { activeHoverText, startDecryption, clearDecryption } = useMatrixDecrypt({
  speed: 20,
  revealStep: 0.4,
});

function onPointerMove(e: PointerEvent) {
  tiltMove(e);
}

function onPointerEnter() {
  tiltEnter();
  startDecryption(props.item.name, props.item.slug);
}

function onPointerLeave() {
  tiltLeave();
  clearDecryption(props.item.slug);
}
</script>

<template>
  <NuxtLink
    ref="cardRef"
    :to="`/${item.stem}`"
    class="group relative flex flex-col justify-between overflow-hidden rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 backdrop-blur-xs ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-(--app-surface-hover)/90 dark:hover:bg-(--app-surface-hover) hover:border-primary-500/40 hover:shadow-[0_10px_24px_-4px_rgba(0,0,0,0.1),0_18px_36px_-8px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_14px_32px_-4px_rgba(0,0,0,0.65),0_22px_44px_-8px_rgba(0,0,0,0.5)] select-none h-full w-full p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    :style="[
      transformStyles,
      {
        '--mouse-x': `${mouseX}px`,
        '--mouse-y': `${mouseY}px`,
        '--spotlight-opacity': isHovered ? '1' : '0',
        '--taxonomy-color': item.color || 'var(--ui-primary)',
      },
    ]"
    :aria-label="`Browse ${item.name} ${typeLabel} with ${item.count || 0} ${item.count === 1 ? 'article' : 'articles'}`"
    @pointermove="onPointerMove"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <!-- Spotlight Radial Glow -->
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
      style="background: radial-gradient(240px circle at var(--mouse-x) var(--mouse-y), color-mix(in srgb, var(--taxonomy-color) 10%, transparent), transparent 60%);"
    />

    <div class="relative z-10 flex flex-col justify-between h-full w-full gap-5">
      <div class="space-y-3">
        <!-- Top Metadata Row -->
        <div class="flex items-center justify-between gap-2">
          <div
            class="w-9 h-9 rounded-xs flex items-center justify-center border transition-all duration-300 group-hover:scale-105 shadow-2xs"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--taxonomy-color) 12%, transparent)',
              borderColor: 'color-mix(in srgb, var(--taxonomy-color) 28%, transparent)',
            }"
          >
            <UIcon
              :name="item.icon || fallbackIcon"
              class="w-4 h-4 transition-transform duration-300 group-hover:rotate-6"
              :style="{ color: 'var(--taxonomy-color)' }"
              aria-hidden="true"
            />
          </div>

          <span
            class="px-2 py-0.5 rounded-xs bg-(--app-bg)/80 border border-(--app-border) font-mono text-[10px] font-bold text-neutral-600 dark:text-neutral-300 transition-all duration-200"
            :style="isHovered ? {
              borderColor: 'color-mix(in srgb, var(--taxonomy-color) 35%, transparent)',
              color: 'var(--taxonomy-color)',
            } : {}"
          >
            {{ item.count || 0 }} {{ item.count === 1 ? "Article" : "Articles" }}
          </span>
        </div>

        <!-- Title & Description -->
        <div class="space-y-1.5">
          <h3
            class="text-sm font-bold text-neutral-900 dark:text-neutral-100 transition-colors duration-200 font-mono tracking-tight min-h-5"
            :style="isHovered ? { color: 'var(--taxonomy-color)' } : {}"
          >
            {{ activeHoverText[item.slug] || item.name }}
          </h3>

          <p v-if="item.description" class="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2">
            {{ item.description }}
          </p>
          <p v-else class="text-xs text-neutral-500 dark:text-neutral-400 italic">
            No description available for this {{ typeLabel }}.
          </p>
        </div>
      </div>

      <div
        class="pt-3 border-t border-(--app-border) flex items-center justify-between text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 transition-colors duration-200 mt-auto"
        :style="isHovered ? { color: 'var(--taxonomy-color)' } : {}"
      >
        <span>
          Explore Track
        </span>
        <UIcon
          name="i-lucide-arrow-right"
          class="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200"
          aria-hidden="true"
        />
      </div>
    </div>
  </NuxtLink>
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
    color-mix(in srgb, var(--taxonomy-color) 45%, transparent),
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
