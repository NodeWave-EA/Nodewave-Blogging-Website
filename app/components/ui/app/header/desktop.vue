<script setup lang="ts">
import { onMounted, ref } from "vue";

import { navLinks } from "~/constants";

import type { ComponentPublicInstance } from "vue";

const route = useRoute();
const { isMotionReduced } = useReduceMotion();
const { setLinkRef, bubbleStyles } = useNavBubble(route, navLinks);

const { activeHoverText, clearDecryption, startDecryption } = useMatrixDecrypt();

const isMounted = ref<boolean>(false);

onMounted(() => {
  isMounted.value = true;
  navLinks.forEach((link, idx) => {
    startDecryption(`${link.label}`, `desktop-${idx}`);
  });
});
</script>

<template>
  <nav
    class="relative mx-auto hidden items-center rounded-full border border-gray-200/50 p-1.5 backdrop-blur-md isolation-auto dark:border-gray-800/50 lg:flex"
    aria-label="Desktop navigation"
    :data-aos="!isMotionReduced ? 'fade-down' : undefined"
    data-aos-duration="450"
    data-aos-easing="ease-out-quad"
    data-aos-anchor="body"
  >
    <div
      v-if="isMounted"
      :style="bubbleStyles"
      class="absolute bottom-1.5 left-0 top-1.5 z-0 pointer-events-none rounded-full bg-primary-50/80 shadow-[0_2px_8px_rgba(37,99,235,0.12)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-[width,transform] dark:bg-primary-950/35 dark:shadow-[0_4px_12px_rgba(37,99,235,0.18)]"
      :class="{ 'transition-none': isMotionReduced }"
      aria-hidden="true"
    />

    <ul class="z-10 m-0 flex list-none items-center p-0">
      <li v-for="(link, idx) in navLinks" :key="link.label">
        <NuxtLink
          :ref="(el) => setLinkRef(el as Element | ComponentPublicInstance | null, idx)"
          :to="link.to"
          class="group relative flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-current transition-colors duration-200 ease-out hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
          active-class="!text-primary-700 !font-bold"
          @mouseover="startDecryption(`${link.label}`, `desktop-${link.label}`)"
          @mouseleave="clearDecryption(`desktop-${link.label}`)"
        >
          <UIcon
            v-if="link.icon"
            :name="link.icon"
            class="h-4 w-4 shrink-0 text-current transition-transform duration-200 group-hover:scale-110"
            aria-hidden="true"
          />

          <span class="whitespace-nowrap">
            {{
              activeHoverText[`desktop-${link.label}`]?.toUpperCase()
                || link.label?.toUpperCase() }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
