<script setup lang="ts">
import { useAnimatedBorder } from "~/composables/use-animated-border";
import { useTiltCard } from "~/composables/use-tilt-card";

const props = defineProps<{
  author: any;
  activeHoverText: Record<string, string>;
}>();

const emit = defineEmits(["startDecrypt", "clearDecrypt", "getRoleColor"]);

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

// Intercept pointer hooks for a clean orchestration
function onPointerEnter() {
  tiltEnter();
  emit("startDecrypt", props.author.name, props.author.slug);
}

function onPointerLeave() {
  tiltLeave();
  emit("clearDecrypt", props.author.slug);
}
</script>

<template>
  <div
    ref="cardRef"
    class="group relative flex flex-col justify-between rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/30 p-px overflow-hidden select-none transition-all duration-300"
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
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
      style="background: radial-gradient(240px circle at var(--mouse-x) var(--mouse-y), rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.05), transparent 60%);"
    />

    <div class="relative z-10 w-full h-full rounded-[15px] bg-white dark:bg-neutral-950 p-6 flex flex-col justify-between items-stretch">
      <div class="absolute top-0 right-0 p-3 opacity-10 dark:opacity-5 group-hover:scale-110 transition-all pointer-events-none select-none">
        <UIcon
          name="i-lucide-quote"
          class="w-16 h-16 transform rotate-180 transition-colors"
          :style="{ color: author.color ? 'var(--author-accent)' : '' }"
        />
      </div>

      <div class="flex flex-col items-center text-center">
        <div
          class="relative w-24 h-24 rounded-full p-1 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 group-hover:scale-105 transition-all duration-300"
          :style="{ borderColor: author.color ? `${author.color}30` : '' }"
        >
          <NuxtImg
            v-if="author.avatar?.src"
            :src="author.avatar.src"
            :alt="author.avatar.alt || author.name"
            width="96"
            height="96"
            loading="lazy"
            format="webp"
            class="w-full h-full rounded-full object-cover bg-neutral-100 dark:bg-neutral-900"
          />
          <div
            v-else
            class="w-full h-full rounded-full flex items-center justify-center font-bold text-2xl font-mono"
            :style="{ backgroundColor: author.color ? `${author.color}15` : 'rgba(var(--color-primary-500-rgb), 0.1)', color: author.color || 'var(--ui-primary)' }"
          >
            {{ author.name.charAt(0) }}
          </div>
        </div>

        <h3 class="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-4 tracking-tight font-mono group-hover:text-(--author-accent) transition-colors min-h-6">
          {{ activeHoverText[author.slug] || author.name }}
        </h3>

        <div class="flex flex-wrap items-center justify-center gap-1.5 mt-1">
          <span class="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            {{ author.title || 'Contributor' }}
          </span>
          <span v-if="author.company" class="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
            @ {{ author.company }}
          </span>
        </div>

        <UBadge
          v-if="author.role && author.role !== 'author'"
          size="xs"
          variant="subtle"
          :color="emit('getRoleColor', author.role)"
          class="font-mono uppercase tracking-wider text-[9px] mt-2 px-1.5 py-0"
        >
          {{ author.role }}
        </UBadge>

        <p v-if="author.description" class="text-xs text-neutral-500 dark:text-neutral-400 mt-4 line-clamp-3 leading-relaxed">
          {{ author.description }}
        </p>

        <div v-if="author.socialLinks?.length" class="flex items-center justify-center gap-3 mt-4 relative z-30">
          <a
            v-for="(link, lIdx) in author.socialLinks"
            :key="`sl-${lIdx}`"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="p-1.5 rounded-lg border border-neutral-200/50 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-400 dark:text-neutral-500 hover:scale-110 transition-all duration-200 hover:text-(--hover-brand-color)"
            :style="{
              '--hover-brand-color': link.color || 'var(--ui-primary)',
            }"
            :title="link.platform"
            onmouseenter="this.style.borderColor = 'var(--hover-brand-color)'"
            onmouseleave="this.style.borderColor = ''"
          >
            <UIcon :name="link.icon" class="w-4 h-4 block" />
          </a>
        </div>
      </div>

      <div class="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 mt-6 w-full">
        <NuxtLink
          :to="`/${author.stem}`"
          class="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-(--author-accent) flex items-center gap-1 transition-colors relative z-20"
        >
          View Profile
          <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
        </NuxtLink>

        <UBadge
          variant="solid"
          size="xs"
          color="neutral"
          class="font-mono rounded px-2 py-0.5 text-[10px] font-bold dark:bg-white dark:text-neutral-950"
        >
          {{ author.count }} {{ author.count === 1 ? 'Post' : 'Posts' }}
        </UBadge>
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
