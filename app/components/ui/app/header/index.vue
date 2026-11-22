<script setup lang="ts">
import { navLinks } from "~/constants";

const route = useRoute();

useAOS();

const isMobileMenuOpen = ref(false);

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false;
  },
);

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
      root: 'sticky top-0 z-50 pt-2.5 pb-1 px-3 sm:px-6 lg:px-8 bg-transparent border-0 shadow-none transition-all duration-300',
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
