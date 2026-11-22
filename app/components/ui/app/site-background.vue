<script setup lang="ts">
import { computed } from "vue";

type Props = {
  /**
   * Opacity of the paper texture overlay (0.1 to 1.0).
   * @default 1.0
   */
  grainOpacity?: number;
  /**
   * Color palette profile for background reading comfort and branding.
   * @default 'teal'
   */
  warmthProfile?: "teal" | "cream" | "sepia" | "amber";
};

const props = withDefaults(defineProps<Props>(), {
  grainOpacity: 1.0,
  warmthProfile: "teal",
});

const themeConfig = computed(() => {
  switch (props.warmthProfile) {
    case "sepia":
      return {
        base: "bg-[#f4efe6] dark:bg-[#181614]",
        lightMatrix: "0.3 0 0 0 0.4 0 0.3 0 0 0.35 0 0 0.3 0 0.3 0 0 0 0.7 0",
        dotOpacity: "opacity-[0.03] dark:opacity-[0.08]",
        dotColor: "rgba(160, 150, 130, 0.6)",
        vignette:
          "bg-[radial-gradient(circle_at_center,transparent_30%,rgba(120,53,15,0.05)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]",
        glowTop: "bg-amber-500/[0.05] dark:bg-amber-500/[0.05]",
        glowBottom: "bg-teal-500/[0.07] dark:bg-teal-500/[0.07]",
      };
    case "amber":
      return {
        base: "bg-[#faf5eb] dark:bg-[#1a1713]",
        lightMatrix: "0.3 0 0 0 0.4 0 0.3 0 0 0.35 0 0 0.3 0 0.3 0 0 0 0.7 0",
        dotOpacity: "opacity-[0.03] dark:opacity-[0.08]",
        dotColor: "rgba(160, 150, 130, 0.6)",
        vignette:
          "bg-[radial-gradient(circle_at_center,transparent_30%,rgba(120,53,15,0.05)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]",
        glowTop: "bg-amber-500/[0.06] dark:bg-amber-500/[0.05]",
        glowBottom: "bg-amber-400/[0.06] dark:bg-teal-500/[0.06]",
      };
    case "cream":
      return {
        base: "bg-[#f7f4ed] dark:bg-[#161513]",
        lightMatrix: "0.3 0 0 0 0.4 0 0.3 0 0 0.35 0 0 0.3 0 0.3 0 0 0 0.7 0",
        dotOpacity: "opacity-[0.03] dark:opacity-[0.08]",
        dotColor: "rgba(160, 150, 130, 0.6)",
        vignette:
          "bg-[radial-gradient(circle_at_center,transparent_30%,rgba(120,53,15,0.04)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]",
        glowTop: "bg-amber-500/[0.04] dark:bg-amber-500/[0.04]",
        glowBottom: "bg-teal-500/[0.05] dark:bg-teal-500/[0.05]",
      };
    case "teal":
    default:
      return {
        base: "bg-[#f0f8f7] dark:bg-[#0a1615]",
        lightMatrix: "0.2 0 0 0 0.1 0 0.3 0 0 0.4 0 0 0.3 0 0.4 0 0 0 0.7 0",
        dotOpacity: "opacity-[0.04] dark:opacity-[0.1]",
        dotColor: "rgba(20, 184, 166, 0.8)",
        vignette:
          "bg-[radial-gradient(circle_at_center,transparent_30%,rgba(13,148,136,0.06)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_30%,rgba(4,47,46,0.6)_100%)]",
        glowTop: "bg-teal-500/10 dark:bg-teal-500/8",
        glowBottom: "bg-teal-400/12 dark:bg-teal-600/8",
      };
  }
});
</script>

<template>
  <div
    class="fixed inset-0 -z-50 h-full w-full overflow-hidden pointer-events-none select-none transition-colors duration-700 ease-in-out"
    :class="themeConfig.base"
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
          :values="themeConfig.lightMatrix"
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

    <!-- MICRO PAPER FIBER DOT PATTERN -->
    <div
      class="absolute inset-0 pointer-events-none mix-blend-overlay"
      :class="themeConfig.dotOpacity"
      :style="{
        backgroundImage: `radial-gradient(circle at 50% 50%, ${themeConfig.dotColor} 1px, transparent 1px)`,
        backgroundSize: '12px 12px',
      }"
    />

    <!-- SOFT VIGNETTE TO CENTER READABILITY -->
    <div
      class="absolute inset-0 pointer-events-none"
      :class="themeConfig.vignette"
    />

    <!-- AMBIENT GLOWS -->
    <div class="absolute inset-0 transition-opacity duration-1000">
      <div
        class="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] max-w-140 rounded-full blur-[120px] transform-gpu"
        :class="themeConfig.glowTop"
      />
      <div
        class="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-150 rounded-full blur-[130px] transform-gpu"
        :class="themeConfig.glowBottom"
      />
    </div>
  </div>
</template>

<style scoped>
/* Prevents Tailwind v4 Vite plugin HMR issue */
</style>
