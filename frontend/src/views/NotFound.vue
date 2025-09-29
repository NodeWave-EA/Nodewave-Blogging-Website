<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-transparent px-4 text-center">
    <!-- Animated SVG Illustration -->
    <div class="w-full max-w-md mb-8">
      <svg class="w-full h-auto" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <!-- Ghost Shape -->
        <g class="animate-bounce">
          <circle cx="200" cy="120" r="60" fill="#3b82f6" opacity="0.1" />
          <path d="M160 180 Q200 240 240 180 L240 120 Q240 80 200 80 Q160 80 160 120 Z" fill="#3b82f6" opacity="0.15" />
          <circle cx="185" cy="115" r="10" fill="#1e40af" />
          <circle cx="215" cy="115" r="10" fill="#1e40af" />
        </g>
        <!-- Floating Glow -->
        <circle class="animate-pulse" cx="200" cy="120" r="85" fill="#3b82f6" opacity="0.05" />
      </svg>
    </div>

    <!-- Page Header -->
    <PageHeader tag="404" title="Page Not Found" description="The page you're looking for doesn't exist."
      size="compact" />

    <!-- Go Home Button -->
    <div class="mt-6">
      <router-link to="/"
        class="inline-block px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900">
        Go Home
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
  import PageHeader from '@/components/ui/PageHeader.vue';
  import { onMounted } from 'vue';
  import { updateSEO } from '../utils/seo';

  onMounted(() => {
    updateSEO({
      title: '404 - Page Not Found',
      description: 'The page you are looking for could not be found.',
    })
  })
</script>
