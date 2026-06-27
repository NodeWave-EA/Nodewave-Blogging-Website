<script setup lang="ts">
useAOS();
</script>

<template>
  <UApp>
    <UiAppHeader />

    <UMain>
      <slot />
    </UMain>
    <BlogSearchModal />
    <UiScrollToTop />
  </UApp>
</template>
