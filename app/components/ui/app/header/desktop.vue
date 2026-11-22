<script setup lang="ts">
import { onMounted, ref } from "vue";

import { isNavLinkActive, useNavBubble } from "~/composables/use-nav-bubble";
import { navLinks } from "~/constants";

import type { ComponentPublicInstance } from "vue";

const route = useRoute();
const { isMotionReduced } = useReduceMotion();
const { setLinkRef, bubbleStyles } = useNavBubble(route, navLinks);

const isMounted = ref<boolean>(false);
onMounted(() => {
  isMounted.value = true;
});
</script>

<template>
  <nav
    class="hidden lg:flex relative mx-auto items-center rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/70 p-1 isolation-auto"
    aria-label="Global desktop site navigation"
    :data-aos="!isMotionReduced ? 'fade-down' : undefined"
    data-aos-duration="450"
    data-aos-easing="ease-out-quad"
    data-aos-anchor="body"
  >
    <!-- Sliding Bento Active Pill -->
    <div
      v-if="isMounted"
      :style="bubbleStyles"
      aria-hidden="true"
      class="absolute left-0 top-1 bottom-1 z-0 pointer-events-none rounded-xs border border-(--app-border) bg-(--app-bg) shadow-2xs transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
      :class="{ 'transition-none': isMotionReduced }"
    />

    <!-- Navigation Links -->
    <NuxtLink
      v-for="(link, idx) in navLinks"
      :key="link.to"
      :ref="(el) => setLinkRef(el as Element | ComponentPublicInstance | null, idx)"
      :to="link.to"
      :aria-current="isNavLinkActive(link.to, route.path) ? 'page' : undefined"
      class="group relative z-10 flex items-center gap-1.5 rounded-xs px-3.5 py-1.5 font-mono text-xs font-medium tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      :class="
        isNavLinkActive(link.to, route.path)
          ? 'text-primary-600 dark:text-primary-400 font-bold'
          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
      "
    >
      <UIcon
        v-if="link.icon"
        :name="link.icon"
        class="size-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110"
        :class="
          isNavLinkActive(link.to, route.path)
            ? 'text-primary-500'
            : 'text-neutral-500 dark:text-neutral-400 group-hover:text-primary-500'
        "
        aria-hidden="true"
      />

      <span class="whitespace-nowrap">
        {{ link.label }}
      </span>
    </NuxtLink>
  </nav>
</template>
