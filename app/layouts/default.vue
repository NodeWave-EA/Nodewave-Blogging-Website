<template>
  <div class="layout-wrapper">
    <UApp>
      <UiAppHeader />

      <UMain>
        <SiteOpenGraph>
          <slot />
        </SiteOpenGraph>
      </UMain>

      <BlogSearchModal />
      <UiScrollToTop />

      <UiAppFooter />
    </UApp>
  </div>
</template>
