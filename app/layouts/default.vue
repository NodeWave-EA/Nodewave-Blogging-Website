<template>
  <div class="layout-wrapper">
    <UApp>
      <UiAppHeader />

      <UMain>
        <slot />
      </UMain>

      <BlogSearchModal />
      <UiScrollToTop />

      <UiAppFooter />
    </UApp>
  </div>
</template>
