<template>
  <div class="default-layout-wrapper">
    <UiAppHeader />

    <UMain>
      <SiteOpenGraph>
        <slot />
      </SiteOpenGraph>
    </UMain>

    <BlogSearchModal />
    <UiScrollToTop />

    <UiAppFooter />
  </div>
</template>
