<template>
  <div class="animate-pulse">
    <div
      class="card overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-lg"
    >
      <!-- Image skeleton -->
      <div class="w-full h-48 bg-zinc-300 dark:bg-zinc-600"></div>

      <div class="p-6">
        <!-- Category skeleton -->
        <div class="h-4 bg-zinc-300 dark:bg-zinc-600 rounded w-20 mb-3"></div>

        <!-- Title skeleton -->
        <div class="space-y-2 mb-4">
          <div class="h-6 bg-zinc-300 dark:bg-zinc-600 rounded w-full"></div>
          <div class="h-6 bg-zinc-300 dark:bg-zinc-600 rounded w-3/4"></div>
        </div>

        <!-- Excerpt skeleton -->
        <div class="space-y-2 mb-4">
          <div class="h-4 bg-zinc-300 dark:bg-zinc-600 rounded w-full"></div>
          <div class="h-4 bg-zinc-300 dark:bg-zinc-600 rounded w-5/6"></div>
          <div class="h-4 bg-zinc-300 dark:bg-zinc-600 rounded w-2/3"></div>
        </div>

        <!-- Footer skeleton -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-zinc-300 dark:bg-zinc-600 rounded-full"></div>
            <div class="h-4 bg-zinc-300 dark:bg-zinc-600 rounded w-24"></div>
          </div>
          <div class="h-4 bg-zinc-300 dark:bg-zinc-600 rounded w-20"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed for skeleton loader
</script>
