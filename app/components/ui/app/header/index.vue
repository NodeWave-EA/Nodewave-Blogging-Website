<script setup lang="ts">
import { navLinks } from "~/constants";

const { headerClass, containerClass } = useFloatingHeader();

useAOS();

const config = useRuntimeConfig();
const siteUrl = (config.public.siteUrl || "https://nodewave-blogs.vercel.app").replace(/\/$/, "");

// Dynamically generate SiteNavigationElement Schema from navLinks
useSchemaOrg([
  defineItemList({
    "@type": "SiteNavigationElement",
    name: "Main Navigation",
    itemListElement: navLinks.map(link => ({
      name: link.label.charAt(0).toUpperCase() + link.label.slice(1),
      url: `${siteUrl}${link.to}`,
    })),
  }),
]);
</script>

<template>
  <UHeader
    mode="slideover"
    :class="headerClass"
    :ui="{
      root: 'sticky top-0 z-50 border-0 bg-transparent ring-0 transition-colors duration-300',
      container: containerClass,
      left: 'flex items-center gap-1.5',
      center: 'hidden lg:flex flex-1 items-center justify-center',
      right: 'flex items-center gap-2',
      body: 'border-0 bg-transparent p-6 backdrop-blur-md',
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
      <LazyUiAppHeaderMobile />
    </template>
  </UHeader>
</template>
  
