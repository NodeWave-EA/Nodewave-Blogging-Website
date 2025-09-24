<template>
  <div class="relative backdrop-blur-xl py-20 overflow-hidden">

    <div class="relative z-10 container mx-auto px-4 text-center">
      <div class="max-w-4xl mx-auto">
        <!-- Breadcrumb or Badge -->
        <div class="mb-6" data-aos="fade-down">
          <span class="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-semibold backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Blog & Insights
          </span>
        </div>

        <!-- Main Title -->
        <h1 class="text-5xl md:text-7xl font-black mb-6" data-aos="fade-up" data-aos-delay="100">
          <span class="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent leading-tight">
            {{ title }}
          </span>
        </h1>

        <!-- Description -->
        <p v-if="description" class="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium" data-aos="fade-up" data-aos-delay="200">
          {{ description }}
        </p>

        <!-- Decorative Line -->
        <div class="mt-8 flex justify-center" data-aos="fade-up" data-aos-delay="300">
          <div class="w-24 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full"></div>
        </div>

        <!-- Stats or Additional Info -->
        <div class="mt-12 flex flex-wrap justify-center gap-8 text-center" data-aos="fade-up" data-aos-delay="400">
          <div class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <div class="text-2xl font-bold text-slate-900 dark:text-white">50+</div>
            <div class="text-sm text-slate-600 dark:text-slate-400">Articles</div>
          </div>
          <div class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <div class="text-2xl font-bold text-slate-900 dark:text-white">10+</div>
            <div class="text-sm text-slate-600 dark:text-slate-400">Categories</div>
          </div>
          <div class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <div class="text-2xl font-bold text-slate-900 dark:text-white">1000+</div>
            <div class="text-sm text-slate-600 dark:text-slate-400">Readers</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>
