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
    class="relative overflow-hidden bg-[#faf7f2] dark:bg-[#141311] flex flex-col select-none h-full w-full animate-pulse rounded-none border-b border-r border-[#e8e3d8] dark:border-[#26231f]"
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
        class="relative p-0 overflow-hidden w-full aspect-video rounded-xs border border-[#e8e3d8]/60 dark:border-[#26231f]"
        :class="[
          meta.class === 'hero-grid-layout-variant'
            ? '[@media(min-width:740px)]:col-span-5 [@media(min-width:740px)]:h-full [@media(min-width:740px)]:aspect-auto max-h-35 [@media(min-width:740px)]:max-h-none'
            : 'max-h-36',
        ]"
      >
        <USkeleton class="absolute inset-0 w-full h-full rounded-xs bg-[#e8e3d8]/70 dark:bg-[#2a2722]/60" />
      </div>

      <div
        class="flex flex-col justify-between items-start min-w-0 gap-3 flex-1"
        :class="[
          meta.class === 'hero-grid-layout-variant' ? '[@media(min-width:740px)]:col-span-7' : 'w-full',
        ]"
      >
        <div class="w-full space-y-2.5">
          <div class="flex items-center gap-2">
            <USkeleton class="h-4 w-16 rounded-xs bg-[#e8e3d8]/80 dark:bg-[#2a2722]/70" />
            <USkeleton class="h-3 w-12 rounded-xs bg-[#e8e3d8]/50 dark:bg-[#2a2722]/40" />
          </div>

          <div class="space-y-1.5">
            <USkeleton class="h-4 w-[90%] rounded-xs bg-[#e8e3d8]/90 dark:bg-[#2a2722]/80" />
            <USkeleton class="h-4 w-[55%] rounded-xs bg-[#e8e3d8]/90 dark:bg-[#2a2722]/80" />
          </div>

          <div class="space-y-1.5 pt-1">
            <USkeleton class="h-3 w-full rounded-xs bg-[#e8e3d8]/50 dark:bg-[#2a2722]/40" />
            <USkeleton class="h-3 w-[85%] rounded-xs bg-[#e8e3d8]/50 dark:bg-[#2a2722]/40" />
          </div>
        </div>

        <div class="w-full space-y-3 pt-2.5 border-t border-[#e8e3d8] dark:border-[#26231f] mt-auto">
          <div class="flex items-center gap-1.5">
            <USkeleton class="h-3.5 w-10 rounded-xs bg-[#e8e3d8]/50 dark:bg-[#2a2722]/40" />
            <USkeleton class="h-3.5 w-12 rounded-xs bg-[#e8e3d8]/50 dark:bg-[#2a2722]/40" />
          </div>

          <div class="flex items-center justify-between gap-4 w-full">
            <div class="flex items-center gap-1.5">
              <USkeleton class="h-4 w-4 rounded-full bg-[#e8e3d8]/80 dark:bg-[#2a2722]/70" />
              <USkeleton class="h-3 w-16 rounded-xs bg-[#e8e3d8]/50 dark:bg-[#2a2722]/40" />
            </div>
            <USkeleton class="hidden sm:block h-3 w-10 rounded-xs bg-[#e8e3d8]/40 dark:bg-[#2a2722]/30" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
