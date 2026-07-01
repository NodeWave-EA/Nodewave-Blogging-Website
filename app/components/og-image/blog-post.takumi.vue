<script setup>
defineProps({
  colorMode: { type: String, required: false, default: "dark" },
  title: { type: String, required: false, default: "Blog Post Title" },
  author: { type: String, required: false, default: "Author Name" },
  date: { type: String, required: false, default: "Jan 1, 2025" },
  readingTime: { type: String, required: false, default: "5 min read" },
  category: { type: String, required: false, default: "Technology" },
  avatar: { type: String, required: false },
  backgroundImage: { type: String, required: false },
});
</script>

<template>
  <!-- Main container (Must keep overflow-hidden) -->
  <div class="relative w-full h-full flex flex-col p-12 md:p-16 justify-between bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-white overflow-hidden">
    <!-- Fixed Background Image Layer -->
    <div
      v-if="backgroundImage"
      class="absolute inset-0 bg-center bg-no-repeat bg-cover pointer-events-none"
      :style="{
        backgroundImage: `url(${backgroundImage})`,
        filter: 'blur(2px)',
        transform: 'scale(1.2)',
      }"
    />

    <!-- Top Row: Category -->
    <div class="flex items-start z-10">
      <div class="text-xl md:text-2xl font-bold px-6 py-2.5 text-white bg-blue-500 rounded-full">
        {{ category }}
      </div>
    </div>

    <!-- Middle Row: Title -->
    <div class="flex flex-col gap-4 max-w-5xl text-white z-10">
      <h1
        class="text-5xl md:text-6xl font-black m-0 tracking-tight"
        style="line-height: 1.15;"
      >
        {{ title }}
      </h1>
    </div>

    <!-- Bottom Row: Author details & Reading Time -->
    <div class="flex items-center gap-6 md:gap-8 z-10">
      <div
        v-if="avatar"
        class="overflow-hidden border-4 border-neutral-200 dark:border-neutral-800 shrink-0"
        style="width: 112px; height: 112px; border-radius: 50%;"
      >
        <img
          :src="avatar"
          alt="Avatar"
          class="w-full h-full"
          style="object-fit: cover; border-radius: 50%;"
        >
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-3xl md:text-4xl font-black text-white tracking-tight">
          {{ author }}
        </span>
        <div class="flex items-center gap-4 text-2xl md:text-3xl font-semibold text-white tracking-tight">
          <span>{{ date }}</span>
          <span>•</span>
          <span>{{ readingTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
