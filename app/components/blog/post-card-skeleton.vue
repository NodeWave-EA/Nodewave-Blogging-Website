<script setup lang="ts">
defineOptions({
  name: "BlogPostCardSkeleton",
});

withDefaults(
  defineProps<{
    meta?: {
      class?: string | Record<string, boolean> | string[];
    };
  }>(),
  {
    meta: () => ({
      class: "",
    }),
  },
);
</script>

<template>
  <div
    class="relative rounded-xl bg-neutral-100/40 dark:bg-neutral-900/10 p-px flex flex-col overflow-hidden animate-pulse select-none"
  >
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
        class="relative p-0 overflow-hidden w-full aspect-video"
        :class="[
          meta.class === 'hero-grid-layout-variant'
            ? '[@media(min-width:740px)]:col-span-5 [@media(min-width:740px)]:h-full [@media(min-width:740px)]:aspect-auto max-h-35 [@media(min-width:740px)]:max-h-none'
            : 'max-h-33.75',
        ]"
      >
        <USkeleton class="absolute inset-0 w-full h-full rounded-none bg-neutral-200/60 dark:bg-neutral-800/50" />
      </div>

      <div
        class="p-3.5 flex flex-col justify-between items-start min-w-0 gap-3.5"
        :class="[
          meta.class === 'hero-grid-layout-variant' ? '[@media(min-width:740px)]:col-span-7' : 'w-full',
        ]"
      >
        <div class="w-full space-y-2.5">
          <div class="flex items-center gap-2">
            <USkeleton class="h-4 w-16 rounded bg-neutral-200/60 dark:bg-neutral-800/50" />
            <USkeleton class="h-3 w-12 rounded bg-neutral-100 dark:bg-neutral-900/50" />
          </div>

          <div class="space-y-1.5">
            <USkeleton class="h-4 w-[90%] rounded bg-neutral-200/80 dark:bg-neutral-800/70" />
            <USkeleton class="h-4 w-[55%] rounded bg-neutral-200/80 dark:bg-neutral-800/70" />
          </div>

          <div class="space-y-1.5 pt-1">
            <USkeleton class="h-3 w-full rounded bg-neutral-100 dark:bg-neutral-900/40" />
            <USkeleton class="h-3 w-[85%] rounded bg-neutral-100 dark:bg-neutral-900/40" />
          </div>
        </div>

        <div class="w-full space-y-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-900">
          <div class="flex items-center gap-1.5">
            <USkeleton class="h-3.5 w-10 rounded bg-neutral-100 dark:bg-neutral-900/40" />
            <USkeleton class="h-3.5 w-12 rounded bg-neutral-100 dark:bg-neutral-900/40" />
          </div>

          <div class="flex items-center justify-between gap-4 w-full">
            <div class="flex items-center gap-1.5">
              <USkeleton class="h-4 w-4 rounded-full bg-neutral-200/60 dark:bg-neutral-800/50" />
              <USkeleton class="h-3 w-16 rounded bg-neutral-100 dark:bg-neutral-900/40" />
            </div>
            <USkeleton class="hidden sm:block h-3 w-10 rounded bg-neutral-100 dark:bg-neutral-900/30" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
