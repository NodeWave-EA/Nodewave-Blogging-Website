<script lang="ts" setup>
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
setInterval(() => {
  const currentIndex = variants.indexOf(variant.value);
  variant.value = variants[(currentIndex + 1) % variants.length];
}, 86400000); // 24 hours in milliseconds
</script>

<template>
  <div class="app-root-container">
    <NuxtLayout>
      <UiAppSiteBackground :variant="variant" />
      <NuxtRouteAnnouncer />
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
