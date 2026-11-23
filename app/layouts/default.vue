<template>
  <div class="default-layout-wrapper w-full max-w-full min-w-0 overflow-x-clip">
    <UiAppHeader />

    <UMain class="w-full max-w-full min-w-0">
      <slot />
    </UMain>

    <BlogSearchModal />
    <UiScrollToTop />

    <UiAppFooter />
  </div>
</template>
