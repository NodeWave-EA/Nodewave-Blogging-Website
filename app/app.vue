<template>
  <div class="app-root-container min-w-0 overflow-x-clip">
    <UApp>
      <NuxtLayout>
        <!-- Hidden target container for Google Translate widget -->
        <div
          id="google_translate_element"
          class="sr-only"
          aria-hidden="true"
        />
        <UiAppLoadingScreen />
        <LazyUiLangSwitcher hydrate-on-idle />
        <UiSiteSharer />
        <UiAppSiteBackground
          :grain-opacity="1.0"
          warmth-profile="sepia"
        />
        <NuxtRouteAnnouncer />
        <NuxtLoadingIndicator
          color="repeating-linear-gradient(to right, #14b8a6 0%, #0d9488 50%, #2dd4bf 100%)"
          :height="3"
        />
        <SiteOpenGraph />
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>
