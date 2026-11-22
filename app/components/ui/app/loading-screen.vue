<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";

import { siteConfig } from "~/app.meta";

const props = withDefaults(defineProps<{
  /** Minimum display duration (ms) when reduced motion is off to avoid jarring flashes */
  minDuration?: number;
  /** Hard failsafe timeout (ms) so the overlay can never stay stuck */
  maxTimeout?: number;
}>(), {
  minDuration: 320,
  maxTimeout: 3500,
});

const { isMotionReduced } = useReduceMotion();

const isVisible = ref(true);
const progress = ref(18);
const statusStep = ref<"boot" | "hydrate" | "ready">("boot");

let progressInterval: ReturnType<typeof setInterval> | null = null;
let finishTimer: ReturnType<typeof setTimeout> | null = null;
let failsafeTimer: ReturnType<typeof setTimeout> | null = null;

// eslint-disable-next-line vue/return-in-computed-property
const statusLabel = computed(() => {
  switch (statusStep.value) {
    case "boot":
      return "Initializing Nuxt App";
    case "hydrate":
      return "Hydrating Client";
    case "ready":
      return "Ready";
  }
});

function cleanupTimers() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  if (finishTimer) {
    clearTimeout(finishTimer);
    finishTimer = null;
  }
  if (failsafeTimer) {
    clearTimeout(failsafeTimer);
    failsafeTimer = null;
  }
}

function dismissLoader() {
  cleanupTimers();
  progress.value = 100;
  statusStep.value = "ready";
  isVisible.value = false;
}

onMounted(async () => {
  const startTime = performance.now();

  // Hard failsafe to guarantee dismissal
  failsafeTimer = setTimeout(() => {
    dismissLoader();
  }, props.maxTimeout);

  if (isMotionReduced.value) {
    await nextTick();
    dismissLoader();
    return;
  }

  // Smoothly advance progress while client hydration settles
  progressInterval = setInterval(() => {
    if (progress.value < 88) {
      progress.value = Math.min(88, progress.value + Math.ceil((90 - progress.value) * 0.25));
      if (progress.value >= 50) {
        statusStep.value = "hydrate";
      }
    }
  }, 60);

  await nextTick();

  const elapsed = performance.now() - startTime;
  const remaining = Math.max(0, props.minDuration - elapsed);

  finishTimer = setTimeout(() => {
    progress.value = 100;
    statusStep.value = "ready";

    finishTimer = setTimeout(() => {
      dismissLoader();
    }, 140);
  }, remaining);
});

onUnmounted(() => {
  cleanupTimers();
});
</script>

<template>
  <Transition
    leave-active-class="transition-opacity duration-300 ease-out"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible"
      role="status"
      aria-live="polite"
      :aria-label="`Loading ${siteConfig.name}`"
      class="fixed inset-0 z-10000 flex items-center justify-center bg-(--app-bg) px-4 select-none"
      :class="{ 'pointer-events-none': !isVisible }"
    >
      <!-- Subtle ambient grid backdrop -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(color-mix(in_srgb,var(--ui-primary)_10%,transparent)_1px,transparent_1px)] bg-size-[20px_20px] opacity-60"
      />

      <!-- Center Bento Boot Card -->
      <div
        class="relative w-full max-w-sm rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/90 dark:bg-(--app-surface-subtle)/92 backdrop-blur-md ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.06),0_8px_24px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.45),0_12px_32px_-6px_rgba(0,0,0,0.4)] p-6 space-y-5 transition-transform duration-300"
      >
        <!-- Top Telemetry Header -->
        <div class="flex items-center justify-between gap-2 border-b border-(--app-border) pb-3">
          <div class="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
            <span class="relative flex h-2 w-2" aria-hidden="true">
              <span
                v-if="!isMotionReduced"
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"
              />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
            </span>
            <span>
              Nodewave Blog Loading...
            </span>
          </div>

          <span class="font-mono text-[10px] font-semibold tabular-nums text-neutral-500 dark:text-neutral-400">
            {{ progress }}%
          </span>
        </div>

        <!-- Brand Logo -->
        <div class="flex items-center justify-center py-2">
          <UiAppLogo letter-mode="type" :duration="2500" />
        </div>

        <!-- Progress Track & Status Readout -->
        <div class="space-y-2">
          <div
            class="h-1.5 w-full overflow-hidden rounded-xs border border-(--app-border) bg-(--app-bg)"
            aria-hidden="true"
          >
            <div
              class="h-full bg-linear-to-r from-primary-500 to-indigo-500 transition-all duration-150 ease-out"
              :style="{ width: `${progress}%` }"
            />
          </div>

          <div class="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <span>{{ statusLabel }}</span>
            <UIcon
              name="i-lucide-loader-circle"
              class="size-3.5 text-primary-500"
              :class="{ 'animate-spin': !isMotionReduced }"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
