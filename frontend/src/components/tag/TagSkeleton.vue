<template>
  <div class="py-16">
    <div class="container mx-auto px-4">
      <div class="animate-pulse">
        <div class="h-8 rounded-lg mb-8 max-w-md bg-transparent"></div>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="i in count"
            :key="i"
            class="h-10 rounded-full w-24 bg-zinc-300 dark:bg-zinc-600"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ count?: number }>(), { count: 20 })
</script>
