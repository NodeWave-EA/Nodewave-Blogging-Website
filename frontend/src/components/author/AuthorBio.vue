<template>
  <div v-if="content" class="text-black dark:text-white">
    <RichText
      :content="content"
      class="prose prose-lg max-w-none"
      :lazy-images="true"
      aria-label="Author biography"
    />
  </div>
  <div v-else class="text-sm text-zinc-500">No biography available.</div>
</template>

<script setup lang="ts">
import RichText from '@/components/RichText.vue'

const _props = withDefaults(defineProps<{ content?: string | null }>(), { content: '' })
</script>

<style scoped></style>
