<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";

const { logger } = useLogger({ context: "app.vue" });
const route = useRoute();

logger.log(`Navigated to ${route.path}`);

const variants = [
  "parallax-stars",
  "iot-nodes",
  "webdev-flow",
  "mesh",
];

// change variant every day
const variant = ref(variants[0]);
let intervalId: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  intervalId = setInterval(() => {
    const currentIndex = variants.indexOf(variant.value);
    variant.value = variants[(currentIndex + 1) % variants.length];
  }, 86400000); // 24 hours in milliseconds
});

// Clean up the timer if the root component unmounts
onUnmounted(() => {
  if (intervalId)
    clearInterval(intervalId);
});
</script>

<template>
  <div class="app-root-container">
    <NuxtLayout>
      <UiAppSiteBackground :variant="variant" />
      <NuxtRouteAnnouncer />
      <NuxtLoadingIndicator
        color="repeating-linear-gradient(to right, #14b8a6 0%, #0d9488 50%, #2dd4bf 100%)"
        :height="3"
      />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
