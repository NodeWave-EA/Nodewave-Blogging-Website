<script setup lang="ts">
import { onMounted, ref } from "vue";

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
    class="hidden lg:flex relative mx-auto items-center rounded-full border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-md p-1.5 isolation-auto"
    aria-label="Global desktop site navigation"
    :data-aos="!isMotionReduced ? 'fade-down' : undefined"
    data-aos-duration="450"
    data-aos-easing="ease-out-quad"
    data-aos-anchor="body"
  >
    <!-- Active Bubble -->
    <div
      v-if="isMounted"
      :style="bubbleStyles"
      class="absolute left-0 top-1.5 bottom-1.5 z-0 pointer-events-none rounded-full bg-white dark:bg-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
      :class="{ 'transition-none': isMotionReduced }"
    />

    <!-- Navigation Links -->
    <NuxtLink
      v-for="(link, idx) in navLinks"
      :key="idx"
      :ref="
        (el) =>
          setLinkRef(el as Element | ComponentPublicInstance | null, idx)
      "
      :to="link.to"
      class="group relative z-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-all duration-200 ease-out hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
      active-class="!text-primary dark:!text-primary font-bold"
    >
      <UIcon
        v-if="link.icon"
        :name="link.icon"
        class="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110"
        aria-hidden="true"
      />

      <span class="whitespace-nowrap">
        {{ link.label }}
      </span>
    </NuxtLink>
  </nav>
</template>
