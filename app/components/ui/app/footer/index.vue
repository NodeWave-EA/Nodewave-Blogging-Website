<script setup lang="ts">
import { computed } from "vue";

import { siteConfig } from "~/app.meta";
import { useMatrixDecrypt } from "~/composables/use-matrix-decrypt";
import { navLinks, socialLinks } from "~/constants";

defineOptions({
  name: "GlobalApplicationFooter",
});

// Using a computed property is fine here, though a standard const is sufficient
// unless the user leaves the tab open during New Year's Eve!
const currentYear = computed(() => new Date().getFullYear());

const { activeHoverText, startDecryption, clearDecryption } = useMatrixDecrypt({
  speed: 25,
  revealStep: 0.35,
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <UFooter aria-label="Main Footer">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-10 border-b border-neutral-200/50 dark:border-neutral-800/40">
        <!-- Brand & Description -->
        <div class="md:col-span-5 flex flex-col items-start gap-4">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 transition-transform duration-200 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md"
            aria-label="Return to homepage"
          >
            <UiAppLogo />
          </NuxtLink>
          <p class="font-sans text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
            Deep-dives into the world of technology, software development, and the latest trends in the tech industry. Stay informed and inspired with our expert insights and analysis.
          </p>
        </div>

        <!-- Navigation Links -->
        <div class="md:col-span-3 md:col-start-7 flex flex-col gap-3.5">
          <h2 class="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            Explore
          </h2>
          <ul class="space-y-2.5">
            <li v-for="link in navLinks" :key="link.label">
              <NuxtLink
                :to="link.to"
                class="group font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm px-1 -ml-1"
                @mouseenter="startDecryption(`${link.label}`, `footer-${link.label}`)"
                @mouseleave="clearDecryption(`footer-${link.label}`)"
                @focus="startDecryption(`${link.label}`, `footer-${link.label}`)"
                @blur="clearDecryption(`footer-${link.label}`)"
              >
                <span class="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 group-hover:bg-primary-500 group-focus-visible:bg-primary-500 group-hover:scale-125 transition-all duration-200" />
                <span>
                  {{ activeHoverText[`footer-${link.label}`] || link.label }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Social Links -->
        <div class="md:col-span-3 flex flex-col gap-3.5">
          <h2 class="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            Connect
          </h2>
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              v-for="link in socialLinks"
              :key="link.label"
              variant="subtle"
              color="neutral"
              size="sm"
              :href="link.to"
              target="_blank"
              rel="noopener noreferrer"
              :icon="link.icon"
              class="rounded-lg font-sans font-semibold tracking-wide text-[10px] px-2.5 py-1.5 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-primary-500 dark:hover:text-primary-400 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-500"
              :aria-label="`Visit our ${link.label} page`"
            />
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="pt-6 flex flex-col lg:flex-row items-center justify-between gap-6 font-mono text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500">
        <!-- Copyright -->
        <div class="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 order-2 lg:order-1 tracking-tight text-center lg:text-left">
          <span>&copy; {{ currentYear }}</span>
          <span class="text-neutral-700 dark:text-neutral-300 font-semibold">{{ siteConfig.name }}</span>
          <span class="text-neutral-300 dark:text-neutral-800 hidden sm:inline-block">|</span>
          <span class="text-[9px] text-neutral-400/70 dark:text-neutral-500/60 uppercase tracking-widest w-full sm:w-auto mt-1 sm:mt-0">
            {{ siteConfig.tagLine }}
          </span>
        </div>

        <!-- Badges & Controls -->
        <div class="flex flex-wrap items-center justify-center gap-4 order-1 lg:order-2">
          <!-- Made with Love Badge -->
          <div class="hidden md:inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200/40 dark:border-neutral-800/60 cursor-default">
            <!-- Layered Ping Indicator -->
            <span class="relative flex h-1.5 w-1.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span class="text-[9px] uppercase tracking-wider text-neutral-500 font-bold">
              Made with <span class="text-rose-500 mx-0.5" aria-label="love">❤</span> by <span class="text-emerald-500">{{ siteConfig.name }}</span>
            </span>
          </div>

          <!-- Back to Top -->
          <button
            type="button"
            class="group inline-flex items-center gap-1.5 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm px-1"
            aria-label="Scroll back to top of page"
            @click="scrollToTop"
          >
            <span class="uppercase tracking-wider text-[10px] font-bold">Back to top</span>
            <UIcon name="i-lucide-arrow-up" class="h-3.5 w-3.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  </UFooter>
</template>
