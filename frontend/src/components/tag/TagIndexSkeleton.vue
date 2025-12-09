<template>
  <div class="min-h-screen bg-transparent">
    <!-- Header skeleton (matches PageHeader regular) -->
    <div class="py-8">
      <div class="container mx-auto px-4 max-w-4xl text-center">
        <div class="animate-pulse">
          <div class="h-8 rounded-lg mb-4 max-w-sm bg-zinc-200 dark:bg-zinc-700 mx-auto"></div>
          <div class="h-12 rounded-lg mb-3 max-w-2xl bg-zinc-200 dark:bg-zinc-700 mx-auto"></div>
          <div class="h-4 rounded-lg mb-6 max-w-3xl bg-zinc-200 dark:bg-zinc-700 mx-auto"></div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Popular Tags skeleton -->
      <div class="mb-12">
        <div class="animate-pulse text-center">
          <div class="h-8 w-64 bg-zinc-200 dark:bg-zinc-700 rounded mx-auto mb-8"></div>
          <div class="flex flex-wrap justify-center gap-4">
            <div
              v-for="i in 8"
              :key="i"
              class="h-10 rounded-full w-24 bg-zinc-300 dark:bg-zinc-600"
            ></div>
          </div>
        </div>
      </div>

      <!-- Sort and counts skeleton -->
      <div class="animate-pulse mb-6">
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
          <div class="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          <div class="flex items-center gap-4">
            <div class="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
            <div class="h-8 w-40 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Tags Grid skeleton -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div
          v-for="i in 24"
          :key="i"
          class="h-10 rounded-full w-full bg-zinc-300 dark:bg-zinc-600"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Presentational skeleton — no props required
</script>
