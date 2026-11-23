<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";

import { navLinks } from "~/constants";

const props = withDefaults(defineProps<{
  /** Auto-hide header when scrolling down to read and reveal when scrolling up */
  autoHideOnRead?: boolean;
}>(), {
  autoHideOnRead: false,
});

const route = useRoute();

const isMobileMenuOpen = ref(false);
const isHeaderVisible = useState<boolean>("blog-header-visible", () => true);

let lastScrollY = 0;
let ticking = false;

function syncHeaderOffsetVar(visible: boolean) {
  if (!import.meta.client)
    return;
  document.documentElement.style.setProperty(
    "--blog-header-offset",
    visible ? "var(--ui-header-height)" : "0px",
  );
}

function updateHeaderVisibility() {
  ticking = false;

  if (!props.autoHideOnRead || isMobileMenuOpen.value) {
    isHeaderVisible.value = true;
    return;
  }

  const currentY = Math.max(0, window.scrollY || 0);
  const delta = currentY - lastScrollY;

  if (currentY <= 48) {
    isHeaderVisible.value = true;
  }
  else if (delta > 6) {
    // Scrolling down hide header while reading
    isHeaderVisible.value = false;
  }
  else if (delta < -6) {
    // Scrolling up show header
    isHeaderVisible.value = true;
  }

  lastScrollY = currentY;
}

function onWindowScroll() {
  if (!ticking) {
    ticking = true;
    window.requestAnimationFrame(updateHeaderVisibility);
  }
}

watch(
  isHeaderVisible,
  (visible) => {
    syncHeaderOffsetVar(visible);
  },
  { immediate: true },
);

watch(isMobileMenuOpen, (open) => {
  if (open) {
    isHeaderVisible.value = true;
  }
});

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false;
    isHeaderVisible.value = true;
    if (import.meta.client) {
      lastScrollY = Math.max(0, window.scrollY || 0);
    }
  },
);

onMounted(() => {
  lastScrollY = Math.max(0, window.scrollY || 0);
  isHeaderVisible.value = true;
  syncHeaderOffsetVar(true);

  if (props.autoHideOnRead) {
    window.addEventListener("scroll", onWindowScroll, { passive: true });
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener("scroll", onWindowScroll);
    document.documentElement.style.removeProperty("--blog-header-offset");
  }
  isHeaderVisible.value = true;
});

const config = useRuntimeConfig();
const siteUrl = (config.public.siteUrl || "https://nodewaveblog.vercel.app").replace(/\/$/, "");

// Dynamically generate SiteNavigationElement Schema from navLinks
useSchemaOrg([
  defineItemList({
    "@type": "SiteNavigationElement",
    "name": "Main Navigation",
    "itemListElement": navLinks.map(link => ({
      name: link.label.charAt(0).toUpperCase() + link.label.slice(1),
      url: `${siteUrl}${link.to}`,
    })),
  }),
]);
</script>

<template>
  <UHeader
    v-model:open="isMobileMenuOpen"
    mode="slideover"
    class="bg-transparent border-0 shadow-none backdrop-blur-none"
    :ui="{
      root: [
        'sticky top-0 z-50 pt-2.5 pb-1 px-3 sm:px-6 lg:px-8 bg-transparent border-0 shadow-none transition-all duration-300 ease-out will-change-transform',
        autoHideOnRead && !isHeaderVisible
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100',
      ].join(' '),
      container: 'max-w-(--ui-container) mx-auto h-13 sm:h-14 px-3 sm:px-4 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/85 dark:bg-(--app-surface-subtle)/90 backdrop-blur-md ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.06),0_6px_16px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_8px_20px_-4px_rgba(0,0,0,0.35)] flex items-center justify-between gap-2 transition-colors duration-300',
      left: 'flex items-center justify-start min-w-0 shrink lg:flex-1',
      center: 'hidden lg:flex items-center justify-center shrink-0',
      right: 'flex items-center justify-end gap-1 shrink-0 lg:flex-1',
      toggle: 'lg:hidden rounded-xs border border-transparent hover:border-(--app-border) hover:bg-(--app-bg) text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer',
      content: 'lg:hidden bg-(--app-bg) border-l border-(--app-border)',
      overlay: 'lg:hidden bg-neutral-950/40 backdrop-blur-xs',
      header: 'px-4 sm:px-6 h-(--ui-header-height) shrink-0 flex items-center justify-between gap-3 border-b border-(--app-border) bg-(--app-bg)',
      body: 'p-4 sm:p-6 overflow-y-auto bg-(--app-bg) flex-1',
    }"
  >
    <!-- Logo -->
    <template #left>
      <UiAppLogo letter-mode="type" :duration="3600" />
    </template>

    <!-- Desktop Navigation -->
    <template #default>
      <UiAppHeaderDesktop />
    </template>

    <!-- Header Actions -->
    <template #right>
      <UiAppHeaderActions />
    </template>

    <!-- Mobile Navigation Panel -->
    <template #body>
      <LazyUiAppHeaderMobile @navigate="isMobileMenuOpen = false" />
    </template>
  </UHeader>
</template>
