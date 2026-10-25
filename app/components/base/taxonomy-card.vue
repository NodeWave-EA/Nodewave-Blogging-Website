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
    class="group relative flex flex-col justify-between overflow-hidden bg-[#faf7f2] dark:bg-[#141311] transition-colors duration-200 hover:bg-[#f3eee4] dark:hover:bg-[#1a1816] select-none h-full w-full rounded-none border-b border-r border-[#e8e3d8] dark:border-[#26231f] p-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500"
    :style="[
      transformStyles,
      {
        '--mouse-x': `${mouseX}px`,
        '--mouse-y': `${mouseY}px`,
        '--spotlight-opacity': isHovered ? '1' : '0',
        '--taxonomy-color': item.color || 'var(--ui-primary)',
      },
    ]"
    :aria-label="`Browse ${item.name} category with ${item.count || 0} articles`"
    @pointermove="onPointerMove"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <!-- Bento Grid Tile Spotlight Radial Glow -->
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
      style="background: radial-gradient(240px circle at var(--mouse-x) var(--mouse-y), rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.06), transparent 60%);"
    />

    <div class="relative z-10 flex flex-col justify-between h-full w-full gap-5">
      <div class="space-y-3">
        <!-- Top Metadata Row -->
        <div class="flex items-center justify-between">
          <div
            class="w-9 h-9 rounded-xs flex items-center justify-center border transition-all duration-300 group-hover:scale-105"
            :style="{
              backgroundColor: item.color ? `${item.color}15` : 'rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.05)',
              borderColor: item.color ? `${item.color}30` : 'rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.15)',
            }"
          >
            <UIcon
              :name="item.icon || fallbackIcon"
              class="w-4 h-4 transition-transform group-hover:rotate-6"
              :style="{ color: 'var(--taxonomy-color)' }"
              aria-hidden="true"
            />
          </div>

          <span
            class="px-2 py-0.5 rounded-xs bg-[#f2eee5] dark:bg-[#1c1a17] border border-[#e0dad0]/60 dark:border-[#2a2722] font-mono text-[10px] font-bold text-neutral-600 dark:text-neutral-400 group-hover:bg-[#e8e3d8] dark:group-hover:bg-[#2a2722] transition-all"
            :style="isHovered && item.color ? { borderColor: `${item.color}30`, color: 'var(--taxonomy-color)' } : {}"
          >
            {{ item.count || 0 }} {{ item.count === 1 ? 'Article' : 'Articles' }}
          </span>
        </div>

        <!-- Title & Description -->
        <div class="space-y-1">
          <h3
            class="text-sm font-bold text-neutral-900 dark:text-neutral-100 transition-colors duration-200 font-mono tracking-tight min-h-5"
            :style="isHovered ? { color: 'var(--taxonomy-color)' } : {}"
          >
            {{ activeHoverText[item.slug] || item.name }}
          </h3>

          <p v-if="item.description" class="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2">
            {{ item.description }}
          </p>
          <p v-else class="text-xs text-neutral-400 dark:text-neutral-500 italic">
            No description available for this {{ typeLabel }}.
          </p>
        </div>
      </div>

      <!-- Bento Tile Footer Link Signifier -->
      <div
        class="pt-3 border-t border-[#e8e3d8] dark:border-[#26231f] flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 transition-colors duration-200 mt-auto"
        :style="isHovered ? { color: 'var(--taxonomy-color)' } : {}"
      >
        <span>
          Explore Track
        </span>
        <UIcon
          name="i-lucide-arrow-right"
          class="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
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
