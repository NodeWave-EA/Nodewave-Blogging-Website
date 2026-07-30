<script lang="ts" setup>
import { onMounted, ref } from "vue";

import LangSwitcher from "~/components/ui/lang-switcher.vue";

import type { BackgroundVariant } from "./components/ui/app/site-background.vue";

const { logger } = useLogger({ context: "app.vue" });
const route = useRoute();

logger.log(`Navigated to ${route.path}`);

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

<style>
/* Prevent Google Translate from shifting html/body down */
html,
body {
  top: 0px !important;
  margin-top: 0px !important;
  position: static !important;
}

/* Target and completely destroy all Google Translate banner iframes */
iframe.goog-te-banner-frame,
iframe.skiptranslate,
iframe[id^=":"],
iframe[src*="translate.google.com"],
iframe[src*="translate.googleapis.com"],
.goog-te-banner-frame,
.goog-te-banner,
.goog-te-balloon-frame,
#goog-gt-tt,
.goog-te-spinner-pos,
.VIpgJd-yA0ft-XU192b-G1b3Vk,
.VIpgJd-yA0ft-XU192b-nkC42e {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0px !important;
  max-height: 0px !important;
  width: 0px !important;
  pointer-events: none !important;
}

/* Strip hover highlights and tooltips */
.goog-text-highlight {
  background-color: transparent !important;
  box-shadow: none !important;
}

/* Font stack fallbacks for foreign languages */
body,
button,
input,
select,
textarea {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    "Noto Sans",
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Sans CJK KR",
    "Malgun Gothic",
    sans-serif;
}
</style>
