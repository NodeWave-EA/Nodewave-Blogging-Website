<script setup lang="ts">
import { computed } from "vue";

type Props = {
  /**
   * Opacity of the paper texture overlay (0.1 to 1.0).
   * @default 0.35
   */
  grainOpacity?: number;
  /**
   * Warm color palette profile for reading comfort.
   * @default 'cream'
   */
  warmthProfile?: "cream" | "sepia" | "amber";
};

const props = withDefaults(defineProps<Props>(), {
  grainOpacity: 0.35,
  warmthProfile: "cream",
});

// Warm reading paper base colors tuned for low contrast
const paletteClasses = computed(() => {
  switch (props.warmthProfile) {
    case "sepia":
      return "bg-[#f4efe6] dark:bg-[#181614]";
    case "amber":
      return "bg-[#faf5eb] dark:bg-[#1a1713]";
    case "cream":
    default:
      return "bg-[#f7f4ed] dark:bg-[#161513]";
  }
});
</script>

<template>
  <div
    class="fixed inset-0 -z-50 h-full w-full overflow-hidden pointer-events-none select-none transition-colors duration-700 ease-in-out"
    :class="paletteClasses"
    aria-hidden="true"
  >
    <!-- LIGHT MODE TACTILE PARCHMENT GRAIN -->
    <svg
      class="absolute inset-0 h-full w-full dark:hidden pointer-events-none mix-blend-multiply transition-opacity duration-300"
      :style="{ opacity: grainOpacity }"
    >
      <filter id="paper-grain-light">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="4"
          stitchTiles="stitch"
          result="noise"
        />
        <feColorMatrix
          type="matrix"
          values="
            0.3 0 0 0 0.4
            0 0.3 0 0 0.35
            0 0 0.3 0 0.3
            0 0 0 0.7 0"
        />
      </filter>
      <rect
        width="100%"
        height="100%"
        filter="url(#paper-grain-light)"
      />
    </svg>

    <!-- DARK MODE TACTILE PAPER FIBER TEXTURE -->
    <svg
      class="absolute inset-0 h-full w-full hidden dark:block pointer-events-none mix-blend-soft-light transition-opacity duration-300"
      :style="{ opacity: props.grainOpacity * 1.6 }"
    >
      <filter id="paper-grain-dark">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.7"
          numOctaves="4"
          stitchTiles="stitch"
          result="noise"
        />
        <feColorMatrix
          type="matrix"
          values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 0.85 0"
        />
      </filter>
      <rect
        width="100%"
        height="100%"
        filter="url(#paper-grain-dark)"
      />
    </svg>

    <!-- MICRO PAPER FIBER DOT PATTERN (ADDS TACTILE DEPTH IN DARK MODE) -->
    <div
      class="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none mix-blend-overlay"
      :style="{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(160, 150, 130, 0.6) 1px, transparent 1px)`,
        backgroundSize: '12px 12px',
      }"
    />

    <!-- SOFT WARM VIGNETTE TO CENTER READABILITY -->
    <div
      class="absolute inset-0 [background-image:radial-gradient(circle_at_center,transparent_30%,rgba(120,53,15,0.05)_100%)] dark:[background-image:radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)] pointer-events-none"
    />

    <!-- SUBTLE BRAND ACCENT AMBIENT GLOWS (WARM AMBER & NODEWAVE TEAL) -->
    <div class="absolute inset-0 transition-opacity duration-1000">
      <div
        class="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] max-w-140 rounded-full bg-amber-500/5 dark:bg-amber-600/5 blur-[120px] transform-gpu"
      />
      <div
        class="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-150 rounded-full bg-teal-500/8 dark:bg-teal-500/5 blur-[130px] transform-gpu"
      />
    </div>
  </div>
</template>

<style scoped>
/* Prevents Tailwind v4 Vite plugin HMR issue */
</style>
