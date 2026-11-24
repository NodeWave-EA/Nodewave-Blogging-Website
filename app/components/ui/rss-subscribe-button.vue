<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";

defineOptions({
  name: "RssSubscribeButton",
});

const props = defineProps<{
  /** Label name for the feed (e.g. Author Name, Category Name) */
  title: string;
  /** Relative feed endpoint URL (e.g. /authors/gideon-yebei/rss.xml) */
  feedPath: string;
}>();

const config = useRuntimeConfig().public;
const copied = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | null = null;

const normalizedFeedPath = computed(() =>
  props.feedPath.startsWith("/")
    ? props.feedPath
    : `/${props.feedPath}`,
);

const fullFeedUrl = computed(() => {
  const site = (config.siteUrl || "https://nodewaveblog.vercel.app").replace(/\/$/, "");
  return `${site}${normalizedFeedPath.value}`;
});

const tooltipText = computed(() =>
  copied.value
    ? "RSS feed URL copied to clipboard"
    : `Subscribe to ${props.title} RSS feed`,
);

async function handleSubscribe() {
  if (!import.meta.client)
    return;

  window.open(normalizedFeedPath.value, "_blank", "noopener,noreferrer");

  try {
    await navigator.clipboard.writeText(fullFeedUrl.value);
    copied.value = true;

    if (copyTimer !== null)
      clearTimeout(copyTimer);

    copyTimer = setTimeout(() => {
      copied.value = false;
      copyTimer = null;
    }, 2500);
  }
  catch (err) {
    console.error("Failed to copy feed URL to clipboard:", err);
  }
}

onUnmounted(() => {
  if (copyTimer !== null) {
    clearTimeout(copyTimer);
    copyTimer = null;
  }
});
</script>

<template>
  <UTooltip
    :text="tooltipText"
    :content="{ side: 'top', sideOffset: 6 }"
  >
    <button
      type="button"
      :aria-label="tooltipText"
      class="group relative inline-flex items-center justify-center size-8 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/85 dark:bg-(--app-surface-subtle)/90 backdrop-blur-md ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_6px_16px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_8px_20px_-4px_rgba(0,0,0,0.35)] hover:bg-(--app-surface-hover)/95 hover:border-primary-500/40 transition-all duration-200 ease-out cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      :class="{ 'border-primary-500/50 bg-(--app-surface-hover)': copied }"
      @click="handleSubscribe"
    >
      <UIcon
        :name="copied ? 'i-lucide-check' : 'i-lucide-rss'"
        class="size-3.5 transition-transform duration-200 group-hover:scale-105"
        :class="copied ? 'text-primary-600 dark:text-primary-400' : 'text-amber-500 dark:text-amber-400'"
        aria-hidden="true"
      />
    </button>
  </UTooltip>
</template>
