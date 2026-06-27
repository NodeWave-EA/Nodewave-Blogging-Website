<template>
  <div class="layout-wrapper">
    <UApp>
      <UiAppHeader />
      <BlogSearchModal />
      <UMain>
        <slot />
      </UMain>
      <UiScrollToTop />
    </UApp>
  </div>
</template>
