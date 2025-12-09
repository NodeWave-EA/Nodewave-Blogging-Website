<template>
  <div class="p-8 rounded-xl bg-transparent border border-black/10 dark:border-white/10">
    <div class="text-center mb-6 relative">
      <div class="inline-block">
        <div
          class="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-700 mx-auto animate-pulse"
        ></div>
      </div>
      <!-- post badge placeholder bottom-right -->
      <div
        class="absolute -bottom-2 right-6 w-8 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse"
      ></div>
    </div>

    <div class="text-center">
      <div class="h-6 bg-zinc-200 dark:bg-zinc-700 rounded mb-3 w-3/4 mx-auto animate-pulse"></div>
      <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded mb-4 w-1/2 mx-auto animate-pulse"></div>

      <div class="flex items-center justify-center gap-4 text-sm mb-4">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse"></div>
          <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-10 animate-pulse"></div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse"></div>
        <div class="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse"></div>
        <div class="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse"></div>
      </div>

      <div class="flex flex-wrap justify-center gap-2">
        <span
          class="px-2 py-1 text-xs font-medium rounded-full bg-transparent text-black dark:text-white border border-black/10 dark:border-white/10 h-6 w-16 inline-block"
        ></span>
        <span
          class="px-2 py-1 text-xs font-medium rounded-full bg-transparent text-black dark:text-white border border-black/10 dark:border-white/10 h-6 w-12 inline-block"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Presentational skeleton — no props
</script>
