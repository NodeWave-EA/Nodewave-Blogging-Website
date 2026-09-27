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
  <button
    type="button"
    :aria-label="`Subscribe to ${props.title} RSS Feed`"
    class="group relative inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/60 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/80 hover:border-teal-500/50 transition-all duration-300 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
    @click="handleSubscribe"
  >
    <UIcon
      :name="copied ? 'i-lucide-check' : 'i-lucide-rss'"
      class="w-3.5 h-3.5 transition-transform group-hover:scale-110"
      :class="copied ? 'text-teal-500' : 'text-amber-500 dark:text-amber-400'"
    />
    <span class="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
      {{ copied ? "Feed URL Copied!" : `Subscribe to ${props.title} RSS Feed` }}
    </span>
  </button>
</template>

<style scoped>
/* Prevents Tailwind v4 Vite plugin HMR issue */
</style>
