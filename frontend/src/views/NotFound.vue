<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-transparent px-4">
    <PageHeader tag="404" title="Page Not Found" description="The page you're looking for doesn't exist."
      size="compact" />
    <div class="mt-6">
      <router-link to="/"
        class="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900">
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
