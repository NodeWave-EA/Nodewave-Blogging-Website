<script lang="ts" setup>
import { watch } from "vue";

import LangSwitcher from "~/components/ui/lang-switcher.vue";

const { logger } = useLogger({ context: "app.vue" });
const route = useRoute();

logger.log(`Navigated to ${route.path}`);

// Watch global route queries for dynamic parameter handling
watch(
  () => route.query,
  (query) => {
    // Handle PWA shortcut redirect to main website (?main=https://nodewave.net)
    if (typeof query.main === "string" && query.main) {
      logger.log(`Redirecting to main site: ${query.main}`);
      navigateTo(query.main, { external: true });
      return;
    }

    // Global search interceptor: auto-redirect ?q= from root or other pages (e.g. /?q=vuejs) to /search?q=vuejs
    if (typeof query.q === "string" && query.q.trim() && route.path !== "/search") {
      logger.log(`Global search query detected. Forwarding to search page: ${query.q}`);
      navigateTo({
        path: "/search",
        query: { q: query.q },
      });
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="app-root-container">
    <UApp>
      <NuxtLayout>
        <!-- Hidden target container for Google Translate widget -->
        <div
          id="google_translate_element"
          class="sr-only"
          aria-hidden="true"
        />

        <!-- Floating Language Switcher Widget (Bottom Left) -->
        <LangSwitcher />
        <!-- Global Eye-Care Reading Background with Customizable Grain Opacity & Warmth -->
        <UiAppSiteBackground
          :grain-opacity="0.2"
          warmth-profile="cream"
        />
        <NuxtRouteAnnouncer />
        <NuxtLoadingIndicator
          color="repeating-linear-gradient(to right, #14b8a6 0%, #0d9488 50%, #2dd4bf 100%)"
          :height="3"
        />
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>
