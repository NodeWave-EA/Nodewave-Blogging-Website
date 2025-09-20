<template>
  <div class="backdrop-blur-xl py-16">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        {{ title }}
      </h1>
      <p v-if="description" class="text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
        {{ description }}
      </p>
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
