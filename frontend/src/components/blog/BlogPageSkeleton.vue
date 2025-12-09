<template>
  <section class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header skeleton (matches PageHeader regular) -->
      <div class="relative backdrop-blur-xl overflow-hidden py-12 animate-pulse">
        <div class="relative z-10 container mx-auto px-4 text-center">
          <div class="max-w-4xl mx-auto">
            <div class="mb-4">
              <div
                class="inline-block mx-auto h-8 bg-zinc-300 dark:bg-zinc-700 rounded-full w-32"
              ></div>
            </div>

            <div class="mb-6">
              <div class="mx-auto bg-zinc-300 dark:bg-zinc-700 rounded w-3/4 h-12 md:h-16"></div>
            </div>

            <div class="mb-4">
              <div class="mx-auto bg-zinc-300 dark:bg-zinc-700 rounded w-1/2 h-4 md:h-6"></div>
            </div>

            <div class="mt-6 flex justify-center">
              <div class="h-1 bg-zinc-300 dark:bg-zinc-700 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters skeleton (matches BlogFilters layout without search) -->
      <div class="mt-8 animate-pulse">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div class="flex items-center space-x-5">
            <div class="h-6 w-24 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
            <div class="w-52">
              <div class="h-12 bg-zinc-300 dark:bg-zinc-700 rounded-xl"></div>
            </div>
          </div>

          <div class="mt-4 lg:mt-0 lg:mx-6 flex items-center">
            <div class="flex flex-wrap items-center gap-3">
              <div class="h-8 w-24 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
              <div class="h-8 w-28 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
            </div>
          </div>

          <div class="flex items-center space-x-5">
            <div class="h-6 w-20 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
            <div class="w-52">
              <div class="h-12 bg-zinc-300 dark:bg-zinc-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Posts grid skeleton (matches BlogCard grid layout) -->
      <div class="mt-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BlogPostSkeleton v-for="n in 9" :key="n" />
        </div>
      </div>

      <!-- Load more skeleton placeholder -->
      <div class="text-center mt-12 animate-pulse">
        <div class="inline-block h-12 w-56 bg-zinc-300 dark:bg-zinc-700 rounded-2xl"></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import BlogPostSkeleton from './BlogPostSkeleton.vue'
</script>

<style scoped></style>
