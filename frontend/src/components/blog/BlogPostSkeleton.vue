<template>
  <article
    class="group relative overflow-hidden rounded-2xl shadow-lg animate-pulse bg-white/80 dark:bg-slate-900/60"
  >
    <!-- Image area matches BlogCard aspect ratio -->
    <div
      class="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-zinc-300 dark:bg-zinc-700"
    ></div>

    <!-- Content -->
    <div class="p-6 lg:p-7">
      <!-- Date skeleton -->
      <div class="h-3 w-24 bg-zinc-300 dark:bg-zinc-700 rounded mb-3"></div>

      <!-- Title skeleton (matches title sizes) -->
      <div class="space-y-3 mb-4">
        <div class="h-6 sm:h-7 lg:h-9 bg-zinc-300 dark:bg-zinc-700 rounded w-full"></div>
        <div class="h-6 sm:h-7 lg:h-9 bg-zinc-300 dark:bg-zinc-700 rounded w-3/4"></div>
      </div>

      <!-- Excerpt skeleton -->
      <div class="space-y-2 mb-4">
        <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-full"></div>
        <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-5/6"></div>
        <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-2/3"></div>
      </div>

      <!-- Tags skeleton -->
      <div class="flex flex-wrap gap-2 mb-4">
        <div class="h-6 w-16 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
        <div class="h-6 w-12 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
        <div
          class="h-6 w-20 bg-zinc-300 dark:bg-zinc-700 rounded-full hidden md:inline-block"
        ></div>
      </div>

      <!-- Footer skeleton -->
      <div
        class="flex items-center justify-between pt-5 border-t border-slate-200/40 dark:border-slate-700/40"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
          <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-24"></div>
        </div>
        <div class="flex items-center gap-3 text-xs">
          <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-8"></div>
          <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-8"></div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
// No props needed for skeleton loader
</script>
