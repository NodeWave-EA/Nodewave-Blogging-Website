<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const isVisible = ref(false);
const dashOffset = ref(0);

// Circle dimensions for SVG progress calculation
const radius = 20;
const circumference = 2 * Math.PI * radius; // ~125.66

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  // Toggle button visibility
  isVisible.value = scrollTop > 300;

  // Calculate dynamic circular stroke progress offset
  if (docHeight > 0) {
    const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
    dashOffset.value = circumference - progress * circumference;
  }
}

function scrollToTopNode() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

onMounted(() => {
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();
});

onUnmounted(() => {
  window.removeEventListener("scroll", updateScrollProgress);
});
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-8 opacity-0 scale-95"
    enter-to-class="transform translate-y-0 opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100 scale-100"
    leave-to-class="transform translate-y-8 opacity-0 scale-95"
  >
    <div
      v-if="isVisible"
      class="fixed bottom-6 right-6 z-50 flex items-center justify-center group"
    >
      <!-- CIRCULAR PROGRESS RING SVG WITH GRADIENT -->
      <svg
        class="w-13 h-13 -rotate-90 pointer-events-none drop-shadow-md"
        viewBox="0 0 48 48"
      >
        <defs>
          <linearGradient
            id="scroll-progress-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <!-- Brand Teal to Sky/Blue Gradient Stops -->
            <stop offset="0%" stop-color="#14b8a6" />
            <stop offset="100%" stop-color="#0284c7" />
          </linearGradient>
        </defs>

        <!-- Background Track Ring -->
        <circle
          cx="24"
          cy="24"
          :r="radius"
          class="stroke-gray-300/40 dark:stroke-gray-700/50"
          stroke-width="3"
          fill="none"
        />

        <!-- Active Progress Ring -->
        <circle
          cx="24"
          cy="24"
          :r="radius"
          stroke="url(#scroll-progress-gradient)"
          stroke-width="3.5"
          stroke-linecap="round"
          fill="none"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          class="transition-[stroke-dashoffset] duration-150 ease-out"
        />
      </svg>

      <!-- SCROLL TO TOP ACTION BUTTON -->
      <UButton
        icon="i-lucide-arrow-up"
        color="neutral"
        variant="ghost"
        size="md"
        class="absolute rounded-full p-2.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border border-gray-200/50 dark:border-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:scale-110 active:scale-95 transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400"
        aria-label="Scroll to top of log stream"
        @click="scrollToTopNode"
      />
    </div>
  </Transition>
</template>

<style scoped>
/* Prevents Tailwind v4 Vite plugin HMR issues */
</style>
