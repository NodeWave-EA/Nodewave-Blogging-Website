<template>
  <div class="min-h-screen bg-transparent">
    <!-- Header skeleton -->
    <header class="bg-transparent backdrop-blur-xl py-16 mb-12">
      <div class="container mx-auto px-4 max-w-4xl">
        <div class="animate-pulse">
          <div class="flex items-center justify-center mb-6">
            <div class="w-20 h-20 rounded-2xl bg-zinc-300 dark:bg-zinc-600"></div>
          </div>
          <div class="h-10 bg-zinc-200 dark:bg-zinc-700 rounded mb-3 w-3/4 mx-auto"></div>
          <div class="h-6 bg-zinc-200 dark:bg-zinc-700 rounded mb-4 w-1/2 mx-auto"></div>

          <div class="flex items-center justify-center gap-6 mt-4">
            <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-20"></div>
            <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-32"></div>
          </div>
        </div>
      </div>
    </header>

    <!-- Posts Grid skeleton -->
    <div class="container mx-auto px-4 max-w-6xl">
      <div class="mb-8 animate-pulse">
        <div class="h-8 w-64 bg-zinc-200 dark:bg-zinc-700 rounded mb-2"></div>
        <div class="h-4 w-48 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
      </div>

      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <BlogPostSkeleton v-for="n in 6" :key="n" />
      </div>

      <!-- Related Tags skeleton -->
      <div class="mt-12 animate-pulse">
        <div class="h-8 w-64 bg-zinc-200 dark:bg-zinc-700 rounded mx-auto mb-6"></div>
        <div class="flex flex-wrap justify-center gap-3">
          <div
            v-for="i in 6"
            :key="i"
            class="inline-flex items-center px-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-transparent h-10 w-36"
          ></div>
        </div>
      </div>

      <!-- Tag Cloud skeleton -->
      <div class="mt-12 animate-pulse">
        <div class="h-8 w-64 bg-zinc-200 dark:bg-zinc-700 rounded mx-auto mb-6"></div>
        <div class="text-center">
          <div
            v-for="i in 20"
            :key="i"
            class="inline-block m-2 h-6 rounded w-24 bg-zinc-300 dark:bg-zinc-600"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BlogPostSkeleton from '@/components/blog/BlogPostSkeleton.vue'
</script>
