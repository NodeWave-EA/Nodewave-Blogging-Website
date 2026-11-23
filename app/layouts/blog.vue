<template>
  <div class="blog-layout-wrapper min-w-0 overflow-x-clip">
    <UiAppHeader auto-hide-on-read />

    <UMain class="min-w-0">
      <SiteOpenGraph>
        <slot />
      </SiteOpenGraph>
    </UMain>

    <BlogSearchModal />
    <UiScrollToTop />
  </div>
</template>
