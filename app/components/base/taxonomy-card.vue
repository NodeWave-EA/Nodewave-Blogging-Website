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
    class="group relative p-px rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/30 overflow-hidden select-none transition-all duration-300 flex flex-col items-stretch"
    :style="[
      transformStyles,
      {
        '--mouse-x': `${mouseX}px`,
        '--mouse-y': `${mouseY}px`,
        '--spotlight-opacity': isHovered ? '1' : '0',
        '--taxonomy-color': item.color || 'var(--ui-primary)',
      },
    ]"
    @pointermove="onPointerMove"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
      style="background: radial-gradient(240px circle at var(--mouse-x) var(--mouse-y), rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.05), transparent 60%);"
    />

    <div class="relative z-10 w-full h-full rounded-[15px] bg-white dark:bg-neutral-950 p-6 flex flex-col justify-between gap-6 items-stretch">
      <div
        class="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
        :style="{ backgroundColor: 'var(--taxonomy-color)' }"
      />

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105"
            :style="{
              backgroundColor: item.color ? `${item.color}15` : 'rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.05)',
              borderColor: item.color ? `${item.color}30` : 'rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.15)',
            }"
          >
            <UIcon
              :name="item.icon || fallbackIcon"
              class="w-5 h-5 transition-transform group-hover:rotate-6"
              :style="{ color: 'var(--taxonomy-color)' }"
            />
          </div>

          <span
            class="px-2.5 py-1 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 font-mono text-[10px] font-bold text-neutral-500 dark:text-neutral-400 group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800 transition-all"
            :style="isHovered && item.color ? { borderColor: `${item.color}30`, color: 'var(--taxonomy-color)' } : {}"
          >
            {{ item.count || 0 }} {{ item.count === 1 ? 'Article' : 'Articles' }}
          </span>
        </div>

        <div class="space-y-1.5">
          <h3
            class="text-base font-bold text-neutral-900 dark:text-neutral-50 transition-colors duration-200 font-mono min-h-6"
            :style="isHovered ? { color: 'var(--taxonomy-color)' } : {}"
          >
            {{ activeHoverText[item.slug] || item.name }}
          </h3>
          <p v-if="item.description" class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">
            {{ item.description }}
          </p>
          <p v-else class="text-xs text-neutral-400 dark:text-neutral-600 italic">
            No description available for this {{ typeLabel }}.
          </p>
        </div>
      </div>

      <div
        class="pt-4 border-t border-neutral-100 dark:border-neutral-900/60 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 transition-colors duration-200"
        :style="isHovered ? { color: 'var(--taxonomy-color)' } : {}"
      >
        <span>
          Explore {{ item.count || 0 }} {{ item.count === 1 ? 'Article' : 'Articles' }}
        </span>
        <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
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
