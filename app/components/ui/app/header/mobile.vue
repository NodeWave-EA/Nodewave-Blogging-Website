<script setup lang="ts">
import { navLinks } from "~/constants";

const { activeHoverText, clearDecryption, startDecryption } = useMatrixDecrypt({
  revealStep: 2,
  speed: 20,
});

useAOS();
</script>

<template>
  <div class="flex h-full w-full select-none flex-col justify-between pt-4">
    <nav
      aria-label="Mobile viewport navigation menu"
      class="w-full"
    >
      <ul class="m-0 w-full list-none space-y-2 p-0">
        <li
          v-for="(link, idx) in navLinks"
          :key="link.label"
          class="w-full"
          data-aos="fade-right"
          :data-aos-delay="idx * 50"
          data-aos-duration="350"
          data-aos-easing="ease-out-quad"
        >
          <NuxtLink
            :to="link.to"
            class="group flex w-full items-center gap-3 border-l-4 border-transparent rounded-xl px-5 py-3.5 text-base font-semibold tracking-wide text-current transition-[colors,background-color] duration-200 hover:bg-primary-50/70 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            active-class="!border-primary !text-primary-700 bg-primary-50/80 rounded-l-none !font-bold dark:bg-primary-950/25"
            @mouseover="startDecryption(`${link.label}`, `desktop-${link.label}`)"
            @mouseleave="clearDecryption(`desktop-${link.label}`)"
          >
            <UIcon
              v-if="link.icon"
              :name="link.icon"
              class="h-5 w-5 shrink-0 text-current transition-[colors,transform] duration-200 group-hover:scale-110 group-hover:text-primary-600"
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
  </div>
</template>
