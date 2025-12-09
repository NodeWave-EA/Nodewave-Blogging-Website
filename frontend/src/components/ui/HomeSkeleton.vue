<template>
  <section class="py-12 sm:py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header Skeleton (matches PageHeader - size: regular) -->
      <div class="relative backdrop-blur-xl overflow-hidden py-12 animate-pulse">
        <div class="relative z-10 container mx-auto px-4 text-center">
          <div class="max-w-4xl mx-auto">
            <!-- Badge / Tag skeleton (px-4 py-2 => h-8) -->
            <div class="mb-4">
              <div
                class="inline-block mx-auto h-8 bg-zinc-300 dark:bg-zinc-700 rounded-full w-32"
              ></div>
            </div>

            <!-- Title skeleton (text-4xl md:text-6xl) -->
            <div class="mb-6">
              <div class="mx-auto bg-zinc-300 dark:bg-zinc-700 rounded w-3/4 h-12 md:h-16"></div>
            </div>

            <!-- Description skeleton (text-lg md:text-xl) -->
            <div class="mb-4">
              <div class="mx-auto bg-zinc-300 dark:bg-zinc-700 rounded w-1/2 h-4 md:h-6"></div>
            </div>

            <!-- Decorative Line skeleton (w-20) -->
            <div class="mt-6 flex justify-center">
              <div class="h-1 bg-zinc-300 dark:bg-zinc-700 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Featured Posts Skeleton -->
      <div class="space-y-8">
        <!-- Large hero skeleton on wider screens (matches FeaturedPostCard.hero sizing) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Hero (lg:col-span-2) -->
          <div class="lg:col-span-2">
            <div class="relative overflow-hidden rounded-xl shadow-inner">
              <!-- image area matches real card: h-64 sm:h-80 md:h-[500px] -->
              <div class="w-full h-64 sm:h-80 md:h-[500px] bg-zinc-300 dark:bg-zinc-700"></div>

              <!-- overlayed title/excerpt skeleton positioned where the real text appears -->
              <div class="mt-4 p-4 md:p-6 space-y-3">
                <div class="h-3 sm:h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-36"></div>
                <div class="h-6 sm:h-8 bg-zinc-300 dark:bg-zinc-700 rounded w-3/4"></div>
                <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>

          <!-- Two side compact skeletons (compact cards use aspect-16/9 thumbnails) -->
          <div class="space-y-6">
            <div class="rounded-xl overflow-hidden bg-transparent">
              <div class="aspect-[16/9] bg-zinc-300 dark:bg-zinc-700 rounded-xl"></div>
              <div class="p-4 space-y-2">
                <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-24"></div>
                <div class="h-5 bg-zinc-300 dark:bg-zinc-700 rounded w-3/4"></div>
                <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-2/3"></div>
              </div>
            </div>

            <div class="rounded-xl overflow-hidden bg-transparent">
              <div class="aspect-[16/9] bg-zinc-300 dark:bg-zinc-700 rounded-xl"></div>
              <div class="p-4 space-y-2">
                <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-20"></div>
                <div class="h-5 bg-zinc-300 dark:bg-zinc-700 rounded w-2/3"></div>
                <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Remaining compact cards matching grid layout and aspect ratio -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="rounded-xl overflow-hidden">
            <div class="aspect-[16/9] bg-zinc-300 dark:bg-zinc-700 rounded-xl"></div>
            <div class="p-4 space-y-2">
              <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-1/2"></div>
              <div class="h-5 bg-zinc-300 dark:bg-zinc-700 rounded w-3/4"></div>
            </div>
          </div>

          <div class="rounded-xl overflow-hidden">
            <div class="aspect-[16/9] bg-zinc-300 dark:bg-zinc-700 rounded-xl"></div>
            <div class="p-4 space-y-2">
              <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-1/3"></div>
              <div class="h-5 bg-zinc-300 dark:bg-zinc-700 rounded w-2/3"></div>
            </div>
          </div>

          <div class="hidden lg:block rounded-xl overflow-hidden">
            <div class="aspect-[16/9] bg-zinc-300 dark:bg-zinc-700 rounded-xl"></div>
            <div class="p-4 space-y-2">
              <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-1/2"></div>
              <div class="h-5 bg-zinc-300 dark:bg-zinc-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Pure presentational skeleton — no props required
</script>

<style scoped></style>
