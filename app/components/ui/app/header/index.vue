<script setup lang="ts">
// const { headerClass, containerClass } = useFloatingHeader();

useAOS();
</script>

<template>
  <UHeader
    mode="slideover"
    :ui="{
      root: 'sticky top-0 z-50 border-0 bg-transparent ring-0 transition-all duration-300 will-change-[padding,background-color,backdrop-filter]',
      left: 'flex items-center gap-1.5',
      center: 'hidden flex-1 items-center justify-center lg:flex',
      right: 'flex items-center gap-2',
      body: 'border-0 p-6',
    }"
  >
    <!-- Logo -->
    <template #left>
      <UiAppLogo />
    </template>

    <!-- Desktop Navigation -->
    <template #default>
      <UiAppHeaderDesktop />
    </template>

    <!-- Header Actions -->
    <template #right>
      <UiAppHeaderActions />
    </template>

    <!-- Mobile Navigation Panel -->
    <template #body>
      <LazyUiAppHeaderMobile />
    </template>
  </UHeader>
</template>
