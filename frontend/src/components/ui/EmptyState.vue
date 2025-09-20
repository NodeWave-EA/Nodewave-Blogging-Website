<template>
  <div class="text-center py-16" data-aos="fade-up">
    <!-- Icon -->
    <div class="mx-auto w-24 h-24 mb-6">
      <svg
        v-if="icon === 'document'"
        class="w-full h-full text-zinc-400 dark:text-zinc-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <svg
        v-else-if="icon === 'search'"
        class="w-full h-full text-zinc-400 dark:text-zinc-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <svg
        v-else
        class="w-full h-full text-zinc-400 dark:text-zinc-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    </div>

    <!-- Title -->
    <h3 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-8">
      {{ description }}
    </p>

    <!-- Action Button (optional) -->
    <slot name="action">
      <router-link v-if="actionText && actionTo" :to="actionTo" class="btn btn-primary">
        {{ actionText }}
      </router-link>
    </slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  icon?: 'document' | 'search' | 'error'
  actionText?: string
  actionTo?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'document',
})
</script>
