<template>
  <section class="min-h-screen bg-transparent">
    <div class="py-16">
      <div class="container mx-auto px-4 max-w-4xl">
        <div class="animate-pulse">
          <!-- Breadcrumb / Title area -->
          <div class="text-center mb-12">
            <div class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full mb-4 mx-auto w-40"></div>
            <div
              class="h-10 md:h-12 lg:h-16 bg-zinc-200 dark:bg-zinc-700 rounded mb-6 mx-auto max-w-3xl"
            ></div>
            <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded mb-8 mx-auto max-w-2xl"></div>
          </div>

          <!-- Categories / meta skeleton -->
          <div class="flex flex-wrap gap-3 justify-center mb-6">
            <div class="h-8 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
            <div class="h-8 w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
            <div class="h-8 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
          </div>

          <!-- Featured image skeleton -->
          <div class="aspect-[16/9] bg-zinc-200 dark:bg-zinc-700 rounded-xl mb-8"></div>

          <!-- Meta row skeleton (author/avatar, date, read time, views) -->
          <div class="flex flex-wrap items-center gap-6 mb-8 justify-center">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
              <div class="w-32 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-20 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
              <div class="w-20 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
            </div>
          </div>

          <!-- Content skeleton: multiple paragraphs + headings + blockquote + code block -->
          <div class="space-y-6 mb-12">
            <div class="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-full"></div>
            <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-11/12"></div>
            <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-10/12"></div>
            <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-9/12"></div>

            <div class="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
            <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full"></div>
            <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6"></div>

            <div class="border-l-4 border-zinc-200 dark:border-zinc-700 pl-4 py-3">
              <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
            </div>

            <div class="bg-zinc-900/5 dark:bg-zinc-800/30 rounded p-4">
              <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full mb-2"></div>
              <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-11/12"></div>
            </div>

            <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-10/12"></div>
            <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-8/12"></div>
          </div>

          <!-- Tags skeleton -->
          <div class="mb-12">
            <div
              class="h-6 w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full inline-block mr-2 mb-2"
            ></div>
            <div
              class="h-6 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full inline-block mr-2 mb-2"
            ></div>
            <div
              class="h-6 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full inline-block mr-2 mb-2"
            ></div>
          </div>

          <!-- Social share skeleton -->
          <div class="mb-12 py-6 border-y border-zinc-200 dark:border-zinc-700">
            <div class="flex flex-wrap gap-4">
              <div class="h-10 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
              <div class="h-10 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
              <div class="h-10 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
              <div class="h-10 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
            </div>
          </div>

          <!-- Related posts skeleton -->
          <div class="mb-12">
            <div class="h-8 bg-zinc-200 dark:bg-zinc-700 rounded mb-6 w-56"></div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <BlogPostSkeleton v-for="n in 2" :key="n" />
            </div>
          </div>

          <!-- Navigation skeleton -->
          <div
            class="flex justify-between items-center py-8 border-t border-zinc-200 dark:border-zinc-700"
          >
            <div class="h-12 w-36 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
            <div class="h-12 w-40 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import BlogPostSkeleton from './BlogPostSkeleton.vue'
</script>

<style scoped></style>
