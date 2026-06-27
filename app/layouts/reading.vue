<script setup lang="ts">
useAOS();
</script>

<template>
  <div class="layout-wrapper">
    <UApp>
      <UiAppHeader />

      <UMain>
        <slot />
      </UMain>
      <BlogSearchModal />
      <UiScrollToTop />
    </UApp>
  </div>
</template>
