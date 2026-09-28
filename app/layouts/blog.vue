<template>
  <div class="blog-layout-wrapper">
    <UiAppHeader />

    <UMain>
      <SiteOpenGraph>
        <slot />
      </SiteOpenGraph>
    </UMain>

    <BlogSearchModal />
    <UiScrollToTop />
  </div>
</template>
