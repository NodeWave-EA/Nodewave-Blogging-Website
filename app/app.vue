<script lang="ts" setup>
const { logger } = useLogger({ context: "app.vue" });
const route = useRoute();

logger.log(`Navigated to ${route.path}`);
</script>

<template>
  <div class="app-root-container">
    <ConfigProvider>
      <TooltipProvider>
        <ToastProvider>
          <NuxtLayout>
            <NuxtRouteAnnouncer />
            <NuxtLoadingIndicator />
            <NuxtPage />
          </NuxtLayout>
        </ToastProvider>
      </TooltipProvider>
    </ConfigProvider>
  </div>
</template>
