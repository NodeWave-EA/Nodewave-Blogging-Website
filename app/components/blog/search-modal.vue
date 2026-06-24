<script setup lang="ts">
const { getSearchSections, getNavigation } = useContent();
const { data: navigation } = await getNavigation();

const { data: files } = await getSearchSections();

const links = [
  {
    label: "Categories",
    icon: "i-lucide-folders",
    to: "/categories",
  },
  {
    label: "Tags",
    icon: "i-lucide-tags",
    to: "/tags",
  },
  {
    label: "Authors",
    icon: "i-lucide-users",
    to: "/authors",
  },
];
</script>

<template>
  <UApp>
    <ClientOnly>
      <LazyUContentSearch
        :navigation="navigation"
        :files="files"
        :fuse="{ resultLimit: 20, fuseOptions: { threshold: 0.2 } }"
        shortcut="meta_k"
        :links="links"
      />
    </ClientOnly>
  </UApp>
</template>
