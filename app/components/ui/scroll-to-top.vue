<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

defineOptions({
  name: "AppScrollToTop",
});

const { isMotionReduced } = useReduceMotion();

const isVisible = ref(false);
const scrollProgress = ref(0);
let rafId: number | null = null;

function computeScrollMetrics() {
  rafId = null;
  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  isVisible.value = scrollTop > 280;

  if (docHeight > 0) {
    const ratio = Math.min(Math.max(scrollTop / docHeight, 0), 1);
    scrollProgress.value = Math.round(ratio * 1000) / 10;
  }
  else {
    scrollProgress.value = 0;
  }
}

function scheduleScrollUpdate() {
  if (rafId !== null)
    return;
  rafId = window.requestAnimationFrame(computeScrollMetrics);
}

function scrollToTopNode() {
  window.scrollTo({
    top: 0,
    behavior: isMotionReduced.value ? "auto" : "smooth",
  });
}

onMounted(() => {
  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate, { passive: true });
  computeScrollMetrics();
});

onUnmounted(() => {
  window.removeEventListener("scroll", scheduleScrollUpdate);
  window.removeEventListener("resize", scheduleScrollUpdate);
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }
});
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="isVisible"
      class="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 flex items-center justify-center"
    >
      <UTooltip
        text="Back to top"
        :content="{ side: 'left', sideOffset: 8 }"
      >
        <button
          type="button"
          aria-label="Scroll back to top"
          class="group relative inline-flex items-center justify-center size-9 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/85 dark:bg-(--app-surface-subtle)/90 backdrop-blur-md ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.06),0_6px_16px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_8px_20px_-4px_rgba(0,0,0,0.35)] text-neutral-700 dark:text-neutral-200 hover:bg-(--app-surface-hover)/95 hover:border-primary-500/40 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 ease-out cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          @click="scrollToTopNode"
        >
          <!-- Perimeter Reading / Scroll Progress Indicator -->
          <svg
            class="absolute inset-0 size-full pointer-events-none"
            viewBox="0 0 36 36"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="1"
              y="1"
              width="34"
              height="34"
              rx="2"
              pathLength="100"
              stroke="var(--ui-primary)"
              stroke-width="1.75"
              stroke-linecap="square"
              stroke-dasharray="100"
              :stroke-dashoffset="100 - scrollProgress"
              class="transition-[stroke-dashoffset] duration-100 ease-out"
            />
          </svg>

          <UIcon
            name="i-lucide-arrow-up"
            class="size-4 transition-transform duration-200 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </button>
      </UTooltip>
    </div>
  </Transition>
</template>
