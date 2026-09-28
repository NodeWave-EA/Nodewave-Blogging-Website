<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  /** Label name for the feed (e.g. Author Name, Category Name) */
  title: string;
  /** Relative feed endpoint URL (e.g. /authors/gideon-yebei/rss.xml) */
  feedPath: string;
}>();

const config = useRuntimeConfig().public;
const copied = ref(false);

const fullFeedUrl = computed(() => {
  const site = (config.siteUrl || "https://nodewaveblog.vercel.app").replace(/\/$/, "");
  return `${site}${props.feedPath}`;
});

const tooltipText = computed(() => {
  return copied.value ? "Feed URL Copied!" : `Subscribe to ${props.title} RSS Feed`;
});

async function handleSubscribe() {
  // Open styled feed in new tab with security attributes
  window.open(props.feedPath, "_blank", "noopener,noreferrer");

  // Copy full RSS URL to clipboard for easy feed reader paste
  try {
    await navigator.clipboard.writeText(fullFeedUrl.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  }
  catch (err) {
    console.error("Failed to copy feed URL to clipboard:", err);
  }
}
</script>

<template>
  <UTooltip :text="tooltipText">
    <button
      type="button"
      :aria-label="`Subscribe to ${props.title} RSS Feed`"
      class="group relative inline-flex items-center justify-center p-2 rounded-full border border-neutral-300 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/60 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/80 hover:border-teal-500/50 transition-all duration-300 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      @click="handleSubscribe"
    >
      <UIcon
        :name="copied ? 'i-lucide-check' : 'i-lucide-rss'"
        class="w-4 h-4 transition-transform group-hover:scale-110"
        :class="copied ? 'text-teal-500' : 'text-amber-500 dark:text-amber-400'"
      />
    </button>
  </UTooltip>
</template>

<style scoped>
/* Prevents Tailwind v4 Vite plugin HMR issue */
</style>
