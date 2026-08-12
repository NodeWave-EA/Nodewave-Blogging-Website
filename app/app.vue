<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";

import LangSwitcher from "~/components/ui/lang-switcher.vue";

import type { BackgroundVariant } from "./components/ui/app/site-background.vue";

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

const variants: BackgroundVariant[] = [
  "parallax-stars",
  "iot-nodes",
  "webdev-flow",
  "mesh",
];

// Calculate background variant based on the current calendar day
function getDailyVariant(): BackgroundVariant {
  const dayIndex = Math.floor(Date.now() / 86400000); // Days since Unix epoch
  return variants[dayIndex % variants.length] as BackgroundVariant;
}

// Default to first variant for SSR hydration consistency
const variant = ref<BackgroundVariant>(variants[0]!);

onMounted(() => {
  // Set the variant based on today's date upon mount
  variant.value = getDailyVariant();
});
</script>

<template>
  <div class="app-root-container">
    <NuxtLayout>
      <!-- Hidden target container for Google Translate widget -->
      <div
        id="google_translate_element"
        class="sr-only"
        aria-hidden="true"
      />

      <!-- Floating Language Switcher Widget (Bottom Left) -->
      <LangSwitcher />
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
