<script setup lang="ts">
import { navLinks } from "~/constants";

const route = useRoute();
const { headerClass, containerClass } = useFloatingHeader();

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
    :class="headerClass"
    :ui="{
      root: 'sticky top-0 z-50 h-(--ui-header-height) transition-all duration-300',
      container: containerClass,
      left: 'lg:flex-1 flex items-center gap-2 min-w-0',
      center: 'hidden lg:flex items-center justify-center',
      right: 'flex items-center justify-end lg:flex-1 gap-1.5',
      toggle: 'lg:hidden rounded-xs border border-transparent hover:border-(--app-border) hover:bg-(--app-surface-hover) text-neutral-700 dark:text-neutral-300',
      content: 'lg:hidden bg-(--app-bg) border-l border-(--app-border)',
      overlay: 'lg:hidden bg-neutral-950/40 backdrop-blur-xs',
      header: 'px-4 sm:px-6 h-(--ui-header-height) shrink-0 flex items-center justify-between gap-3 border-b border-(--app-border) bg-(--app-bg)',
      body: 'p-4 sm:p-6 overflow-y-auto bg-(--app-bg) flex-1',
    }"
  >
    <!-- Logo -->
    <template #left>
      <UiAppLogo />
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
