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

    <!-- Authors Grid skeleton -->
    <div class="container mx-auto px-4 max-w-6xl">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AuthorCardSkeleton v-for="i in 6" :key="i" />
      </div>

      <!-- Featured Authors skeleton -->
      <div class="container mx-auto px-4 max-w-6xl mt-16">
        <div class="animate-pulse text-center">
          <div class="h-8 w-64 bg-zinc-200 dark:bg-zinc-700 rounded mx-auto mb-8"></div>
          <div class="flex flex-wrap justify-center gap-6">
            <div
              v-for="i in 5"
              :key="i"
              class="flex items-center gap-3 p-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent"
            >
              <div class="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
              <div class="w-36">
                <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded mb-2 w-28"></div>
                <div class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthorCardSkeleton from './AuthorCardSkeleton.vue'
</script>
