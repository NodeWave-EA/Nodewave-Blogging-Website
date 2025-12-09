<template>
  <div class="p-4">
    <div class="space-y-3">
      <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 animate-pulse"></div>
      <div class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-full animate-pulse"></div>
      <div class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6 animate-pulse"></div>
    </div>
    <div class="mt-4 grid gap-4">
      <div
        v-for="i in 4"
        :key="i"
        class="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-transparent"
      >
        <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3 animate-pulse mb-2"></div>
        <div class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-full animate-pulse"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Presentational skeleton
</script>

<style scoped></style>
