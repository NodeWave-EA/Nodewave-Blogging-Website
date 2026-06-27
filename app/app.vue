<script lang="ts" setup>
const { logger } = useLogger({ context: "app.vue" });
const route = useRoute();

logger.log(`Navigated to ${route.path}`);
</script>

<template>
  <div class="app-root-container">
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
