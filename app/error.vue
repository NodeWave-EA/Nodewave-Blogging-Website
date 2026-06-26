<script setup lang="ts">
import type { NuxtError } from "#app";

const error = useError() as ComputedRef<NuxtError>;

const is404 = computed(() => error.value?.statusCode === 404);
const errorTitle = computed(() => is404.value ? "Page Not Found" : "System Error");
const errorMessage = computed(() => error.value?.statusMessage || "The page you are looking for does not exist or an unexpected error occurred.");

const isDev = import.meta.dev;

const handleClear = () => clearError({ redirect: "/" });

useSeoMeta({
  title: () => errorTitle.value,
  description: () => errorMessage.value,
});
</script>

<template>
  <UContainer class="flex flex-col items-center justify-center min-h-screen py-24 text-center">
    <div class="mb-6 flex justify-center">
      <UIcon
        v-if="is404"
        name="i-lucide-search-x"
        class="size-12 text-neutral-400 dark:text-neutral-600"
      />
      <UIcon
        v-else
        name="i-lucide-bug"
        class="size-12 text-neutral-400 dark:text-neutral-600"
      />
    </div>

    <h1 class="text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-2">
      {{ error?.statusCode || 'Error' }}
    </h1>

    <div class="max-w-md space-y-4 mb-10">
      <h2 class="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
        {{ is404 ? 'Page Not Found' : 'Internal System Error' }}
      </h2>
      <p class="text-neutral-600 dark:text-neutral-400">
        {{ errorMessage }}
      </p>
    </div>

    <div class="flex items-center gap-3">
      <UButton
        icon="i-lucide-arrow-left"
        size="lg"
        color="neutral"
        variant="solid"
        class="rounded-xl px-6"
        @click="handleClear"
      >
        Go Home
      </UButton>

      <UButton
        to="/search"
        icon="i-lucide-search"
        size="lg"
        color="neutral"
        variant="soft"
        class="rounded-xl px-6"
      >
        Search Site
      </UButton>
    </div>

    <div
      v-if="isDev"
      class="mt-16 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left max-w-2xl w-full"
    >
      <h4 class="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-2 font-mono">
        Development Trace
      </h4>
      <pre class="text-xs text-neutral-600 dark:text-neutral-400 font-mono overflow-x-auto p-2 bg-neutral-50 dark:bg-neutral-950 rounded border border-neutral-200 dark:border-neutral-800">{{ error }}</pre>
    </div>
  </UContainer>
</template>
