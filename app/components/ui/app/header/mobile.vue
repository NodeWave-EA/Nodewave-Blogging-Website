<script setup lang="ts">
import { nextTick, onMounted } from "vue";

import { navLinks } from "~/constants";

const { $refreshAos } = useNuxtApp();

onMounted(async () => {
  await nextTick();
  $refreshAos();
});
</script>

<template>
  <div class="w-full h-full flex flex-col justify-between pt-4 select-none">
    <nav
      aria-label="Mobile viewport navigation menu"
      class="w-full"
    >
      <ul class="space-y-2 w-full p-0 m-0 list-none">
        <li
          v-for="(link, idx) in navLinks"
          :key="idx"
          class="w-full"
          data-aos="fade-right"
          :data-aos-delay="idx * 50"
          data-aos-duration="350"
          data-aos-easing="ease-out-quad"
        >
          <NuxtLink
            :to="link.to"
            class="group flex w-full items-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-base tracking-wide transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-900/60 focus-visible:ring-2 focus-visible:ring-primary"
            active-class="!text-primary bg-primary-50/50 dark:bg-primary-950/20 font-bold border-l-4 border-primary rounded-l-none"
          >
            <UIcon
              v-if="link.icon"
              :name="link.icon"
              class="w-5 h-5 shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-primary transition-transform duration-200 group-hover:scale-110"
            />

            <span class="whitespace-nowrap">
              {{ link.label }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
