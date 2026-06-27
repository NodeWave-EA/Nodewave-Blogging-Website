<script setup lang="ts">
const { headerClass, containerClass } = useFloatingHeader();

useAOS();
</script>

<template>
  <UHeader
    mode="slideover"
    :class="headerClass"
    :ui="{
      root: 'sticky top-0 z-50 border-0 bg-transparent ring-0 transition-colors duration-300',
      container: containerClass,
      left: 'flex items-center gap-1.5',
      center: 'hidden lg:flex flex-1 items-center justify-center',
      right: 'flex items-center gap-2',
      body: 'border-0 bg-transparent p-6 backdrop-blur-md',
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
