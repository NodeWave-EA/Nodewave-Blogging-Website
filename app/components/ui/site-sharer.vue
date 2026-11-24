<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

defineOptions({
  name: "AppSiteSharer",
});

type ShareTarget = {
  id: string;
  label: string;
  href: string;
  icon: string;
};

const SCROLL_IDLE_DELAY_MS = 1400;
const COMPACT_VIEWPORT_QUERY = "(max-width: 767px)";

const route = useRoute();
const runtimeConfig = useRuntimeConfig().public;
const { isMotionReduced } = useReduceMotion();

const isMenuOpen = ref(false);
const isCopied = ref(false);
const isScrolling = ref(false);
const isInteracting = ref(false);
const isCompactViewport = ref(false);
const canNativeShare = ref(false);

let copyTimer: ReturnType<typeof setTimeout> | null = null;
let scrollIdleTimer: ReturnType<typeof setTimeout> | null = null;
let viewportMediaQuery: MediaQueryList | null = null;

const isBlogDetailPage = computed(() => {
  if (route.name === "blogs-slug")
    return true;
  const cleanPath = route.path.replace(/\/$/, "");
  return cleanPath.startsWith("/blogs/") && cleanPath !== "/blogs";
});

// Auto-hide while idle only on mobile / small screens when reading a blog post
const shouldAutoHideOnIdle = computed(() =>
  isCompactViewport.value && isBlogDetailPage.value,
);

const isSharerVisible = computed(() => {
  if (!shouldAutoHideOnIdle.value)
    return true;
  return isScrolling.value || isMenuOpen.value || isInteracting.value;
});

const currentUrl = computed(() => {
  const configuredSiteUrl = (runtimeConfig.siteUrl || "").replace(/\/$/, "");
  const origin = configuredSiteUrl
    || (import.meta.client
      ? window.location.origin
      : "https://nodewaveblog.vercel.app");

  const normalizedPath = route.path === "/"
    ? "/"
    : route.path.replace(/\/$/, "");

  return `${origin}${normalizedPath}`;
});

const encodedUrl = computed(() => encodeURIComponent(currentUrl.value));

// Top 3 primary socials rendered directly on the floating strip (URL-only so OG tags drive previews)
const primarySocials = computed<ShareTarget[]>(() => [
  {
    id: "x",
    label: "Share on X",
    href: `https://x.com/intent/tweet?url=${encodedUrl.value}`,
    icon: "i-simple-icons-x",
  },
  {
    id: "linkedin",
    label: "Share on LinkedIn",
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl.value}`,
    icon: "i-simple-icons-linkedin",
  },
  {
    id: "whatsapp",
    label: "Share on WhatsApp",
    href: `https://api.whatsapp.com/send?text=${encodedUrl.value}`,
    icon: "i-simple-icons-whatsapp",
  },
]);

// Secondary channels inside the three-dots overflow menu
const secondarySocials = computed<ShareTarget[]>(() => [
  {
    id: "facebook",
    label: "Facebook",
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl.value}`,
    icon: "i-simple-icons-facebook",
  },
  {
    id: "telegram",
    label: "Telegram",
    href: `https://t.me/share/url?url=${encodedUrl.value}`,
    icon: "i-simple-icons-telegram",
  },
  {
    id: "reddit",
    label: "Reddit",
    href: `https://www.reddit.com/submit?url=${encodedUrl.value}`,
    icon: "i-simple-icons-reddit",
  },
  {
    id: "bluesky",
    label: "BlueSky",
    href: `https://bsky.app/intent/compose?text=${encodedUrl.value}`,
    icon: "i-simple-icons-bluesky",
  },
  {
    id: "email",
    label: "Email",
    href: `mailto:?body=${encodedUrl.value}`,
    icon: "i-lucide-mail",
  },
]);

function syncViewportState() {
  if (!viewportMediaQuery)
    return;
  isCompactViewport.value = viewportMediaQuery.matches;
  if (!isCompactViewport.value) {
    isScrolling.value = false;
    if (scrollIdleTimer !== null) {
      clearTimeout(scrollIdleTimer);
      scrollIdleTimer = null;
    }
  }
}

function scheduleAutoHide() {
  if (scrollIdleTimer !== null)
    clearTimeout(scrollIdleTimer);

  scrollIdleTimer = setTimeout(() => {
    if (!isMenuOpen.value && !isInteracting.value) {
      isScrolling.value = false;
    }
    scrollIdleTimer = null;
  }, SCROLL_IDLE_DELAY_MS);
}

function handleScrollActivity() {
  if (!shouldAutoHideOnIdle.value)
    return;
  isScrolling.value = true;
  scheduleAutoHide();
}

function handleInteractionStart() {
  isInteracting.value = true;
  if (scrollIdleTimer !== null) {
    clearTimeout(scrollIdleTimer);
    scrollIdleTimer = null;
  }
}

function handleInteractionEnd() {
  isInteracting.value = false;
  if (shouldAutoHideOnIdle.value && !isMenuOpen.value) {
    scheduleAutoHide();
  }
}

watch(isMenuOpen, (open) => {
  if (!open && shouldAutoHideOnIdle.value) {
    scheduleAutoHide();
  }
});

watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false;
    isInteracting.value = false;
    isScrolling.value = false;
    if (scrollIdleTimer !== null) {
      clearTimeout(scrollIdleTimer);
      scrollIdleTimer = null;
    }
  },
);

async function copyCurrentUrl() {
  if (!import.meta.client)
    return;

  try {
    await navigator.clipboard.writeText(currentUrl.value);
    isCopied.value = true;

    if (copyTimer !== null)
      clearTimeout(copyTimer);

    copyTimer = setTimeout(() => {
      isCopied.value = false;
      copyTimer = null;
    }, 2200);
  }
  catch (err) {
    console.error("Failed to copy page URL:", err);
  }
}

async function triggerNativeShare() {
  if (!import.meta.client || !navigator.share)
    return;

  isMenuOpen.value = false;
  try {
    await navigator.share({ url: currentUrl.value });
  }
  catch {
    // Ignore user-cancelled share sheets
  }
}

onMounted(() => {
  canNativeShare.value = typeof navigator !== "undefined" && typeof navigator.share === "function";

  viewportMediaQuery = window.matchMedia(COMPACT_VIEWPORT_QUERY);
  syncViewportState();
  viewportMediaQuery.addEventListener("change", syncViewportState);

  window.addEventListener("scroll", handleScrollActivity, { passive: true });
});

onUnmounted(() => {
  viewportMediaQuery?.removeEventListener("change", syncViewportState);
  window.removeEventListener("scroll", handleScrollActivity);

  if (copyTimer !== null) {
    clearTimeout(copyTimer);
    copyTimer = null;
  }
  if (scrollIdleTimer !== null) {
    clearTimeout(scrollIdleTimer);
    scrollIdleTimer = null;
  }
});
</script>

<template>
  <aside
    aria-label="Share current page"
    :aria-hidden="!isSharerVisible"
    :inert="!isSharerVisible"
    class="fixed right-2 sm:right-3 top-1/2 -translate-y-1/2 z-40 ease-out md:translate-x-0 md:opacity-90 md:hover:opacity-100 md:focus-within:opacity-100 md:pointer-events-auto"
    :class="[
      isMotionReduced ? 'transition-none' : 'transition-all duration-300',
      isSharerVisible
        ? 'translate-x-0 opacity-90 hover:opacity-100 focus-within:opacity-100 pointer-events-auto'
        : 'translate-x-[calc(100%+1rem)] opacity-0 pointer-events-none',
    ]"
    @pointerenter="handleInteractionStart"
    @pointerleave="handleInteractionEnd"
    @touchstart.passive="handleInteractionStart"
    @focusin="handleInteractionStart"
    @focusout="handleInteractionEnd"
  >
    <div
      class="flex flex-col items-center gap-0.5 p-1 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/85 dark:bg-(--app-surface-subtle)/90 backdrop-blur-md ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.06),0_6px_16px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_8px_20px_-4px_rgba(0,0,0,0.35)]"
    >
      <!-- Top 3 Social Channels -->
      <UTooltip
        v-for="social in primarySocials"
        :key="social.id"
        :text="social.label"
        :content="{ side: 'left', sideOffset: 8 }"
      >
        <UButton
          :to="social.href"
          external
          target="_blank"
          rel="noopener noreferrer"
          variant="ghost"
          color="neutral"
          size="xs"
          :icon="social.icon"
          :aria-label="social.label"
          class="inline-flex items-center justify-center size-7 sm:size-8 p-0 rounded-xs text-neutral-600 dark:text-neutral-300 hover:bg-(--app-surface-hover) hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-150"
          :ui="{
            leadingIcon: 'size-3.5 shrink-0',
          }"
        />
      </UTooltip>

      <USeparator class="w-4 my-0.5 border-(--app-border)" />

      <!-- Overflow Menu (All Other Platforms + Copy Link) -->
      <UPopover
        v-model:open="isMenuOpen"
        :modal="false"
        :content="{ side: 'left', align: 'center', sideOffset: 10 }"
        :ui="{
          content: 'w-52 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/95 dark:bg-(--app-surface-subtle)/95 backdrop-blur-md ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_10px_28px_-4px_rgba(0,0,0,0.14),0_18px_40px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_14px_32px_-4px_rgba(0,0,0,0.65),0_22px_44px_-8px_rgba(0,0,0,0.5)] overflow-hidden',
        }"
      >
        <UTooltip
          text="More share options & copy link"
          :content="{ side: 'left', sideOffset: 8 }"
        >
          <UButton
            type="button"
            variant="ghost"
            color="neutral"
            size="xs"
            :icon="isCopied ? 'i-lucide-check' : 'i-lucide-ellipsis'"
            aria-label="More share options and copy link"
            :aria-expanded="isMenuOpen"
            class="inline-flex items-center justify-center size-7 sm:size-8 p-0 rounded-xs text-neutral-600 dark:text-neutral-300 hover:bg-(--app-surface-hover) hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-150 cursor-pointer"
            :class="{
              'bg-(--app-surface-hover) text-primary-600 dark:text-primary-400': isMenuOpen,
              'bg-primary-500/10 text-primary-600 dark:text-primary-400': !isMenuOpen && isCopied,
            }"
            :ui="{
              leadingIcon: 'size-3.5 shrink-0',
            }"
          />
        </UTooltip>

        <template #content>
          <div class="p-1.5 flex flex-col gap-0.5 select-none">
            <div class="px-2 pt-1 pb-1.5 mb-0.5 border-b border-(--app-border) flex items-center justify-between gap-2">
              <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Share Page
              </span>
              <span class="font-mono text-[9px] text-neutral-400 dark:text-neutral-500 truncate max-w-24">
                {{ route.path }}
              </span>
            </div>

            <!-- Copy Link Action -->
            <UButton
              type="button"
              variant="ghost"
              :color="isCopied ? 'primary' : 'neutral'"
              size="xs"
              :icon="isCopied ? 'i-lucide-check' : 'i-lucide-link'"
              class="group w-full justify-start px-2 py-1.5 rounded-xs font-mono text-xs transition-colors cursor-pointer hover:bg-(--app-surface-hover)"
              :class="
                isCopied
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold'
                  : 'text-neutral-700 dark:text-neutral-200 font-medium hover:text-primary-600 dark:hover:text-primary-400'
              "
              :ui="{
                leadingIcon: [
                  'size-3.5 shrink-0 transition-colors',
                  isCopied
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-neutral-500 dark:text-neutral-400 group-hover:text-primary-500',
                ],
              }"
              @click="copyCurrentUrl"
            >
              <span>{{ isCopied ? "Link Copied" : "Copy Link" }}</span>
              <span class="ms-auto text-[9px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 group-hover:text-primary-500 transition-colors">
                URL
              </span>
            </UButton>

            <!-- Native OS Share Sheet (when supported) -->
            <UButton
              v-if="canNativeShare"
              type="button"
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-lucide-share"
              class="group w-full justify-start px-2 py-1.5 rounded-xs font-mono text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-(--app-surface-hover) hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
              :ui="{
                leadingIcon: 'size-3.5 shrink-0 text-neutral-500 dark:text-neutral-400 group-hover:text-primary-500 transition-colors',
              }"
              @click="triggerNativeShare"
            >
              <span>System Share...</span>
              <span class="ms-auto text-[9px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 group-hover:text-primary-500 transition-colors">
                OS
              </span>
            </UButton>

            <USeparator class="my-1 border-(--app-border)" />

            <!-- Remaining Social Platforms -->
            <UButton
              v-for="social in secondarySocials"
              :key="social.id"
              :to="social.href"
              external
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              color="neutral"
              size="xs"
              :icon="social.icon"
              trailing-icon="i-lucide-arrow-up-right"
              class="group w-full justify-start px-2 py-1.5 rounded-xs font-mono text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-(--app-surface-hover) hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              :ui="{
                leadingIcon: 'size-3.5 shrink-0 text-neutral-500 dark:text-neutral-400 group-hover:text-primary-500 transition-colors',
                trailingIcon: 'ms-auto size-3 shrink-0 text-neutral-400 dark:text-neutral-500 group-hover:text-primary-500 transition-colors',
              }"
              @click="isMenuOpen = false"
            >
              {{ social.label }}
            </UButton>
          </div>
        </template>
      </UPopover>
    </div>
  </aside>
</template>

<style scoped>
/* Prevents Tailwind v4 Vite plugin HMR issue */
</style>
