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
    class="relative overflow-hidden rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 backdrop-blur-xs ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.4)] flex flex-col select-none h-full w-full animate-pulse"
    aria-hidden="true"
  >
    <div
      class="relative z-10 grid grid-cols-1 w-full h-full p-3.5 gap-3 flex-1"
      :class="[
        meta.class === 'hero-grid-layout-variant'
          ? '[@media(min-width:740px)]:grid-cols-12 [@media(min-width:740px)]:items-stretch'
          : 'grid-cols-1',
        meta.class,
      ]"
    >
      <div
        class="relative p-0 overflow-hidden w-full aspect-video rounded-xs border border-(--app-border)"
        :class="[
          meta.class === 'hero-grid-layout-variant'
            ? '[@media(min-width:740px)]:col-span-5 [@media(min-width:740px)]:h-full [@media(min-width:740px)]:aspect-auto max-h-35 [@media(min-width:740px)]:max-h-none'
            : 'max-h-36',
        ]"
      >
        <USkeleton class="absolute inset-0 w-full h-full rounded-xs bg-(--app-bg) opacity-85" />
      </div>

      <div
        class="flex flex-col justify-between items-start min-w-0 gap-3 flex-1"
        :class="[
          meta.class === 'hero-grid-layout-variant' ? '[@media(min-width:740px)]:col-span-7' : 'w-full',
        ]"
      >
        <div class="w-full space-y-2.5">
          <div class="flex items-center gap-2">
            <USkeleton class="h-4 w-16 rounded-xs bg-(--app-bg) opacity-90" />
            <USkeleton class="h-3 w-12 rounded-xs bg-(--app-bg) opacity-65" />
          </div>

          <div class="space-y-1.5">
            <USkeleton class="h-4 w-[90%] rounded-xs bg-(--app-bg) opacity-95" />
            <USkeleton class="h-4 w-[55%] rounded-xs bg-(--app-bg) opacity-95" />
          </div>

          <div class="space-y-1.5 pt-1">
            <USkeleton class="h-3 w-full rounded-xs bg-(--app-bg) opacity-65" />
            <USkeleton class="h-3 w-[85%] rounded-xs bg-(--app-bg) opacity-65" />
          </div>
        </div>

        <div class="w-full space-y-3 pt-2.5 border-t border-(--app-border) mt-auto">
          <div class="flex items-center gap-1.5">
            <USkeleton class="h-3.5 w-10 rounded-xs bg-(--app-bg) opacity-65" />
            <USkeleton class="h-3.5 w-12 rounded-xs bg-(--app-bg) opacity-65" />
          </div>

          <div class="flex items-center justify-between gap-4 w-full">
            <div class="flex items-center gap-1.5">
              <USkeleton class="h-4 w-4 rounded-full bg-(--app-bg) opacity-90" />
              <USkeleton class="h-3 w-16 rounded-xs bg-(--app-bg) opacity-65" />
            </div>
            <USkeleton class="hidden sm:block h-3 w-10 rounded-xs bg-(--app-bg) opacity-55" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
