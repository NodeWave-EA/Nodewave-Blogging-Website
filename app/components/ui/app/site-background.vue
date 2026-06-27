<script setup lang="ts">
import { useMouse, usePreferredReducedMotion } from "@vueuse/core";
import { computed, onMounted, ref, watch } from "vue";

export type BackgroundVariant
  = | "mesh"
    | "matrix-tech"
    | "parallax-stars"
    | "iot-nodes"
    | "webdev-flow";

type Props = {
  variant?: BackgroundVariant;
  accentColor?: string; // RGB values e.g., '14, 165, 233'
};

withDefaults(defineProps<Props>(), {
  variant: "mesh",
  accentColor: "14, 165, 233", // NodeWave sky blue default
});

// Accessibility safety preference listener
const motionPreference = usePreferredReducedMotion();
const reducedMotion = computed(() => motionPreference.value === "reduce");

// Smooth hardware parallax calculations via composable mouse vectors
const { x: mouseX, y: mouseY } = useMouse();
const parallaxX = ref(0);
const parallaxY = ref(0);

if (import.meta.client) {
  watch([mouseX, mouseY], () => {
    if (reducedMotion.value)
      return;
    // Smooth dampening offsets prevent sudden layout jumps
    parallaxX.value = (mouseX.value - window.innerWidth / 2) * 0.03;
    parallaxY.value = (mouseY.value - window.innerHeight / 2) * 0.03;
  });
}

const nodeCount = 12;
const randomNodes = ref<
  Array<{
    top: string;
    left: string;
    size: string;
    delay: string;
    duration: string;
  }>
>([]);

onMounted(() => {
  randomNodes.value = Array.from({ length: nodeCount }).map((_, i) => ({
    top: `${15 + ((i * 7) % 75)}%`,
    left: `${10 + ((i * 9) % 80)}%`,
    size: `${i % 3 === 0 ? "w-3 h-3" : i % 2 === 0 ? "w-2 h-2" : "w-1.5 h-1.5"}`,
    delay: `${(i * 0.4).toFixed(1)}s`,
    duration: `${6 + (i % 4) * 2}s`,
  }));
});
</script>

<template>
  <div
    class="fixed inset-0 -z-50 w-full h-full pointer-events-none select-none overflow-hidden transition-colors duration-500 ease-in-out font-sans"
    aria-hidden="true"
  >
    <!-- VARIANT 1: THE METRIC MESH GRID -->
    <div
      v-if="variant === 'mesh'"
      class="absolute inset-0"
    >
      <div
        class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mask-[radial-gradient(ellipse_at_center,white_40%,transparent_85%)]"
        :style="{
          backgroundImage:
            'linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }"
      />
    </div>

    <!-- VARIANT 2: TECH MATRIX DATA GRID -->
    <div
      v-if="variant === 'matrix-tech'"
      class="absolute inset-0"
    >
      <div
        class="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
        :style="{
          backgroundImage: `radial-gradient(rgba(${accentColor}, 0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }"
      />
    </div>

    <!-- VARIANT 3: PARALLAX SPACE STARFIELD -->
    <div
      v-if="variant === 'parallax-stars' && !reducedMotion"
      class="absolute inset-0 transition-transform duration-300 ease-out transform-gpu"
      :style="{
        transform: `translate3d(${parallaxX * 0.5}px, ${parallaxY * 0.5}px, 0)`,
      }"
    >
      <div
        class="absolute inset-0 opacity-[0.15] dark:opacity-[0.35]"
        :style="{
          backgroundImage:
            'radial-gradient(circle, #808080 1px, transparent 1px), radial-gradient(circle, #a1a1aa 1.5px, transparent 1.5px)',
          backgroundSize: '120px 120px, 200px 200px',
          backgroundPosition: '0 0, 40px 60px',
        }"
      />
    </div>

    <!-- VARIANT 4: INTERCONNECTED IoT DISTRIBUTED NODES -->
    <div
      v-if="variant === 'iot-nodes' && !reducedMotion"
      class="absolute inset-0 transition-transform duration-300 ease-out transform-gpu"
      :style="{
        transform: `translate3d(${parallaxX * 0.3}px, ${parallaxY * 0.3}px, 0)`,
      }"
    >
      <!-- Circuit-inspired background wire tracks -->
      <div
        class="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(#808080_1px,transparent_1px)] bg-size-[16px_16px]"
      />
      <!-- Pulsing Node Cluster System Layer -->
      <div
        v-for="(node, idx) in randomNodes"
        :key="idx"
        class="absolute rounded-full bg-primary/20 dark:bg-primary/30 border border-primary/40 animate-ping transform-gpu"
        :class="node.size"
        :style="{
          top: node.top,
          left: node.left,
          animationDelay: node.delay,
          animationDuration: node.duration,
        }"
      />
    </div>

    <!-- VARIANT 5: FLOWING WEBDEV CODE TRACK LINES -->
    <div
      v-if="variant === 'webdev-flow'"
      class="absolute inset-0 overflow-hidden opacity-[0.02] dark:opacity-[0.04] flex flex-col justify-around font-mono text-[10px] tracking-widest p-4 text-gray-500"
    >
      <div
        v-if="!reducedMotion"
        class="w-full flex flex-col gap-8 transform -rotate-12 scale-125 origin-center"
      >
        <div class="whitespace-nowrap animate-marquee-left">
          &lt;div class="grid grid-cols-12 gap-8 items-center"&gt;
          &lt;ContentRenderer :value="post" /&gt; &lt;UAccordion :items="faqs"
          /&gt;&lt;/div&gt;
        </div>
        <div class="whitespace-nowrap animate-marquee-right text-primary">
          &lt;script setup lang="ts"&gt; const { data: storeProducts } = await
          useAsyncData('store-products') &lt;/script&gt;
        </div>
        <div class="whitespace-nowrap animate-marquee-left">
          &lt;template&gt; &lt;section class="relative py-24 overflow-hidden
          shadow-2xl"&gt; &lt;UiAppBackground /&gt;&lt;/template&gt;
        </div>
      </div>
    </div>

    <div
      v-if="!reducedMotion"
      class="absolute inset-0 transition-opacity duration-700"
    >
      <div
        class="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-150 rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px] transform-gpu animate-pulse"
        style="animation-duration: 10s"
      />
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-150 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] transform-gpu animate-pulse"
        style="animation-duration: 14s"
      />
    </div>

    <div
      v-else
      class="absolute inset-0"
    >
      <div
        class="absolute inset-0 opacity-40 dark:opacity-20"
        :style="{
          backgroundImage: `radial-gradient(circle at 50% 30%, rgba(${accentColor}, 0.1), transparent 60%)`,
        }"
      />
    </div>
  </div>
</template>

<style>
/* CSS Marquee Animation Engines for Variant 5: WebDev Flow Track lines */
@keyframes marqueeLeft {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-33.33%, 0, 0);
  }
}
@keyframes marqueeRight {
  0% {
    transform: translate3d(-33.33%, 0, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}

.animate-marquee-left {
  display: inline-block;
  animation: marqueeLeft 30s linear infinite;
}
.animate-marquee-right {
  display: inline-block;
  animation: marqueeRight 35s linear infinite;
}
</style>
