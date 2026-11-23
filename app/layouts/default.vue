<template>
  <div class="default-layout-wrapper min-w-0 overflow-x-clip">
    <UiAppHeader />

    <UMain class="min-w-0">
      <SiteOpenGraph>
        <slot />
      </SiteOpenGraph>
    </UMain>

    <BlogSearchModal />
    <UiScrollToTop />

    <UiAppFooter />
  </div>
</template>
